import {
  BaseWorldController,
  IslandLineControllers,
} from '../../../shared/engine/base-controllers';
import {
  Boost,
  CulturalSet,
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../game/enums';
import { IslandId, ProductionLineId, TradeRouteId } from './models';
import { WorldStore1800 } from './world-store-1800';
import {
  Island1800View,
  Line1800View,
  TradeRoute1800View,
} from './world-views';

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

export class Line1800Controller extends Line1800View {
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

class TradeRoute1800Controller extends TradeRoute1800View {
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

export class Island1800Controller extends Island1800View {
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

  private readonly lines_: IslandLineControllers<Line1800Controller>;

  constructor(store: WorldStore1800, id: IslandId) {
    super(store, id);
    this.lines_ = new IslandLineControllers(
      store,
      id,
      (lineId) => new Line1800Controller(store, lineId),
    );
  }

  /**
   * Overrides Island1800View.productionLines (which returns fresh Line1800View instances on every read) to
   * return the same cached Line1800Controller for a given id across calls, for the identity-stability
   * reason explained in this file's module doc comment. It still reads the current membership from the
   * store each time.
   */
  override get productionLines(): Line1800Controller[] {
    return this.lines_.list();
  }

  addProductionLine(): Line1800Controller {
    return this.lines_.add();
  }

  removeProductionLine(id: ProductionLineId): void {
    this.lines_.remove(id);
  }
}

export class World1800Controller extends BaseWorldController<
  WorldStore1800,
  Island1800Controller,
  TradeRoute1800Controller
> {
  protected override createIslandController(
    id: IslandId,
  ): Island1800Controller {
    return new Island1800Controller(this.store, id);
  }

  protected override createTradeRouteController(
    id: TradeRouteId,
  ): TradeRoute1800Controller {
    return new TradeRoute1800Controller(this.store, id);
  }

  get tradeUnionBonus(): number {
    return this.store.tradeUnionBonus();
  }
  get palacePrestigeLevel(): number | null {
    return this.store.palacePrestigeLevel();
  }
  set palacePrestigeLevel(value: number | null) {
    this.store.setPalacePrestigeLevel(value);
  }
}
