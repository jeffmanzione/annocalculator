import { GameDefinition, GoodId } from '../../../games/game';
import { IslandId } from '../../../shared/mvc/models';
import { ReadonlyTable, Table } from '../../../../tools/table';

/**
 * The minimal shape computeGoodSummaryRows() actually reads, factored out so
 * it can run against either the original views.ts classes (WorldView/
 * IslandView/ProductionLineView) or the store-backed equivalents
 * (StoreWorldView/StoreIslandView/StoreProductionLineView) -- both satisfy
 * this structurally, since it only names public fields. computeGoodSummaryRows
 * itself doesn't care which one it's given.
 */
export interface SummaryWorldSource {
  islands: SummaryIslandSource[];
  tradeRoutes: SummaryTradeRouteSource[];
}

export interface SummaryIslandSource {
  id: IslandId;
  name: string;
  productionLines: SummaryProductionLineSource[];
}

export interface SummaryProductionLineSource {
  good: GoodId;
  inputGoods: GoodId[];
  numBuildings: number;
  goodsProducedPerMinute: number;
  goodsConsumedPerMinute: number;
  extraGoods: SummaryExtraGoodSource[];
}

export interface SummaryExtraGoodSource {
  good: GoodId;
  producedPerMinute: number;
}

export interface SummaryTradeRouteSource {
  sourceIslandId: IslandId;
  targetIslandId: IslandId;
  good: GoodId;
}

/** One island's production/consumption/trade numbers for a single good, shown in a GoodSummaryRow's island breakdown. */
export interface GoodSummaryCell {
  island: SummaryIslandSource;
  good: GoodId;
  localProductionPerMin: number;
  localConsumptionPerMin: number;
  importedPerMin: number;
  exportedPerMin: number;
}

/**
 * One row of the summary table: a good's totals across the whole world, plus
 * its per-island breakdown. showIslandSummary/showIslandSummaryIcon are
 * UI-only (is this row's breakdown currently expanded) -- computeGoodSummaryRows
 * always returns them collapsed; the component decorates them from whichever
 * rows were previously expanded, since that's user interaction state, not
 * something derived from the world.
 */
export interface GoodSummaryRow {
  good: GoodId;
  totalProductionPerMin: number;
  netProductionPerMin: number;
  islandSummaries: GoodSummaryCell[];
  showIslandSummary: boolean;
  showIslandSummaryIcon: string;
  hasIssue: boolean;
}

/** Net per-minute rate available at this cell: what's produced or imported, minus what's consumed or exported. Negative means the island is running a deficit of this good. */
export function availableProduction(cell?: GoodSummaryCell): number {
  if (!cell) return 0;
  return (
    cell.localProductionPerMin -
    cell.localConsumptionPerMin +
    cell.importedPerMin -
    cell.exportedPerMin
  );
}

function newCell(island: SummaryIslandSource, good: GoodId): GoodSummaryCell {
  return {
    island,
    good,
    localProductionPerMin: 0,
    importedPerMin: 0,
    exportedPerMin: 0,
    localConsumptionPerMin: 0,
  };
}

/**
 * Records what each island produces and consumes of every good from its
 * production lines alone -- before trade routes move anything between
 * islands.
 */
function computeLocalProductionAndConsumption(
  world: SummaryWorldSource,
  game: GameDefinition,
): Table<IslandId, GoodId, GoodSummaryCell> {
  const cells = new Table<IslandId, GoodId, GoodSummaryCell>();
  const record = (
    island: SummaryIslandSource,
    good: GoodId,
    netProductionPerMin: number,
  ): void => {
    const cell = cells.getOrDefault(island.id, good, () =>
      newCell(island, good),
    );
    if (netProductionPerMin > 0) {
      cell.localProductionPerMin += netProductionPerMin;
    } else {
      cell.localConsumptionPerMin -= netProductionPerMin;
    }
  };

  for (const island of world.islands) {
    for (const pl of island.productionLines) {
      record(island, pl.good, pl.goodsProducedPerMinute);
      // pl.extraGoods entries already carry their own resolved good/
      // producedPerMinute (see ProductionLineView.extraGoods /
      // StoreProductionLineView.extraGoods) -- no need to re-wrap them.
      for (const eg of pl.extraGoods) {
        record(island, eg.good, eg.producedPerMinute);
      }
      for (const ig of pl.inputGoods) {
        record(island, ig, -pl.goodsConsumedPerMinute);
      }
      // Goods the line uses up on its own, apart from its recipe (the game says which).
      for (const upkeep of game.extraConsumption(pl, island)) {
        record(island, upkeep.good, -upkeep.perMinute);
      }
    }
  }
  return cells;
}

