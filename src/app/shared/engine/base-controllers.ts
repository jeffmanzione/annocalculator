import { BaseWorldStore, EntityId } from './base-world-store';

type AnyStore = BaseWorldStore<any, any, any>;

/**
 * One controller object per id, created when first asked for and kept until dropped. Components get the
 * same controller for the same thing every time, which keeps what they bind to stable between updates.
 */
export class ControllerCache<C> {
  private readonly controllers_ = new Map<EntityId, C>();

  constructor(private readonly create_: (id: EntityId) => C) {}

  get(id: EntityId): C {
    let controller = this.controllers_.get(id);
    if (!controller) {
      controller = this.create_(id);
      this.controllers_.set(id, controller);
    }
    return controller;
  }

  delete(id: EntityId): void {
    this.controllers_.delete(id);
  }
}

/** The production line controllers of one island: listing, adding and removing them. */
export class IslandLineControllers<LC> {
  private readonly cache_: ControllerCache<LC>;

  constructor(
    private readonly store_: AnyStore,
    private readonly islandId_: EntityId,
    create: (id: EntityId) => LC,
  ) {
    this.cache_ = new ControllerCache(create);
  }

  /** The island's lines as they are in the store now. */
  list(): LC[] {
    return [...this.store_.productionLines().values()]
      .filter((line) => line.islandId === this.islandId_)
      .map((line) => this.cache_.get(line.id));
  }

  get(id: EntityId): LC {
    return this.cache_.get(id);
  }

  add(): LC {
    return this.cache_.get(this.store_.addProductionLine(this.islandId_));
  }

  remove(id: EntityId): void {
    this.store_.removeProductionLine(id);
    this.cache_.delete(id);
  }
}

/**
 * What a game's world controller does the same way as any other: hand out its island and trade route
 * controllers (one each per id) and add and remove them.
 */
export abstract class BaseWorldController<S extends AnyStore, IC, TC> {
  private readonly islands_ = new ControllerCache<IC>((id) =>
    this.createIslandController(id),
  );
  private readonly tradeRoutes_ = new ControllerCache<TC>((id) =>
    this.createTradeRouteController(id),
  );

  constructor(protected readonly store: S) {}

  protected abstract createIslandController(id: EntityId): IC;
  protected abstract createTradeRouteController(id: EntityId): TC;

  get islands(): IC[] {
    return [...this.store.islands().keys()].map((id) => this.islands_.get(id));
  }

  islandController(id: EntityId): IC {
    return this.islands_.get(id);
  }

  addIsland(): IC {
    return this.islands_.get(this.store.addIsland());
  }

  removeIsland(id: EntityId): void {
    this.store.removeIsland(id);
    this.islands_.delete(id);
  }

  get tradeRoutes(): TC[] {
    return [...this.store.tradeRoutes().keys()].map((id) =>
      this.tradeRoutes_.get(id),
    );
  }

  addTradeRoute(): TC {
    return this.tradeRoutes_.get(this.store.addTradeRoute());
  }

  removeTradeRoute(id: EntityId): void {
    this.store.removeTradeRoute(id);
    this.tradeRoutes_.delete(id);
  }
}
