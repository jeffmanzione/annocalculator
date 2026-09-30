import { signal, WritableSignal } from '@angular/core';
import {
  BASE_ISLAND_MODEL,
  BASE_PRODUCTION_LINE_MODEL,
  BASE_TRADE_ROUTE_MODEL,
  DEFAULT_ISLAND_MODEL,
  DEFAULT_PRODUCTION_LINE_MODEL,
  DEFAULT_WORLD_MODEL,
  Island,
  IslandId,
  ProductionLine,
  ProductionLineId,
  TradeRoute,
  TradeRouteId,
  World,
} from './models';
import { Good } from '../game/enums';
import { lookupItemInfo, lookupProductionInfo } from '../game/facts';

// Helpers below were moved here from controllers.ts (now deleted), their
// last remaining consumer being this file.

// Array-typed model fields (boosts/items/culturalSets) are compared
// against their defaults by content, not by reference: DEFAULT_*_MODEL's
// array fields are each one specific [] instance, so a freshly-created
// array from the UI (e.g. selecting then deselecting everything) is never
// == to it even when empty, and a plain == check here would silently fail
// to ever clear these fields. Order doesn't matter for these multi-select
// values, so this compares as sets.
export function arrayEqualsAsSet<T>(
  a: T[] | undefined,
  b: T[] | undefined,
): boolean {
  // Defensive: some form-control "cleared" values in production-line.ts are
  // (incorrectly) `false` rather than `[]` for these array-typed controls
  // (see clearAndDisableControl_ calls for 'items'/'culturalSets') -- treat
  // anything that isn't a real array as empty rather than throwing, same as
  // Array.isArray(a) ? a : [] would for iteration purposes.
  const setA = new Set(Array.isArray(a) ? a : []);
  const setB = new Set(Array.isArray(b) ? b : []);
  return setA.size === setB.size && [...setA].every((x) => setB.has(x));
}

export function generatePseudorandomInt(): number {
  // Ensure min and max are integers
  const [min, max] = [0, Number.MAX_SAFE_INTEGER];
  // Generate a random number between min (inclusive) and max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min; // NOSONAR - Pseudorandomness is sufficient
}

export const resolveDuplicateReplacementGoods = (g1: Good, g2: Good): Good => {
  // Prefer Susanna the Steam Engineer (switches input from Steam Motors to
  // Filaments) over Maria Maravilla (switches input from Steam Motors to
  // Motors) because Filaments are much much easier to produce.
  if (g1 === Good.Filaments && g2 === Good.Motor) {
    return Good.Filaments;
  }
  return g2;
};

/**
 * A ProductionLine as held in the normalized store: the same shape as the
 * saved model, plus the id of the island it belongs to. This is the store's
 * replacement for `Island.productionLines[]` membership (see Decision 1 in
 * `domain-layer-signals-redesign.md`): rather than an island embedding its
 * production lines, each production line points at its island by id, so any
 * entity can be looked up independently without a manually-threaded parent
 * pointer.
 *
 * `islandId` is a store-internal field, not part of the saved JSON format --
 * `WorldStore.toWorld()` re-nests each production line under its owning
 * island's `productionLines` array and strips this field back out.
 */
export interface ProductionLineEntity extends ProductionLine {
  islandId: IslandId;
}

/**
 * Ported from the old ProductionLineController.updateGoods_() (in the now-deleted controllers.ts):
 * recomputes `good`/`inputGoods` from `building` (+ `items`, which can
 * replace some of the building's normal input goods -- see
 * resolveDuplicateReplacementGoods). This is a real, eager side effect of
 * changing `building` or `items`, not an export-minimization nicety, so
 * updateProductionLine() below calls this whenever a patch touches either
 * field, rather than deferring it to toWorld() the way default-clearing is.
 */
