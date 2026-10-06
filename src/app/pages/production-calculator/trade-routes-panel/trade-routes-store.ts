import { Good } from '../../../games/anno1800/game/enums';
import { IslandId, TradeRoute } from '../../../shared/mvc/models';

/**
 * Read-only summary of an island, as needed by the trade routes table
 * (name for the origin/destination dropdowns, producedGoods for the goods
 * dropdown).
 */
export interface IslandSummary {
  id: IslandId;
  name: string;
  producedGoods: Good[];
}

// Pure option-filtering rules for a trade-route row's dropdowns. These used
// to be methods on a TradeRoutesStore class that kept its own mirror of the
// world's trade routes and islands; now that the panel reads WorldStore's
// signals directly, only the rules themselves are left.

/** Islands selectable as a route's origin: any island but the current destination. */
export function originOptions(
  tradeRoute: TradeRoute,
  islands: IslandSummary[],
): IslandSummary[] {
  return islands.filter((i) => i.id !== tradeRoute.targetIslandId);
}

/** Islands selectable as a route's destination: any island but the current origin. */
export function destinationOptions(
  tradeRoute: TradeRoute,
  islands: IslandSummary[],
): IslandSummary[] {
  return islands.filter((i) => i.id !== tradeRoute.sourceIslandId);
}

/** Goods shippable on a route: whatever its origin island currently produces. */
export function goodOptions(
  tradeRoute: TradeRoute,
  islands: IslandSummary[],
): Good[] {
  return (
    islands.find((i) => i.id === tradeRoute.sourceIslandId)?.producedGoods ??
    []
  );
}
