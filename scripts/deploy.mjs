// Deploys the production build to annocalculator.com (S3 + CloudFront).
//
//   npm run deploy              build, then deploy
//   npm run deploy -- --dry-run build, then show what would be uploaded
//   npm run deploy -- --skip-build   deploy the existing dist/ as it is
//
// Order matters: the hashed bundles go up first (so the old page keeps working
// while they land), index.html goes up last (that is the switch), then
// CloudFront is invalidated. Needs the AWS CLI with credentials that can write
// to the bucket and create invalidations (see scripts/deploy-policy.json).
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BUCKET = 'annocalculator-com';
const REGION = 'us-east-2';
const DISTRIBUTION_ID = 'E212U9B15HNWT6';
const SITE = 'https://annocalculator.com';
const DIST = path.resolve('dist/annocalculator/browser');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

const run = (cmd, argv, opts = {}) => {
  // npm is a .cmd shim on Windows and needs a shell; the AWS CLI and git do not.
  const result = spawnSync(cmd, argv, {
    stdio: 'inherit',
    shell: cmd === 'npm' && process.platform === 'win32',
    ...opts,
  });
  if (result.status !== 0) throw new Error(`${cmd} ${argv.join(' ')} failed`);
};
const aws = (...argv) => run('aws', [...argv, '--region', REGION]);
const awsOut = (...argv) => execFileSync('aws', [...argv, '--region', REGION], { encoding: 'utf8' }).trim();
const git = (...argv) => execFileSync('git', argv, { encoding: 'utf8' }).trim();

try {
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const dirty = git('status', '--porcelain', '--untracked-files=no');
  console.log(`Deploying ${version} from ${branch}${dryRun ? ' (dry run)' : ''}`);
  if (dirty) throw new Error('Uncommitted changes: commit or stash them first.');
  if (version === '0.0.0' && !dryRun)
    throw new Error('Version is 0.0.0: deploy from a release branch where the version has been set.');

  if (!args.has('--skip-build')) run('npm', ['run', 'build']);

  const files = fs.readdirSync(DIST);
  const bundles = files.filter((f) => /^(main|styles)-[A-Z0-9]+\.(js|css)$/.test(f));
  if (bundles.length !== 2)
    throw new Error(`Expected one main and one styles bundle in ${DIST}, found: ${bundles.join(', ')}`);
  // Pages loaded on demand (such as the Anno 117 calculator) are separate chunks, named by content like the bundles.
  const chunks = files.filter((f) => /^chunk-[A-Z0-9]+\.js$/.test(f));
  const hashed = [...bundles, ...chunks];
  // The version is shown in the toolbar; which file the bundler puts it in can change, so look in all of them.
  const scripts = hashed.filter((f) => f.endsWith('.js'));
  // The minifier writes the string with whichever quote it likes.
  const quoted = ['"', "'", '`'].map((q) => `${q}${version}${q}`);
  if (!scripts.some((f) => quoted.some((v) => fs.readFileSync(path.join(DIST, f), 'utf8').includes(v))))
    throw new Error(`The build in ${DIST} does not contain version ${version}: rebuild.`);

  const previous = awsOut(
    's3api',
    'head-object',
    '--bucket',
    BUCKET,
    '--key',
    'index.html',
    '--query',
    'VersionId',
    '--output',
    'text',
  );
  console.log(`Rollback target (current index.html version): ${previous}`);

  // The bundles and chunks go up first: the old page keeps working while they land, and the new
  // index.html below only points at files that already exist.
  const types = { '.js': 'application/javascript', '.css': 'text/css' };
  for (const file of hashed) {
    const args = [
      's3',
      'cp',
      path.join(DIST, file),
      `s3://${BUCKET}/${file}`,
      '--cache-control',
      'public,max-age=31536000,immutable',
      '--content-type',
      types[path.extname(file)],
    ];
    if (dryRun) args.push('--dryrun');
    aws(...args);
  }
  // Fonts, icons and the like: unchanged most releases, so only differences go up.
  aws(
    's3',
    'sync',
    DIST,
    `s3://${BUCKET}`,
    '--exclude',
    'index.html',
    '--exclude',
    'main-*',
    '--exclude',
    'styles-*',
    '--exclude',
    'chunk-*',
    ...(dryRun ? ['--dryrun'] : []),
  );
  aws(
    's3',
    'cp',
    path.join(DIST, 'index.html'),
    `s3://${BUCKET}/index.html`,
    '--cache-control',
    'no-cache',
    '--content-type',
    'text/html',
    ...(dryRun ? ['--dryrun'] : []),
  );

  if (dryRun) {
    console.log('Dry run: nothing was uploaded or invalidated.');
  } else {
    const invalidation = awsOut(
      'cloudfront',
      'create-invalidation',
      '--distribution-id',
      DISTRIBUTION_ID,
      '--paths',
      '/*',
      '--query',
      'Invalidation.Id',
      '--output',
      'text',
    );
    console.log(`Invalidating CloudFront (${invalidation})...`);
    aws('cloudfront', 'wait', 'invalidation-completed', '--distribution-id', DISTRIBUTION_ID, '--id', invalidation);
    const live = await (await fetch(SITE)).text();
    const missing = bundles.filter((f) => !live.includes(f));
    if (missing.length) throw new Error(`${SITE} is not serving ${missing.join(', ')} yet.`);
    console.log(
      `Done: ${SITE} is serving ${version}. To roll back, restore index.html version ${previous} and invalidate again.`,
    );
  }
} catch (error) {
  console.error(`\nDeploy failed: ${error.message}`);
  process.exit(1);
}
