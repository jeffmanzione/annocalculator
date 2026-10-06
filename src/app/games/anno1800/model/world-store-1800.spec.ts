import {
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../game/enums';
import { World1800 } from './models';
import {
  arrayEqualsAsSet,
  resolveInputGoods,
  WorldStore1800,
} from './world-store-1800';

const line = (overrides: object = {}) => ({
  building: ProductionBuilding.Bakery,
  good: Good.Bread,
  numBuildings: 3,
  ...overrides,
});

const sampleWorld = (): World1800 => ({
  palacePrestigeLevel: 5,
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
    expect(WorldStore1800.fromWorld(structuredClone(world)).toWorld()).toEqual(
      world,
    );
  });

  it('round-trips an empty world', () => {
    const world: World1800 = { islands: [], tradeRoutes: [] };
    expect(WorldStore1800.fromWorld(world).toWorld()).toEqual(world);
  });

  it('assigns ids to legacy data that has none', () => {
    const world = sampleWorld();
    delete world.islands[0].id;
    delete world.islands[0].productionLines[0].id;
    const saved = WorldStore1800.fromWorld(world).toWorld();
    expect(saved.islands[0].id).toBeGreaterThanOrEqual(0);
    expect(saved.islands[0].productionLines[0].id).toBeGreaterThanOrEqual(0);
  });

  it('regenerates negative "unassigned" ids', () => {
    const world = sampleWorld();
    world.islands[0].id = -1;
    world.islands[0].productionLines[0].id = -1;
    world.tradeRoutes[0].id = -1;
    const saved = WorldStore1800.fromWorld(world).toWorld();
    expect(saved.islands[0].id).toBeGreaterThanOrEqual(0);
    expect(saved.islands[0].productionLines[0].id).toBeGreaterThanOrEqual(0);
    expect(saved.tradeRoutes[0].id).toBeGreaterThanOrEqual(0);
  });

  it('keeps production lines under their own islands', () => {
    const saved = WorldStore1800.fromWorld(sampleWorld()).toWorld();
    expect(
      saved.islands.map((i) => i.productionLines.map((p) => p.id)),
    ).toEqual([[10], [20, 21]]);
  });

  it('never writes islandId into saved JSON', () => {
    for (const island of WorldStore1800.fromWorld(sampleWorld()).toWorld()
      .islands) {
      for (const pl of island.productionLines) {
        expect('islandId' in pl).toBe(false);
      }
    }
  });

  it('strips defaults on save, comparing arrays by content', () => {
    const world: World1800 = {
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
    const saved = WorldStore1800.fromWorld(world).toWorld();
    expect('palacePrestigeLevel' in saved).toBe(false);
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
    const saved = WorldStore1800.fromWorld(world).toWorld();
    expect('items' in saved.islands[0].productionLines[0]).toBe(false);
  });

  it('keeps non-default values', () => {
    const saved = WorldStore1800.fromWorld(sampleWorld()).toWorld();
    expect(saved.palacePrestigeLevel).toBe(5);
    expect(saved.islands[0].dolPolicy).toBe(
      DepartmentOfLaborPolicy.SkilledLaborAct,
    );
    expect(saved.islands[0].productionLines[0].hasTradeUnion).toBe(true);
  });
});

