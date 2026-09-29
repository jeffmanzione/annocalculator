import { computed, Signal, signal } from '@angular/core';
import { Good } from '../../../shared/game/enums';
import { IslandId, TradeRoute, TradeRouteId } from '../../../shared/mvc/models';

/**
 * Read-only summary of an island, as needed by the trade routes table
 * (name for the origin/destination dropdowns, producedGoods for the goods
 * dropdown). This store is not the source of truth for islands -- it's
 * refreshed from whatever currently owns island state -- only for trade
 * routes.
 */
export interface IslandSummary {
  id: IslandId;
  name: string;
  producedGoods: Good[];
}

/**
 * Normalized, id-keyed state for the trade routes panel.
 *
 * Trade routes are addressed by id rather than nested in a parent object,
 * so a lookup or edit doesn't need a manually-threaded parent context (see
 * the "Domain Layer Redesign" doc in the project). This is a first,
 * contained application of that idea to a single page, ahead of a full
 * migration of the rest of the domain layer.
 */
export class TradeRoutesStore {
  private readonly tradeRoutes_ = signal(new Map<TradeRouteId, TradeRoute>());
  private readonly islands_ = signal(new Map<IslandId, IslandSummary>());

  readonly tradeRoutes: Signal<TradeRoute[]> = computed(() => [
    ...this.tradeRoutes_().values(),
  ]);

  loadTradeRoutes(tradeRoutes: TradeRoute[]): void {
    this.tradeRoutes_.set(new Map(tradeRoutes.map((tr) => [tr.id, tr])));
  }

  loadIslands(islands: IslandSummary[]): void {
    this.islands_.set(new Map(islands.map((i) => [i.id, i])));
  }

  tradeRoute(id: TradeRouteId): TradeRoute | undefined {
    return this.tradeRoutes_().get(id);
  }

  island(id: IslandId | null | undefined): IslandSummary | undefined {
    return id == null ? undefined : this.islands_().get(id);
  }

  /** Islands selectable as a route's origin: any island but the current destination. */
  originOptions(tradeRouteId: TradeRouteId): IslandSummary[] {
    const targetId = this.tradeRoute(tradeRouteId)?.targetIslandId;
    return [...this.islands_().values()].filter((i) => i.id !== targetId);
  }

  /** Islands selectable as a route's destination: any island but the current origin. */
  destinationOptions(tradeRouteId: TradeRouteId): IslandSummary[] {
    const sourceId = this.tradeRoute(tradeRouteId)?.sourceIslandId;
    return [...this.islands_().values()].filter((i) => i.id !== sourceId);
  }

  /** Goods shippable on a route: whatever its origin island currently produces. */
  goodOptions(tradeRouteId: TradeRouteId): Good[] {
    const sourceId = this.tradeRoute(tradeRouteId)?.sourceIslandId;
    return this.island(sourceId)?.producedGoods ?? [];
  }

  addTradeRoute(tradeRoute: TradeRoute): void {
    this.tradeRoutes_.update(
      (map) => new Map(map).set(tradeRoute.id, tradeRoute),
    );
  }

  removeTradeRoute(id: TradeRouteId): void {
    this.tradeRoutes_.update((map) => {
      const next = new Map(map);
      next.delete(id);
      return next;
    });
  }

  updateTradeRoute(id: TradeRouteId, patch: Partial<TradeRoute>): void {
    const current = this.tradeRoute(id);
    if (!current) {
      return;
    }
    this.tradeRoutes_.update((map) =>
      new Map(map).set(id, { ...current, ...patch }),
    );
  }
}
