// Headless check that a floating field label's plate has a visible edge on BOTH sides at
// several display scales (1x to 3x, including fractional ones such as 1.25x and 1.5x).
//
// The plate sits across the field's top border, and a one-pixel line at a fractional
// position can disappear from one side on some displays; this reads the actual rendered
// pixels, above the field's top line where the plate stands against the panel, and needs a
// clearly darker edge on the left and the right. See README.md.
//
//   node e2e/label-edges.mjs [distDir]      (default: dist/annocalculator/browser)
import { chromium } from 'playwright';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, serveDist, settle } from './support.mjs';

const dist = path.resolve(process.argv[2] ?? DEFAULT_DIST);
const server = await serveDist(dist);
const browser = await launchBrowser(chromium);
let failures = 0;

for (const dsf of [1, 1.25, 1.5, 1.75, 2, 3]) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dsf });
  const page = await context.newPage();
  await page.goto(`${server.url}/calculator`);
  await page.waitForSelector('island');
  await settle(page);

  const fields = await page.locator('island').first().locator('.mat-mdc-form-field').all();
  for (const field of fields) {
    const geom = await field.evaluate((f) => {
      const notch = f.querySelector('.mdc-notched-outline--notched .mdc-notched-outline__notch');
      if (!notch) return null;
      const n = notch.getBoundingClientRect();
      return {
        left: n.left - 5,
        right: n.right - 2,
        top: n.top - 7,
        line: n.top,
        name: (f.querySelector('.mdc-floating-label')?.textContent ?? '').trim(),
      };
    });
    if (!geom) continue;
    const pad = 8;
    const clip = {
      x: geom.left - pad,
      y: geom.top - pad,
      width: geom.right - geom.left + pad * 2,
      height: geom.line - geom.top + pad,
    };
    const png = await page.screenshot({ clip });
    const res = await page.evaluate(
      async ({ b64, dsf, pad, geom }) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const lum = (x, y) => {
          const d = ctx.getImageData(x, y, 1, 1).data;
          return d[0] * 0.3 + d[1] * 0.59 + d[2] * 0.11;
        };
        // The strip of rows above the field line, inset from the plate's rounded corners.
        const y0 = Math.round((pad + 3) * dsf),
          y1 = Math.round((geom.line - geom.top + pad - 2) * dsf);
        const bandMin = (xa, xb) => {
          let m = 255;
          for (let y = y0; y < y1; y++)
            for (let x = Math.round(xa * dsf); x <= Math.round(xb * dsf); x++) m = Math.min(m, lum(x, y));
          return m;
        };
        // Background reference: the panel just outside the plate on each side.
        const bg = Math.min(
          lum(Math.round((pad - 4) * dsf), y0 + 2),
          lum(Math.round((pad + geom.right - geom.left + 4) * dsf), y0 + 2),
        );
        const left = bandMin(pad - 1.5, pad + 1.5);
        const right = bandMin(pad + geom.right - geom.left - 1.5, pad + geom.right - geom.left + 1.5);
        return { bg, left, right };
      },
      { b64: png.toString('base64'), dsf, pad, geom },
    );
    // An edge pixel is clearly darker than the panel next to it.
    const ok = res.left < res.bg - 25 && res.right < res.bg - 25;
    if (!ok) failures++;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  x${String(dsf).padEnd(4)} "${geom.name}"  panel=${res.bg.toFixed(0)} left-edge=${res.left.toFixed(0)} right-edge=${res.right.toFixed(0)}`,
    );
  }
  await context.close();
}
await browser.close();
await server.close();
console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
