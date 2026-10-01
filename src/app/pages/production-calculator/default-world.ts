import {
  Boost,
  DepartmentOfLaborPolicy,
  Good,
  ProductionBuilding,
  Region,
} from '../../shared/game/enums';
import { World } from '../../shared/mvc/models';

/** The world a first-time visitor sees, and what "reset" restores. */
export const defaultWorld: World = {
  tradeUnionBonus: 0.3,
  islands: [
    {
      id: 1,
      name: 'Crown Falls',
      region: Region.CapeTrelawney,
      dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
      productionLines: [
        {
          building: ProductionBuilding.Bakery,
          inputGoods: [Good.Flour],
          good: Good.Bread,
          numBuildings: 10,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.FlourMill,
          inputGoods: [Good.Grain],
          good: Good.Flour,
          numBuildings: 5,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.Brewery,
          inputGoods: [Good.Malt, Good.Hops],
          good: Good.Beer,
          numBuildings: 4,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.Malthouse,
          inputGoods: [Good.Grain],
          good: Good.Malt,
          numBuildings: 3,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.AdvancedCoffeeRoaster,
          inputGoods: [Good.Malt],
          good: Good.Coffee,
          numBuildings: 2,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.FurDealer,
          inputGoods: [Good.CottonFabric, Good.Furs],
          good: Good.FurCoats,
          numBuildings: 2,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
      ],
    },
    {
      id: 2,
      name: 'Farm Island',
      region: Region.OldWorld,
      dolPolicy: DepartmentOfLaborPolicy.LandReformAct,
      productionLines: [
        {
          building: ProductionBuilding.GrainFarm,
          good: Good.Grain,
          numBuildings: 8,
          boosts: [Boost.TractorBarn],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.HopFarm,
          good: Good.Hops,
          numBuildings: 3,
          boosts: [Boost.TractorBarn],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.HuntingCabin,
          good: Good.Furs,
          numBuildings: 10,
        },
      ],
    },
    {
      id: 3,
      name: 'Plantation Island',
      region: Region.NewWorld,
      productionLines: [
        {
          building: ProductionBuilding.CottonPlantation,
          good: Good.Cotton,
          numBuildings: 10,
        },
        {
          building: ProductionBuilding.CottonMill,
          good: Good.CottonFabric,
          inputGoods: [Good.Cotton],
          numBuildings: 5,
        },
      ],
    },
  ],
  tradeRoutes: [
    {
      id: 1,
      sourceIslandId: 2,
      targetIslandId: 1,
      good: Good.Grain,
    },
    {
      id: 2,
      sourceIslandId: 2,
      targetIslandId: 1,
      good: Good.Hops,
    },
    {
      id: 3,
      sourceIslandId: 2,
      targetIslandId: 1,
      good: Good.Furs,
    },
    {
      id: 4,
      sourceIslandId: 3,
      targetIslandId: 1,
      good: Good.CottonFabric,
    },
  ],
};
