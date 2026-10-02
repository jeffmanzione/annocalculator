// Headless layout check for the island tables: at several desktop widths and in
// every language, no header word may be wider than its column (that is, no
// header breaks mid-word) and no computed value may be clipped. See README.md.
//
//   node e2e/layout.mjs [distDir]      (default: dist/annocalculator/browser)
import { chromium } from 'playwright';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, serveDist, settle } from './support.mjs';

const dist = path.resolve(process.argv[2] ?? DEFAULT_DIST);
const server = await serveDist(dist);
const browser = await launchBrowser(chromium);

// Widths of common desktop viewports. The island panel is about 60% of this.
const WIDTHS = [1440, 1600, 1920, 2560];
// Display names as shown in the language dropdown.
const LANGUAGES = ['EN', 'De', 'Nl', '中文'];

let failures = 0;

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 1100 } });
  await page.goto(`${server.url}/calculator`);
  await page.waitForSelector('island');
  await settle(page);

  for (const language of LANGUAGES) {
    if (language !== 'EN') {
      await page.locator('mat-toolbar mat-select').click();
      await page.getByRole('option', { name: language, exact: true }).click();
      await settle(page);
    }

    const problems = await page.evaluate(() => {
      const found = [];
      for (const table of document.querySelectorAll('island table')) {
        // Soft hyphens are deliberate break points, so measure the word without them.
        const measure = (th, word) => {
          const probe = document.createElement('span');
          const style = getComputedStyle(th);
          probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${style.font};letter-spacing:${style.letterSpacing}`;
          probe.textContent = word;
          document.body.appendChild(probe);
          const widthPx = probe.getBoundingClientRect().width;
          probe.remove();
          return widthPx;
        };
        for (const th of table.querySelectorAll('th')) {
          const available = th.clientWidth - 8; // minus horizontal padding
          const text = (th.textContent || '').trim();
          // Latin headers wrap at spaces and soft hyphens; CJK headers must stay whole.
          const pieces = /[㐀-鿿]/.test(text) ? [text] : text.split(/[\s­]+/);
          for (const piece of pieces) {
            if (piece && measure(th, piece) > available + 0.5) {
              found.push(`header "${piece}" is wider than its column (${Math.round(available)}px)`);
            }
          }
        }
        for (const td of table.querySelectorAll('td.computed-field, td.mat-column-producedPerMinute')) {
          if (td.scrollWidth > td.clientWidth + 1) found.push(`value "${td.textContent.trim()}" is clipped`);
        }
      }
      return [...new Set(found)];
    });

    const ok = problems.length === 0;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${String(width).padEnd(4)} ${language.padEnd(2)}${ok ? '' : '  -- ' + problems.join('; ')}`,
    );
    if (!ok) failures++;
  }
  await page.close();
}

await browser.close();
await server.close();

console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
