import { computeGoodSummaryRows } from '../../../pages/calculator/summary-panel/summary-panel-store';
import { anno117Game } from '../anno117-game';
import { defaultWorld117 } from './default-world';
import { ALBION, LATIUM, World117 } from './models';
import { World117Controller } from './world-controllers';
import { WorldStore117 } from './world-store-117';

// Ids: 2693 Wheat Farm, 3075 Grain Mill, 3174 Bakery, 2880 Charcoal Burner; products 2069 Wheat, 2085 Coal,
// 2119 Flour, 2137 Bread. Rates are worked out by hand in the comments.
const WHEAT = '2069';
const COAL = '2085';
const FLOUR = '2119';
const BREAD = '2137';

const open = (world: World117) => {
  const store = WorldStore117.fromWorld(structuredClone(world));
  return { store, controller: new World117Controller(store) };
};
const line = (world: World117Controller, island: number, index: number) =>
  world.islands[island].productionLines[index];

describe('Line117Controller', () => {
  it('works out a plain building: 1 wheat per minute per farm, 1.5 with an aqueduct', () => {
    const { controller } = open(defaultWorld117);
    const farms = line(controller, 0, 0);
    expect(farms.efficiency).toBeCloseTo(1.5);
    expect(farms.processTimeSeconds).toBeCloseTo(40);
    expect(farms.good).toBe(WHEAT);
    expect(farms.inputGoods).toEqual([]);
    // 4 farms x 60 / 60 s x 1.5
    expect(farms.goodsProducedPerMinute).toBeCloseTo(6);
    farms.aqueduct = false;
    expect(farms.goodsProducedPerMinute).toBeCloseTo(4);
  });

  it('shows what a recipe consumes, and what fuel costs', () => {
    const { controller } = open(defaultWorld117);
    const mills = line(controller, 1, 0);
    const bakeries = line(controller, 1, 1);
    expect(mills.inputGoods).toEqual([WHEAT]);
    expect(mills.goodsConsumedPerMinute).toBeCloseTo(6); // 2 mills x 60 / 20 s
    expect(mills.goodsProducedPerMinute).toBeCloseTo(6);
    expect(bakeries.good).toBe(BREAD);
    expect(bakeries.goodsProducedPerMinute).toBeCloseTo(6); // 6 x 60 / 60 s
    // 6 bakeries x one coal per 120 s
    expect(bakeries.extraConsumption).toEqual([
      { good: COAL, perMinute: expect.closeTo(3) },
    ]);
    expect(bakeries.extraGoods).toEqual([]);
  });

  it('adds a silo: double speed, an extra animal every third cycle, and feed', () => {
    const world: World117 = {
      islands: [
        {
          id: 1,
          name: 'Farm',
          session: LATIUM,
          productionLines: [
            { id: 10, building: 2793, numBuildings: 3, silo: true },
          ],
        },
      ],
      tradeRoutes: [],
    };
    const pigs = line(open(world).controller, 0, 0);
    // Pig Farm: 30 s cycle, silo +100% -> 4 cycles/min per building, 3 buildings
    expect(pigs.goodsProducedPerMinute).toBeCloseTo(12);
    expect(pigs.extraGoods[0].producedPerMinute).toBeCloseTo(4); // 12 x 1/3
    expect(pigs.extraConsumption).toEqual([
      { good: WHEAT, perMinute: expect.closeTo(0.6) },
    ]); // 3 x 60 / 300 s
  });

  it('ignores an aqueduct or silo the building cannot have, and clamps the count', () => {
    const { controller } = open(defaultWorld117);
    const bakeries = line(controller, 1, 1);
    bakeries.aqueduct = true;
    bakeries.silo = true;
    expect(bakeries.aqueduct).toBe(false);
    expect(bakeries.silo).toBe(false);
    bakeries.numBuildings = -3;
    expect(bakeries.numBuildings).toBe(0);
    bakeries.numBuildings = 2.7;
    expect(bakeries.numBuildings).toBe(2);
  });

  it('follows the fertility of the island and the techs researched', () => {
    const world: World117 = {
      islands: [
        {
          id: 1,
          name: 'Coast',
          session: LATIUM,
          missingFertilities: [2206],
          productionLines: [{ id: 10, building: 2956, numBuildings: 2 }],
        },
      ],
      tradeRoutes: [],
    };
    const { controller } = open(world);
    const hut = line(controller, 0, 0);
    expect(hut.efficiency).toBeLessThan(0.001);
    controller.setTech(37858, true); // Mackerel Hauling: half the fertility
    expect(hut.efficiency).toBeCloseTo(0.5);
    expect(hut.goodsProducedPerMinute).toBeCloseTo(1); // 2 x 1 x 0.5
  });

  it('drops items when its building changes', () => {
    const world: World117 = {
      islands: [
        {
          id: 1,
          name: 'Isle',
          session: ALBION,
          productionLines: [
            { id: 10, building: 5615, numBuildings: 1, items: [160057] },
          ],
        },
      ],
      tradeRoutes: [],
    };
    const { controller } = open(world);
    const l = line(controller, 0, 0);
    expect(l.efficiency).toBeCloseTo(1.3);
    l.building = 5960;
    expect(l.items).toEqual([]);
    expect(l.efficiency).toBe(1);
  });
});

describe('Island117Controller', () => {
  it('lists what the island makes, for trade routes', () => {
    const { controller } = open(defaultWorld117);
    expect([...controller.islands[1].producedGoods].sort()).toEqual(
      [BREAD, COAL, FLOUR].sort(),
    );
    expect(controller.islands[0].producedGoods).toEqual([WHEAT]);
  });

  it('adds and removes lines, keeping each line controller stable', () => {
    const { controller } = open(defaultWorld117);
    const island = controller.islands[1];
    const first = island.productionLines[0];
    const id = island.addProductionLine().id;
    expect(island.productionLines.length).toBe(4);
    expect(island.productionLines[0]).toBe(first);
    island.removeProductionLine(id);
    expect(island.productionLines.length).toBe(3);
  });

  it('edits name, patron and devotion', () => {
    const { controller, store } = open(defaultWorld117);
    const island = controller.islands[0];
    island.name = 'Ostia Antica';
    island.patron = 80562;
    island.devotion = 100.9;
    expect(store.toWorld().islands[0]).toMatchObject({
      name: 'Ostia Antica',
      patron: 80562,
      devotion: 100,
    });
    island.patron = null;
    expect('patron' in store.toWorld().islands[0]).toBe(false);
  });
});

describe('the default world', () => {
  const rows = () => {
    const { controller } = open(defaultWorld117);
    const asSummary = {
      islands: controller.islands.map((island) => ({
        id: island.id,
        name: island.name,
        productionLines: island.productionLines,
      })),
      tradeRoutes: controller.tradeRoutes,
    };
    return computeGoodSummaryRows(asSummary, anno117Game);
  };

  it('is balanced: every good it uses is made, with nothing running short', () => {
    for (const row of rows().values()) {
      if (row.islandSummaries.length === 0) continue;
      expect(row.hasIssue, row.good).toBe(false);
      expect(row.netProductionPerMin, row.good).toBeGreaterThanOrEqual(-1e-9);
    }
  });

  it('makes 6 bread a minute, with a little coal over and no wheat to spare', () => {
    const goods = rows();
    expect(goods.get(BREAD)!.totalProductionPerMin).toBeCloseTo(6);
    expect(goods.get(COAL)!.netProductionPerMin).toBeCloseTo(1); // 4 made, 3 burnt
    expect(goods.get(WHEAT)!.netProductionPerMin).toBeCloseTo(0); // 6 made, 6 milled
  });
});
