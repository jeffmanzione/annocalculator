import {
  ALBION,
  InvalidSaveError,
  LATIUM,
  saveOf,
  World117,
  worldFromSave,
} from './models';
import {
  counterpart,
  factoriesForSession,
  MAX_TECH_LEVEL,
  regionOfSession,
  WorldStore117,
} from './world-store-117';
import { anno117Data, factoriesById } from '../game/data';

// Ids: 3174 Bakery (Roman) and 5960 Bakery (Celtic); 2693 Wheat Farm (Roman), which can have an aqueduct;
// 2793 Pig Farm (Roman), which can have a silo; item 160057 is for the Celtic Narcissium (5615) only.
const BAKERY_ROMAN = 3174;
const BAKERY_CELTIC = 5960;
const WHEAT_FARM = 2693;
const PIG_FARM = 2793;
const NARCISSIUM = 5615;

const sample = (): World117 => ({
  techs: [38708],
  islands: [
    {
      id: 1,
      name: 'Roma',
      session: LATIUM,
      productionLines: [
        { id: 10, building: BAKERY_ROMAN, numBuildings: 3 },
        { id: 11, building: WHEAT_FARM, numBuildings: 2, aqueduct: true },
      ],
    },
    { id: 2, name: 'Isle', session: ALBION, productionLines: [] },
  ],
  tradeRoutes: [{ id: 5, sourceIslandId: 2, targetIslandId: 1, good: '2069' }],
});

describe('provinces', () => {
  it('know their region and the buildings they offer', () => {
    expect(regionOfSession(LATIUM)).toBe('Roman');
    expect(regionOfSession(ALBION)).toBe('Celtic');
    expect(factoriesForSession(LATIUM).some((f) => f.id === BAKERY_ROMAN)).toBe(
      true,
    );
    expect(
      factoriesForSession(LATIUM).some((f) => f.id === BAKERY_CELTIC),
    ).toBe(false);
  });

  it('pair buildings that make the same good', () => {
    expect(counterpart(factoriesById.get(BAKERY_ROMAN)!, ALBION)?.id).toBe(
      BAKERY_CELTIC,
    );
    expect(counterpart(factoriesById.get(BAKERY_CELTIC)!, ALBION)?.id).toBe(
      BAKERY_CELTIC,
    );
  });
});

