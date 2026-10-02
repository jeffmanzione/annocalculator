// Headless end-to-end smoke test: drives the built app through edits,
// adds/removes, and a reload, checking what's saved to localStorage and
// that components aren't needlessly recreated. See README.md.
//
//   node e2e/smoke.mjs [distDir]      (default: dist/annocalculator/browser)
import { chromium } from 'playwright';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, openPage, savedWorld, serveDist, settle as settleFn } from './support.mjs';

const dist = path.resolve(process.argv[2] ?? DEFAULT_DIST);
const server = await serveDist(dist);

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`);
  if (!ok) failures++;
};

const browser = await launchBrowser(chromium);
const { page, errors } = await openPage(browser);

const saved = () => savedWorld(page);
const islands = () => page.locator('island');
const settle = () => settleFn(page);

await page.goto(`${server.url}/calculator`);
await page.waitForSelector('island');
await settle();

// 1. Boot with the default world.
check('boots with 3 default islands', (await islands().count()) === 3);
check('trade routes table shows 3 rows', (await page.locator('trade-routes-panel tr.mat-mdc-row').count()) === 3);
const summaryRowsBefore = await page.locator('summary-panel tr.mat-mdc-row').count();
check('summary panel renders rows', summaryRowsBefore > 0, `${summaryRowsBefore} rows`);

// Tag each <island> DOM node so we can tell later whether Angular destroyed/recreated it.
await page.evaluate(() => document.querySelectorAll('island').forEach((el, i) => (el.__marker = 'orig-' + i)));
const markers = () => page.evaluate(() => [...document.querySelectorAll('island')].map((el) => el.__marker ?? null));

// 2. Rename island 1 -> persisted + header updates.
const name0 = islands().nth(0).locator('input[aria-label="name"]');
await name0.fill('Crown Falls Renamed');
await settle();
let s = await saved();
check('rename persists to localStorage', s?.islands?.[0]?.name === 'Crown Falls Renamed', s?.islands?.[0]?.name);
check(
  'panel header shows new name',
  (await page.locator('mat-panel-title').nth(0).innerText()).includes('Crown Falls Renamed'),
);
check(
  'island components not recreated by an edit',
  JSON.stringify(await markers()) === JSON.stringify(['orig-0', 'orig-1', 'orig-2']),
  JSON.stringify(await markers()),
);

// 3. Change a building count -> persisted + summary recomputes.
const summaryTextBefore = await page.locator('summary-panel').innerText();
const count0 = islands().nth(0).locator('input[aria-label="numBuildings"]').first();
await count0.fill('20');
await settle();
s = await saved();
check(
  'numBuildings edit persists',
  s.islands[0].productionLines[0].numBuildings === 20,
  String(s.islands[0].productionLines[0].numBuildings),
);
check('summary panel updates after edit', (await page.locator('summary-panel').innerText()) !== summaryTextBefore);

// 4. Add an island -> existing islands keep their component instances; new island edits persist.
await page.getByRole('button', { name: 'Add Island' }).click();
await settle();
check('add island -> 4 islands', (await islands().count()) === 4);
check(
  'existing islands survive add (not recreated)',
  JSON.stringify((await markers()).slice(0, 3)) === JSON.stringify(['orig-0', 'orig-1', 'orig-2']),
  JSON.stringify(await markers()),
);
check('island 1 form kept its edited name', (await name0.inputValue()) === 'Crown Falls Renamed');
s = await saved();
check('added island persisted', s.islands.length === 4);
check('added island got a first production line', (s.islands[3].productionLines ?? []).length === 1);
await islands().nth(3).locator('input[aria-label="name"]').fill('New Isle');
await settle();
s = await saved();
check('editing the newly added island persists', s.islands[3].name === 'New Isle', s.islands[3].name);

// 5. Trade routes: new island shows up in the origin dropdown; add/remove routes persist.
await page.locator('trade-routes-panel mat-select').first().click();
await settle();
const options = await page.locator('mat-option').allInnerTexts();
check(
  'trade-route dropdown lists renamed + new island',
  options.some((o) => o.includes('Crown Falls Renamed')) || options.some((o) => o.includes('New Isle')),
  JSON.stringify(options),
);
await page.keyboard.press('Escape');
await settle();

// 5b. Trade-route row dropdowns read live store state.
const row0 = page.locator('trade-routes-panel tr.mat-mdc-row').first();
await row0.locator('mat-select').nth(1).click();
await settle();
let destOpts = await page.locator('mat-option').allInnerTexts();
check(
  'destination dropdown shows renamed + new island, not the origin',
  destOpts.some((o) => o.includes('Crown Falls Renamed')) &&
    destOpts.some((o) => o.includes('New Isle')) &&
    !destOpts.some((o) => o.includes('Farm Island')),
  JSON.stringify(destOpts),
);
await page.locator('mat-option').filter({ hasText: 'New Isle' }).click();
await settle();
s = await saved();
check(
  'changing a route destination persists',
  s.tradeRoutes[0].targetIslandId === s.islands[3].id,
  `${s.tradeRoutes[0].targetIslandId} vs ${s.islands[3].id}`,
);
check(
  'edited route row still shows its good (regression in 31af495: showed None)',
  (await row0.locator('enum-select').innerText()).includes('Grain'),
  await row0.locator('enum-select').innerText(),
);
await row0.locator('mat-select').nth(0).click();
await settle();
const originOpts = await page.locator('mat-option').allInnerTexts();
check(
  'origin dropdown now excludes the new destination',
  originOpts.some((o) => o.includes('Crown Falls Renamed')) && !originOpts.some((o) => o.includes('New Isle')),
  JSON.stringify(originOpts),
);
await page.keyboard.press('Escape');
await settle();
await islands().nth(1).locator('input[aria-label="name"]').fill('Farm Renamed');
await settle();
check(
  'trade-route origin shows an island renamed elsewhere',
  (await row0.locator('mat-select').nth(0).innerText()).includes('Farm Renamed'),
  await row0.locator('mat-select').nth(0).innerText(),
);
await row0.locator('enum-select').click();
await settle();
const goodOpts = await page.locator('mat-option').allInnerTexts();
check(
  "goods dropdown lists the origin island's goods",
  ['Grain', 'Furs'].every((g) => goodOpts.some((o) => o.includes(g))),
  JSON.stringify(goodOpts),
);
await page.keyboard.press('Escape');
await settle();
const nBefore = (await saved()).tradeRoutes.length;
const editedId = (await saved()).tradeRoutes[0].id;
await row0.locator('.remove-field ac-button').click();
await settle();
s = await saved();
check(
  'deleting an edited route works (regression in 31af495: click did nothing)',
  s.tradeRoutes.length === nBefore - 1 && !s.tradeRoutes.some((t) => t.id === editedId),
  `${nBefore} -> ${s.tradeRoutes.length}`,
);
await page.getByRole('button', { name: 'Add Trade Route' }).click();
await settle();
s = await saved();
check('add trade route persists', s.tradeRoutes.length === nBefore, String(s.tradeRoutes.length));
check(
  `trade routes table shows ${nBefore} rows`,
  (await page.locator('trade-routes-panel tr.mat-mdc-row').count()) === nBefore,
);
await page.locator('trade-routes-panel tr.mat-mdc-row').last().locator('ac-button, button').last().click();
await settle();
s = await saved();
check('remove trade route persists', s.tradeRoutes.length === nBefore - 1, String(s.tradeRoutes.length));

// 6. Remove the added island (by id) -> the right one goes; others untouched.
await page.locator('.delete-island-button').nth(3).click();
await settle();
check('remove island -> 3 islands', (await islands().count()) === 3);
check(
  'remaining islands not recreated',
  JSON.stringify(await markers()) === JSON.stringify(['orig-0', 'orig-1', 'orig-2']),
  JSON.stringify(await markers()),
);
s = await saved();
check(
  'removed island gone from storage, others intact',
  s.islands.length === 3 &&
    !s.islands.some((i) => i.name === 'New Isle') &&
    s.islands[0].name === 'Crown Falls Renamed',
);

// 7. Remove a middle island -> correct one removed (id, not index, based).
const idsBefore = s.islands.map((i) => i.id);
await page.locator('.delete-island-button').nth(1).click();
await settle();
s = await saved();
check(
  'removing middle island removes that id',
  JSON.stringify(s.islands.map((i) => i.id)) === JSON.stringify([idsBefore[0], idsBefore[2]]),
  JSON.stringify(s.islands.map((i) => i.id)),
);
check(
  'middle removal keeps neighbours alive',
  JSON.stringify(await markers()) === JSON.stringify(['orig-0', 'orig-2']),
  JSON.stringify(await markers()),
);

// 8. Reload -> state round-trips.
const beforeReload = await saved();
await page.reload();
await page.waitForSelector('island');
await settle();
check('reload shows persisted islands', (await islands().count()) === 2);
check(
  'reload keeps renamed island',
  (await islands().nth(0).locator('input[aria-label="name"]').inputValue()) === 'Crown Falls Renamed',
);
await page.locator('input[aria-label="tradeUnionBonusPercent"]').fill('50');
await settle();
s = await saved();
check('trade union bonus persists', s.tradeUnionBonus === 0.5, String(s.tradeUnionBonus));
check(
  'saved JSON shape stable across reload (except bonus)',
  JSON.stringify({ ...s, tradeUnionBonus: beforeReload.tradeUnionBonus }) === JSON.stringify(beforeReload),
);

// 9. Minimization still applies: no empty arrays / default fields stored.
const raw = JSON.stringify(s);
check('no islandId leaks into saved JSON', !raw.includes('islandId'));

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
await server.close();
console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
process.exit(failures ? 1 : 0);
