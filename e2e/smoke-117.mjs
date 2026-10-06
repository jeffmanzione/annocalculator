// Headless check that the Anno 117 calculator works end to end, and leaves the Anno 1800 one alone.
//
//   node e2e/smoke-117.mjs [distDir]      (default: dist/annocalculator/browser)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { launchBrowser, DEFAULT_DIST, openPage, serveDist, settle as settleFn, WORLD_KEY } from './support.mjs';

const KEY_117 = 'anno-117-production-calculator-world';
const dist = path.resolve(process.argv[2] ?? DEFAULT_DIST);
const server = await serveDist(dist);
const browser = await launchBrowser(chromium);
const { page, errors } = await openPage(browser);
const settle = () => settleFn(page);
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`);
  if (!ok) failures++;
};
const saved = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), KEY_117));
const summaryText = () => page.locator('summary-panel').innerText();
const islands = () => page.locator('anno-117-island');

await page.goto(`${server.url}/anno-117`);
await page.waitForSelector('anno-117-island');
await settle();

// 1. First visit: the default world, saved under its own key and format.
check('boots with 3 default islands', (await islands().count()) === 3);
let s = await saved();
check('saved as an Anno 117 world', s.game === 'anno117' && s.version === 1 && s.world.islands.length === 3, JSON.stringify(s).slice(0, 80));
check('does not touch the Anno 1800 save', (await page.evaluate((k) => localStorage.getItem(k), WORLD_KEY)) === null);
check('the summary shows the default numbers', /Bread[\s\S]*6\/m/.test(await summaryText()));
check('the page title names the game', (await page.title()).includes('Anno 117'));

// The efficiency explains itself on hover (the island must sit above the background logo layer to get the pointer).
await islands().nth(0).locator('composite-number').first().hover();
await page.waitForTimeout(700);
check('hovering an efficiency shows where it comes from', /Base Productivity/.test(await page.locator('.tooltip-container').first().innerText().catch(() => '')));
await page.mouse.move(5, 5);

// Buildings and goods explain themselves on hover too.
{
  const hoverText = async (locator, text) => {
    await locator.hover();
    await page.waitForTimeout(700);
    const shown = await page.locator('.tooltip-container').allInnerTexts();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(200);
    return shown.some((s) => text.test(s)) ? true : shown.join(' | ').replace(/\s+/g, ' ').slice(0, 200);
  };
  const roma = islands().nth(1);
  const building = await hoverText(roma.locator('tbody tr').nth(1).locator('enum-select .item-container').first(), /Bakery[\s\S]*Inputs[\s\S]*Flour[\s\S]*Output[\s\S]*Bread/);
  check('hovering a building shows what it makes and needs', building === true, String(building));
  const good = await hoverText(roma.locator('tbody tr').nth(1).locator('td.goods-field').nth(1).locator('.item-container').first(), /Bread[\s\S]*Made By[\s\S]*Bakery/);
  check('hovering a good shows where it is made', good === true, String(good));
}

// 2. Editing: the count changes the totals and is saved.
const count = (island, line) => islands().nth(island).locator('input[aria-label="numBuildings"]').nth(line);
await count(0, 0).fill('6');
await settle();
s = await saved();
check('a count edit is saved', s.world.islands[0].productionLines[0].numBuildings === 6);
check('and changes the totals (6 farms with an aqueduct make 9 wheat a minute)', /Wheat[\s\S]*?9\/m/.test(await summaryText()), (await summaryText()).replace(/\s+/g, ' ').slice(0, 160));

// 3. The aqueduct switches off, which lowers the output.
await islands().nth(0).locator('mat-checkbox').first().click();
await settle();
s = await saved();
check('the aqueduct is saved as off', s.world.islands[0].productionLines[0].aqueduct === undefined);
check('and 6 farms make 6 wheat a minute', /Wheat[\s\S]*?6\/m/.test(await summaryText()));

// 4. The stepper arrows.
await islands().nth(0).locator('.count-step-up').first().click();
await settle();
check('the count arrows add one', (await count(0, 0).inputValue()) === '7');

// 5. Adding an island and a line.
await page.getByRole('button', { name: 'Add Island' }).click();
await settle();
check('adding an island makes 4', (await islands().count()) === 4);
await islands().nth(3).getByRole('button', { name: 'Add Production Line' }).click();
await settle();
s = await saved();
check('the new island has a line, saved', s.world.islands[3].productionLines.length === 1 && s.world.islands[3].session === 3245);

// 6. A reload keeps everything.
await page.reload();
await page.waitForSelector('anno-117-island');
await settle();
check('a reload keeps the islands and the edit', (await islands().count()) === 4 && (await count(0, 0).inputValue()) === '7');

// 6b. Buildings that burn coal show it among their inputs, and a repeatable discovery has a level.
check('a coal-burning building lists Coal with its use per minute', (await page.locator('.extra-good').filter({ hasText: /Coal.*\/m/s }).count()) > 0);
const levelInput = page.locator('input[aria-label^="repeatable-tech-"]');
await levelInput.fill('17');
await levelInput.press('Tab');
await settle();
const repeatableId = JSON.parse(fs.readFileSync(path.resolve('src/app/games/anno117/data/anno117-data.json'), 'utf8')).techs.find((t) => t.repeatable).id;
s = await saved();
check('a repeatable discovery saves one entry per level', s.world.techs.filter((t) => t === repeatableId).length === 3, JSON.stringify(s.world.techs));
await page.reload();
await page.waitForSelector('anno-117-island');
check('and shows the level again after a reload, in percent, with a typed 17% cut down to 15%', (await levelInput.inputValue()) === '15');
await levelInput.fill('0');
await levelInput.press('Tab');
await settle();

// 6c. A line with extra output (a pig farm with a silo) has an Extras button and a table whose source has a tooltip.
{
  const withSilo = await saved();
  withSilo.world.islands[0].productionLines.push({ id: 900, building: 2793, numBuildings: 2, silo: true });
  await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY_117, withSilo]);
  await page.reload();
  await page.waitForSelector('anno-117-island');
  await settle();
  const table = () => islands().nth(0).locator('table.extra-goods-table');
  check('extra goods are shown by default', (await table().count()) === 1);
  await islands().nth(0).locator('td.extras-field ac-button').click();
  await settle();
  check('the Extras button hides them', (await table().count()) === 0);
  await islands().nth(0).locator('td.extras-field ac-button').click();
  await settle();
  check('and shows them again', (await table().count()) === 1);
  await table().locator('tbody td').nth(1).locator('.item-container').first().hover();
  await page.waitForTimeout(800);
  const sourceTip = (await page.locator('.tooltip-container').allInnerTexts()).join(' ').replace(/\s+/g, ' ');
  check('the source has a tooltip', /Silo/.test(sourceTip) && /Productivity/.test(sourceTip), sourceTip);
  await page.mouse.move(5, 5);
  const restored = await saved();
  restored.world.islands[0].productionLines = restored.world.islands[0].productionLines.filter((l) => l.id !== 900);
  await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY_117, restored]);
  await page.reload();
  await page.waitForSelector('anno-117-island');
  await settle();
}

// 7. The language follows into the goods' names (the game's own German name).
const data = JSON.parse(fs.readFileSync(path.resolve('src/app/games/anno117/data/anno117-data.json'), 'utf8'));
const wheat = data.products.find((p) => p.id === 2069);
await page.locator('mat-toolbar mat-select').click();
await page.getByRole('option', { name: 'De', exact: true }).click();
await settle();
check('goods are named in German', (await summaryText()).includes(wheat.name.de ?? wheat.name.en), wheat.name.de);

// 8. Moving an island to the other province swaps its buildings for that province's.
await page.locator('mat-toolbar mat-select').click();
await page.getByRole('option', { name: 'En', exact: true }).click();
await settle();
await islands().nth(1).locator('enum-select').nth(0).click();
await page.locator('mat-option').filter({ hasText: 'Albion' }).click();
await settle();
s = await saved();
const celtic = new Set(data.factories.filter((f) => f.regions.includes('Celtic')).map((f) => f.id));
check('the island moves to Albion with Celtic buildings', s.world.islands[1].session === 6627 && s.world.islands[1].productionLines.every((l) => celtic.has(l.building)));

// 9. The calculators keep separate saves.
await page.goto(`${server.url}/calculator`);
await page.waitForSelector('island');
await settle();
check('visiting the Anno 1800 page makes its own save', (await page.evaluate((k) => localStorage.getItem(k), WORLD_KEY)) !== null);
check('and leaves the Anno 117 one as it was', (await saved()).world.islands.length === 4);

check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
await server.close();
console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
process.exit(failures ? 1 : 0);
