import {
  Boost,
  Good,
  ProductionBuilding,
  DepartmentOfLaborPolicy,
  Region,
} from '../game/enums';
import { computeExtraGoodsModifier, lookupProductionInfo } from '../game/facts';
import {
  DEFAULT_ISLAND_MODEL,
  DEFAULT_PRODUCTION_LINE_MODEL,
  DEFAULT_WORLD_MODEL,
  Island,
  Model,
  ProductionLine,
  World,
  ExtraGood,
  DEFAULT_EXTRA_GOOD_MODEL,
  TradeRoute,
  IslandId,
  TradeRouteId,
} from './models';

export interface ViewContext {
  world?: WorldView;
  island?: IslandView;
  productionLine?: ProductionLineView;
}

export abstract class View<M extends Model> {
  protected constructor(
    protected model: M,
    protected context: ViewContext,
  ) { }

  asView(): this {
    return this;
  }

  toJsonString(): string {
    return JSON.stringify(this.model);
  }
}

export class ExtraGoodView extends View<ExtraGood> implements ExtraGood {
  static wrap(model: ExtraGood, context: ViewContext): ExtraGoodView {
    return new ExtraGoodView(model, context);
  }

  get good(): Good {
    return this.model.good;
  }

  get rateNumerator(): number {
    return this.model.rateNumerator ?? DEFAULT_EXTRA_GOOD_MODEL.rateNumerator!;
  }

  get rateDenominator(): number {
    return (
      this.model.rateDenominator ?? DEFAULT_EXTRA_GOOD_MODEL.rateDenominator!
    );
  }

  get rate(): number {
    return this.rateNumerator / this.rateDenominator;
  }

  get processTimeSeconds(): number {
    return this.context.productionLine!.buildingProcessTimeSeconds / this.rate;
  }

  get producedPerMinute(): number {
    return (
      (this.context.productionLine!.numBuildings * 60) / this.processTimeSeconds
    );
  }
}

export class ProductionLineView
  extends View<ProductionLine>
  implements ProductionLine {
  static wrap(model: ProductionLine, context: ViewContext): ProductionLineView {
    return new ProductionLineView(model, context);
  }

  get building(): ProductionBuilding {
    return this.model.building;
  }

  get inputGoods(): Good[] {
    return this.model.inputGoods ?? DEFAULT_PRODUCTION_LINE_MODEL.inputGoods!;
  }

  get good(): Good {
    return this.model.good;
  }

  get numBuildings(): number {
    return (
      this.model.numBuildings ?? DEFAULT_PRODUCTION_LINE_MODEL.numBuildings
    );
  }

  get boosts(): Boost[] {
    return this.model.boosts ?? DEFAULT_PRODUCTION_LINE_MODEL.boosts!;
  }

  get hasTradeUnion(): boolean {
    return (
      this.model.hasTradeUnion ?? DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion!
    );
  }

  get tradeUnionItemsBonus(): number {
    return (
      this.model.tradeUnionItemsBonus ??
      DEFAULT_PRODUCTION_LINE_MODEL.tradeUnionItemsBonus!
    );
  }

  get extraGoods(): ExtraGoodView[] {
    return (this.model.extraGoods ?? []).map((eg) =>
      ExtraGoodView.wrap(eg, { ...this.context, productionLine: this }),
    );
  }

  get inRangeOfLocalDepartment(): boolean {
    return (
      this.model.inRangeOfLocalDepartment ??
      DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment!
    );
  }

  get efficiency(): number {
    let efficiency = 1;
    for (const boost of this.boosts) {
      switch (boost) {
        case Boost.Electricity:
          efficiency += 1;
          if (
            this.inRangeOfLocalDepartment &&
            this.context.island!.dolPolicy ==
            DepartmentOfLaborPolicy.GalvanicGrantsAct
          ) {
            efficiency += 0.5;
          }
          break;
        case Boost.TracktorBarn:
          efficiency += 2;
          break;
        case Boost.Fertilizer:
          efficiency += 1;
          break;
        case Boost.Silo:
          efficiency += 1;
          break;
      }
    }
    if (this.hasTradeUnion) {
      if (
        this.inRangeOfLocalDepartment &&
        this.context.island!.dolPolicy != DepartmentOfLaborPolicy.None
      ) {
        efficiency += this.context.world!.tradeUnionBonus;
      }
      efficiency += this.tradeUnionItemsBonus;
    }
    return efficiency;
  }

  get buildingProcessTimeSeconds(): number {
    return (
      (lookupProductionInfo(this.building)?.processingTimeSeconds ?? 0) /
      this.efficiency
    );
  }

  get goodProcessTimeSeconds(): number {
    return (
      this.buildingProcessTimeSeconds /
      (this.hasTradeUnion && this.inRangeOfLocalDepartment
        ? computeExtraGoodsModifier(
          this.building,
          this.good,
          this.context.island!,
        )
        : 1)
    );
  }

  get goodsConsumedPerMinute(): number {
    return (this.numBuildings * 60) / this.buildingProcessTimeSeconds;
  }

  get goodsProducedPerMinute(): number {
    return (this.numBuildings * 60) / this.goodProcessTimeSeconds;
  }

  get islandHasDepartmentOfLabor(): boolean {
    return this.context.island?.dolPolicy != DepartmentOfLaborPolicy.None;
  }
}

