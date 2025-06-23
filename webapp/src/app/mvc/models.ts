import { Good, ProductionBuilding, Boost, Region, DepartmentOfLaborPolicy } from "../game/enums";



export interface Model { };

export interface ExtraGoodModel extends Model {
  good: Good;
  rateNumerator?: number,
  rateDenominator?: number,
};

export interface ProductionLineModel extends Model {
  building: ProductionBuilding;
  inputGoods?: Good[];
  good: Good;
  numBuildings: number;
  boosts?: Boost[];
  hasTradeUnion?: boolean;
  tradeUnionItemsBonus?: number;
  extraGoods?: ExtraGoodModel[];
  inRangeOfLocalDepartment?: boolean;
};

export type IslandId = number;

export interface TradeRouteModel extends Model {
  fromIsland: IslandId;
  toIsland: IslandId;
  good: Good;
};

export interface IslandModel extends Model {
  id?: IslandId;
  name: string;
  region?: Region;
  productionLines: ProductionLineModel[];
  dolPolicy?: DepartmentOfLaborPolicy;
};

export interface WorldModel extends Model {
  tradeUnionBonus?: number;
  islands: IslandModel[];
  tradeRoutes: TradeRouteModel[];
};

export const BASE_EXTRA_GOOD_MODEL: ExtraGoodModel = {
  good: Good.Unknown,
  rateNumerator: 1,
  rateDenominator: 1,
};

export const DEFAULT_EXTRA_GOOD_MODEL: ExtraGoodModel = {
  good: Good.Unknown,
  rateNumerator: 1,
  rateDenominator: 1,
};

export const BASE_PRODUCTION_LINE_MODEL: ProductionLineModel = {
  building: ProductionBuilding.Unknown,
  good: Good.Unknown,
  numBuildings: 1,
};

export const DEFAULT_PRODUCTION_LINE_MODEL: ProductionLineModel = {
  building: ProductionBuilding.Unknown,
  inputGoods: [],
  good: Good.Unknown,
  numBuildings: 0,
  boosts: [],
  hasTradeUnion: false,
  tradeUnionItemsBonus: 0.0,
  extraGoods: [],
  inRangeOfLocalDepartment: false,
};

export const BASE_TRADE_ROUTE_MODEL: TradeRouteModel = {
  fromIsland: -1,
  toIsland: -1,
  good: Good.Unknown,
};

export const DEFAULT_TRADE_ROUTE_MODEL: TradeRouteModel = {
  fromIsland: -1,
  toIsland: -1,
  good: Good.Unknown,
};

export const BASE_ISLAND_MODEL: IslandModel = {
  name: 'UNNAMED_ISLAND',
  productionLines: [],
};

export const DEFAULT_ISLAND_MODEL: IslandModel = {
  name: '',
  region: Region.OldWorld,
  productionLines: [],
  dolPolicy: DepartmentOfLaborPolicy.None,
};

export const BASE_WORLD_MODEL: WorldModel = {
  islands: [],
  tradeRoutes: [],
};

export const DEFAULT_WORLD_MODEL: WorldModel = {
  tradeUnionBonus: 0.0,
  islands: [],
  tradeRoutes: [],
};

