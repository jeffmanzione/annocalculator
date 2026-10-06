import { Good } from '../../../games/anno1800/game/enums';
import { anno1800Game } from '../../../games/anno1800/anno1800-game';
import { featureWorld, round, viewOf } from '../../../shared/mvc/test-worlds';
import { World } from '../../../shared/mvc/models';
import { defaultWorld } from '../default-world';
import {
  availableProduction,
  computeGoodSummaryRows,
} from './summary-panel-store';

const summarize = (world: World) =>
  [...computeGoodSummaryRows(viewOf(structuredClone(world)), anno1800Game).values()]
    .filter((row) => row.islandSummaries.length > 0)
    .map((row) => ({
      good: row.good,
      totalProductionPerMin: round(row.totalProductionPerMin),
      netProductionPerMin: round(row.netProductionPerMin),
      hasIssue: row.hasIssue,
      islands: row.islandSummaries.map((c) => ({
        island: c.island.name,
        produced: round(c.localProductionPerMin),
        consumed: round(c.localConsumptionPerMin),
        imported: round(c.importedPerMin),
        exported: round(c.exportedPerMin),
      })),
    }));

const row = (world: World, good: Good) =>
  computeGoodSummaryRows(viewOf(structuredClone(world)), anno1800Game).get(good)!;

describe('computeGoodSummaryRows', () => {
  it('default world summary', () => {
    expect(summarize(defaultWorld)).toMatchSnapshot();
  });

  it('feature world summary', () => {
    expect(summarize(featureWorld())).toMatchSnapshot();
  });

  it('has one collapsed row per known good, produced or not', () => {
    const rows = computeGoodSummaryRows(viewOf(featureWorld()), anno1800Game);
    expect(rows.has(Good.Unknown)).toBe(false);
    expect(rows.get(Good.Gold)?.islandSummaries).toEqual([]);
    expect([...rows.values()].every((r) => !r.showIslandSummary)).toBe(true);
  });

  it('Silo upkeep consumes Grain in the Old World and Corn in the New World', () => {
    const old = row(featureWorld(), Good.Grain).islandSummaries.find(
      (c) => c.island.name === 'Old Isle',
    )!;
    // 4 pig farms with a Silo consume 0.2/min each (plus Flour Mill input).
    expect(old.localConsumptionPerMin).toBeGreaterThanOrEqual(0.8);
    const corn = row(featureWorld(), Good.Corn).islandSummaries.find(
      (c) => c.island.name === 'New Isle',
    )!;
    expect(corn.localConsumptionPerMin).toBeCloseTo(0.4);
  });

  it('Fertiliser upkeep consumes 0.2/min per building', () => {
    const cells = row(featureWorld(), Good.Fertiliser).islandSummaries;
    const oldIsle = cells.find((c) => c.island.name === 'Old Isle')!;
    const newIsle = cells.find((c) => c.island.name === 'New Isle')!;
    expect(oldIsle.localConsumptionPerMin).toBeCloseTo(0.6);
    expect(newIsle.localConsumptionPerMin).toBeCloseTo(0.4);
  });

  it('trade routes move surplus to islands in deficit, capped at the need', () => {
    const grain = row(featureWorld(), Good.Grain);
    const source = grain.islandSummaries.find(
      (c) => c.island.name === 'Land Reform Isle',
    )!;
    const targets = grain.islandSummaries.filter(
      (c) => c.island.name !== 'Land Reform Isle',
    );
    const imported = targets.reduce((sum, c) => sum + c.importedPerMin, 0);
    expect(source.exportedPerMin).toBeCloseTo(imported);
    for (const c of targets) {
      if (c.importedPerMin > 0) {
        expect(availableProduction(c)).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it('flags a deficit with no covering route when the world overall has enough', () => {
    // Old Isle makes a Flour surplus but has no route to Galvanic Isle's Bakery.
    const flour = row(featureWorld(), Good.Flour);
    expect(flour.netProductionPerMin).toBeGreaterThanOrEqual(0);
    expect(flour.hasIssue).toBe(true);
  });

  it('does not flag an issue once a route covers the deficit', () => {
    const w = featureWorld();
    w.tradeRoutes.push({
      id: 9,
      sourceIslandId: 1,
      targetIslandId: 3,
      good: Good.Flour,
    });
    expect(row(w, Good.Flour).hasIssue).toBe(false);
  });

  it('availableProduction of a missing cell is 0', () => {
    expect(availableProduction(undefined)).toBe(0);
  });
});
