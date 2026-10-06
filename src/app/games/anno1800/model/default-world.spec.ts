import { Good, Item, Region } from '../game/enums';
import { anno1800Game } from '../anno1800-game';
import { lookupItemInfo, lookupProductionInfo } from '../game/facts';
import { viewOf } from './test-worlds';
import { defaultWorld } from './default-world';
import {
  availableProduction,
  computeGoodSummaryRows,
} from '../../../pages/calculator/summary-panel/summary-panel-store';

// The default world is a newcomer's first impression and what "Reset" restores,
// so these pin the qualities that make it a good starting point.
describe('default world', () => {
  const summary = () =>
    computeGoodSummaryRows(viewOf(structuredClone(defaultWorld)), anno1800Game);

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

  it('turns out Bread, Chocolate and Fur Coats as its finished goods', () => {
    const rows = summary();
    // 4 Bakeries at +30% (Fine Cake Decorator); the item also adds 1/5 Chocolate.
    expect(rows.get(Good.Bread)!.netProductionPerMin).toBeCloseTo(5.2);
    expect(rows.get(Good.Chocolate)!.netProductionPerMin).toBeCloseTo(1.04);
    expect(rows.get(Good.FurCoats)!.netProductionPerMin).toBeCloseTo(2);
  });

  it('wastes next to nothing: intermediate goods leave under 1/min to spare', () => {
    const rows = summary();
    for (const good of [
      Good.Grain,
      Good.Flour,
      Good.Furs,
      Good.Cotton,
      Good.CottonFabric,
    ]) {
      const net = rows.get(good)!.netProductionPerMin;
      expect(net, good).toBeGreaterThanOrEqual(-1e-9);
      expect(net, good).toBeLessThan(1);
    }
  });

  it('covers the Old World, Cape Trelawney and the New World', () => {
    expect(
      new Set(defaultWorld.islands.map((island) => island.region)),
    ).toEqual(
      new Set([Region.OldWorld, Region.CapeTrelawney, Region.NewWorld]),
    );
  });

  it('shows a few items but keeps every other advanced option off', () => {
    expect(defaultWorld.palacePrestigeLevel).toBeUndefined();
    expect(defaultWorld.tradeUnionBonus).toBeUndefined();
    const items: Item[] = [];
    for (const island of defaultWorld.islands) {
      expect(island.dolPolicy, island.name).toBeUndefined();
      for (const line of island.productionLines) {
        const where = `${island.name}/${line.building}`;
        expect(line.boosts ?? [], where).toEqual([]);
        expect(line.culturalSets ?? [], where).toEqual([]);
        // Items only work inside a trade union, so a line with items must have it ticked.
        if ((line.items ?? []).length > 0) {
          expect(line.hasTradeUnion, where).toBe(true);
          // And each must be a specialist for this very building.
          for (const item of line.items!) {
            expect(
              lookupItemInfo(item)!.targets,
              `${item} on ${where}`,
            ).toContain(line.building);
          }
        }
        items.push(...(line.items ?? []));
      }
    }
    // "A few": enough to demonstrate, not so many it overwhelms.
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.length).toBeLessThanOrEqual(5);
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
