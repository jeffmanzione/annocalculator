import {
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../../shared/game/enums';
import { World } from '../../shared/mvc/models';

/**
 * The world a first-time visitor sees, and what "reset" restores.
 *
 * A small starter that reads at a glance, with every number in balance so the
 * Summary shows no shortages and no warnings:
 *
 *  - Farm Island (Old World) grows Grain and hunts Furs.
 *  - Crown Falls (Cape Trelawney) mills Grain into Flour, bakes Bread and
 *    makes Fur Coats; it gets its Grain and Furs by trade route.
 *  - Plantation Island (New World) grows Cotton and weaves Cotton Fabric,
 *    shipped to Crown Falls for the Fur Dealer.
 *
 * A few specialists (items) show how they work, each a different idea: a
 * plain +10% (Cropper, Poacher), a bigger boost for a mill (Burrstone), and
 * Fine Cake Decorator, which also adds a bonus good (Chocolate). Items need the
 * Trade Union box ticked. Everything else advanced (boosts, department
 * policies, cultural sets, the trade union bonus) stays off.
 *
 * Quantities are chosen so the chains balance, leaving only a sliver of
 * spare Flour, Grain and Furs: 5 Grain Farms (+10%) feed 2 Flour Mills (+35%),
 * which feed 4 Bakeries (+30%) for 5.2 Bread/min; 2 Hunting Cabins (+10%) and 1
 * Cotton Mill (fed by 2 Cotton Plantations) supply 1 Fur Dealer (2 Fur
 * Coats/min).
 */
export const defaultWorld: World = {
  islands: [
    {
      id: 1,
      name: 'Crown Falls',
      region: Region.CapeTrelawney,
      productionLines: [
        {
          building: ProductionBuilding.FlourMill,
          inputGoods: [Good.Grain],
          good: Good.Flour,
          numBuildings: 2,
          hasTradeUnion: true,
          items: [Item.Burrstone],
        },
        {
          building: ProductionBuilding.Bakery,
          inputGoods: [Good.Flour],
          good: Good.Bread,
          numBuildings: 4,
          hasTradeUnion: true,
          items: [Item.FineCakeDecorator],
        },
        {
          building: ProductionBuilding.FurDealer,
          inputGoods: [Good.CottonFabric, Good.Furs],
          good: Good.FurCoats,
          numBuildings: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Farm Island',
      region: Region.OldWorld,
      productionLines: [
        {
          building: ProductionBuilding.GrainFarm,
          good: Good.Grain,
          numBuildings: 5,
          hasTradeUnion: true,
          items: [Item.Cropper],
        },
        {
          building: ProductionBuilding.HuntingCabin,
          good: Good.Furs,
          numBuildings: 2,
          hasTradeUnion: true,
          items: [Item.Poacher],
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
          numBuildings: 2,
        },
        {
          building: ProductionBuilding.CottonMill,
          inputGoods: [Good.Cotton],
          good: Good.CottonFabric,
          numBuildings: 1,
        },
      ],
    },
  ],
  tradeRoutes: [
    { id: 1, sourceIslandId: 2, targetIslandId: 1, good: Good.Grain },
    { id: 2, sourceIslandId: 2, targetIslandId: 1, good: Good.Furs },
    { id: 3, sourceIslandId: 3, targetIslandId: 1, good: Good.CottonFabric },
  ],
};
