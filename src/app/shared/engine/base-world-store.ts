import { signal, WritableSignal } from '@angular/core';

/**
 * The part of a world store that does not depend on the game: islands, production lines and trade
 * routes kept in flat, id-keyed maps (each a signal), with the operations to add, change and remove
 * them. A game's store extends it with its own entity types, its own world-level settings, and the
 * rules that run when something changes. Anno 117's store is built on it.
 *
 * Production lines are stored flat, each pointing at its island by `islandId`; `nestWorld()` puts
 * them back under their islands for saving.
 */
export type EntityId = number;

export interface TradeRouteShape {
  id: EntityId;
  sourceIslandId: EntityId;
  targetIslandId: EntityId;
  good: string;
}

/** A stored production line: the game's line plus the island it belongs to. */
export type StoredLine<L> = L & { id: EntityId; islandId: EntityId };

/** A stored island: the game's island without its nested lines. */
export type StoredIsland<I> = Omit<I, 'productionLines' | 'id'> & {
  id: EntityId;
};

function generateId(): EntityId {
  return Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1)); // NOSONAR - Pseudorandomness is sufficient
}

const hasId = (id: number | undefined): id is number => id != null && id >= 0;

/** Splits a nested world into flat maps, giving anything without an id a new one. */
export function flattenWorld<
  NI extends { id?: number; productionLines: NL[] },
  NL extends { id?: number },
  T extends { id: number },
>(
  islands: readonly NI[],
  tradeRoutes: readonly T[],
): {
  islands: Map<EntityId, StoredIsland<NI>>;
  productionLines: Map<EntityId, StoredLine<NL>>;
  tradeRoutes: Map<EntityId, T>;
} {
  const islandMap = new Map<EntityId, StoredIsland<NI>>();
  const lineMap = new Map<EntityId, StoredLine<NL>>();
  for (const island of islands) {
    const { productionLines, ...rest } = island;
    const islandId = hasId(island.id) ? island.id : generateId();
    islandMap.set(islandId, {
      ...rest,
      id: islandId,
    } as unknown as StoredIsland<NI>);
    for (const line of productionLines) {
      const lineId = hasId(line.id) ? line.id : generateId();
      lineMap.set(lineId, { ...line, id: lineId, islandId });
    }
  }
  const routeMap = new Map<EntityId, T>();
  for (const route of tradeRoutes) {
    const id = hasId(route.id) ? route.id : generateId();
    routeMap.set(id, { ...route, id });
  }
  return {
    islands: islandMap,
    productionLines: lineMap,
    tradeRoutes: routeMap,
  };
}

/** The reverse of flattenWorld(): islands with their production lines nested back in. */
export function nestWorld<I extends { id?: number }, L extends { id?: number }>(
  islands: Iterable<StoredIsland<I>>,
  lines: Iterable<StoredLine<L>>,
  stripLine: (line: L) => L = (line) => line,
): (StoredIsland<I> & { productionLines: L[] })[] {
  const byIsland = new Map<EntityId, L[]>();
  for (const stored of lines) {
    const { islandId, ...line } = stored;
    const list = byIsland.get(islandId) ?? [];
    list.push(stripLine(line as unknown as L));
    byIsland.set(islandId, list);
  }
  return [...islands].map((island) => ({
    ...island,
    productionLines: byIsland.get(island.id) ?? [],
  }));
}

export abstract class BaseWorldStore<
  I extends { id?: number },
  L extends { id?: number },
  T extends TradeRouteShape,
> {
  readonly islands: WritableSignal<Map<EntityId, StoredIsland<I>>>;
  readonly productionLines: WritableSignal<Map<EntityId, StoredLine<L>>>;
  readonly tradeRoutes: WritableSignal<Map<EntityId, T>>;

  protected constructor(
    islands: Map<EntityId, StoredIsland<I>>,
    productionLines: Map<EntityId, StoredLine<L>>,
    tradeRoutes: Map<EntityId, T>,
  ) {
    this.islands = signal(islands);
    this.productionLines = signal(productionLines);
    this.tradeRoutes = signal(tradeRoutes);
  }

  /** A new, empty island (without an id). */
  protected abstract newIsland(): Omit<StoredIsland<I>, 'id'>;
  /** A new production line for an island (without an id). */
  protected abstract newProductionLine(islandId: EntityId): L;
  /** A new trade route (without an id). */
  protected abstract newTradeRoute(): Omit<T, 'id'>;

  /** Called on a line's new state after it changes, to keep derived fields consistent. Returns the line to store. */
  protected onProductionLineUpdated(
    updated: StoredLine<L>,
    _patch: Partial<L>,
  ): StoredLine<L> {
    return updated;
  }

  addIsland(): EntityId {
    const id = generateId();
    const island = { ...this.newIsland(), id } as StoredIsland<I>;
    this.islands.update((islands) => new Map(islands).set(id, island));
    return id;
  }

  removeIsland(id: EntityId): void {
    this.islands.update((islands) => {
      const next = new Map(islands);
      next.delete(id);
      return next;
    });
    // Lines are stored flat, so removing an island takes its lines with it explicitly. Trade routes
    // that mention the island are left alone, as in the Anno 1800 calculator.
    this.productionLines.update((lines) => {
      const next = new Map(lines);
      for (const [lineId, line] of next) {
        if (line.islandId === id) next.delete(lineId);
      }
      return next;
    });
  }

  updateIsland(
    id: EntityId,
    patch: Partial<Omit<StoredIsland<I>, 'id'>>,
  ): void {
    this.islands.update((islands) => {
      const current = islands.get(id);
      if (!current) {
        console.warn(`Invalid island id. Was ${id}.`);
        return islands;
      }
      return new Map(islands).set(id, { ...current, ...patch });
    });
  }

  addProductionLine(islandId: EntityId): EntityId {
    const id = generateId();
    const line = {
      ...this.newProductionLine(islandId),
      id,
      islandId,
    } as StoredLine<L>;
    this.productionLines.update((lines) => new Map(lines).set(id, line));
    return id;
  }

  removeProductionLine(id: EntityId): void {
    this.productionLines.update((lines) => {
      const next = new Map(lines);
      next.delete(id);
      return next;
    });
  }

  updateProductionLine(id: EntityId, patch: Partial<Omit<L, 'id'>>): void {
    this.productionLines.update((lines) => {
      const current = lines.get(id);
      if (!current) {
        console.warn(`Invalid productionLine id. Was ${id}.`);
        return lines;
      }
      const updated = this.onProductionLineUpdated(
        { ...current, ...patch } as StoredLine<L>,
        patch as Partial<L>,
      );
      return new Map(lines).set(id, updated);
    });
  }

  addTradeRoute(): EntityId {
    const id = generateId();
    const route = { ...this.newTradeRoute(), id } as T;
    this.tradeRoutes.update((routes) => new Map(routes).set(id, route));
    return id;
  }

  removeTradeRoute(id: EntityId): void {
    this.tradeRoutes.update((routes) => {
      const next = new Map(routes);
      next.delete(id);
      return next;
    });
  }

  updateTradeRoute(id: EntityId, patch: Partial<Omit<T, 'id'>>): void {
    this.tradeRoutes.update((routes) => {
      const current = routes.get(id);
      if (!current) {
        console.warn(`Invalid tradeRoute id. Was ${id}.`);
        return routes;
      }
      return new Map(routes).set(id, { ...current, ...patch });
    });
  }
}
