import { WorldStore1800 } from './world-store-1800';
import { World1800 } from './models';
import emptyWorld from './__fixtures__/legacy-saves/empty-world.json';
import noIds from './__fixtures__/legacy-saves/no-ids-with-trade-union-bonus.json';
import withIds from './__fixtures__/legacy-saves/with-ids-and-explicit-defaults.json';
import expectedEmptyWorld from './__fixtures__/legacy-saves/expected/empty-world.json';
import expectedNoIds from './__fixtures__/legacy-saves/expected/no-ids-with-trade-union-bonus.json';
import expectedWithIds from './__fixtures__/legacy-saves/expected/with-ids-and-explicit-defaults.json';

// Worlds saved by older versions sit in real users' browsers, un-versioned, and the
// app rewrites them on every load. These pin what the store alone makes of them on
// load and save -- values AND key order, since the saved text is what users keep -- so
// a refactor cannot silently change a save. The expected files were generated from the
// 2.2.0 store. In the running app the production-line forms also write derived fields
// back (for example `inputGoods`) when the page loads; `npm run e2e:diff -- <baseline>
// <candidate> --seed <fixture>` compares that whole path between two builds.
// If a change to the saved format is intended, it needs a migration and new expectations.

/** Ids are pseudorandom unless the save had them: label them in first-seen order. */
function normalizeIds(world: unknown): unknown {
  const labels = new Map<number, string>();
  const label = (id: number) => {
    if (!labels.has(id)) labels.set(id, `#${labels.size}`);
    return labels.get(id);
  };
  return JSON.parse(
    JSON.stringify(world, (key, value) =>
      (key === 'id' || key.endsWith('IslandId')) && typeof value === 'number'
        ? label(value)
        : value,
    ),
  );
}

const saved = (world: unknown) =>
  WorldStore1800.fromWorld(structuredClone(world) as World1800).toWorld();

const cases: [string, unknown, unknown][] = [
  ['an empty world', emptyWorld, expectedEmptyWorld],
  [
    'a save without ids and with the old Trade Union bonus',
    noIds,
    expectedNoIds,
  ],
  ['a save with ids and explicit default values', withIds, expectedWithIds],
];

describe('worlds saved by older versions', () => {
  for (const [name, fixture, expected] of cases) {
    it(`loads and saves ${name} exactly as before`, () => {
      expect(JSON.stringify(normalizeIds(saved(fixture)))).toBe(
        JSON.stringify(expected),
      );
    });

    it(`saves ${name} the same way again on the next load`, () => {
      const once = saved(fixture);
      expect(JSON.stringify(saved(once))).toBe(JSON.stringify(once));
    });
  }

  it('keeps ids a save already has', () => {
    const world = saved(withIds);
    expect(world.islands.map((island) => island.id)).toEqual([101, 102]);
    expect(world.tradeRoutes).toEqual([
      { id: 201, sourceIslandId: 102, targetIslandId: 101, good: 'Grain' },
    ]);
  });

  it('converts the old Trade Union bonus to a Palace prestige level and drops it', () => {
    const world = saved(noIds);
    expect(world.palacePrestigeLevel).toBe(10);
    expect('tradeUnionBonus' in world).toBe(false);
  });
});
