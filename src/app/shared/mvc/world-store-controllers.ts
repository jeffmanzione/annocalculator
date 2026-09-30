import {
  Boost,
  CulturalSet,
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../game/enums';
import {
  IslandId,
  ProductionLineId,
  TradeRouteId,
} from './models';
import { WorldStore } from './world-store';
import {
  StoreIslandView,
  StoreProductionLineView,
  StoreTradeRouteView,
} from './world-store-views';

/**
 * Write-capable counterparts to the read-only Store*View classes in
 * world-store-views.ts: each class here extends its View, inheriting every
 * getter unchanged, and adds setters/mutation methods that write through
 * WorldStore's mutation API (world-store.ts). production-calculator.ts
 * builds one StoreWorldController over its WorldStore and hands its
 * per-id-cached children to <island>/<trade-routes-panel>.
 *
 * (These replaced WorldController/IslandController/ProductionLineController/
 * TradeRouteController, in the now-deleted controllers.ts.) Unlike those
 * old setters, these don't do their own "delete field if it equals the
 * default" minimization --
 * that already moved to WorldStore.toWorld() in step 1 (see
 * stripProductionLineDefaults/stripIslandDefaults/stripWorldDefaults in
 * world-store.ts). Nor do these setters re-derive good/inputGoods or clear
 * items when hasTradeUnion is turned off -- WorldStore.updateProductionLine
 * already does both eagerly, once, in one place, rather than each caller
 * needing to remember to.
 *
 * Per-id caching: each class below caches its own child controllers in a
 * plain Map, filled lazily and read fresh from the store's current maps on
 * every access. This matters for more than just avoiding reallocation:
 * production-calculator.html's `@for (island of world.islands; track
 * island.id)` needs a given id's controller object to be the *same* object
 * across re-reads, or
 * Angular would tear down and rebuild every child component on every store
 * update. A WorldStore instance is itself long-lived (constructed once per
 * loaded world, not recreated on every mutation -- only its internal
 * signals' Map values change), so caching keyed by the store instance
 * (each StoreWorldController wraps exactly one WorldStore) is sufficient for that
 * identity to hold for as long as the world itself is loaded.
 */

export class StoreProductionLineController extends StoreProductionLineView {
  override set building(value: ProductionBuilding) {
    this.store.updateProductionLine(this.id_, { building: value });
  }
  override get building(): ProductionBuilding {
    return super.building;
  }

  override set numBuildings(value: number) {
    if (!Number.isInteger(value)) {
      console.warn(`numBuildings must be an integer. Was ${value}.`);
    }
    this.store.updateProductionLine(this.id_, {
      numBuildings: Math.trunc(value),
    });
  }
  override get numBuildings(): number {
    return super.numBuildings;
  }

  override set boosts(value: Boost[]) {
    this.store.updateProductionLine(this.id_, { boosts: value ?? [] });
  }
  override get boosts(): Boost[] {
    return super.boosts;
  }

  override set hasTradeUnion(value: boolean) {
    this.store.updateProductionLine(this.id_, { hasTradeUnion: value });
  }
  override get hasTradeUnion(): boolean {
    return super.hasTradeUnion;
  }

  override set items(value: Item[]) {
    this.store.updateProductionLine(this.id_, { items: value ?? [] });
  }
  override get items(): Item[] {
    return super.items;
  }

  override set inRangeOfLocalDepartment(value: boolean) {
    this.store.updateProductionLine(this.id_, {
      inRangeOfLocalDepartment: value,
    });
  }
  override get inRangeOfLocalDepartment(): boolean {
    return super.inRangeOfLocalDepartment;
  }

  override set inRangeOfHaciendaFertiliserWorks(value: boolean) {
    this.store.updateProductionLine(this.id_, {
      inRangeOfHaciendaFertiliserWorks: value,
    });
  }
  override get inRangeOfHaciendaFertiliserWorks(): boolean {
    return super.inRangeOfHaciendaFertiliserWorks;
  }

  override set culturalSets(value: CulturalSet[]) {
    this.store.updateProductionLine(this.id_, { culturalSets: value ?? [] });
  }
  override get culturalSets(): CulturalSet[] {
    return super.culturalSets;
  }
}

export class StoreTradeRouteController extends StoreTradeRouteView {
  override set sourceIslandId(value: IslandId) {
    this.store.updateTradeRoute(this.id_, { sourceIslandId: value });
  }
  override get sourceIslandId(): IslandId {
    return super.sourceIslandId;
  }

  override set targetIslandId(value: IslandId) {
    this.store.updateTradeRoute(this.id_, { targetIslandId: value });
  }
  override get targetIslandId(): IslandId {
    return super.targetIslandId;
  }

  override set good(value: Good) {
    this.store.updateTradeRoute(this.id_, { good: value });
  }
  override get good(): Good {
    return super.good;
  }
}

export class StoreIslandController extends StoreIslandView {
  override set name(value: string) {
    this.store.updateIsland(this.id_, { name: value });
  }
  override get name(): string {
    return super.name;
  }

  override set region(value: Region) {
    this.store.updateIsland(this.id_, { region: value });
  }
  override get region(): Region {
    return super.region;
  }

  override set dolPolicy(value: DepartmentOfLaborPolicy) {
    this.store.updateIsland(this.id_, { dolPolicy: value });
  }
  override get dolPolicy(): DepartmentOfLaborPolicy {
    return super.dolPolicy;
  }

  private readonly productionLineControllers_ = new Map<
    ProductionLineId,
    StoreProductionLineController
  >();

  /**
   * Overrides StoreIslandView.productionLines (which returns fresh
   * StoreProductionLineView instances on every read) to return the same
   * cached StoreProductionLineController instance for a given id across
   * calls, for the identity-stability reason explained in this file's
   * module doc comment. Still reads the current membership fresh from the
   * store on every call, so this stays correct even if the store's
   * productionLines map changes some way other than through this class's
   * own addProductionLine()/removeProductionLineById().
   */
  override get productionLines(): StoreProductionLineController[] {
    return [...this.store.productionLines().values()]
      .filter((pl) => pl.islandId === this.id_)
      .map((pl) => this.getOrCreateProductionLineController_(pl.id!));
  }

  private getOrCreateProductionLineController_(
    id: ProductionLineId,
  ): StoreProductionLineController {
    let controller = this.productionLineControllers_.get(id);
    if (!controller) {
      controller = new StoreProductionLineController(this.store, id);
      this.productionLineControllers_.set(id, controller);
    }
    return controller;
  }

  addProductionLine(): StoreProductionLineController {
    const id = this.store.addProductionLine(this.id_);
    return this.getOrCreateProductionLineController_(id);
  }

  removeProductionLineById(id: ProductionLineId): void {
    this.store.removeProductionLine(id);
    this.productionLineControllers_.delete(id);
  }
}

export class StoreWorldController {
  constructor(private readonly store: WorldStore) {}

  get tradeUnionBonus(): number {
    return this.store.tradeUnionBonus();
  }
  set tradeUnionBonus(value: number) {
    this.store.setTradeUnionBonus(value);
  }

  private readonly islandControllers_ = new Map<
    IslandId,
    StoreIslandController
  >();

  get islands(): StoreIslandController[] {
    return [...this.store.islands().keys()].map((id) =>
      this.getOrCreateIslandController_(id),
    );
  }

  private getOrCreateIslandController_(id: IslandId): StoreIslandController {
    let controller = this.islandControllers_.get(id);
    if (!controller) {
      controller = new StoreIslandController(this.store, id);
      this.islandControllers_.set(id, controller);
    }
    return controller;
  }

  addIsland(): StoreIslandController {
    const id = this.store.addIsland();
    return this.getOrCreateIslandController_(id);
  }

  removeIsland(id: IslandId): void {
    // Capture which production lines belonged to this island before
    // removeIsland() deletes them from the store, so their cached
    // controllers (held by the StoreIslandController being removed, which
    // is about to become unreachable from here anyway) can be dropped too
    // rather than left to accumulate.
    const island = this.islandControllers_.get(id);
    island?.productionLines.forEach((pl) =>
      island.removeProductionLineById(pl.id),
    );
    this.store.removeIsland(id);
    this.islandControllers_.delete(id);
  }

  private readonly tradeRouteControllers_ = new Map<
    TradeRouteId,
    StoreTradeRouteController
  >();

  get tradeRoutes(): StoreTradeRouteController[] {
    return [...this.store.tradeRoutes().keys()].map((id) =>
      this.getOrCreateTradeRouteController_(id),
    );
  }

  private getOrCreateTradeRouteController_(
    id: TradeRouteId,
  ): StoreTradeRouteController {
    let controller = this.tradeRouteControllers_.get(id);
    if (!controller) {
      controller = new StoreTradeRouteController(this.store, id);
      this.tradeRouteControllers_.set(id, controller);
    }
    return controller;
  }

  addTradeRoute(): StoreTradeRouteController {
    const id = this.store.addTradeRoute();
    return this.getOrCreateTradeRouteController_(id);
  }

  removeTradeRoute(id: TradeRouteId): void {
    this.store.removeTradeRoute(id);
    this.tradeRouteControllers_.delete(id);
  }
}
