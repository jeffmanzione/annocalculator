import { signal, WritableSignal } from '@angular/core';
import {
  DEFAULT_WORLD_MODEL,
  Island,
  IslandId,
  ProductionLine,
  ProductionLineId,
  TradeRoute,
  TradeRouteId,
  World,
} from './models';
import { generatePseudorandomInt } from './controllers';

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
 * Normalized, id-keyed signal store for a `World`: flat `Map`s instead of
 * one nested tree. This exists alongside `WorldController` for now -- it is
 * not yet read from by any component (see the design doc's "suggested next
 * step"). `fromWorld()`/`toWorld()` are the load/save boundary, and must
 * round-trip existing saved data losslessly: the app's real users have
 * un-versioned, un-validated `JSON.stringify`/`JSON.parse` data sitting in
 * their browsers' `localStorage` today (see `local-storage.ts`), so this is
 * a hard correctness requirement, not just a nice-to-have. Note that an
 * island/production-line/trade-route with no id yet (older saved data, or a
 * just-created entity) gets one assigned in `fromWorld()`, exactly matching
 * the existing `IslandController.wrap`/`TradeRouteController.wrap`/
 * `ProductionLineController.wrap` convention -- see `controllers.ts`.
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
      linesForIsland.push(productionLineModel);
      productionLinesByIsland.set(islandId, linesForIsland);
    }

    const islands: Island[] = [...this.islands().values()].map((island) => ({
      ...island,
      productionLines: productionLinesByIsland.get(island.id!) ?? [],
    }));

    return {
      tradeUnionBonus: this.tradeUnionBonus(),
      islands,
      tradeRoutes: [...this.tradeRoutes().values()],
    };
  }
}
