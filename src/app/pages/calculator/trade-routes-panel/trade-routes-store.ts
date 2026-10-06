import { GoodId } from '../../../games/game';
import { EntityId } from '../../../shared/engine/base-world-store';

/** A trade route as the trade routes table edits it. */
export interface TradeRouteEditor {
  readonly id: EntityId;
  sourceIslandId: EntityId;
  targetIslandId: EntityId;
  good: GoodId;
}

/** What the trade routes table needs from a world: its islands and routes, and a way to add and remove routes. */
export interface TradeRoutesWorld {
  readonly islands: readonly IslandSummary[];
  readonly tradeRoutes: readonly TradeRouteEditor[];
  addTradeRoute(): void;
  removeTradeRoute(id: EntityId): void;
}

/**
 * Read-only summary of an island, as needed by the trade routes table
 * (name for the origin/destination dropdowns, producedGoods for the goods
 * dropdown).
 */
export interface IslandSummary {
  id: EntityId;
  name: string;
  producedGoods: GoodId[];
}

// Pure option-filtering rules for a trade-route row's dropdowns. These used
// to be methods on a TradeRoutesStore class that kept its own mirror of the
// world's trade routes and islands; now that the panel reads WorldStore's
// signals directly, only the rules themselves are left.

/** Islands selectable as a route's origin: any island but the current destination. */
export function originOptions(
  tradeRoute: Pick<TradeRouteEditor, 'targetIslandId'>,
  islands: IslandSummary[],
): IslandSummary[] {
  return islands.filter((i) => i.id !== tradeRoute.targetIslandId);
}

/** Islands selectable as a route's destination: any island but the current origin. */
export function destinationOptions(
  tradeRoute: Pick<TradeRouteEditor, 'sourceIslandId'>,
  islands: IslandSummary[],
): IslandSummary[] {
  return islands.filter((i) => i.id !== tradeRoute.sourceIslandId);
}

/** Goods shippable on a route: whatever its origin island currently produces. */
export function goodOptions(
  tradeRoute: Pick<TradeRouteEditor, 'sourceIslandId'>,
  islands: IslandSummary[],
): GoodId[] {
  return (
    islands.find((i) => i.id === tradeRoute.sourceIslandId)?.producedGoods ?? []
  );
}
