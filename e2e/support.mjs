// Shared helpers for the e2e scripts in this folder. See README.md.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_DIST = path.join(REPO_ROOT, 'dist', 'annocalculator', 'browser');
export const WORLD_KEY = 'anno-1800-production-calculator-world';

const CONTENT_TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/**
 * Launches headless Chromium. By default this uses the browser Playwright
 * installed itself (`npx playwright install chromium`). Set
 * PLAYWRIGHT_CHROMIUM_EXECUTABLE to use a different Chromium binary instead,
 * e.g. one preinstalled in a sandbox that doesn't match this Playwright
 * version's expected browser build.
 */
export function launchBrowser(chromium) {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;
  return chromium.launch({ executablePath });
}

/** Newest modification time (ms) of any file under dir. */
function newestMtimeMs(dir) {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const mtime = entry.isDirectory() ? newestMtimeMs(full) : fs.statSync(full).mtimeMs;
    newest = Math.max(newest, mtime);
  }
  return newest;
}

/**
 * Refuses to test a build that's older than its own source: the scripts
 * serve whatever is in the dist folder and never build anything, so a
 * stale build silently tests old code. Assumes the standard
 * `<repo>/dist/annocalculator/browser` layout, and checks `<repo>/src`;
 * skips the check for folders outside that layout. Set E2E_ALLOW_STALE=1
 * to skip it deliberately (e.g. to test an old build on purpose).
 */
function assertBuildIsCurrent(root) {
  if (process.env.E2E_ALLOW_STALE === '1') return;
  const srcDir = path.resolve(root, '..', '..', '..', 'src');
  if (!fs.existsSync(srcDir)) return;
  const builtAt = fs.statSync(path.join(root, 'index.html')).mtimeMs;
  const srcChangedAt = newestMtimeMs(srcDir);
  if (srcChangedAt > builtAt) {
    throw new Error(
      `The build in ${root} (${new Date(builtAt).toISOString()}) is older than the newest file in ` +
        `${srcDir} (${new Date(srcChangedAt).toISOString()}), so it would test old code. Rebuild first: ` +
        `npx ng build --configuration development (or set E2E_ALLOW_STALE=1 to test it anyway).`,
    );
  }
}

/**
 * Serves a built app folder on a free localhost port, falling back to
 * index.html for unknown paths (the app is a client-side-routed SPA).
 * Resolves to { url, close }.
 */
export function serveDist(root) {
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    throw new Error(`No index.html in ${root} -- build first (see e2e/README.md).`);
  }
  assertBuildIsCurrent(root);
  const server = http.createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(root, 'index.html');
    }
    res.writeHead(200, {
      'content-type': CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

/**
 * Opens a page and collects uncaught errors and console errors. Console
 * "Failed to load resource" messages are ignored: they're network failures
 * (e.g. Google Fonts being unreachable in a sandbox), not app bugs.
 */
export async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1400 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) {
      errors.push(`console: ${m.text()}`);
    }
  });
  return { page, errors };
}

/** Short pause for change detection, persistence, and overlays to settle. */
export const settle = (page) => page.waitForTimeout(300);

/** The world JSON the app last saved to localStorage. */
export async function savedWorld(page) {
  return JSON.parse(await page.evaluate((k) => localStorage.getItem(k), WORLD_KEY));
}

/**
 * Ids are pseudorandom, so two runs never share them. Replace each id
 * (and each island reference) with a stable label in first-seen order, so
 * two runs' saved worlds can be compared structurally.
 */
export function normalizeIds(world) {
  const labels = new Map();
  const label = (id) => {
    if (!labels.has(id)) labels.set(id, `#${labels.size}`);
    return labels.get(id);
  };
  return JSON.parse(
    JSON.stringify(world, (k, v) => ((k === 'id' || k.endsWith('IslandId')) && typeof v === 'number' ? label(v) : v)),
  );
}

/** Lists every leaf path where a and b differ. */
export function deepDiff(a, b, p = '', out = []) {
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out.push(`${p}: baseline=${JSON.stringify(a)} candidate=${JSON.stringify(b)}`);
    }
    return out;
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    deepDiff(a[k], b[k], `${p}.${k}`, out);
  }
  return out;
}