describe('WorldStore mutations', () => {
  it('removeIsland removes its production lines but not trade routes', () => {
    const store = WorldStore1800.fromWorld(sampleWorld());
    store.removeIsland(2);
    expect([...store.islands().keys()]).toEqual([1]);
    expect([...store.productionLines().keys()]).toEqual([10]);
    expect([...store.tradeRoutes().keys()]).toEqual([100]);
  });

  it('addIsland / addProductionLine create linked entities', () => {
    const store = WorldStore1800.fromWorld(sampleWorld());
    const islandId = store.addIsland();
    const lineId = store.addProductionLine(islandId);
    expect(store.islands().get(islandId)?.name).toBe('UNNAMED_ISLAND');
    expect(store.productionLines().get(lineId)?.islandId).toBe(islandId);
  });

  it('updates replace the Map so signal consumers see a change', () => {
    const store = WorldStore1800.fromWorld(sampleWorld());
    const before = store.islands();
    store.updateIsland(1, { name: 'Renamed' });
    expect(store.islands()).not.toBe(before);
    expect(store.islands().get(1)?.name).toBe('Renamed');
  });

  it('ignores updates to unknown ids', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = WorldStore1800.fromWorld(sampleWorld());
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
    const store = WorldStore1800.fromWorld(world);
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
      return WorldStore1800.fromWorld(world);
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

  it('setPalacePrestigeLevel updates the level and the bonus it gives', () => {
    const store = WorldStore1800.fromWorld(sampleWorld());
    store.setPalacePrestigeLevel(12);
    expect(store.toWorld().palacePrestigeLevel).toBe(12);
    expect(store.tradeUnionBonus()).toBeCloseTo(0.34);
    store.setPalacePrestigeLevel(null);
    expect('palacePrestigeLevel' in store.toWorld()).toBe(false);
    expect(store.tradeUnionBonus()).toBe(0);
  });

  describe('worlds saved with the old Trade Union bonus', () => {
    const load = (tradeUnionBonus?: number) => {
      const world = { ...sampleWorld(), tradeUnionBonus } as World1800;
      delete world.palacePrestigeLevel;
      return WorldStore1800.fromWorld(world);
    };

    it('converts the bonus to the nearest prestige level', () => {
      expect(load(0.3).palacePrestigeLevel()).toBe(10);
      expect(load(0.3).tradeUnionBonus()).toBeCloseTo(0.3);
      expect(load(0.1).palacePrestigeLevel()).toBe(0);
      expect(load(0.6).palacePrestigeLevel()).toBe(25);
      expect(load(0.25).palacePrestigeLevel()).toBe(8); // 7.5 rounds up
      expect(load(0.07).palacePrestigeLevel()).toBe(0);
      expect(load(2).palacePrestigeLevel()).toBe(25);
    });

    it('treats no bonus as no Palace', () => {
      expect(load(0).palacePrestigeLevel()).toBeNull();
      expect(load(undefined).palacePrestigeLevel()).toBeNull();
      expect(load(0).tradeUnionBonus()).toBe(0);
    });

    it('saves the level and drops the old bonus', () => {
      const saved = load(0.3).toWorld();
      expect(saved.palacePrestigeLevel).toBe(10);
      expect('tradeUnionBonus' in saved).toBe(false);
    });

    it('prefers the level when a world has both', () => {
      const store = WorldStore1800.fromWorld({
        ...sampleWorld(),
        palacePrestigeLevel: 3,
        tradeUnionBonus: 0.6,
      });
      expect(store.palacePrestigeLevel()).toBe(3);
    });
  });
});

describe('resolveInputGoods', () => {
  it("is the building's normal inputs, none substituted, without items", () => {
    expect(resolveInputGoods(ProductionBuilding.CabAssemblyLine, [])).toEqual([
      { good: Good.SteamMotors },
      { good: Good.Chassis },
    ]);
    expect(
      resolveInputGoods(ProductionBuilding.CabAssemblyLine, undefined),
    ).toHaveLength(2);
  });

  it('records which item replaced which good', () => {
    expect(
      resolveInputGoods(ProductionBuilding.CabAssemblyLine, [
        Item.MariaMaravilla,
      ]),
    ).toEqual([
      {
        good: Good.Motor,
        replaces: Good.SteamMotors,
        item: Item.MariaMaravilla,
      },
      { good: Good.Chassis },
    ]);
  });

  it('can replace a different good with a different item', () => {
    expect(resolveInputGoods(ProductionBuilding.Bakery, [Item.Baker])).toEqual([
      { good: Good.Grain, replaces: Good.Flour, item: Item.Baker },
    ]);
  });

  it("credits Susannah, whose Filaments win over Maria's Motors, in either order", () => {
    for (const items of [
      [Item.SusannahtheSteamEngineer, Item.MariaMaravilla],
      [Item.MariaMaravilla, Item.SusannahtheSteamEngineer],
    ]) {
      expect(
        resolveInputGoods(ProductionBuilding.CabAssemblyLine, items)[0],
      ).toEqual({
        good: Good.Filaments,
        replaces: Good.SteamMotors,
        item: Item.SusannahtheSteamEngineer,
      });
    }
  });

  it('is empty for a building that does not exist', () => {
    expect(resolveInputGoods(ProductionBuilding.Unknown, [Item.Baker])).toEqual(
      [],
    );
  });

  it('always agrees with the stored inputGoods after an edit', () => {
    const store = WorldStore1800.fromWorld({
      islands: [
        {
          id: 1,
          name: 'I',
          productionLines: [
            {
              id: 10,
              building: ProductionBuilding.CabAssemblyLine,
              good: Good.SteamCarriages,
              numBuildings: 1,
            },
          ],
        },
      ],
      tradeRoutes: [],
    });
    for (const items of [
      [],
      [Item.MariaMaravilla],
      [Item.SusannahtheSteamEngineer, Item.MariaMaravilla],
    ]) {
      store.updateProductionLine(10, { hasTradeUnion: true, items });
      const line = store.productionLines().get(10)!;
      expect(line.inputGoods).toEqual(
        resolveInputGoods(line.building, line.items).map((s) => s.good),
      );
    }
  });
});
