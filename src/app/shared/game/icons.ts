import {
  Good,
  ProductionBuilding,
  Boost,
  Region,
  DepartmentOfLaborPolicy,
  Item,
} from './enums';
import { buildingInfo, lookupItemInfo } from './facts';

import * as boostsJson from '../data/boosts.json' with { type: 'json' };
import * as goodsJson from '../data/goods.json' with { type: 'json' };
import * as policiesJson from '../data/policies.json' with { type: 'json' };
import * as regionsJson from '../data/regions.json' with { type: 'json' };

// I can finally let go of that pent up gas.
const defaultIconUrl = '/icons/others/Sir_Archibald_Blake.png';

export const goodsToIconUrl = new Map<Good, string>(
  (goodsJson as any).default as [Good, string][],
);

export const boostTypeToImageUrl = new Map<Boost, string>(
  (boostsJson as any).default as [Boost, string][],
);

export const regionToImageUrl = new Map<Region, string>(
  (regionsJson as any).default as [Region, string][],
);

export const policyToImageUrl = new Map<DepartmentOfLaborPolicy, string>(
  (policiesJson as any).default as [DepartmentOfLaborPolicy, string][],
);

const lookupUrlFn =
  <T>(map: Map<T, string>) =>
  (key: T) =>
    map.get(key) ?? defaultIconUrl;

export const lookupGoodIconUrl = lookupUrlFn(goodsToIconUrl);

const productionBuildingToIconUrl = new Map<ProductionBuilding, string>(
  buildingInfo.map((bi) => [bi.building, lookupGoodIconUrl(bi.good)]),
);

export const lookupBuildingIconUrl = lookupUrlFn(productionBuildingToIconUrl);
export const lookupBoostIconUrl = lookupUrlFn(boostTypeToImageUrl);
export const lookupRegionIconUrl = lookupUrlFn(regionToImageUrl);
export const lookupPolicyIconUrl = lookupUrlFn(policyToImageUrl);
export const lookupItemIconUrl = (item: Item) =>
  lookupItemInfo(item)?.iconUrl ?? defaultIconUrl;
export const lookupHaciendaFertilizerWorksIconUrl = (_: any) =>
  '/icons/others/Hacienda_Fertiliser_Works.png';
