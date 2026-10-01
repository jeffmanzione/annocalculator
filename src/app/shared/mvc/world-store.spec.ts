import {
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../game/enums';
import { World } from './models';
import { arrayEqualsAsSet, WorldStore } from './world-store';

const line = (overrides: object = {}) => ({
  building: ProductionBuilding.Bakery,
  good: Good.Bread,
  numBuildings: 3,
  ...overrides,
});

const sampleWorld = (): World => ({
  tradeUnionBonus: 5,
  islands: [
    {
      id: 1,
      name: 'Crown Falls',
      region: Region.OldWorld,
      dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
      productionLines: [line({ id: 10, hasTradeUnion: true })],
    },
    {
      id: 2,
      name: 'Farm Island',
      region: Region.OldWorld,
      productionLines: [line({ id: 20 }), line({ id: 21 })],
    },
  ],
  tradeRoutes: [
    { id: 100, sourceIslandId: 2, targetIslandId: 1, good: Good.Grain },
  ],
});

describe('arrayEqualsAsSet', () => {
  it('ignores order and compares by content', () => {
    expect(arrayEqualsAsSet([1, 2], [2, 1])).toBe(true);
    expect(arrayEqualsAsSet([1, 2], [1, 3])).toBe(false);
  });

  it('treats undefined and non-arrays as empty', () => {
    expect(arrayEqualsAsSet(undefined, [])).toBe(true);
    expect(arrayEqualsAsSet(false as unknown as number[], [])).toBe(true);
    expect(arrayEqualsAsSet(undefined, [1])).toBe(false);
  });
});

describe('WorldStore load/save', () => {
  it('round-trips a world with explicit non-default values', () => {
    const world = sampleWorld();
    expect(WorldStore.fromWorld(structuredClone(world)).toWorld()).toEqual(
      world,
    );
  });

  it('round-trips an empty world', () => {
    const world: World = { islands: [], tradeRoutes: [] };
    expect(WorldStore.fromWorld(world).toWorld()).toEqual(world);
  });

  it('assigns ids to legacy data that has none', () => {
    const world = sampleWorld();
    delete world.islands[0].id;
    delete world.islands[0].productionLines[0].id;
    const saved = WorldStore.fromWorld(world).toWorld();
    expect(saved.islands[0].id).toBeGreaterThanOrEqual(0);
    expect(saved.islands[0].productionLines[0].id).toBeGreaterThanOrEqual(0);
  });

  it('regenerates negative "unassigned" ids', () => {
    const world = sampleWorld();
    world.islands[0].id = -1;
    world.islands[0].productionLines[0].id = -1;
    world.tradeRoutes[0].id = -1;
    const saved = WorldStore.fromWorld(world).toWorld();
    expect(saved.islands[0].id).toBeGreaterThanOrEqual(0);
    expect(saved.islands[0].productionLines[0].id).toBeGreaterThanOrEqual(0);
    expect(saved.tradeRoutes[0].id).toBeGreaterThanOrEqual(0);
  });

  it('keeps production lines under their own islands', () => {
    const saved = WorldStore.fromWorld(sampleWorld()).toWorld();
    expect(
      saved.islands.map((i) => i.productionLines.map((p) => p.id)),
    ).toEqual([[10], [20, 21]]);
  });

  it('never writes islandId into saved JSON', () => {
    for (const island of WorldStore.fromWorld(sampleWorld()).toWorld()
      .islands) {
      for (const pl of island.productionLines) {
        expect('islandId' in pl).toBe(false);
      }
    }
  });

  it('strips defaults on save, comparing arrays by content', () => {
    const world: World = {
      tradeUnionBonus: 0,
      islands: [
        {
          id: 1,
          name: 'Island',
          dolPolicy: DepartmentOfLaborPolicy.None,
          productionLines: [
            line({
              id: 10,
              boosts: [],
              items: [],
              culturalSets: [],
              hasTradeUnion: false,
              inRangeOfLocalDepartment: false,
              inRangeOfHaciendaFertiliserWorks: false,
            }),
          ],
        },
      ],
      tradeRoutes: [],
    };
    const saved = WorldStore.fromWorld(world).toWorld();
    expect('tradeUnionBonus' in saved).toBe(false);
    expect('dolPolicy' in saved.islands[0]).toBe(false);
    expect(saved.islands[0].productionLines[0]).toEqual({
      id: 10,
      building: ProductionBuilding.Bakery,
      good: Good.Bread,
      numBuildings: 3,
    });
  });

  it('strips fields set to non-array "cleared" values', () => {
    const world = sampleWorld();
    world.islands[0].productionLines[0] = line({
      id: 10,
      items: false,
    }) as never;
    const saved = WorldStore.fromWorld(world).toWorld();
    expect('items' in saved.islands[0].productionLines[0]).toBe(false);
  });

  it('keeps non-default values', () => {
    const saved = WorldStore.fromWorld(sampleWorld()).toWorld();
    expect(saved.tradeUnionBonus).toBe(5);
    expect(saved.islands[0].dolPolicy).toBe(
      DepartmentOfLaborPolicy.SkilledLaborAct,
    );
    expect(saved.islands[0].productionLines[0].hasTradeUnion).toBe(true);
  });
});

describe('WorldStore mutations', () => {
  it('removeIsland removes its production lines but not trade routes', () => {
    const store = WorldStore.fromWorld(sampleWorld());
    store.removeIsland(2);
    expect([...store.islands().keys()]).toEqual([1]);
    expect([...store.productionLines().keys()]).toEqual([10]);
    expect([...store.tradeRoutes().keys()]).toEqual([100]);
  });

  it('addIsland / addProductionLine create linked entities', () => {
    const store = WorldStore.fromWorld(sampleWorld());
    const islandId = store.addIsland();
    const lineId = store.addProductionLine(islandId);
    expect(store.islands().get(islandId)?.name).toBe('UNNAMED_ISLAND');
    expect(store.productionLines().get(lineId)?.islandId).toBe(islandId);
  });

  it('updates replace the Map so signal consumers see a change', () => {
    const store = WorldStore.fromWorld(sampleWorld());
    const before = store.islands();
    store.updateIsland(1, { name: 'Renamed' });
    expect(store.islands()).not.toBe(before);
    expect(store.islands().get(1)?.name).toBe('Renamed');
  });

  it('ignores updates to unknown ids', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = WorldStore.fromWorld(sampleWorld());
    const before = store.productionLines();
    store.updateProductionLine(999, { numBuildings: 1 });
    expect(store.productionLines()).toBe(before);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('setting hasTradeUnion = false clears items', () => {
    const world = sampleWorld();
    world.islands[0].productionLines[0] = line({
      id: 10,
      building: ProductionBuilding.CabAssemblyLine,
      hasTradeUnion: true,
      items: [Item.MariaMaravilla],
    }) as never;
    const store = WorldStore.fromWorld(world);
    store.updateProductionLine(10, { hasTradeUnion: false });
    expect(store.productionLines().get(10)?.items).toEqual([]);
  });

  describe('derived goods', () => {
    const storeWithCabLine = () => {
      const world = sampleWorld();
      world.islands[0].productionLines[0] = line({
        id: 10,
        building: ProductionBuilding.CabAssemblyLine,
        hasTradeUnion: true,
      }) as never;
      return WorldStore.fromWorld(world);
    };

    it('derives good and inputGoods from the building', () => {
      const store = storeWithCabLine();
      store.updateProductionLine(10, {
        building: ProductionBuilding.CabAssemblyLine,
      });
      const pl = store.productionLines().get(10)!;
      expect(pl.good).toBe(Good.SteamCarriages);
      expect(pl.inputGoods).toEqual([Good.SteamMotors, Good.Chassis]);
    });

    it('uses Unknown / no inputs for an unknown building', () => {
      const store = storeWithCabLine();
      store.updateProductionLine(10, { building: ProductionBuilding.Unknown });
      const pl = store.productionLines().get(10)!;
      expect(pl.good).toBe(Good.Unknown);
      expect(pl.inputGoods).toEqual([]);
    });

    it('applies an item that replaces an input good', () => {
      const store = storeWithCabLine();
      store.updateProductionLine(10, { items: [Item.MariaMaravilla] });
      expect(store.productionLines().get(10)!.inputGoods).toEqual([
        Good.Motor,
        Good.Chassis,
      ]);
      store.updateProductionLine(10, {
        items: [Item.SusannahtheSteamEngineer],
      });
      expect(store.productionLines().get(10)!.inputGoods).toEqual([
        Good.Filaments,
        Good.Chassis,
      ]);
    });

    it("prefers Susannah's Filaments over Maria's Motors, in either order", () => {
      for (const items of [
        [Item.SusannahtheSteamEngineer, Item.MariaMaravilla],
        [Item.MariaMaravilla, Item.SusannahtheSteamEngineer],
      ]) {
        const store = storeWithCabLine();
        store.updateProductionLine(10, { items });
        expect(store.productionLines().get(10)!.inputGoods).toEqual([
          Good.Filaments,
          Good.Chassis,
        ]);
      }
    });

    it('does not re-derive when the patch touches neither building nor items', () => {
      const store = storeWithCabLine();
      store.updateProductionLine(10, { inputGoods: [Good.Wool] });
      store.updateProductionLine(10, { numBuildings: 9 });
      expect(store.productionLines().get(10)!.inputGoods).toEqual([Good.Wool]);
    });
  });

  it('setTradeUnionBonus updates the signal', () => {
    const store = WorldStore.fromWorld(sampleWorld());
    store.setTradeUnionBonus(12);
    expect(store.toWorld().tradeUnionBonus).toBe(12);
  });
});