export class TradeRouteView extends View<TradeRoute> implements TradeRoute {
  static wrap(model: TradeRoute, context: ViewContext): TradeRouteView {
    return new TradeRouteView(model, context);
  }

  get id(): TradeRouteId {
    return this.model.id;
  }

  get sourceIslandId(): IslandId {
    return this.model.sourceIslandId;
  }

  get sourceIsland(): IslandView {
    return this.world.lookupIslandById(this.model.sourceIslandId);
  }

  get targetIslandId(): IslandId {
    return this.model.targetIslandId;
  }

  get targetIsland(): IslandView {
    return this.world.lookupIslandById(this.model.targetIslandId);
  }

  get good(): Good {
    return this.model.good;
  }

  get world(): WorldView {
    return this.context.world!;
  }
}

export class IslandView extends View<Island> implements Island {
  static wrap(model: Island, context: ViewContext): IslandView {
    return new IslandView(model, context);
  }

  get id(): IslandId {
    return this.model.id!;
  }

  get name(): string {
    return this.model.name;
  }

  get region(): Region {
    return this.model.region ?? DEFAULT_ISLAND_MODEL.region!;
  }

  get productionLines(): ProductionLineView[] {
    return this.model.productionLines.map((pl) =>
      ProductionLineView.wrap(pl, { ...this.context, island: this }),
    );
  }

  get dolPolicy(): DepartmentOfLaborPolicy {
    return this.model.dolPolicy ?? DEFAULT_ISLAND_MODEL.dolPolicy!;
  }

  get outgoingTradeRoutes(): TradeRouteView[] {
    return this.context.world!.lookupTradeRoutesStartingFrom(this);
  }

  get incomingTradeRoutes(): TradeRouteView[] {
    return this.context.world!.lookupTradeRoutesEndingAt(this);
  }

  get producedGoods(): Good[] {
    return Array.from(
      new Set<Good>(
        this.model.productionLines.flatMap((pl) => {
          const goods = [pl.good];
          pl.extraGoods?.forEach((eg) => goods.push(eg.good));
          return goods;
        }),
      ),
    );
  }
}

export class WorldView extends View<World> implements World {
  static wrap(model: World): WorldView {
    return new WorldView(model, {});
  }

  get tradeUnionBonus(): number {
    return this.model.tradeUnionBonus ?? DEFAULT_WORLD_MODEL.tradeUnionBonus!;
  }

  get islands(): IslandView[] {
    return this.model.islands.map((i) => IslandView.wrap(i, this.selfContext));
  }

  lookupIslandById(id: IslandId): IslandView {
    return IslandView.wrap(
      this.model.islands.find((i) => i.id == id)!,
      this.selfContext,
    );
  }

  get tradeRoutes(): TradeRouteView[] {
    return this.model.tradeRoutes.map((tr) =>
      TradeRouteView.wrap(tr, this.selfContext),
    );
  }

  public lookupTradeRoutesStartingFrom(
    island: IslandId | IslandView,
  ): TradeRouteView[] {
    const id = typeof island === 'number' ? island : island.id;
    return this.model.tradeRoutes
      .filter((tr) => tr.sourceIslandId == id)
      .map((tr) => TradeRouteView.wrap(tr, this.selfContext));
  }

  public lookupTradeRoutesEndingAt(
    island: IslandId | IslandView,
  ): TradeRouteView[] {
    const id = typeof island === 'number' ? island : island.id;
    return this.model.tradeRoutes
      .filter((tr) => tr.targetIslandId == id)
      .map((tr) => TradeRouteView.wrap(tr, this.selfContext));
  }

  private get selfContext(): ViewContext {
    return { world: this };
  }
}
