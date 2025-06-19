import { BASE_ISLAND_MODEL, BASE_PRODUCTION_LINE_MODEL, BASE_WORLD_MODEL, BoostType, DEFAULT_ISLAND_MODEL, DEFAULT_PRODUCTION_LINE_MODEL, DEFAULT_WORLD_MODEL, getExtraGoodsModifier as computeExtraGoodsModifier, IslandModel, DepartmentOfLaborPolicy, lookupProductionInfo, Model, ProductionBuilding, ProductionLineModel, Good, WorldModel, Region, ExtraGoodModel, BASE_EXTRA_GOOD_MODEL, DEFAULT_EXTRA_GOOD_MODEL } from "./models";

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
  override model = BASE_EXTRA_GOOD_MODEL;

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
  override model = BASE_PRODUCTION_LINE_MODEL;

  static wrap(model: ProductionLineModel, context: ViewContext): ProductionLineView {
    const view = new ProductionLineView(context);
    view.wrap(model);
    return view;
  }

  get building(): ProductionBuilding {
    return this.model.building;
  }

  get good(): Good {
    return this.model.good;
  }

  get numBuildings(): number {
    return this.model.numBuildings ?? DEFAULT_PRODUCTION_LINE_MODEL.numBuildings;
  }

  get boosts(): BoostType[] {
    return this.model.boosts ?? DEFAULT_PRODUCTION_LINE_MODEL.boosts!;
  }

  get hasTradeUnion(): boolean {
    return this.model.hasTradeUnion ?? DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion!;
  }

  get tradeUnionItemsBonus(): number {
    return this.model.tradeUnionItemsBonus ?? DEFAULT_PRODUCTION_LINE_MODEL.tradeUnionItemsBonus!;
  }

  get extraGoods(): ExtraGoodView[] {
    return this.model.extraGoods.map(eg => ExtraGoodView.wrap(eg, { ...this.context, productionLine: this }));
  }

  get inRangeOfLocalDepartment(): boolean {
    return this.model.inRangeOfLocalDepartment ?? DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment!;
  }

  get efficiency(): number {
    let efficiency = 1.0;
    for (const boost of this.boosts) {
      switch (boost) {
        case BoostType.Electricity:
          efficiency += 1.0;
          if (this.inRangeOfLocalDepartment && this.context.island!.dolPolicy == DepartmentOfLaborPolicy.GalvanicGrantsAct) {
            efficiency += 0.5;
          }
          break;
        case BoostType.TracktorBarn:
          efficiency += 2.0;
          break;
        case BoostType.Fertilizer:
          efficiency += 1.0;
          break;
        case BoostType.Silo:
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

export class IslandView extends View<IslandModel> {
  override model = BASE_ISLAND_MODEL;

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
  override model = BASE_WORLD_MODEL;

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

