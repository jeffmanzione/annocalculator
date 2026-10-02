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
      // A field's cream fill must be rounded on all four corners like its border,
      // or the square corners of the fill poke out beside the curve.
      for (const wrapper of document.querySelectorAll('island .mat-mdc-text-field-wrapper')) {
        const style = getComputedStyle(wrapper);
        for (const corner of ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']) {
          if (parseFloat(style[`border${corner}Radius`]) < 4) {
            found.push(
              `field fill has a square ${corner
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .toLowerCase()} corner`,
            );
          }
        }
      }

      // A floating field label sits in a plate set into the field's top border. The
      // plate (drawn on the label's cut-out) must be a solid, fully edged box in the
      // field's own fill, the border must run unbroken behind it with no clip
      // chopping it off, and it must stay within the field's width.
      for (const label of document.querySelectorAll('island .mdc-floating-label--float-above')) {
        const field = label.closest('.mat-mdc-form-field');
        const notchEl = label.closest('.mdc-notched-outline__notch');
        const name = (label.textContent || '').trim();
        const fill = getComputedStyle(field.querySelector('.mat-mdc-text-field-wrapper')).backgroundColor;
        const plate = getComputedStyle(notchEl, '::before');
        const notch = getComputedStyle(notchEl);
        if (plate.backgroundColor !== fill)
          found.push(`label "${name}": plate ${plate.backgroundColor} does not match its field ${fill}`);
        for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
          if (plate[`border${side}Style`] !== 'solid')
            found.push(`label "${name}": plate has no ${side.toLowerCase()} edge`);
          if (plate[`border${side}Color`] === 'rgba(0, 0, 0, 0)')
            found.push(`label "${name}": plate ${side.toLowerCase()} edge is transparent`);
        }
        if (notch.borderTopStyle !== 'solid') found.push(`label "${name}": the field's border has a gap behind it`);
        if (notch.clipPath !== 'none') found.push(`label "${name}": its cut-out is clipped (${notch.clipPath})`);
        const n = notchEl.getBoundingClientRect();
        const f = field.getBoundingClientRect();
        if (n.left - 5 < f.left - 0.5 || n.right > f.right + 0.5) found.push(`label "${name}" sticks out of its field`);
        // The text is centered in its plate (plate runs from 5px left of the cut-out to 2px left of its end).
        const l = label.getBoundingClientRect();
        const padLeft = l.left - (n.left - 5);
        const padRight = n.right - 2 - l.right;
        if (Math.abs(padLeft - padRight) > 1.5)
          found.push(`label "${name}" is off-center in its plate (${padLeft.toFixed(1)}px left, ${padRight.toFixed(1)}px right)`);
      }
      return [...new Set(found)];
    });

    // A label must not move when its field gains focus (focus thickens the border).
    const labelTop = () =>
      page.locator('island .island-name-field .mdc-floating-label').first().evaluate((l) => l.getBoundingClientRect().top);
    const restTop = await labelTop();
    await page.locator('island .island-name-field input').first().focus();
    await page.waitForTimeout(300);
    const focusTop = await labelTop();
    if (Math.abs(focusTop - restTop) > 0.1) problems.push(`label moves ${(focusTop - restTop).toFixed(2)}px on focus`);
    await page.evaluate(() => document.activeElement?.blur());

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
