import { Boost, Good, ProductionBuilding, Region, DepartmentOfLaborPolicy } from "../game/enums";
import { BASE_ISLAND_MODEL, BASE_PRODUCTION_LINE_MODEL, DEFAULT_ISLAND_MODEL, DEFAULT_PRODUCTION_LINE_MODEL, DEFAULT_WORLD_MODEL, IslandModel, ProductionLineModel, WorldModel, ExtraGoodModel, BASE_EXTRA_GOOD_MODEL, TradeRouteModel, IslandId } from "./models";
import { ExtraGoodView, IslandView, ProductionLineView, TradeRouteView, ViewContext, WorldView } from "./views";

let islandCounter = 0;

export class ExtraGoodController extends ExtraGoodView {
  static override wrap(model: ExtraGoodModel, context: ViewContext): ExtraGoodController {
    const controller = new ExtraGoodController(context);
    controller.wrap(model);
    return controller;
  }

  asView(): ExtraGoodView {
    return this;
  }

  override set good(value: Good) {
    this.model.good = value;
  }
  override get good(): Good {
    return super.good;
  }

  override set rateNumerator(value: number) {
    this.model.rateNumerator = value;
  }
  override get rateNumerator(): number {
    return super.rateNumerator;
  }

  override set rateDenominator(value: number) {
    this.model.rateDenominator = value;
  }
  override get rateDenominator(): number {
    return super.rateDenominator;
  }
};

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

  override set inputGoods(value: Good[]) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.inputGoods) {
      delete this.model.inputGoods;
      return;
    }
    this.model.inputGoods = value;
  }
  override get inputGoods(): Good[] {
    return super.inputGoods;
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

  override set boosts(value: Boost[]) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.boosts) {
      delete this.model.boosts;
      return;
    }
    this.model.boosts = value;
  }
  override get boosts(): Boost[] {
    return super.boosts;
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

  private _extraGoods?: ExtraGoodController[];

  override get extraGoods(): ExtraGoodController[] {
    if (!this.model.extraGoods) {
      return [];
    }
    this._extraGoods ??= this.model.extraGoods.map(eg => ExtraGoodController.wrap(eg, { ...this.context, productionLine: this }));
    return this._extraGoods;
  }

  addExtraGood(): ExtraGoodController {
    this.model.extraGoods ??= [];
    this._extraGoods ??= this.model.extraGoods.map(eg => ExtraGoodController.wrap(eg, { ...this.context, productionLine: this }));
    const extraGood = structuredClone(BASE_EXTRA_GOOD_MODEL);
    this.model.extraGoods.push(extraGood);
    const controller = ExtraGoodController.wrap(extraGood, { ...this.context, productionLine: this });
    this._extraGoods.push(controller);
    return controller;
  }

  removeExtraGoodAt(index: number): void {
    if (!Number.isInteger(index) || index < 0
      || index >= this.model.extraGoods!.length) {
      console.warn('Invalid productionLine index. ' +
        `Was ${index} and length is ${this.model.extraGoods!.length}`);
      return;
    }
    this.model.extraGoods!.splice(index, 1);
    this._extraGoods!.splice(index, 1);

    if (this.model.extraGoods?.length == 0) {
      delete this.model.extraGoods;
    }
  }
};

export class TradeRouteController extends TradeRouteView {
  static override wrap(model: TradeRouteModel, context: ViewContext): TradeRouteController {
    const controller = new TradeRouteController(context);
    controller.wrap(model);
    return controller;
  }

  asView(): TradeRouteView {
    return this;
  }

  override set fromIsland(value: IslandId) {
    this.model.fromIsland = value;
  }
  override get fromIsland(): IslandId {
    return super.fromIsland;
  }

  override set toIsland(value: IslandId) {
    this.model.toIsland = value;
  }
  override get toIsland(): IslandId {
    return super.toIsland;
  }

  override set good(value: Good) {
    this.model.good = value;
  }
  override get good(): Good {
    return super.good;
  }
}

export class IslandController extends IslandView {
  static override wrap(model: IslandModel, context: ViewContext): IslandController {
    const controller = new IslandController(context);
    controller.wrap(model);
    model.id ??= islandCounter++;
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

  override set region(value: Region) {
    this.model.region = value;
  }
  override get region(): Region {
    return super.region;
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

