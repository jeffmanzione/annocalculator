// Takes the screenshots that the README shows, from a built copy of the app, so that they can be taken again
// whenever the look changes.
//
//   node e2e/readme-screenshots.mjs [outDir]      (default: screenshots/)
//
// Build first (npx ng build --configuration development). Only the screenshots of the full pages, the Anno 117
// close-ups, the themes and the phone are made here; the close-ups of Anno 1800's tooltips were cropped by hand.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, serveDist } from './support.mjs';

const out = path.resolve(process.argv[2] ?? 'screenshots');
fs.mkdirSync(out, { recursive: true });
const server = await serveDist(DEFAULT_DIST);
const browser = await launchBrowser(chromium);

const KEY_117 = 'anno-117-production-calculator-world';
const TUNICS = '2141';
const line = (id, building, numBuildings, extra = {}) => ({ id, building, numBuildings, ...extra });

// A plan that shows what the Anno 117 calculator does: bread and tunics across Latium and Albion, with aqueducts,
// a silo (and so extra goods), items, a patron, and discoveries (one of them researched three times).
const world117 = {
  game: 'anno117',
  version: 1,
  world: {
    techs: [37858, 37870, 37870, 37870, 38708],
    islands: [
      {
        id: 1,
        name: 'Ostia',
        session: 3245,
        patron: 80562,
        devotion: 5000,
        productionLines: [
          line(11, 2693, 4, { aqueduct: true, items: [44431] }),
          line(12, 2793, 2, { silo: true }),
          line(13, 3075, 2),
          line(14, 3174, 6),
        ],
      },
      {
        id: 2,
        name: 'Roma',
        session: 3245,
        productionLines: [line(21, 2880, 2), line(22, 2693, 3, { aqueduct: true })],
      },
      {
        id: 3,
        name: 'Dun Eidyn',
        session: 6627,
        productionLines: [line(31, 31762, 2, { aqueduct: true }), line(32, 5958, 3)],
      },
    ],
    tradeRoutes: [
      { id: 5, sourceIslandId: 2, targetIslandId: 1, good: '2085' },
      { id: 6, sourceIslandId: 3, targetIslandId: 1, good: TUNICS },
    ],
  },
};

async function open({
  theme,
  language = 'En',
  route,
  selector,
  seed117 = false,
  phone = false,
  width = 1500,
  height = 940,
}) {
  const context = await browser.newContext(
    phone
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : { viewport: { width, height } },
  );
  const page = await context.newPage();
  await page.addInitScript(
    ([t, l, w, seed]) => {
      localStorage.setItem('ANNOCALCULATOR_THEME', t);
      localStorage.setItem('ANNOCALCULATOR_LANGUAGE', l);
      if (seed) localStorage.setItem('anno-117-production-calculator-world', JSON.stringify(w));
    },
    [theme, language, world117, seed117],
  );
  await page.goto(`${server.url}${route}`);
  await page.waitForSelector(selector);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  return { page, context };
}

const save = (page, name, options = {}) => page.screenshot({ path: path.join(out, name), ...options });

// 1. Anno 1800: the whole page, and in German and Chinese (its look is the Anno 1800 theme).
for (const [name, language] of [
  ['whole_app.jpg', 'En'],
  ['german.jpg', 'De'],
  ['chinese.jpg', 'Zh'],
]) {
  const { page, context } = await open({
    theme: 'anno1800',
    language,
    route: '/anno-1800-calculator',
    selector: 'anno-1800-island',
  });
  await save(page, name, { type: 'jpeg', quality: 88 });
  await context.close();
}

// 2. Anno 117 (the default theme): the whole page, and close-ups of what its numbers are made of.
{
  const { page, context } = await open({
    theme: 'anno117',
    route: '/anno-117-calculator',
    selector: 'anno-117-island',
    seed117: true,
  });
  await save(page, 'anno117_whole.jpg', { type: 'jpeg', quality: 88 });

  const pigFarm = page.locator('anno-117-island').first().locator('tbody tr').nth(1);
  const box = async (locator, pad = 12) => {
    const b = await locator.boundingBox();
    return {
      x: Math.max(0, b.x - pad),
      y: Math.max(0, b.y - pad),
      width: b.width + pad * 2,
      height: b.height + pad * 2,
    };
  };
  await pigFarm.locator('composite-number').first().hover();
  await page.waitForTimeout(900);
  await save(page, 'anno117_efficiency.png', { clip: { x: 0, y: 330, width: 1300, height: 560 } });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);

  await pigFarm.locator('composite-number').last().hover();
  await page.waitForTimeout(900);
  await save(page, 'anno117_goods_per_minute.png', { clip: { x: 0, y: 330, width: 1300, height: 560 } });
  await page.mouse.move(5, 5);
  await context.close();
}

// 3. The two themes, on the same page.
for (const [name, theme] of [
  ['theme_anno117.jpg', 'anno117'],
  ['theme_anno1800.jpg', 'anno1800'],
]) {
  const { page, context } = await open({
    theme,
    route: '/anno-117-calculator',
    selector: 'anno-117-island',
    seed117: true,
    width: 1100,
    height: 700,
  });
  await save(page, name, { type: 'jpeg', quality: 88 });
  await context.close();
}

// 4. A phone: the islands as cards, a tap on a tooltip, and the summary with a good opened.
{
  const { page, context } = await open({
    theme: 'anno117',
    route: '/anno-117-calculator',
    selector: 'anno-117-island',
    seed117: true,
    phone: true,
  });
  await save(page, 'mobile_top.jpg', { type: 'jpeg', quality: 88 });
  // The second line (the pig farm) with its top just under the bar of tabs.
  await page.evaluate(() => {
    const card = document.querySelector('anno-117-island tbody tr:nth-child(2)');
    window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 76);
  });
  await page.waitForTimeout(500);
  await save(page, 'mobile_cards.jpg', { type: 'jpeg', quality: 88 });
  await page
    .locator('anno-117-island')
    .first()
    .locator('tbody tr')
    .nth(1)
    .locator('td.m-stat composite-number .container')
    .first()
    .tap();
  await page.waitForTimeout(700);
  await save(page, 'mobile_tooltip.jpg', { type: 'jpeg', quality: 88 });
  await page.touchscreen.tap(30, 20);
  await page.getByRole('tab', { name: 'Summary' }).tap();
  await page.waitForTimeout(500);
  await page.locator('summary-panel td.good-name').nth(1).tap();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await save(page, 'mobile_summary.jpg', { type: 'jpeg', quality: 88 });
  await context.close();
}

await browser.close();
await server.close();
console.log(`Saved the screenshots in ${out}`);
