import {
  Boost,
  Good,
  ProductionBuilding,
  Region,
  DepartmentOfLaborPolicy,
  Item,
} from '../game/enums';
import {
  BASE_ISLAND_MODEL,
  BASE_PRODUCTION_LINE_MODEL,
  DEFAULT_ISLAND_MODEL,
  DEFAULT_PRODUCTION_LINE_MODEL,
  DEFAULT_WORLD_MODEL,
  Island,
  ProductionLine,
  World,
  // ExtraGood,
  TradeRoute,
  IslandId,
  BASE_TRADE_ROUTE_MODEL,
  TradeRouteId,
} from './models';
import {
  // ExtraGoodView,
  IslandView,
  ProductionLineView,
  TradeRouteView,
  ViewContext,
  WorldView,
} from './views';

function generatePseudorandomInt(): number {
  // Ensure min and max are integers
  const [min, max] = [0, Number.MAX_SAFE_INTEGER];
  // Generate a random number between min (inclusive) and max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export class ExtraGoodController extends ExtraGoodView {
//   static override wrap(
//     model: ExtraGood,
//     context: ViewContext,
//   ): ExtraGoodController {
//     return new ExtraGoodController(model, context);
//   }

//   override set good(value: Good) {
//     this.model.good = value;
//   }
//   override get good(): Good {
//     return super.good;
//   }

//   override set rateNumerator(value: number) {
//     this.model.rateNumerator = value;
//   }
//   override get rateNumerator(): number {
//     return super.rateNumerator;
//   }

//   override set rateDenominator(value: number) {
//     this.model.rateDenominator = value;
//   }
//   override get rateDenominator(): number {
//     return super.rateDenominator;
//   }
// }

export class ProductionLineController extends ProductionLineView {
  static override wrap(
    model: ProductionLine,
    context: ViewContext,
  ): ProductionLineController {
    return new ProductionLineController(model, context);
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

  override set items(value: Item[]) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.items) {
      delete this.model.items;
      return;
    }
    this.model.items = value;
  }
  override get items(): Item[] {
    return super.items;
  }

  override set hasTradeUnion(value: boolean) {
    if (value == null || value == DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion) {
      delete this.model.hasTradeUnion;
      delete this.model.items;
      return;
    }
    this.model.hasTradeUnion = value;
  }
  override get hasTradeUnion(): boolean {
    return super.hasTradeUnion;
  }

  override set inRangeOfLocalDepartment(value: boolean) {
    if (
      value == null ||
      value == DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment
    ) {
      delete this.model.inRangeOfLocalDepartment;
      return;
    }
    this.model.inRangeOfLocalDepartment = value;
  }
  override get inRangeOfLocalDepartment(): boolean {
    return super.inRangeOfLocalDepartment;
  }
}

export class TradeRouteController extends TradeRouteView {
  static override wrap(
    model: TradeRoute,
    context: ViewContext,
  ): TradeRouteController {
    const controller = new TradeRouteController(model, context);
    if (model.id < 0) {
      controller.model.id = generatePseudorandomInt();
    }
    return controller;
  }

  override set sourceIslandId(value: IslandId) {
    this.model.sourceIslandId = value;
  }
  override get sourceIslandId(): IslandId {
    return super.sourceIslandId;
  }

  override set targetIslandId(value: IslandId) {
    this.model.targetIslandId = value;
  }
  override get targetIslandId(): IslandId {
    return super.targetIslandId;
  }

  override set good(value: Good) {
    this.model.good = value;
  }
  override get good(): Good {
    return super.good;
  }
}

export class IslandController extends IslandView {
  static override wrap(model: Island, context: ViewContext): IslandController {
    const controller = new IslandController(model, context);
    if (!model.id || model.id < 0) {
      controller.model.id = generatePseudorandomInt();
    }
    return controller;
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
    this._productionLines ??= this.model.productionLines.map((pl) =>
      ProductionLineController.wrap(pl, { ...this.context, island: this }),
    );
    return this._productionLines;
  }

  addProductionLine(): ProductionLineController {
    const productionLine = structuredClone(BASE_PRODUCTION_LINE_MODEL);
    this.model.productionLines.push(productionLine);
    this._productionLines ??= [];
    const controller = ProductionLineController.wrap(productionLine, {
      ...this.context,
      island: this,
    });
    this._productionLines.push(controller);
    return controller;
  }

  removeProductionLineAt(index: number): void {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this.model.productionLines.length
    ) {
      console.warn(
        'Invalid productionLine index. ' +
        `Was ${index} and length is ${this.model.productionLines.length}`,
      );
      return;
    }
    this.model.productionLines.splice(index, 1);
    this._productionLines!.splice(index, 1);
  }
}

export class WorldController extends WorldView {
  static override wrap(model: World): WorldController {
    return new WorldController(model, {});
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
    this._islands ??= this.model.islands.map((i) =>
      IslandController.wrap(i, this.selfContextC),
    );
    return this._islands;
  }

  addIsland(): IslandController {
    const island = structuredClone(BASE_ISLAND_MODEL);
    this.model.islands.push(island);
    const controller = IslandController.wrap(island, this.selfContextC);
    this._islands!.push(controller);
    return controller;
  }

  removeIslandAt(index: number): void {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this.model.islands.length
    ) {
      console.warn(
        'Invalid islands index. ' +
        `Was ${index} and length is ${this.model.islands.length}`,
      );
      return;
    }
    this.model.islands.splice(index, 1);
    this._islands!.splice(index, 1);
  }

  private _tradeRoutes?: TradeRouteController[];

  override get tradeRoutes(): TradeRouteController[] {
    this._tradeRoutes ??= this.model.tradeRoutes.map((i) =>
      TradeRouteController.wrap(i, this.selfContextC),
    );
    return this._tradeRoutes;
  }

  addTradeRoute(): TradeRouteController {
    const tradeRoute = structuredClone(BASE_TRADE_ROUTE_MODEL);
    this.model.tradeRoutes.push(tradeRoute);
    const controller = TradeRouteController.wrap(tradeRoute, this.selfContextC);
    this._tradeRoutes!.push(controller);
    return controller;
  }

  removeTradeRoute(id: TradeRouteId) {
    const index = this.model.tradeRoutes.findIndex((tr) => tr.id == id);
    this.model.tradeRoutes.splice(index, 1);
    this._tradeRoutes!.splice(index, 1);
  }

  private get selfContextC(): ViewContext {
    return { ...this.context, world: this };
  }

  copyModel(): World {
    return structuredClone(this.model);
  }
}