function computeDerivedGoods(
  pl: Pick<ProductionLine, 'building' | 'items'>,
): Pick<ProductionLine, 'good' | 'inputGoods'> {
  const productionInfo = lookupProductionInfo(pl.building);
  if (!productionInfo) {
    return { good: Good.Unknown, inputGoods: [] };
  }

  const inputGoodMappings = new Map<Good, Good>(
    productionInfo.inputGoods?.map((ig) => [ig, ig]),
  );
  for (const item of pl.items ?? []) {
    const itemInfo = lookupItemInfo(item)!;
    for (const replacementGood of itemInfo.replacementGoods ?? []) {
      inputGoodMappings.set(
        replacementGood.from,
        resolveDuplicateReplacementGoods(
          inputGoodMappings.get(replacementGood.from)!,
          replacementGood.to,
        ),
      );
    }
  }

  return {
    good: productionInfo.good,
    inputGoods: [...inputGoodMappings.values()].filter(
      (g) => g != Good.Unknown,
    ),
  };
}

/**
 * Normalized, id-keyed signal store for a `World`: flat `Map`s instead of
 * one nested tree. This is the app's source of truth for the loaded world
 * (production-calculator.ts builds one per page load). `fromWorld()`/
 * `toWorld()` are the load/save boundary, and must
 * round-trip existing saved data losslessly: the app's real users have
 * un-versioned, un-validated `JSON.stringify`/`JSON.parse` data sitting in
 * their browsers' `localStorage` today (see `local-storage.ts`), so this is
 * a hard correctness requirement, not just a nice-to-have. Note that an
 * island/production-line/trade-route with no id yet (older saved data, or a
 * just-created entity) gets one assigned in `fromWorld()` (missing or negative id means
 * unassigned -- the convention the old, now-deleted controllers.ts used).
 */
export class WorldStore {
  readonly islands: WritableSignal<Map<IslandId, Island>>;
  readonly productionLines: WritableSignal<
    Map<ProductionLineId, ProductionLineEntity>
  >;
  readonly tradeRoutes: WritableSignal<Map<TradeRouteId, TradeRoute>>;
  readonly tradeUnionBonus: WritableSignal<number>;

  private constructor(
    islands: Map<IslandId, Island>,
    productionLines: Map<ProductionLineId, ProductionLineEntity>,
    tradeRoutes: Map<TradeRouteId, TradeRoute>,
    tradeUnionBonus: number,
  ) {
    this.islands = signal(islands);
    this.productionLines = signal(productionLines);
    this.tradeRoutes = signal(tradeRoutes);
    this.tradeUnionBonus = signal(tradeUnionBonus);
  }

  static fromWorld(world: World): WorldStore {
    const islands = new Map<IslandId, Island>();
    const productionLines = new Map<ProductionLineId, ProductionLineEntity>();

    for (const islandModel of world.islands) {
      const islandId =
        islandModel.id != null && islandModel.id >= 0
          ? islandModel.id
          : generatePseudorandomInt();

      const { productionLines: rawProductionLines, ...islandRest } =
        islandModel;
      // The embedded productionLines array is intentionally not carried
      // over onto the store's Island entry -- membership now lives on the
      // ProductionLineEntity side (islandId), and toWorld() re-derives this
      // array from the productionLines map at save time. Leaving a stale
      // copy here would let the two get out of sync.
      islands.set(islandId, { ...islandRest, id: islandId, productionLines: [] });

      for (const productionLineModel of rawProductionLines) {
        const productionLineId =
          productionLineModel.id != null && productionLineModel.id >= 0
            ? productionLineModel.id
            : generatePseudorandomInt();
        productionLines.set(productionLineId, {
          ...productionLineModel,
          id: productionLineId,
          islandId,
        });
      }
    }

    const tradeRoutes = new Map<TradeRouteId, TradeRoute>();
    for (const tradeRouteModel of world.tradeRoutes) {
      const tradeRouteId =
        tradeRouteModel.id >= 0 ? tradeRouteModel.id : generatePseudorandomInt();
      tradeRoutes.set(tradeRouteId, { ...tradeRouteModel, id: tradeRouteId });
    }

    return new WorldStore(
      islands,
      productionLines,
      tradeRoutes,
      world.tradeUnionBonus ?? DEFAULT_WORLD_MODEL.tradeUnionBonus!,
    );
  }

