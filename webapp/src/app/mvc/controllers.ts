import { BASE_ISLAND_MODEL, BASE_PRODUCTION_LINE_MODEL, BoostType, DEFAULT_ISLAND_MODEL, DEFAULT_PRODUCTION_LINE_MODEL, DEFAULT_WORLD_MODEL, IslandModel, DepartmentOfLaborPolicy, Model, ProductionBuilding, ProductionLineModel, Good, WorldModel } from "./models";
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
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.goodsRateNumerator) {
      delete this.model.goodsRateNumerator;
      return;
    }
    this.model.goodsRateNumerator = value;
  }
  override get goodsRateNumerator(): number {
    return super.goodsRateNumerator;
  }

  override set goodsRateDenominator(value: number) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.goodsRateDenominator) {
      delete this.model.goodsRateDenominator;
      return;
    }
    this.model.goodsRateDenominator = value;
  }
  override get goodsRateDenominator(): number {
    return super.goodsRateDenominator;
  }

  override set boostType(value: BoostType) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.boostType) {
      delete this.model.boostType;
      return;
    }
    this.model.boostType = value;
  }
  override get boostType(): BoostType {
    return super.boostType;
  }

  override set hasTradeUnion(value: boolean) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion) {
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
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.tradeUnionItemsBonus) {
      delete this.model.tradeUnionItemsBonus;
      return;
    }
    this.model.tradeUnionItemsBonus = value;
  }
  override get tradeUnionItemsBonus(): number {
    return super.tradeUnionItemsBonus;
  }

  override set inRangeOfLocalDepartment(value: boolean) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment) {
      delete this.model.inRangeOfLocalDepartment;
      return;
    }
    this.model.inRangeOfLocalDepartment = value;
  }
  override get inRangeOfLocalDepartment(): boolean {
    return super.inRangeOfLocalDepartment;
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
  override get name(): string {
    return super.name;
  }

  override set dolPolicy(value: DepartmentOfLaborPolicy) {
    if (value == null || value == DEFAULT_ISLAND_MODEL.dolPolicy) {
      delete this.model.dolPolicy;
      return;
    }
    this.model.dolPolicy = value;
  }
  override get dolPolicy(): DepartmentOfLaborPolicy {
    return super.dolPolicy;
  }

  private _productionLines?: ProductionLineController[];

  override get productionLines(): ProductionLineController[] {
    this._productionLines ??= this.model.productionLines.map(pl => ProductionLineController.wrap(pl, { ...this.context, island: this }));
    return this._productionLines;
  }

  addProductionLine(): ProductionLineController {
    const productionLine = structuredClone(BASE_PRODUCTION_LINE_MODEL);
    this.model.productionLines.push(productionLine);
    this._productionLines ??= [];
    const controller = ProductionLineController.wrap(productionLine, { ...this.context, island: this });
    this._productionLines.push(controller);
    return controller;
  }

  removeProductionLineAt(index: number): void {
    if (!Number.isInteger(index) || index < 0
      || index >= this.model.productionLines.length) {
      console.warn('Invalid productionLine index. ' +
        `Was ${index} and length is ${this.model.productionLines.length}`);
      return;
    }
    this.model.productionLines.splice(index, 1);
    this._productionLines!.splice(index, 1);
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
    if (value == null || value == DEFAULT_WORLD_MODEL.tradeUnionBonus) {
      delete this.model.tradeUnionBonus;
      return;
    }
    this.model.tradeUnionBonus = value;
  }

  private _islands?: IslandController[];

  override get islands(): IslandController[] {
    this._islands ??= this.model.islands.map(i => IslandController.wrap(i, { world: this }));
    return this._islands;
  }

  addIsland(): IslandController {
    const island = structuredClone(BASE_ISLAND_MODEL);
    this.model.islands.push(island);
    const controller = IslandController.wrap(island, { ...this.context, world: this });
    this._islands?.push(controller);
    return controller;
  }

  removeIslandAt(index: number): void {
    if (!Number.isInteger(index) || index < 0
      || index >= this.model.islands.length) {
      console.warn('Invalid islands index. ' +
        `Was ${index} and length is ${this.model.islands.length}`);
      return;
    }
    this.model.islands.splice(index, 1);
    this._islands?.splice(index, 1);
  }
};

