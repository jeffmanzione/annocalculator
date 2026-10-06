import fs from 'node:fs';
import path from 'node:path';
import {
  anno117Data,
  areaBuffsById,
  buffsById,
  effectsById,
  factoriesById,
  fertilitiesById,
  modulesById,
  productsById,
  workforceById,
} from './data';

// The Anno 117 data is generated (src/tools/anno117/convert-params.ts); these checks catch a bad
// regeneration, such as an id that points at something that was left out.

// The tests run from the repository root.
const ICON_DIR = path.resolve('public/icons/anno117');
const missing = <T>(ids: Iterable<T>, known: ReadonlyMap<T, unknown>): T[] =>
  [...ids].filter((id) => !known.has(id));

describe('Anno 117 data', () => {
  it('has unique ids within each list', () => {
    for (const [name, list] of Object.entries(anno117Data)) {
      if (!Array.isArray(list)) continue;
      const ids = list.map((item: { id: number }) => item.id);
      expect(new Set(ids).size, name).toBe(ids.length);
    }
  });

  it('gives every named thing an English name', () => {
    for (const list of [
      anno117Data.products,
      anno117Data.factories,
      anno117Data.items,
      anno117Data.techs,
      anno117Data.patrons,
    ]) {
      for (const item of list)
        expect(item.name.en.trim(), String(item.id)).not.toBe('');
    }
  });

  it('only refers to products that exist', () => {
    const used = new Set<number>();
    for (const f of anno117Data.factories)
      [...f.inputs, ...f.outputs].forEach((x) => used.add(x.product));
    for (const m of anno117Data.modules)
      m.inputs.forEach((x) => used.add(x.product));
    for (const b of anno117Data.buffs) {
      // A replacement to product 0 removes the input.
      b.replaceInputs?.forEach((r) => {
        used.add(r.from);
        if (r.to) used.add(r.to);
      });
      b.additionalOutputs?.forEach((o) => o.product && used.add(o.product));
    }
    used.add(anno117Data.constants.fuelProduct);
    expect(missing(used, productsById)).toEqual([]);
  });

  it('gives every factory a cycle time and an output', () => {
    for (const f of anno117Data.factories) {
      expect(f.cycleTime, f.name.en).toBeGreaterThan(0);
      expect(f.outputs.length, f.name.en).toBeGreaterThan(0);
    }
  });

  it('only refers to workforce, fertilities, modules and buffs that exist', () => {
    const factories = anno117Data.factories;
    expect(
      missing(
        factories.flatMap((f) => (f.workforce ? [f.workforce.product] : [])),
        workforceById,
      ),
    ).toEqual([]);
    expect(
      missing(
        factories.flatMap((f) => (f.fertility ? [f.fertility] : [])),
        fertilitiesById,
      ),
    ).toEqual([]);
    expect(
      missing(
        factories.flatMap((f) => (f.module ? [f.module] : [])),
        modulesById,
      ),
    ).toEqual([]);
    expect(
      missing(
        factories.flatMap((f) => (f.aqueductBuff ? [f.aqueductBuff] : [])),
        buffsById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.modules.flatMap((m) => m.buffs),
        buffsById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.effects.flatMap((e) => e.buffs),
        buffsById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.items.flatMap((i) => [...i.buffs, ...(i.boostBuffs ?? [])]),
        buffsById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.areaBuffs.map((a) => a.fertility),
        fertilitiesById,
      ),
    ).toEqual([]);
  });

  it('only targets factories that exist', () => {
    expect(
      missing(
        anno117Data.items.flatMap((i) => i.targets),
        factoriesById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.effects.flatMap((e) => e.targets),
        factoriesById,
      ),
    ).toEqual([]);
  });

  it('only refers to effects, area buffs and fertilities that exist', () => {
    expect(
      missing(
        anno117Data.techs.flatMap((t) => t.effects),
        effectsById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.techs.flatMap((t) => t.areaBuffs ?? []),
        areaBuffsById,
      ),
    ).toEqual([]);
    expect(
      missing(
        anno117Data.patrons.flatMap((p) => p.effects.map((e) => e.effect)),
        effectsById,
      ),
    ).toEqual([]);
  });

  it('has an icon file for every icon it names', () => {
    const named = new Set<string>();
    const collect = (list: readonly { icon?: string }[]) =>
      list.forEach((x) => x.icon && named.add(x.icon));
    for (const key of [
      'products',
      'workforce',
      'factories',
      'modules',
      'buffs',
      'effects',
      'items',
      'techs',
      'patrons',
      'fertilities',
      'areaBuffs',
      'sessions',
    ] as const) {
      collect(anno117Data[key]);
    }
    const files = new Set(fs.readdirSync(ICON_DIR));
    expect([...named].filter((icon) => !files.has(icon))).toEqual([]);
  });

  it('has no leftover zero-width spaces, soft hyphens or line breaks in names', () => {
    const names = [
      anno117Data.products,
      anno117Data.factories,
      anno117Data.items,
    ].flatMap((list) => list.flatMap((x) => Object.values(x.name)));
    expect(names.filter((n) => /[​­\n]/.test(n))).toEqual([]);
  });

  it('contains the buildings and goods the research expected', () => {
    const english = (list: readonly { name: { en: string } }[]) =>
      list.map((x) => x.name.en);
    expect(english(anno117Data.factories)).toEqual(
      expect.arrayContaining([
        'Fishing Hut',
        'Bakery',
        'Sawmill',
        'Wheat Farm',
      ]),
    );
    expect(english(anno117Data.products)).toEqual(
      expect.arrayContaining(['Bread', 'Timber', 'Flour']),
    );
    expect(anno117Data.factories.length).toBeGreaterThan(100);
  });
});
