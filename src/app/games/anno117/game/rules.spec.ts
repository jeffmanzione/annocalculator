import {
  BuffContribution,
  buffContributions,
  extraOutputsPerCycle,
  fertilityFactor,
  fuelPerMinute,
  inputProducts,
  IslandSettings,
  LineSettings,
  moduleInputsPerMinute,
  patronScaling,
  productivity,
  WorldSettings,
} from './rules';
import { anno117Data, effectsById, factoriesById, itemsById } from './data';

// Hand-derived expectations from the game data (see data/NOTICE.md). Ids of the things used here:
//   2693 Wheat Farm (Roman): connected to an aqueduct it gets +50% productivity (buff 28480)
//   2793 Pig Farm (Roman), 30 s cycle: can have a silo (+100% productivity, one extra output per 3 cycles,
//        uses 1 wheat per 300 s)
//   3174 Bakery (Roman): burns coal; fuel lasts 120 s, and the Better Bellows tech (38708) makes it last 20% longer
//   2956 Scomber's Shack (Roman): needs the Mackerel fertility (2206); the Mackerel Hauling tech (37858)
//        provides half of it
//   5615 Narcissium (Celtic): the item 160057 gives +30% productivity and swaps its Silver input for Iron
//   80562 Mars, whose Armamentum effect (80565) gives Pig Farms +1% productivity per point of its milestone

const WHEAT_FARM = 2693;
const PIG_FARM = 2793;
const BAKERY = 3174;
const SCOMBER = 2956;
const NARCISSIUM = 5615;
const MARS = 80562;
const WHEAT = 2069;
const COAL = 2085;
const SILVER = 2129;
const IRON = 2115;

const line = (
  building: number,
  extra: Partial<LineSettings> = {},
): LineSettings => ({
  building,
  items: [],
  boostedItems: [],
  aqueduct: false,
  silo: false,
  ...extra,
});
const island = (extra: Partial<IslandSettings> = {}): IslandSettings => ({
  missingFertilities: [],
  patron: null,
  devotion: 0,
  effects: [],
  ...extra,
});
const world = (extra: Partial<WorldSettings> = {}): WorldSettings => ({
  techs: [],
  ...extra,
});
const contributions = (l: LineSettings, i = island(), w = world()) =>
  buffContributions(l, i, w);
const factory = (id: number) => factoriesById.get(id)!;

describe('productivity', () => {
  it('is 100% with nothing acting on a building', () => {
    expect(productivity(contributions(line(WHEAT_FARM)))).toBe(1);
  });

  it('adds the aqueduct bonus to the percentage', () => {
    expect(
      productivity(contributions(line(WHEAT_FARM, { aqueduct: true }))),
    ).toBeCloseTo(1.5);
  });

  it('adds the base bonuses to 100 and the percentage bonuses to 100, then multiplies', () => {
    const fake = (
      baseProductivity: number,
      prod: number,
    ): BuffContribution => ({
      source: 'item',
      sourceId: 0,
      scaling: 1,
      buff: { id: 0, name: { en: '' }, baseProductivity, productivity: prod },
    });
    // (100 + 20) x (100 + 30) / 10000
    expect(productivity([fake(20, 0), fake(0, 10), fake(0, 20)])).toBeCloseTo(
      1.56,
    );
  });

  it('multiplies by the fertility factor', () => {
    expect(productivity([], 0.5)).toBeCloseTo(0.5);
  });

  it('never reports exactly zero', () => {
    expect(productivity([], 0)).toBeGreaterThan(0);
  });

  it('ignores aqueducts a building cannot have', () => {
    expect(productivity(contributions(line(BAKERY, { aqueduct: true })))).toBe(
      1,
    );
  });
});

describe('the silo', () => {
  const siloLine = line(PIG_FARM, { silo: true });

  it('doubles productivity', () => {
    expect(productivity(contributions(siloLine))).toBeCloseTo(2);
  });

  it('makes one extra animal every third cycle', () => {
    expect(
      extraOutputsPerCycle(factory(PIG_FARM), contributions(siloLine)),
    ).toEqual([
      { product: factory(PIG_FARM).outputs[0].product, perCycle: 1 / 3 },
    ]);
  });

  it('uses one wheat per 300 seconds', () => {
    const [wheat] = moduleInputsPerMinute(siloLine, factory(PIG_FARM));
    expect(wheat.product).toBe(WHEAT);
    expect(wheat.perMinute).toBeCloseTo(0.2);
  });

  it('is not there when the line has no silo, or the building cannot have one', () => {
    expect(moduleInputsPerMinute(line(PIG_FARM), factory(PIG_FARM))).toEqual(
      [],
    );
    expect(
      moduleInputsPerMinute(line(BAKERY, { silo: true }), factory(BAKERY)),
    ).toEqual([]);
    expect(
      extraOutputsPerCycle(factory(PIG_FARM), contributions(line(PIG_FARM))),
    ).toEqual([]);
  });
});

describe('fuel', () => {
  it('is one coal per 120 seconds for a building that burns it', () => {
    expect(
      fuelPerMinute(factory(BAKERY), contributions(line(BAKERY))),
    ).toBeCloseTo(0.5);
    expect(COAL).toBe(anno117Data.constants.fuelProduct);
  });

  it('lasts longer with Better Bellows', () => {
    const w = world({ techs: [38708] });
    expect(
      fuelPerMinute(factory(BAKERY), contributions(line(BAKERY), island(), w)),
    ).toBeCloseTo(60 / (120 * 1.2));
  });

  it('is nothing for a building that burns none', () => {
    expect(
      fuelPerMinute(factory(WHEAT_FARM), contributions(line(WHEAT_FARM))),
    ).toBe(0);
  });
});