  toWorld(): World {
    const productionLinesByIsland = new Map<IslandId, ProductionLine[]>();
    for (const productionLineEntity of this.productionLines().values()) {
      const { islandId, ...productionLineModel } = productionLineEntity;
      const linesForIsland = productionLinesByIsland.get(islandId) ?? [];
      linesForIsland.push(stripProductionLineDefaults(productionLineModel));
      productionLinesByIsland.set(islandId, linesForIsland);
    }

    const islands: Island[] = [...this.islands().values()].map((island) =>
      stripIslandDefaults({
        ...island,
        productionLines: productionLinesByIsland.get(island.id!) ?? [],
      }),
    );

    const world: World = {
      tradeUnionBonus: this.tradeUnionBonus(),
      islands,
      tradeRoutes: [...this.tradeRoutes().values()],
    };
    return stripWorldDefaults(world);
  }

  // --- Mutation API ---
  //
  // Unlike the old Controller setters (controllers.ts), these don't clear a
  // field the moment it's set to its default -- that minimization now
  // happens once, in toWorld() above, at export/save time (see
  // stripIslandDefaults/stripProductionLineDefaults/stripWorldDefaults
  // below). In memory, the store just holds whatever was set. The one
  // exception is computeDerivedGoods() above: `good`/`inputGoods` are real
  // derived state read elsewhere before any save happens, not an export
  // nicety, so updateProductionLine() recomputes them eagerly, exactly
  // like the old building/items setters did.

  addIsland(): IslandId {
    const id = generatePseudorandomInt();
    const island: Island = { ...structuredClone(BASE_ISLAND_MODEL), id };
    this.islands.update((islands) => new Map(islands).set(id, island));
    return id;
  }

  removeIsland(id: IslandId): void {
    this.islands.update((islands) => {
      const next = new Map(islands);
      next.delete(id);
      return next;
    });
    // Production lines are stored flat (keyed by their own id, not nested
    // under their island), so removing an island doesn't implicitly take
    // its production lines with it the way splicing a nested array used
    // to -- clean them up explicitly here, or they'd become orphaned
    // entries pointing at an islandId that no longer exists. Matches the
    // old behavior's net effect (removing an island removed its production
    // lines too), just via an explicit step instead of a side effect of
    // nesting.
    //
    // Trade routes referencing this island are deliberately left alone,
    // matching the old code's behavior (WorldController.removeIslandAt()
    // never touched tradeRoutes either) -- not a fix to make here.
    this.productionLines.update((lines) => {
      const next = new Map(lines);
      for (const [lineId, line] of next) {
        if (line.islandId === id) {
          next.delete(lineId);
        }
      }
      return next;
    });
  }

  updateIsland(
    id: IslandId,
    patch: Partial<Pick<Island, 'name' | 'region' | 'dolPolicy'>>,
  ): void {
    this.islands.update((islands) => {
      const current = islands.get(id);
      if (!current) {
        console.warn(`Invalid island id. Was ${id}.`);
        return islands;
      }
      const next = new Map(islands);
      next.set(id, { ...current, ...patch });
      return next;
    });
  }

  addProductionLine(islandId: IslandId): ProductionLineId {
    const id = generatePseudorandomInt();
    const line: ProductionLineEntity = {
      ...structuredClone(BASE_PRODUCTION_LINE_MODEL),
      id,
      islandId,
    };
    this.productionLines.update((lines) => new Map(lines).set(id, line));
    return id;
  }

  removeProductionLine(id: ProductionLineId): void {
    this.productionLines.update((lines) => {
      const next = new Map(lines);
      next.delete(id);
      return next;
    });
  }

