import {
  Good,
  ProductionBuilding,
  Boost,
  Region,
  DepartmentOfLaborPolicy,
  Item,
  CulturalSet,
} from '../game/enums';

// Marker interface for all models.
interface Model1800 {}

export interface ExtraGood1800 extends Model1800 {
  good?: Good;

  source?:
    | Item
    | Boost
    | DepartmentOfLaborPolicy
    | 'Hacienda Fertilizer Works'
    | CulturalSet;
  sourceType?:
    | 'Item'
    | 'Boost'
    | 'ElectrifiedFarm'
    | 'DepartmentOfLaborPolicy'
    | 'HaciendaFertilizerWorks'
    | 'CulturalSet';

  rateNumerator?: number;
  rateDenominator?: number;

  producedPerMinute?: number;
}

export interface ProductionLine1800 extends Model1800 {
  id?: ProductionLineId;
  building: ProductionBuilding;
  inputGoods?: Good[];
  good: Good;
  numBuildings: number;
  boosts?: Boost[];
  hasTradeUnion?: boolean;
  items?: Item[];
  inRangeOfLocalDepartment?: boolean;
  inRangeOfHaciendaFertiliserWorks?: boolean;
  culturalSets?: CulturalSet[];
}

export type IslandId = number;
export type TradeRouteId = number;
export type ProductionLineId = number;

export interface TradeRoute1800 extends Model1800 {
  id: TradeRouteId;
  sourceIslandId: IslandId;
  targetIslandId: IslandId;
  good: Good;
}

export interface Island1800 extends Model1800 {
  id?: IslandId;
  name: string;
  region?: Region;
  productionLines: ProductionLine1800[];
  dolPolicy?: DepartmentOfLaborPolicy;
}

export interface World1800 extends Model1800 {
  /** The Palace's prestige level; absent when there is no Palace. */
  palacePrestigeLevel?: number;
  /**
   * Only read from worlds saved before palacePrestigeLevel existed, and converted
   * to a level on load. Never written.
   * @deprecated
   */
  tradeUnionBonus?: number;
  islands: Island1800[];
  tradeRoutes: TradeRoute1800[];
}

export const DEFAULT_EXTRA_GOOD_MODEL: ExtraGood1800 = {
  good: Good.Unknown,
  rateNumerator: 1,
  rateDenominator: 1,
};

export const BASE_PRODUCTION_LINE_MODEL: ProductionLine1800 = {
  building: ProductionBuilding.Unknown,
  good: Good.Unknown,
  numBuildings: 1,
};

export const DEFAULT_PRODUCTION_LINE_MODEL: ProductionLine1800 = {
  building: ProductionBuilding.Unknown,
  inputGoods: [],
  good: Good.Unknown,
  numBuildings: 0,
  boosts: [],
  hasTradeUnion: false,
  items: [],
  inRangeOfLocalDepartment: false,
  inRangeOfHaciendaFertiliserWorks: false,
  culturalSets: [],
};

export const BASE_TRADE_ROUTE_MODEL: TradeRoute1800 = {
  id: -1,
  sourceIslandId: -1,
  targetIslandId: -1,
  good: Good.Unknown,
};

export const BASE_ISLAND_MODEL: Island1800 = {
  name: 'UNNAMED_ISLAND',
  productionLines: [],
};

export const DEFAULT_ISLAND_MODEL: Island1800 = {
  name: '',
  region: Region.OldWorld,
  productionLines: [],
  dolPolicy: DepartmentOfLaborPolicy.None,
};
