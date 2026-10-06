import { ALBION, LATIUM, World117 } from './models';

// The world a first-time visitor sees: a small, balanced bread chain across two Latium islands, and a
// separate Albion island making tunics. It shows an aqueduct, a trade route and the summary without
// anything running short.
//
//   Ostia: 4 Wheat Farms with an aqueduct -> 6 wheat/min, shipped to Roma
//   Roma:  2 Grain Mills (6 wheat/min -> 6 flour/min), 6 Bakeries (6 flour/min -> 6 bread/min, burning
//          3 coal/min), 2 Charcoal Burners (4 coal/min)
//   Dun Eidyn (Albion): 2 Hemp Farms with an aqueduct (3 hemp/min), 3 Spinners (3 tunics/min)
const WHEAT_FARM = 2693;
const GRAIN_MILL = 3075;
const BAKERY = 3174;
const CHARCOAL_BURNER = 2880;
const HEMP_FARM_CELTIC = 31762;
const SPINNER_CELTIC = 5958;
const WHEAT = '2069';

export const defaultWorld117: World117 = {
  islands: [
    {
      id: 1,
      name: 'Ostia',
      session: LATIUM,
      productionLines: [
        { id: 101, building: WHEAT_FARM, numBuildings: 4, aqueduct: true },
      ],
    },
    {
      id: 2,
      name: 'Roma',
      session: LATIUM,
      productionLines: [
        { id: 102, building: GRAIN_MILL, numBuildings: 2 },
        { id: 103, building: BAKERY, numBuildings: 6 },
        { id: 104, building: CHARCOAL_BURNER, numBuildings: 2 },
      ],
    },
    {
      id: 3,
      name: 'Dun Eidyn',
      session: ALBION,
      productionLines: [
        {
          id: 105,
          building: HEMP_FARM_CELTIC,
          numBuildings: 2,
          aqueduct: true,
        },
        { id: 106, building: SPINNER_CELTIC, numBuildings: 3 },
      ],
    },
  ],
  tradeRoutes: [{ id: 201, sourceIslandId: 1, targetIslandId: 2, good: WHEAT }],
};