describe('fertility', () => {
  const needsMackerel = factory(SCOMBER);

  it('costs nothing when the island has the fertility, or the building needs none', () => {
    expect(fertilityFactor(needsMackerel, island(), world())).toBe(1);
    expect(
      fertilityFactor(
        factory(WHEAT_FARM),
        island({ missingFertilities: [2206] }),
        world(),
      ),
    ).toBe(1);
  });

  it('is 0 when the island lacks it and nothing stands in for it', () => {
    expect(
      fertilityFactor(
        needsMackerel,
        island({ missingFertilities: [2206] }),
        world(),
      ),
    ).toBe(0);
  });

  it('is half with the Mackerel Hauling tech', () => {
    expect(
      fertilityFactor(
        needsMackerel,
        island({ missingFertilities: [2206] }),
        world({ techs: [37858] }),
      ),
    ).toBe(0.5);
  });

  it('is not changed by a tech for another fertility', () => {
    // Any tech that adds a fertility other than Mackerel (Vino Veritas, for one).
    const other = anno117Data.techs.find(
      (t) => t.areaBuffs && !t.areaBuffs.includes(51796),
    )!;
    expect(
      fertilityFactor(
        needsMackerel,
        island({ missingFertilities: [2206] }),
        world({ techs: [other.id] }),
      ),
    ).toBe(0);
  });
});

describe('patrons', () => {
  const milestones = [
    { devotion: 50, scaling: 10 },
    { devotion: 100, scaling: 20 },
    { devotion: 500, scaling: 30 },
  ];

  it('acts at the highest milestone reached, and not at all below the first', () => {
    expect(patronScaling(milestones, 0)).toBe(0);
    expect(patronScaling(milestones, 49)).toBe(0);
    expect(patronScaling(milestones, 50)).toBe(10);
    expect(patronScaling(milestones, 499)).toBe(20);
    expect(patronScaling(milestones, 100000)).toBe(30);
  });

  it("adds the milestone's percentage to the buildings the effect covers", () => {
    const farm = line(PIG_FARM);
    expect(
      productivity(
        contributions(farm, island({ patron: MARS, devotion: 100 })),
      ),
    ).toBeCloseTo(1.2);
    expect(
      productivity(contributions(farm, island({ patron: MARS, devotion: 50 }))),
    ).toBeCloseTo(1.1);
    expect(
      productivity(contributions(farm, island({ patron: MARS, devotion: 10 }))),
    ).toBe(1);
  });

  it('does not touch buildings the effect does not cover', () => {
    expect(
      contributions(line(WHEAT_FARM), island({ patron: MARS, devotion: 100 })),
    ).toEqual([]);
  });
});

describe('items and effects', () => {
  const item = itemsById.get(160057)!;

  it('gives an item its bonus and swaps the input it replaces', () => {
    const l = line(NARCISSIUM, { items: [item.id] });
    const c = contributions(l);
    expect(productivity(c)).toBeCloseTo(1.3);
    expect(
      inputProducts(factory(NARCISSIUM), contributions(line(NARCISSIUM))),
    ).toContain(SILVER);
    const inputs = inputProducts(factory(NARCISSIUM), c);
    expect(inputs).toContain(IRON);
    expect(inputs).not.toContain(SILVER);
  });

  it('ignores an item on a building it is not for', () => {
    expect(contributions(line(BAKERY, { items: [item.id] }))).toEqual([]);
  });

  it('swaps an item for its boosted form instead of adding to it', () => {
    const boostable = anno117Data.items.find((i) => i.boostBuffs?.length)!;
    const building = boostable.targets[0];
    const plain = contributions(line(building, { items: [boostable.id] }));
    const boosted = contributions(
      line(building, { items: [boostable.id], boostedItems: [boostable.id] }),
    );
    expect(plain.every((c) => c.source === 'item')).toBe(true);
    expect(boosted.length).toBe(boostable.boostBuffs!.length);
    expect(boosted.every((c) => c.source === 'boostedItem')).toBe(true);
  });

  it('counts a repeatable discovery once for each time it was researched', () => {
    const repeatable = anno117Data.techs.find((t) => t.repeatable)!;
    const effect = effectsById.get(repeatable.effects[0])!;
    const target = effect.targets[0];
    const scalings = (techs: number[]) =>
      contributions(line(target), island(), world({ techs }))
        .filter((c) => c.source === 'tech')
        .map((c) => c.scaling);
    expect(scalings([repeatable.id])).toEqual([1]);
    expect(scalings([repeatable.id, repeatable.id, repeatable.id])).toEqual([
      3,
    ]);
  });

  it('applies a researched tech once, and an island effect only to the buildings it targets', () => {
    const effect = anno117Data.effects.find(
      (e) => e.source !== 'tech' && !e.allProduction,
    )!;
    const target = effect.targets[0];
    const outsider = anno117Data.factories.find(
      (f) => !effect.targets.includes(f.id),
    )!.id;
    const settings = island({ effects: [effect.id, effect.id] });
    expect(
      contributions(line(target), settings).filter(
        (c) => c.sourceId === effect.id,
      ).length,
    ).toBe(effect.buffs.length);
    expect(contributions(line(outsider), settings)).toEqual([]);
  });
});

describe('inputs', () => {
  it("are the recipe's, when nothing replaces them", () => {
    const f = factory(BAKERY);
    expect(inputProducts(f, [])).toEqual(f.inputs.map((i) => i.product));
  });
});
