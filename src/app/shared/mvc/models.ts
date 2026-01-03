import {
  Good,
  ProductionBuilding,
  Boost,
  Region,
  DepartmentOfLaborPolicy,
} from '../game/enums';

// Marker interface for all models.
export interface Model { }

export interface ExtraGood extends Model {
  good: Good;
  rateNumerator?: number;
  rateDenominator?: number;
}

export interface ProductionLine extends Model {
  building: ProductionBuilding;
  inputGoods?: Good[];
  good: Good;
  numBuildings: number;
  boosts?: Boost[];
  hasTradeUnion?: boolean;
  tradeUnionItemsBonus?: number;
  extraGoods?: ExtraGood[];
  inRangeOfLocalDepartment?: boolean;
}

export type IslandId = number;
export type TradeRouteId = number;

export interface TradeRoute extends Model {
  id: TradeRouteId;
  sourceIslandId: IslandId;
  targetIslandId: IslandId;
  good: Good;
}

export interface Island extends Model {
  id?: IslandId;
  name: string;
  region?: Region;
  productionLines: ProductionLine[];
  dolPolicy?: DepartmentOfLaborPolicy;
}

export interface World extends Model {
  tradeUnionBonus?: number;
  islands: Island[];
  tradeRoutes: TradeRoute[];
}

export const BASE_EXTRA_GOOD_MODEL: ExtraGood = {
  good: Good.Unknown,
  rateNumerator: 1,
  rateDenominator: 1,
};

export const DEFAULT_EXTRA_GOOD_MODEL: ExtraGood = {
  good: Good.Unknown,
  rateNumerator: 1,
  rateDenominator: 1,
};

export const BASE_PRODUCTION_LINE_MODEL: ProductionLine = {
  building: ProductionBuilding.Unknown,
  good: Good.Unknown,
  numBuildings: 1,
};

export const DEFAULT_PRODUCTION_LINE_MODEL: ProductionLine = {
  building: ProductionBuilding.Unknown,
  inputGoods: [],
  good: Good.Unknown,
  numBuildings: 0,
  boosts: [],
  hasTradeUnion: false,
  tradeUnionItemsBonus: 0,
  extraGoods: [],
  inRangeOfLocalDepartment: false,
};

export const BASE_TRADE_ROUTE_MODEL: TradeRoute = {
  id: -1,
  sourceIslandId: -1,
  targetIslandId: -1,
  good: Good.Unknown,
};

export const DEFAULT_TRADE_ROUTE_MODEL: TradeRoute = {
  id: -1,
  sourceIslandId: -1,
  targetIslandId: -1,
  good: Good.Unknown,
};

export const BASE_ISLAND_MODEL: Island = {
  name: 'UNNAMED_ISLAND',
  productionLines: [],
};

export const DEFAULT_ISLAND_MODEL: Island = {
  name: '',
  region: Region.OldWorld,
  productionLines: [],
  dolPolicy: DepartmentOfLaborPolicy.None,
};

export const BASE_WORLD_MODEL: World = {
  islands: [],
  tradeRoutes: [],
};

export const DEFAULT_WORLD_MODEL: World = {
  tradeUnionBonus: 0,
  islands: [],
  tradeRoutes: [],
};
