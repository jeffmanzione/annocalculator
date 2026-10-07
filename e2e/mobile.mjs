// Headless check of the phone layout: a phone-sized window with touch, on each calculator and the About page.
// The desktop's look is checked separately (e2e/desktop-shots.mjs); this checks that a phone gets a usable one.
//
//   node e2e/mobile.mjs [distDir]      (default: dist/annocalculator/browser)
import { chromium } from 'playwright';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, serveDist } from './support.mjs';

const dist = path.resolve(process.argv[2] ?? DEFAULT_DIST);
const server = await serveDist(dist);
const browser = await launchBrowser(chromium);
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`);
  if (!ok) failures++;
};

const line = (id, building, numBuildings, extra = {}) => ({ id, building, numBuildings, ...extra });
const world117 = {
  game: 'anno117',
  version: 1,
  world: {
    islands: [
      { id: 1, name: 'Ostia', session: 3245, productionLines: [line(11, 2693, 4, { aqueduct: true }), line(12, 2793, 2, { silo: true }), line(13, 3174, 3)] },
      { id: 2, name: 'Roma', session: 3245, productionLines: [line(21, 3075, 2)] },
    ],
    tradeRoutes: [{ id: 5, sourceIslandId: 1, targetIslandId: 2, good: '2069' }],
  },
};

async function openPhone(width, theme, route, selector) {
  const errors = [];
  const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  // (The web fonts are blocked below, which the browser reports as failed loads.)
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.addInitScript(
    ([t, w]) => {
      localStorage.setItem('ANNOCALCULATOR_THEME', t);
      localStorage.setItem('anno-117-production-calculator-world', JSON.stringify(w));
    },
    [theme, world117],
  );
  await page.goto(`${server.url}${route}`);
  await page.waitForSelector(selector);
  await page.waitForTimeout(700);
  return { page, context, errors };
}

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const visibleCount = (page, selector) =>
  page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none').length, selector);

for (const theme of ['anno117', 'anno1800']) {
  for (const width of [390, 360]) {
    for (const [name, route, selector] of [
      ['Anno 117', '/anno-117-calculator', 'anno-117-island'],
      ['Anno 1800', '/anno-1800-calculator', 'anno-1800-island'],
      ['About', '/about', '.logo'],
    ]) {
      const { page, context, errors } = await openPhone(width, theme, route, selector);
      check(`${name} at ${width}px (${theme}) does not scroll sideways`, (await overflow(page)) <= 0, `${await overflow(page)}px too wide`);
      const brand = await page.locator('.toolbar-title').boundingBox();
      check(`${name} at ${width}px (${theme}): the toolbar title is on the screen`, !!brand && brand.x >= 0 && brand.x + brand.width <= width + 1);
      check(`${name} at ${width}px (${theme}): no errors`, errors.length === 0, errors.join(' | '));
      await context.close();
    }
  }
}

for (const [name, route, selector, island] of [
  ['Anno 117', '/anno-117-calculator', 'anno-117-island', 'anno-117-island'],
  ['Anno 1800', '/anno-1800-calculator', 'anno-1800-island', 'anno-1800-island'],
]) {
  const { page, context } = await openPhone(390, 'anno117', route, selector);

  // One part of the page at a time.
  check(`${name}: the islands are shown first`, (await visibleCount(page, island)) > 0 && (await visibleCount(page, 'summary-panel')) === 0 && (await visibleCount(page, 'trade-routes-panel')) === 0);
  await page.getByRole('tab', { name: 'Summary' }).tap();
  await page.waitForTimeout(300);
  check(`${name}: the Summary tab shows only the summary`, (await visibleCount(page, 'summary-panel')) === 1 && (await visibleCount(page, island)) === 0 && (await visibleCount(page, 'trade-routes-panel')) === 0);
  check(`${name}: the summary has rows, not an empty panel`, (await visibleCount(page, 'summary-panel tr.mat-mdc-row')) > 0);
  await page.getByRole('tab', { name: 'Trade Routes' }).tap();
  await page.waitForTimeout(300);
  check(`${name}: the Trade Routes tab shows only the routes`, (await visibleCount(page, 'trade-routes-panel')) === 1 && (await visibleCount(page, 'summary-panel')) === 0);
  await page.getByRole('tab', { name: 'Islands' }).tap();
  await page.waitForTimeout(300);
  check(`${name}: and back to the islands`, (await visibleCount(page, island)) > 0);

  // Production lines are cards, not a wide table.
  const header = await page.evaluate((i) => getComputedStyle(document.querySelector(`${i} table.lines-table thead, ${i} tr.mat-mdc-header-row`)).display, island);
  check(`${name}: the table header row is gone`, header === 'none');
  const widest = await page.evaluate((i) => Math.max(...[...document.querySelectorAll(`${i} tr`)].map((r) => r.getBoundingClientRect().width)), island);
  check(`${name}: a line fits the screen`, widest <= 390, `${Math.round(widest)}px`);
  const labels = await visibleCount(page, `${island} .mobile-label`);
  check(`${name}: the cards label their fields`, labels > 5, `${labels} labels`);

  // Targets for a finger.
  const sizes = await page.evaluate((i) => {
    const h = (sel) => Math.round(document.querySelector(sel)?.getBoundingClientRect().height ?? 0);
    return { field: h(`${i} mat-form-field .mat-mdc-text-field-wrapper`), step: h(`${i} .count-step`), button: h(`${i} ac-button button[mat-icon-button], ${i} ac-button button.mat-mdc-icon-button`), textButton: h(`${i} ac-button button.mat-mdc-unelevated-button, ${i} ac-button button.mat-mdc-button`) };
  }, island);
  check(`${name}: fields are at least 44px tall`, sizes.field >= 44, JSON.stringify(sizes));
  check(`${name}: icon buttons are at least 40px`, sizes.button >= 40, JSON.stringify(sizes));
  check(`${name}: text buttons are at least 40px`, sizes.textButton >= 40 || sizes.textButton === 0, JSON.stringify(sizes));
  check(`${name}: the arrows of the count are at least 20px tall`, sizes.step >= 20, JSON.stringify(sizes));
  await context.close();
}

// Tooltips, without hover: a tap shows one, a tap elsewhere hides it.
{
  const { page, context } = await openPhone(390, 'anno117', '/anno-117-calculator', 'anno-117-island');
  const tips = () => page.locator('.tooltip-container').count();
  await page.locator('anno-117-island td.m-output .item-container').first().tap();
  await page.waitForTimeout(300);
  check('tapping a good shows its tooltip', (await tips()) === 1);
  await page.touchscreen.tap(30, 20);
  await page.waitForTimeout(300);
  check('tapping elsewhere hides it', (await tips()) === 0);
  await page.locator('anno-117-island td.m-stat composite-number .container').first().tap();
  await page.waitForTimeout(300);
  check('tapping a number shows how it is worked out', (await tips()) === 1 && /Base Productivity/.test(await page.locator('.tooltip-container').first().innerText()));
  await page.touchscreen.tap(30, 20);
  await page.waitForTimeout(300);
  check('and tapping elsewhere hides that too', (await tips()) === 0);
  await context.close();
}

// A desktop-sized window, with a mouse, keeps the desktop layout.
{
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${server.url}/anno-117-calculator`);
  await page.waitForSelector('anno-117-island');
  check('at 1100px the phone tabs are not shown', (await visibleCount(page, 'mobile-section-tabs')) === 0);
  check('and the summary is beside the islands', (await visibleCount(page, 'summary-panel')) === 1 && (await visibleCount(page, 'anno-117-island')) > 0);
  await context.close();
}

await browser.close();
await server.close();
console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