describe('WorldStore117', () => {
  it('saves a world exactly as it loaded it, key order included', () => {
    const world = sample();
    const saved = WorldStore117.fromWorld(structuredClone(world)).toWorld();
    expect(JSON.stringify(saved)).toBe(JSON.stringify(world));
  });

  it('gives islands, lines and routes without ids new ones', () => {
    const world = sample();
    delete world.islands[0].id;
    delete world.islands[0].productionLines[0].id;
    const store = WorldStore117.fromWorld(world);
    expect([...store.islands().keys()].every((id) => id >= 0)).toBe(true);
    expect(store.productionLines().size).toBe(2);
  });

  it('leaves out what is a default when saving', () => {
    const world = sample();
    world.techs = [];
    world.islands[0].productionLines[0] = {
      id: 10,
      building: BAKERY_ROMAN,
      numBuildings: 3,
      items: [],
      boostedItems: [],
      aqueduct: false,
      silo: false,
    };
    world.islands[0].missingFertilities = [];
    world.islands[0].effects = [];
    world.islands[0].devotion = 5000; // means nothing without a patron
    const saved = WorldStore117.fromWorld(world).toWorld();
    expect('techs' in saved).toBe(false);
    expect(saved.islands[0].productionLines[0]).toEqual({
      id: 10,
      building: BAKERY_ROMAN,
      numBuildings: 3,
    });
    expect(Object.keys(saved.islands[0])).toEqual([
      'id',
      'name',
      'session',
      'productionLines',
    ]);
  });

  it('keeps a patron and its devotion', () => {
    const world = sample();
    world.islands[0].patron = 80562;
    world.islands[0].devotion = 100;
    const saved = WorldStore117.fromWorld(world).toWorld();
    expect(saved.islands[0]).toMatchObject({ patron: 80562, devotion: 100 });
  });

  it('adds an island in Latium and a line with a building that province offers', () => {
    const store = WorldStore117.fromWorld({ islands: [], tradeRoutes: [] });
    const island = store.addIsland();
    expect(store.islands().get(island)).toMatchObject({
      name: 'New Island',
      session: LATIUM,
    });
    const line = store.addProductionLine(island);
    const building = factoriesById.get(
      store.productionLines().get(line)!.building,
    )!;
    expect(building.regions).toContain('Roman');
    expect(store.productionLines().get(line)!.numBuildings).toBe(1);
  });

  it("drops items and modules a line's new building cannot have", () => {
    const store = WorldStore117.fromWorld({
      islands: [
        {
          id: 1,
          name: 'Isle',
          session: ALBION,
          productionLines: [
            {
              id: 10,
              building: NARCISSIUM,
              numBuildings: 1,
              items: [160057],
              boostedItems: [160057],
              aqueduct: true,
              silo: true,
            },
          ],
        },
      ],
      tradeRoutes: [],
    });
    store.updateProductionLine(10, { building: BAKERY_CELTIC });
    expect(store.productionLines().get(10)).toMatchObject({
      building: BAKERY_CELTIC,
      items: [],
      boostedItems: [],
      aqueduct: false,
      silo: false,
    });
  });

  it('keeps what the new building can have', () => {
    const store = WorldStore117.fromWorld({
      islands: [
        {
          id: 1,
          name: 'Isle',
          session: LATIUM,
          productionLines: [
            { id: 10, building: PIG_FARM, numBuildings: 1, silo: true },
          ],
        },
      ],
      tradeRoutes: [],
    });
    store.updateProductionLine(10, { numBuildings: 4 });
    expect(store.productionLines().get(10)!.silo).toBe(true);
  });

  it("swaps an island's buildings for the other province's when it moves", () => {
    const store = WorldStore117.fromWorld(sample());
    store.updateIsland(1, { session: ALBION });
    expect(store.productionLines().get(10)!.building).toBe(BAKERY_CELTIC);
    // The Roman wheat farm has a Celtic counterpart too.
    expect(
      factoriesById.get(store.productionLines().get(11)!.building)!.regions,
    ).toContain('Celtic');
  });

  it('keeps a level for a repeatable discovery and none for the others', () => {
    const repeatable = anno117Data.techs.find((t) => t.repeatable)!.id;
    const store = WorldStore117.fromWorld({ islands: [], tradeRoutes: [] });
    store.setTechLevel(repeatable, 3);
    store.setTech(38708, true);
    store.setTech(38708, true);
    expect(store.techs()).toEqual(
      [38708, repeatable, repeatable, repeatable].sort((a, b) => a - b),
    );
    expect(store.oneTimeTechs()).toEqual([38708]);
    // Choosing the one-time discoveries again leaves the level alone.
    store.setOneTimeTechs([]);
    expect(store.techs()).toEqual([repeatable, repeatable, repeatable]);
    store.setTechLevel(repeatable, 0);
    expect(store.techs()).toEqual([]);
    store.setTechLevel(repeatable, 1000);
    expect(store.techs().length).toBe(MAX_TECH_LEVEL);
  });

  it('researches and un-researches techs once each', () => {
    const store = WorldStore117.fromWorld({ islands: [], tradeRoutes: [] });
    store.setTech(38708, true);
    store.setTech(38708, true);
    expect(store.techs()).toEqual([38708]);
    store.setTech(38708, false);
    expect(store.techs()).toEqual([]);
  });
});

describe('saved Anno 117 worlds', () => {
  it('are labelled with their game and format', () => {
    expect(saveOf(sample())).toEqual({
      game: 'anno117',
      version: 1,
      world: sample(),
    });
  });

  it('are read back', () => {
    expect(worldFromSave(JSON.parse(JSON.stringify(saveOf(sample()))))).toEqual(
      sample(),
    );
  });

  it('are refused when they are from the other game, newer, or incomplete', () => {
    const anno1800 = { islands: [], tradeRoutes: [] };
    expect(() => worldFromSave(anno1800)).toThrow(/Anno 1800/);
    expect(() => worldFromSave(null)).toThrow(InvalidSaveError);
    expect(() => worldFromSave('text')).toThrow(InvalidSaveError);
    expect(() =>
      worldFromSave({ game: 'anno117', version: 2, world: sample() }),
    ).toThrow(/newer/);
    expect(() => worldFromSave({ game: 'anno117', version: 1 })).toThrow(
      /incomplete/,
    );
    expect(() =>
      worldFromSave({
        game: 'anno117',
        version: 1,
        world: { islands: [{ name: 1 }], tradeRoutes: [] },
      }),
    ).toThrow(/island/);
  });
});