  updateProductionLine(
    id: ProductionLineId,
    patch: Partial<Omit<ProductionLine, 'id'>>,
  ): void {
    this.productionLines.update((lines) => {
      const current = lines.get(id);
      if (!current) {
        console.warn(`Invalid productionLine id. Was ${id}.`);
        return lines;
      }
      let updated: ProductionLineEntity = { ...current, ...patch };
      // Ported from ProductionLineController.hasTradeUnion's setter: items
      // can only be slotted in a trade union, so turning it off clears any
      // selected items right away rather than leaving them in the model
      // pointing at a now-unreachable UI state.
      if (patch.hasTradeUnion === false) {
        updated = { ...updated, items: [] };
      }
      if ('building' in patch || 'items' in patch) {
        updated = { ...updated, ...computeDerivedGoods(updated) };
      }
      const next = new Map(lines);
      next.set(id, updated);
      return next;
    });
  }

  addTradeRoute(): TradeRouteId {
    const id = generatePseudorandomInt();
    const tradeRoute: TradeRoute = {
      ...structuredClone(BASE_TRADE_ROUTE_MODEL),
      id,
    };
    this.tradeRoutes.update((routes) => new Map(routes).set(id, tradeRoute));
    return id;
  }

  removeTradeRoute(id: TradeRouteId): void {
    this.tradeRoutes.update((routes) => {
      const next = new Map(routes);
      next.delete(id);
      return next;
    });
  }

  updateTradeRoute(
    id: TradeRouteId,
    patch: Partial<Omit<TradeRoute, 'id'>>,
  ): void {
    this.tradeRoutes.update((routes) => {
      const current = routes.get(id);
      if (!current) {
        console.warn(`Invalid tradeRoute id. Was ${id}.`);
        return routes;
      }
      const next = new Map(routes);
      next.set(id, { ...current, ...patch });
      return next;
    });
  }

  setTradeUnionBonus(value: number): void {
    this.tradeUnionBonus.set(value);
  }
}

// --- Export-time default clearing ---
//
// Ported from the "delete if equals default" setters in controllers.ts
// (ProductionLineController.boosts/items/hasTradeUnion/
// inRangeOfLocalDepartment/inRangeOfHaciendaFertiliserWorks/culturalSets,
// IslandController.dolPolicy, WorldController.tradeUnionBonus), moved to
// run once here instead of on every individual field write -- see the
// design doc's "Proposed target architecture" section. Array-typed fields
// compare by content (arrayEqualsAsSet), not by reference, for the same
// reason the original setters did: DEFAULT_*_MODEL's array fields are each
// one specific `[]` instance, so a freshly-created empty array is never
// `==` to it.

function stripProductionLineDefaults(pl: ProductionLine): ProductionLine {
  const result = { ...pl };
  if (arrayEqualsAsSet(result.boosts, DEFAULT_PRODUCTION_LINE_MODEL.boosts)) {
    delete result.boosts;
  }
  if (arrayEqualsAsSet(result.items, DEFAULT_PRODUCTION_LINE_MODEL.items)) {
    delete result.items;
  }
  if (
    arrayEqualsAsSet(
      result.culturalSets,
      DEFAULT_PRODUCTION_LINE_MODEL.culturalSets,
    )
  ) {
    delete result.culturalSets;
  }
  if (result.hasTradeUnion == DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion) {
    delete result.hasTradeUnion;
  }
  if (
    result.inRangeOfLocalDepartment ==
    DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment
  ) {
    delete result.inRangeOfLocalDepartment;
  }
  if (
    result.inRangeOfHaciendaFertiliserWorks ==
    DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfHaciendaFertiliserWorks
  ) {
    delete result.inRangeOfHaciendaFertiliserWorks;
  }
  return result;
}

function stripIslandDefaults(island: Island): Island {
  const result = { ...island };
  if (result.dolPolicy == DEFAULT_ISLAND_MODEL.dolPolicy) {
    delete result.dolPolicy;
  }
  return result;
}

function stripWorldDefaults(world: World): World {
  const result = { ...world };
  if (result.tradeUnionBonus == DEFAULT_WORLD_MODEL.tradeUnionBonus) {
    delete result.tradeUnionBonus;
  }
  return result;
}
