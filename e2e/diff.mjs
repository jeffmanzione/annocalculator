// Differential test: runs the same UI edit sequence against two builds
// and compares the saved localStorage JSON after every step (ids
// normalized). Use it to check a refactor doesn't change what gets saved.
// See README.md.
//
//   node e2e/diff.mjs <baselineDistDir> <candidateDistDir>
//
// Exits 1 if any step differs.
import { chromium } from 'playwright';
import path from 'node:path';
import {
  launchBrowser,
  deepDiff,
  normalizeIds,
  openPage,
  savedWorld,
  serveDist,
  settle as settleFn,
} from './support.mjs';

const [baselineDir, candidateDir] = process.argv.slice(2);
if (!baselineDir || !candidateDir) {
  console.error('usage: node e2e/diff.mjs <baselineDistDir> <candidateDistDir>');
  process.exit(2);
}

async function run(dist) {
  const server = await serveDist(path.resolve(dist));
  const browser = await launchBrowser(chromium);
  const { page, errors } = await openPage(browser);
  const snaps = [];
  const settle = () => settleFn(page);
  const snap = async (label) => {
    await settle();
    snaps.push([label, normalizeIds(await savedWorld(page))]);
  };
  const island = (i) => page.locator('island').nth(i);

  await page.goto(`${server.url}/calculator`);
  await page.waitForSelector('island');
  await settle();

  await island(0).locator('input[aria-label="name"]').fill('Renamed');
  await snap('rename island 0');
  await island(0).locator('input[aria-label="numBuildings"]').first().fill('20');
  await snap('numBuildings');
  await island(0).locator('mat-checkbox').first().click();
  await snap('toggle hasTradeUnion off (clears items)');
  await island(0).locator('mat-checkbox').first().click();
  await snap('toggle hasTradeUnion back on');
  await island(1).locator('enum-select[formcontrolname="region"]').click();
  await settle();
  await page.locator('mat-option').filter({ hasText: 'New World' }).first().click();
  await snap('island 1 region -> New World (clears dolPolicy)');
  await page.getByRole('button', { name: 'Add Island' }).click();
  await snap('add island');
  await island(3).locator('input[aria-label="name"]').fill('Fourth');
  await snap('rename new island');
  await island(3).getByRole('button', { name: 'Add Production Line' }).click();
  await snap('add production line to new island');
  await page.locator('trade-routes-panel tr.mat-mdc-row').first().locator('mat-select').nth(1).click();
  await settle();
  await page.locator('mat-option').filter({ hasText: 'Fourth' }).click();
  await snap('change route 0 destination -> new island');
  await page.getByRole('button', { name: 'Add Trade Route' }).click();
  await snap('add trade route');
  await page.locator('trade-routes-panel tr.mat-mdc-row').first().locator('ac-button, button').last().click();
  await snap('remove first trade route');
  await page.locator('.delete-island-button').nth(1).click();
  await snap('remove island 1');
  await page.locator('input[aria-label="tradeUnionBonusPercent"]').fill('50');
  await snap('trade union bonus 50%');
  await page.locator('input[aria-label="tradeUnionBonusPercent"]').fill('30');
  await snap('trade union bonus back to default');

  await browser.close();
  await server.close();
  return { snaps, errors };
}

const baseline = await run(baselineDir);
const candidate = await run(candidateDir);
let differing = 0;
for (let i = 0; i < Math.max(baseline.snaps.length, candidate.snaps.length); i++) {
  const [label, a] = baseline.snaps[i] ?? ['(missing)', undefined];
  const [, b] = candidate.snaps[i] ?? ['(missing)', undefined];
  const diffs = deepDiff(a, b);
  if (diffs.length) differing++;
  console.log(`${diffs.length ? 'DIFF' : 'SAME'}  ${label}`);
  for (const line of diffs.slice(0, 12)) console.log(`    ${line}`);
}
console.log('baseline errors:', baseline.errors.length, baseline.errors.slice(0, 3));
console.log('candidate errors:', candidate.errors.length, candidate.errors.slice(0, 3));
const failed = differing > 0 || baseline.errors.length > 0 || candidate.errors.length > 0;
console.log(differing ? `${differing} step(s) differ` : 'ALL STEPS IDENTICAL');
process.exit(failed ? 1 : 0);
