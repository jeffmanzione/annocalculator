import {
  Boost,
  CulturalSet,
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../game/enums';
import { World1800 } from './models';
import { WorldStore1800 } from './world-store-1800';
import { World1800View } from './world-views';

// Fixtures shared by the characterization specs. Only used from *.spec.ts.

/**
 * A hand-built world exercising the rules the default world doesn't: items,
 * cultural sets, Silo/Fertiliser upkeep, electrified animal farms, Hacienda
 * Fertiliser Works, and the Land Reform / Skilled Labor / Galvanic Grants acts.
 * Ids are fixed so snapshots are stable.
 */
export const featureWorld = (): World1800 => ({
  palacePrestigeLevel: 10,
  islands: [
    {
      id: 1,
      name: 'Old Isle',
      region: Region.OldWorld,
      dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
      productionLines: [
        {
          id: 11,
          building: ProductionBuilding.Steelworks,
          inputGoods: [Good.Steel],
          good: Good.SteelBeams,
          numBuildings: 2,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          id: 12,
          building: ProductionBuilding.PigFarm,
          good: Good.Pigs,
          numBuildings: 4,
          boosts: [Boost.Silo],
        },
        {
          id: 13,
          building: ProductionBuilding.GrainFarm,
          good: Good.Grain,
          numBuildings: 3,
          boosts: [Boost.TractorBarn, Boost.Fertiliser],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
          items: [Item.AlexanderHancock],
        },
        {
          id: 14,
          building: ProductionBuilding.Bakery,
          inputGoods: [Good.Flour],
          good: Good.Bread,
          numBuildings: 2,
          hasTradeUnion: true,
          items: [Item.FineCakeDecorator],
        },
        {
          id: 15,
          building: ProductionBuilding.HuntingCabin,
          good: Good.Furs,
          numBuildings: 2,
          culturalSets: [CulturalSet.BronzeAge],
        },
        {
          id: 16,
          building: ProductionBuilding.FlourMill,
          inputGoods: [Good.Grain],
          good: Good.Flour,
          numBuildings: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Land Reform Isle',
      region: Region.OldWorld,
      dolPolicy: DepartmentOfLaborPolicy.LandReformAct,
      productionLines: [
        {
          id: 21,
          building: ProductionBuilding.GrainFarm,
          good: Good.Grain,
          numBuildings: 5,
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
      ],
    },
    {
      id: 3,
      name: 'Galvanic Isle',
      region: Region.OldWorld,
      dolPolicy: DepartmentOfLaborPolicy.GalvanicGrantsAct,
      productionLines: [
        {
          id: 31,
          building: ProductionBuilding.Bakery,
          inputGoods: [Good.Flour],
          good: Good.Bread,
          numBuildings: 1,
          boosts: [Boost.Electricity],
          inRangeOfLocalDepartment: true,
        },
      ],
    },
    {
      id: 4,
      name: 'New Isle',
      region: Region.NewWorld,
      productionLines: [
        {
          id: 41,
          building: ProductionBuilding.CattleFarmNewWorld,
          good: Good.Beef,
          numBuildings: 2,
          boosts: [Boost.Silo, Boost.Electricity],
        },
        {
          id: 42,
          building: ProductionBuilding.CottonPlantation,
          good: Good.Cotton,
          numBuildings: 2,
          boosts: [Boost.Fertiliser],
          inRangeOfHaciendaFertiliserWorks: true,
        },
      ],
    },
  ],
  tradeRoutes: [
    { id: 1, sourceIslandId: 2, targetIslandId: 1, good: Good.Grain },
    { id: 2, sourceIslandId: 2, targetIslandId: 4, good: Good.Grain },
    { id: 3, sourceIslandId: 1, targetIslandId: 3, good: Good.Bread },
  ],
});

export const viewOf = (world: World1800): World1800View =>
  new World1800View(WorldStore1800.fromWorld(world));

/** Round to dodge floating-point noise in snapshots. */
export const round = (n: number): number => Math.round(n * 1e6) / 1e6;
