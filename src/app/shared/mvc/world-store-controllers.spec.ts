import {
  DepartmentOfLaborPolicy,
  Good,
  ProductionBuilding,
  Region,
} from '../game/enums';
import { World } from './models';
import { WorldStore } from './world-store';
import { StoreWorldController } from './world-store-controllers';

const sampleWorld = (): World => ({
  islands: [
    {
      id: 1,
      name: 'Crown Falls',
      region: Region.OldWorld,
      productionLines: [
        {
          id: 10,
          building: ProductionBuilding.Bakery,
          good: Good.Bread,
          numBuildings: 3,
        },
        {
          id: 11,
          building: ProductionBuilding.Bakery,
          good: Good.Bread,
          numBuildings: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Farm Island',
      region: Region.OldWorld,
      productionLines: [],
    },
  ],
  tradeRoutes: [
    { id: 100, sourceIslandId: 2, targetIslandId: 1, good: Good.Grain },
  ],
});

const setup = () => {
  const store = WorldStore.fromWorld(sampleWorld());
  return { store, world: new StoreWorldController(store) };
};

describe('StoreWorldController identity', () => {
  it('returns the same island controller for the same id across reads', () => {
    const { world } = setup();
    expect(world.islands[0]).toBe(world.islands[0]);
    expect(world.islands.map((i) => i.id)).toEqual([1, 2]);
  });

  it('returns the same production line controller across reads', () => {
    const { world } = setup();
    const first = world.islands[0].productionLines;
    const second = world.islands[0].productionLines;
    expect(first.length).toBe(2);
    expect(second[0]).toBe(first[0]);
    expect(second[1]).toBe(first[1]);
  });

  it('keeps existing controllers when another island is removed', () => {
    const { world } = setup();
    const island = world.islands[0];
    world.removeIsland(2);
    expect(world.islands).toEqual([island]);
    expect(world.islands[0]).toBe(island);
  });

  it('returns the same trade route controller across reads', () => {
    const { world } = setup();
    expect(world.tradeRoutes[0]).toBe(world.tradeRoutes[0]);
  });

  it('controller ids come from the id passed in, not a store lookup', () => {
    const { world, store } = setup();
    const lineCtrl = world.islands[0].productionLines[0];
    store.removeProductionLine(10);
    expect(lineCtrl.id).toBe(10);
  });
});

describe('StoreWorldController writes', () => {
  it('writes through setters into the store', () => {
    const { world, store } = setup();
    const island = world.islands[0];
    island.name = 'Renamed';
    island.dolPolicy = DepartmentOfLaborPolicy.SkilledLaborAct;
    island.productionLines[0].numBuildings = 7;
    world.palacePrestigeLevel = 4;
    expect(store.islands().get(1)?.name).toBe('Renamed');
    expect(store.islands().get(1)?.dolPolicy).toBe(
      DepartmentOfLaborPolicy.SkilledLaborAct,
    );
    expect(store.productionLines().get(10)?.numBuildings).toBe(7);
    expect(store.palacePrestigeLevel()).toBe(4);
    expect(store.tradeUnionBonus()).toBeCloseTo(0.18);
  });

  it('truncates non-integer numBuildings with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { world, store } = setup();
    world.islands[0].productionLines[0].numBuildings = 2.9;
    expect(store.productionLines().get(10)?.numBuildings).toBe(2);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('turning off the trade union through a controller clears items', () => {
    const { world, store } = setup();
    const pl = world.islands[0].productionLines[0];
    pl.hasTradeUnion = true;
    pl.items = [];
    pl.hasTradeUnion = false;
    expect(store.productionLines().get(10)?.items).toEqual([]);
  });

  it('sees writes made directly to the store through cached controllers', () => {
    const { world, store } = setup();
    const island = world.islands[0];
    store.updateIsland(1, { name: 'Direct write' });
    expect(island.name).toBe('Direct write');
    store.updateProductionLine(10, { numBuildings: 9 });
    expect(island.productionLines[0].numBuildings).toBe(9);
  });

  it('addIsland / addProductionLine return cached, readable controllers', () => {
    const { world } = setup();
    const island = world.addIsland();
    expect(world.islands).toContain(island);
    const pl = island.addProductionLine();
    expect(island.productionLines[0]).toBe(pl);
  });

  it('removeProductionLineById drops the line', () => {
    const { world, store } = setup();
    world.islands[0].removeProductionLineById(10);
    expect([...store.productionLines().keys()]).toEqual([11]);
    expect(world.islands[0].productionLines.map((p) => p.id)).toEqual([11]);
  });

  it('removeIsland removes lines but leaves trade routes', () => {
    const { world, store } = setup();
    world.removeIsland(1);
    expect(store.productionLines().size).toBe(0);
    expect(world.tradeRoutes.length).toBe(1);
  });

  it('trade route setters write through, and removal works', () => {
    const { world, store } = setup();
    const route = world.tradeRoutes[0];
    route.good = Good.Hops;
    route.sourceIslandId = 1;
    expect(store.tradeRoutes().get(100)?.good).toBe(Good.Hops);
    expect(store.tradeRoutes().get(100)?.sourceIslandId).toBe(1);
    const added = world.addTradeRoute();
    expect(world.tradeRoutes).toContain(added);
    world.removeTradeRoute(100);
    expect(world.tradeRoutes).toEqual([added]);
  });
});
