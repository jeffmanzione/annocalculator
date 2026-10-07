// Screenshots of the desktop app, to prove that a change leaves it looking exactly as it did.
//
//   node e2e/desktop-shots.mjs <outDir>           take the screenshots (of the build in dist/)
//   node e2e/desktop-shots.mjs --compare <a> <b>  compare two directories of them, byte for byte
//
// Take them before a change and after it, then compare. Both themes, both calculators and the About page, at
// two desktop widths, with a world that has extra goods (a silo) so that the tables are in their full form.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, serveDist } from './support.mjs';

const args = process.argv.slice(2);
/** The share of a screenshot's pixels that may differ before two of them count as different (0.05%). */
const NOISE = 0.0005;

if (args[0] === '--compare') {
  const [a, b] = args.slice(1);
  const files = fs.readdirSync(a).filter((f) => f.endsWith('.png'));
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage();
  // Counts the pixels that differ, and where the first of them is.
  const differing = (x, y) =>
    page.evaluate(async ([x64, y64]) => {
      const load = async (b64) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return { w: img.width, h: img.height, d: ctx.getImageData(0, 0, img.width, img.height).data };
      };
      const [p, q] = [await load(x64), await load(y64)];
      if (p.w !== q.w || p.h !== q.h) return { count: -1, total: 1 };
      let count = 0;
      let first = null;
      for (let i = 0; i < p.d.length; i += 4) {
        if (p.d[i] !== q.d[i] || p.d[i + 1] !== q.d[i + 1] || p.d[i + 2] !== q.d[i + 2] || p.d[i + 3] !== q.d[i + 3]) {
          count++;
          first ??= [(i / 4) % p.w, Math.floor(i / 4 / p.w)];
        }
      }
      return { count, first, total: p.w * p.h };
    }, [x.toString('base64'), y.toString('base64')]);
  let different = 0;
  for (const f of files) {
    const x = fs.readFileSync(path.join(a, f));
    const y = fs.existsSync(path.join(b, f)) ? fs.readFileSync(path.join(b, f)) : null;
    if (y && x.equals(y)) continue;
    const result = y ? await differing(x, y) : { count: -1, total: 1 };
    // A handful of pixels differ from run to run (a webp icon that decoded a frame later); a changed layout
    // moves thousands.
    if (result.count >= 0 && result.count / result.total <= NOISE) continue;
    different++;
    console.log(`DIFFERENT  ${f}  (${result.count} pixels${result.first ? ', first at ' + result.first : ''})`);
  }
  await browser.close();
  console.log(different === 0 ? `ALL ${files.length} THE SAME` : `${different} of ${files.length} DIFFER`);
  process.exit(different === 0 ? 0 : 1);
}

const out = args[0];
fs.mkdirSync(out, { recursive: true });
const world117 = {
  game: 'anno117',
  version: 1,
  world: {
    islands: [
      {
        id: 1,
        name: 'Ostia',
        session: 3245,
        productionLines: [
          { id: 11, building: 2693, numBuildings: 4, aqueduct: true },
          { id: 12, building: 2793, numBuildings: 2, silo: true },
          { id: 13, building: 3174, numBuildings: 3 },
        ],
      },
    ],
    tradeRoutes: [],
  },
};
const server = await serveDist(DEFAULT_DIST);
const browser = await launchBrowser(chromium);
for (const theme of ['anno117', 'anno1800']) {
  for (const width of [1500, 1100]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    // The web fonts arrive at different times from run to run; without them both runs draw with the same fallback fonts.
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await page.addInitScript(
      ([t, w]) => {
        localStorage.setItem('ANNOCALCULATOR_THEME', t);
        localStorage.setItem('anno-117-production-calculator-world', JSON.stringify(w));
      },
      [theme, world117],
    );
    for (const [name, route, selector] of [
      ['117', '/anno-117-calculator', 'anno-117-island'],
      ['1800', '/anno-1800-calculator', 'anno-1800-island'],
      ['about', '/about', '.logo'],
    ]) {
      await page.goto(server.url + route);
      await page.waitForSelector(selector);
      // The first load of a page in a browser settles later (fonts, caches); the second is steady.
      await page.reload();
      await page.waitForSelector(selector);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(out, `${theme}-${width}-${name}.png`) });
    }
    await page.close();
  }
}
await browser.close();
await server.close();
console.log(`Saved the screenshots in ${out}`);
