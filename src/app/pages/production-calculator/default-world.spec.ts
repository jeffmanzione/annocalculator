import { Good, Region } from '../../shared/game/enums';
import { lookupProductionInfo } from '../../shared/game/facts';
import { viewOf } from '../../shared/mvc/test-worlds';
import { defaultWorld } from './default-world';
import {
  availableProduction,
  computeGoodSummaryRows,
} from './summary-panel/summary-panel-store';

// The default world is a newcomer's first impression and what "Reset" restores,
// so these pin the qualities that make it a good starting point.
describe('default world', () => {
  const summary = () =>
    computeGoodSummaryRows(viewOf(structuredClone(defaultWorld)));

  it('is in balance: no good is short anywhere, even before trade is considered overall', () => {
    for (const row of summary().values()) {
      expect(row.netProductionPerMin, row.good).toBeGreaterThanOrEqual(-1e-9);
      for (const cell of row.islandSummaries) {
        // Per island, after the trade routes have moved goods around.
        expect(
          availableProduction(cell),
          `${row.good} on ${cell.island.name}`,
        ).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it('shows no warnings in the summary', () => {
    expect(
      [...summary().values()]
        .filter((row) => row.hasIssue)
        .map((row) => row.good),
    ).toEqual([]);
  });

  it('turns out Bread and Fur Coats as its finished goods', () => {
    const rows = summary();
    expect(rows.get(Good.Bread)!.netProductionPerMin).toBeCloseTo(4);
    expect(rows.get(Good.FurCoats)!.netProductionPerMin).toBeCloseTo(2);
  });

  it('consumes exactly what its chains produce, so nothing is wasted', () => {
    const rows = summary();
    for (const good of [
      Good.Grain,
      Good.Flour,
      Good.Furs,
      Good.Cotton,
      Good.CottonFabric,
    ]) {
      expect(rows.get(good)!.netProductionPerMin, good).toBeCloseTo(0);
    }
  });

  it('covers the Old World, Cape Trelawney and the New World', () => {
    expect(
      new Set(defaultWorld.islands.map((island) => island.region)),
    ).toEqual(
      new Set([Region.OldWorld, Region.CapeTrelawney, Region.NewWorld]),
    );
  });

  it('keeps the advanced options off so there is nothing to explain yet', () => {
    expect(defaultWorld.tradeUnionBonus ?? 0).toBe(0);
    for (const island of defaultWorld.islands) {
      expect(island.dolPolicy, island.name).toBeUndefined();
      for (const line of island.productionLines) {
        expect(line.boosts ?? [], `${island.name}/${line.building}`).toEqual(
          [],
        );
        expect(line.items ?? [], `${island.name}/${line.building}`).toEqual([]);
        expect(
          line.culturalSets ?? [],
          `${island.name}/${line.building}`,
        ).toEqual([]);
        expect(line.hasTradeUnion ?? false).toBe(false);
      }
    }
  });

  it('only uses buildings the game allows in each island region', () => {
    for (const island of defaultWorld.islands) {
      for (const line of island.productionLines) {
        const info = lookupProductionInfo(line.building)!;
        expect(
          info.allowedRegions,
          `${line.building} on ${island.name}`,
        ).toContain(island.region);
        expect(info.good, line.building).toBe(line.good);
        expect(info.inputGoods ?? [], line.building).toEqual(
          line.inputGoods ?? [],
        );
      }
    }
  });

  it('has trade routes between real, different islands carrying goods the source makes', () => {
    const ids = defaultWorld.islands.map((island) => island.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const route of defaultWorld.tradeRoutes) {
      expect(ids).toContain(route.sourceIslandId);
      expect(ids).toContain(route.targetIslandId);
      expect(route.sourceIslandId).not.toBe(route.targetIslandId);
      const source = defaultWorld.islands.find(
        (island) => island.id === route.sourceIslandId,
      )!;
      expect(source.productionLines.map((line) => line.good)).toContain(
        route.good,
      );
    }
  });
});