/** Which islands each island's trade routes can ship a given good to. */
function groupTradeRoutesBySourceAndGood(
  world: SummaryWorldSource,
): ReadonlyTable<IslandId, GoodId, IslandId[]> {
  const trades = new Table<IslandId, GoodId, IslandId[]>();
  for (const tr of world.tradeRoutes) {
    trades.getOrDefault(tr.sourceIslandId, tr.good, () => []).push(tr.targetIslandId);
  }
  return trades;
}

/**
 * Moves each island's surplus of a good onto its trade routes' destinations,
 * mutating `cells` in place. Two passes per source: first split the surplus
 * evenly across destinations still running a deficit (capped at what each
 * one actually needs), then sprinkle whatever's left evenly over the
 * remaining destinations.
 */
function distributeTrades(
  cells: Table<IslandId, GoodId, GoodSummaryCell>,
  trades: ReadonlyTable<IslandId, GoodId, IslandId[]>,
): void {
  for (const [sourceIslandId, good, targetIslandIds] of trades) {
    const sourceCell = cells.get(sourceIslandId, good);
    let available = availableProduction(sourceCell);
    if (available <= 0) {
      continue;
    }

    const deficitTargets = targetIslandIds
      .map((id) => cells.get(id, good))
      .filter((c): c is GoodSummaryCell => c != null && availableProduction(c) < 0)
      .sort((c1, c2) => availableProduction(c1) - availableProduction(c2));

    for (let i = 0; i < deficitTargets.length; i++) {
      const target = deficitTargets[i];
      const share = available / (deficitTargets.length - i);
      const distribution = Math.min(share, -availableProduction(target));
      target.importedPerMin += distribution;
      sourceCell!.exportedPerMin += distribution;
      available -= distribution;
    }
    // Leftover after capping each target at what it actually needed -- split evenly.
    for (let i = 0; i < deficitTargets.length; i++) {
      const target = deficitTargets[i];
      const share = available / (deficitTargets.length - i);
      target.importedPerMin += share;
      sourceCell!.exportedPerMin += share;
      available -= share;
    }
  }
}

function newRow(good: GoodId): GoodSummaryRow {
  return {
    good,
    islandSummaries: [],
    totalProductionPerMin: 0,
    netProductionPerMin: 0,
    showIslandSummary: false,
    showIslandSummaryIcon: 'arrow_drop_down',
    hasIssue: false,
  };
}

/** A good is short somewhere with no trade route covering the gap, even though the world as a whole produces enough of it. */
function hasUncoveredDeficit(
  cells: GoodSummaryCell[],
  netProductionPerMin: number,
): boolean {
  return (
    netProductionPerMin >= 0 && cells.some((c) => availableProduction(c) < 0)
  );
}

/** One row per good defined in the game (even ones nobody's producing yet), aggregating each good's cells -- after trade distribution -- into world totals. */
function aggregateRows(
  cells: ReadonlyTable<IslandId, GoodId, GoodSummaryCell>,
  game: GameDefinition,
): Map<GoodId, GoodSummaryRow> {
  const rows = new Map<GoodId, GoodSummaryRow>();
  for (const good of game.goods) {
    rows.set(good, newRow(good));
  }
  cells.reduceLeft((good, goodCells) => {
    const row = rows.get(good);
    if (!row) return; // not a good the game lists (such as an unknown one)
    row.islandSummaries = Array.from(goodCells);
    for (const cell of row.islandSummaries) {
      row.totalProductionPerMin += cell.localProductionPerMin;
      row.netProductionPerMin += availableProduction(cell);
    }
    row.hasIssue = hasUncoveredDeficit(row.islandSummaries, row.netProductionPerMin);
  });
  return rows;
}

/**
 * Computes, from scratch, every good's world-wide production/consumption
 * summary: local production and consumption per island, then how much of
 * each island's surplus its trade routes can cover for islands running a
 * deficit. Pure function of `world` -- callers own how/when to recompute and
 * how to persist UI-only state (which rows are expanded) across calls, since
 * that isn't part of the underlying data.
 */
export function computeGoodSummaryRows(world: SummaryWorldSource, game: GameDefinition): Map<GoodId, GoodSummaryRow> {
  const cells = computeLocalProductionAndConsumption(world, game);
  const trades = groupTradeRoutesBySourceAndGood(world);
  distributeTrades(cells, trades);
  return aggregateRows(cells, game);
}
