import { BASE_ISLAND_MODEL, BASE_PRODUCTION_LINE_MODEL, BASE_WORLD_MODEL, BoostType, DEFAULT_ISLAND_MODEL, DEFAULT_PRODUCTION_LINE_MODEL, DEFAULT_WORLD_MODEL, getExtraGoodsModifier as computeExtraGoodsModifier, improvedByLandReformAct, improvedBySkilledLaborAct, IslandModel, IslandPolicy, lookupProductionInfo, Model, ProductionBuilding, ProductionLineModel, Good, WorldModel } from "./models";

export interface ViewContext {
  world?: WorldView;
  island?: IslandView;
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
    return this.model.numBuildings;
  }

  get goodsRateNumerator(): number {
    return this.model.goodsRateNumerator ?? DEFAULT_PRODUCTION_LINE_MODEL.goodsRateNumerator!;
  }

  get goodsRateDenominator(): number {
    return this.model.goodsRateDenominator ?? DEFAULT_PRODUCTION_LINE_MODEL.goodsRateDenominator!;
  }

  get goodsRate(): number {
    return this.goodsRateNumerator / this.goodsRateDenominator;
  }

  get boostType(): BoostType {
    return this.model.boostType ?? DEFAULT_PRODUCTION_LINE_MODEL.boostType!;
  }

  get hasTradeUnion(): boolean {
    return this.model.hasTradeUnion ?? DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion!;
  }

  get tradeUnionItemsBonus(): number {
    return this.model.tradeUnionItemsBonus ?? DEFAULT_PRODUCTION_LINE_MODEL.tradeUnionItemsBonus!;
  }

  get efficiency(): number {
    let efficiency = 1.0;
    switch (this.boostType) {
      case BoostType.Electricity:
        efficiency += 1.0;
        if (this.context.island!.policy == IslandPolicy.GalvanicGrantsAct) {
          efficiency += 0.5;
        }
        break;
      case BoostType.TracktorBarn:
        efficiency += 2.0;
        break;
      case BoostType.Fertilizer:
        efficiency += 1.0;
        break;
      case BoostType.TractorsAndFertilizer:
        efficiency += 3.0;
        break;
      case BoostType.Silo:
        efficiency += 1.0;
        break;
    }
    if (this.hasTradeUnion) {
      // if (this.context.island!.policy == IslandPolicy.UnionSubsidiesAct) {
      efficiency += this.context.world!.tradeUnionBonus;
      // }
      efficiency += this.tradeUnionItemsBonus;
    }
    return efficiency;
  }

  get buildingProcessTimeSeconds(): number {
    return (lookupProductionInfo(this.building)?.processingTimeSeconds ?? 0) / this.efficiency;
  }

  get goodProcessTimeSeconds(): number {
    return this.buildingProcessTimeSeconds
      / this.goodsRate
      / computeExtraGoodsModifier(this.building, this.good, this.context.island!);
  }

  get goodsProducedPerMinute(): number {
    return this.numBuildings * 60 / this.goodProcessTimeSeconds;
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

  get policy(): IslandPolicy {
    return this.model.islandPolicy ?? DEFAULT_ISLAND_MODEL.islandPolicy!;
  }

  get productionLines(): ProductionLineView[] {
    return this.model.productionLines.map(pl => ProductionLineView.wrap(pl, { ...this.context, island: this }));
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

