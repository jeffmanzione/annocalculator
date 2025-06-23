import { Boost, Good, ProductionBuilding, DepartmentOfLaborPolicy, Region } from "../game/enums";
import { computeExtraGoodsModifier, lookupProductionInfo } from "../game/facts";
import { BASE_ISLAND_MODEL, BASE_PRODUCTION_LINE_MODEL, BASE_WORLD_MODEL, DEFAULT_ISLAND_MODEL, DEFAULT_PRODUCTION_LINE_MODEL, DEFAULT_WORLD_MODEL, IslandModel, Model, ProductionLineModel, WorldModel, ExtraGoodModel, BASE_EXTRA_GOOD_MODEL, DEFAULT_EXTRA_GOOD_MODEL, TradeRouteModel, BASE_TRADE_ROUTE_MODEL, IslandId } from "./models";

export interface ViewContext {
  world?: WorldView;
  island?: IslandView;
  productionLine?: ProductionLineView;
};

export abstract class View<M extends Model> {
  protected abstract model: M;

  constructor(protected context: ViewContext) { }

  wrap(m: M): void {
    this.model = m;
  }

  toJsonString(): string {
    return JSON.stringify(this.model);
  }
}

export class ExtraGoodView extends View<ExtraGoodModel> {
  protected override model = BASE_EXTRA_GOOD_MODEL;

  static wrap(model: ExtraGoodModel, context: ViewContext): ExtraGoodView {
    const view = new ExtraGoodView(context);
    view.wrap(model);
    return view;
  }

  get good(): Good {
    return this.model.good;
  }

  get rateNumerator(): number {
    return this.model.rateNumerator ?? DEFAULT_EXTRA_GOOD_MODEL.rateNumerator!;
  }

  get rateDenominator(): number {
    return this.model.rateDenominator ?? DEFAULT_EXTRA_GOOD_MODEL.rateDenominator!;
  }

  get rate(): number {
    return this.rateNumerator / this.rateDenominator;
  }

  get processTimeSeconds(): number {
    return this.context.productionLine!.buildingProcessTimeSeconds / this.rate;
  }

  get producedPerMinute(): number {
    return this.context.productionLine!.numBuildings * 60 / this.processTimeSeconds;
  }
};

export class ProductionLineView extends View<ProductionLineModel> {
  protected override model = BASE_PRODUCTION_LINE_MODEL;

  static wrap(model: ProductionLineModel, context: ViewContext): ProductionLineView {
    const view = new ProductionLineView(context);
    view.wrap(model);
    return view;
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
    return this.model.numBuildings ?? DEFAULT_PRODUCTION_LINE_MODEL.numBuildings;
  }

  get boosts(): Boost[] {
    return this.model.boosts ?? DEFAULT_PRODUCTION_LINE_MODEL.boosts!;
  }

  get hasTradeUnion(): boolean {
    return this.model.hasTradeUnion ?? DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion!;
  }

  get tradeUnionItemsBonus(): number {
    return this.model.tradeUnionItemsBonus ?? DEFAULT_PRODUCTION_LINE_MODEL.tradeUnionItemsBonus!;
  }

  get extraGoods(): ExtraGoodView[] {
    return (this.model.extraGoods ?? []).map(eg => ExtraGoodView.wrap(eg, { ...this.context, productionLine: this }));
  }

  get inRangeOfLocalDepartment(): boolean {
    return this.model.inRangeOfLocalDepartment ?? DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment!;
  }

  get efficiency(): number {
    let efficiency = 1.0;
    for (const boost of this.boosts) {
      switch (boost) {
        case Boost.Electricity:
          efficiency += 1.0;
          if (this.inRangeOfLocalDepartment && this.context.island!.dolPolicy == DepartmentOfLaborPolicy.GalvanicGrantsAct) {
            efficiency += 0.5;
          }
          break;
        case Boost.TracktorBarn:
          efficiency += 2.0;
          break;
        case Boost.Fertilizer:
          efficiency += 1.0;
          break;
        case Boost.Silo:
          efficiency += 1.0;
          break;
      }
    }
    if (this.hasTradeUnion) {
      if (this.inRangeOfLocalDepartment && this.context.island!.dolPolicy != DepartmentOfLaborPolicy.None) {
        efficiency += this.context.world!.tradeUnionBonus;
      }
      efficiency += this.tradeUnionItemsBonus;
    }
    return efficiency;
  }

  get buildingProcessTimeSeconds(): number {
    return (lookupProductionInfo(this.building)?.processingTimeSeconds ?? 0) / this.efficiency;
  }

  get goodProcessTimeSeconds(): number {
    return this.buildingProcessTimeSeconds
      / ((this.hasTradeUnion && this.inRangeOfLocalDepartment)
        ? computeExtraGoodsModifier(this.building, this.good, this.context.island!)
        : 1);
  }

  get goodsProducedPerMinute(): number {
    return this.numBuildings * 60 / this.goodProcessTimeSeconds;
  }

  get islandHasDepartmentOfLabor(): boolean {
    return this.context.island?.dolPolicy != DepartmentOfLaborPolicy.None;
  }
};

export class TradeRouteView extends View<TradeRouteModel> {
  protected override model = BASE_TRADE_ROUTE_MODEL;

  static wrap(model: TradeRouteModel, context: ViewContext): TradeRouteView {
    const view = new TradeRouteView(context);
    view.wrap(model);
    return view;
  }

  get fromIsland(): IslandId {
    return this.model.fromIsland;
  }

  get toIsland(): IslandId {
    return this.model.toIsland;
  }

  get good(): Good {
    return this.model.good;
  }
}

export class IslandView extends View<IslandModel> {
  protected override model = BASE_ISLAND_MODEL;

  static wrap(model: IslandModel, context: ViewContext): IslandView {
    const view = new IslandView(context);
    view.wrap(model);
    return view;
  }

  get name(): string {
    return this.model.name;
  }

  get region(): Region {
    return this.model.region ?? DEFAULT_ISLAND_MODEL.region!;
  }

  get productionLines(): ProductionLineView[] {
    return this.model.productionLines.map(pl => ProductionLineView.wrap(pl, { ...this.context, island: this }));
  }

  get dolPolicy(): DepartmentOfLaborPolicy {
    return this.model.dolPolicy ?? DEFAULT_ISLAND_MODEL.dolPolicy!;
  }
};

export class WorldView extends View<WorldModel> {
  protected override model = BASE_WORLD_MODEL;

  static wrap(model: WorldModel): WorldView {
    const view = new WorldView({});
    view.wrap(model);
    return view;
  }

  get tradeUnionBonus(): number {
    return this.model.tradeUnionBonus ?? DEFAULT_WORLD_MODEL.tradeUnionBonus!;
  }

  get islands(): IslandView[] {
    return this.model.islands.map(i => IslandView.wrap(i, { world: this }));
  }
};

