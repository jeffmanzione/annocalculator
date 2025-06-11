import { BASE_ISLAND_MODEL, BASE_PRODUCTION_LINE_MODEL, BoostType, DEFAULT_ISLAND_MODEL, DEFAULT_PRODUCTION_LINE_MODEL, DEFAULT_WORLD_MODEL, IslandModel, IslandPolicy, Model, ProductionBuilding, ProductionLineModel, Good, WorldModel } from "./models";
import { IslandView, ProductionLineView, ViewContext, WorldView } from "./views";


export class ProductionLineController extends ProductionLineView {
  static override wrap(model: ProductionLineModel, context: ViewContext): ProductionLineController {
    const controller = new ProductionLineController(context);
    controller.wrap(model);
    return controller;
  }

  asView(): ProductionLineView {
    return this;
  }

  override set building(value: ProductionBuilding) {
    this.model.building = value;
  }
  override get building(): ProductionBuilding {
    return super.building;
  }

  override set good(value: Good) {
    this.model.good = value;
  }
  override get good(): Good {
    return super.good;
  }

  override set numBuildings(value: number) {
    if (!Number.isInteger(value)) {
      console.warn(`numBuildings must be an integer. Was ${value}.`);
    }
    this.model.numBuildings = Math.trunc(value);
  }
  override get numBuildings(): number {
    return super.numBuildings;
  }

  override set goodsRateNumerator(value: number) {
    if (value == DEFAULT_PRODUCTION_LINE_MODEL.goodsRateNumerator) {
      delete this.model.goodsRateNumerator;
      return;
    }
    this.model.goodsRateNumerator = value;
  }
  override get goodsRateNumerator(): number {
    return super.goodsRateNumerator;
  }

  override set goodsRateDenominator(value: number) {
    if (value == DEFAULT_PRODUCTION_LINE_MODEL.goodsRateDenominator) {
      delete this.model.goodsRateDenominator;
      return;
    }
    this.model.goodsRateDenominator = value;
  }
  override get goodsRateDenominator(): number {
    return super.goodsRateDenominator;
  }

  override set boostType(value: BoostType) {
    if (value == DEFAULT_PRODUCTION_LINE_MODEL.boostType) {
      delete this.model.boostType;
      return;
    }
    this.model.boostType = value;
  }
  override get boostType(): BoostType {
    return super.boostType;
  }

  override set hasTradeUnion(value: boolean) {
    if (value == DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion) {
      delete this.model.hasTradeUnion;
      delete this.model.tradeUnionItemsBonus;
      return;
    }
    this.model.hasTradeUnion = value;
  }
  override get hasTradeUnion(): boolean {
    return super.hasTradeUnion;
  }

  override set tradeUnionItemsBonus(value: number) {
    if (value == DEFAULT_PRODUCTION_LINE_MODEL.tradeUnionItemsBonus) {
      delete this.model.tradeUnionItemsBonus;
      return;
    }
    this.model.tradeUnionItemsBonus = value;
  }
  override get tradeUnionItemsBonus(): number {
    return super.tradeUnionItemsBonus;
  }
};

export class IslandController extends IslandView {
  static override wrap(model: IslandModel, context: ViewContext): IslandController {
    const controller = new IslandController(context);
    controller.wrap(model);
    return controller;
  }

  asView(): IslandView {
    return this;
  }

  override set name(value: string) {
    this.model.name = value;
  }

  override set policy(value: IslandPolicy) {
    if (value == DEFAULT_ISLAND_MODEL.islandPolicy) {
      delete this.model.islandPolicy;
      return;
    }
    this.model.islandPolicy = value;
  }

  override get productionLines(): ProductionLineController[] {
    return this.model.productionLines.map(pl => ProductionLineController.wrap(pl, { ...this.context, island: this }));
  }

  addProductionLine(): ProductionLineController {
    const productionLine = { ...BASE_PRODUCTION_LINE_MODEL };
    this.model.productionLines.push(productionLine);
    return ProductionLineController.wrap(productionLine, { ...this.context, island: this });
  }

  removeProductionLineAt(index: number): void {
    if (!Number.isInteger(index) || index < 0
      || index >= this.model.productionLines.length) {
      console.warn('Invalid productionLine index. ' +
        `Was ${index} and length is ${this.model.productionLines.length}`);
      return;
    }
    this.model.productionLines.splice(index, index + 1);
  }
};

export class WorldController extends WorldView {
  static override wrap(model: WorldModel): WorldController {
    const controller = new WorldController({});
    controller.wrap(model);
    return controller;
  }

  asView(): WorldView {
    return this;
  }

  override get tradeUnionBonus(): number {
    return super.tradeUnionBonus;
  }
  override set tradeUnionBonus(value: number) {
    if (value == DEFAULT_WORLD_MODEL.tradeUnionBonus) {
      delete this.model.tradeUnionBonus;
      return;
    }
    this.model.tradeUnionBonus = value;
  }


  override get islands(): IslandController[] {
    return this.model.islands.map(i => IslandController.wrap(i, { world: this }));
  }

  addIsland(): IslandController {
    const island = { ...BASE_ISLAND_MODEL };
    this.model.islands.push(island);
    return IslandController.wrap(island, this.context);
  }

  removeIslandAt(index: number): void {
    if (!Number.isInteger(index) || index < 0
      || index >= this.model.islands.length) {
      console.warn('Invalid islands index. ' +
        `Was ${index} and length is ${this.model.islands.length}`);
      return;
    }
    this.model.islands.splice(index, index);
  }
};

