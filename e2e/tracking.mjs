// Headless check of the visit counting (GoatCounter) without sending any real visits.
//
// The built app is served to the browser as https://annocalculator.com (the only
// address the counter runs on) and GoatCounter's script is replaced by a stub that
// records what the app asks it to count. Checks that:
//   * on the live address the script is loaded and told not to count on load by itself,
//   * the first page, then each page the visitor navigates to, is reported by path,
//   * a visitor who sends Do Not Track, or Global Privacy Control, is not counted,
//   * a local address (what you get running the app yourself) is never counted.
//
//   node e2e/tracking.mjs [distDir]      (default: dist/annocalculator/browser)
import { chromium } from 'playwright';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, serveDist, settle } from './support.mjs';

const dist = path.resolve(process.argv[2] ?? DEFAULT_DIST);
const server = await serveDist(dist);
const browser = await launchBrowser(chromium);
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`);
  if (!ok) failures++;
};

const LIVE = 'https://annocalculator.com';
// Stands in for https://gc.zgo.at/count.js: records the calls instead of sending them.
const STUB = `
  window.__counted = [];
  window.goatcounter.count = (vars) => window.__counted.push(vars && vars.path);
`;

/** Opens a page that thinks it is on `origin`, with every GoatCounter request caught. */
async function openPage({ initScript } = {}) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (initScript) await page.addInitScript(initScript);
  // The live address is served from the local build.
  await page.route(`${LIVE}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    await route.fulfill({ response: await route.fetch({ url: server.url + pathname }) });
  });
  await page.route(/gc\.zgo\.at|goatcounter\.com/, async (route) => {
    requests.push(route.request().url());
    const isScript = route.request().url().includes('count.js');
    await route.fulfill(isScript ? { contentType: 'text/javascript', body: STUB } : { status: 204, body: '' });
  });
  // Everything else off the local machine (fonts) is not needed.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  return { context, page, requests, errors };
}

// 1. The live address: loaded, configured, and every page reported.
{
  const { context, page, requests, errors } = await openPage();
  await page.goto(`${LIVE}/calculator`);
  await page.waitForSelector('island');
  await settle(page);
  const config = await page.evaluate(() => ({ no_onload: window.goatcounter?.no_onload, endpoint: window.goatcounter?.endpoint }));
  check('the counter script is loaded on the live address', requests.some((u) => u.includes('gc.zgo.at/count.js')));
  check('the counter is told not to count on load itself', config.no_onload === true, JSON.stringify(config));
  check('the counter reports to the annocalculator site', config.endpoint === 'https://annocalculator.goatcounter.com/count', config.endpoint);
  check('the first page is counted', JSON.stringify(await page.evaluate(() => window.__counted)) === '["/calculator"]');
  await page.getByRole('button', { name: 'Anno 117' }).click();
  await settle(page);
  await page.getByRole('button', { name: 'About' }).click();
  await settle(page);
  check(
    'navigating to the other pages counts each one, including the Anno 117 page',
    JSON.stringify(await page.evaluate(() => window.__counted)) === '["/calculator","/anno-117","/about"]',
  );
  check('only the counter script was requested from GoatCounter', requests.length === 1, requests.join(' '));
  check('no page errors on the live address', errors.length === 0, errors.join(' | '));
  await context.close();
}

// 2. Visitors who ask not to be tracked.
for (const [label, initScript] of [
  ['Do Not Track', () => Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' })],
  ['Global Privacy Control', () => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true })],
]) {
  const { context, page, requests } = await openPage({ initScript });
  await page.goto(`${LIVE}/calculator`);
  await page.waitForSelector('island');
  await settle(page);
  check(`${label} is not counted`, requests.length === 0, requests.join(' '));
  await context.close();
}

// 3. Running the app locally is never counted.
{
  const { context, page, requests } = await openPage();
  await page.goto(`${server.url}/calculator`);
  await page.waitForSelector('island');
  await settle(page);
  check('a local address is not counted', requests.length === 0, requests.join(' '));
  await context.close();
}

await browser.close();
await server.close();
console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
