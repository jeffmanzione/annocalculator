// Builds the Anno 117 game data files from the community calculator's `params.js`
// (https://github.com/anno-mods/anno-117-calculator, js/params.js; the code there is MIT, the
// game names, icons and values in it are Ubisoft's -- see the credits in the README).
//
//   npx tsx src/tools/anno117/convert-params.ts <path to params.js>
//
// Writes src/app/games/anno117/data/anno117-data.json (names in English, German and Chinese;
// only what the production calculator uses) and the icons it needs as files under
// public/icons/anno117/. Prints what it kept and what it left out, so a new game patch's data
// can be reviewed. Run `npx tsx src/tools/anno117/verify-data.ts` afterwards.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const [paramsPath] = process.argv.slice(2);
if (!paramsPath) {
  console.error(
    'usage: npx tsx src/tools/anno117/convert-params.ts <path to params.js>',
  );
  process.exit(2);
}

const OUT_DATA = path.resolve('src/app/games/anno117/data/anno117-data.json');
const OUT_ICONS = path.resolve('public/icons/anno117');

// --- Reading params.js ---------------------------------------------------------------------------

const sandbox: { window: { params?: any } } = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(paramsPath, 'utf8'), sandbox);
const params = sandbox.window.params;
if (!params) throw new Error('params.js did not define window.params');

type Loc = { en: string; de?: string; zh?: string };

/** Names come with zero-width spaces (Chinese) and soft hyphens (German) and line breaks. */
const clean = (text: string | undefined): string | undefined =>
  text === undefined
    ? undefined
    : text
        .replace(/[​­]/g, '')
        .replace(/\s*\n\s*/g, ' ')
        .trim();

function loc(o: { locaText?: Record<string, string>; name?: string }): Loc {
  const t = o.locaText ?? {};
  const en = clean(t['english']) ?? o.name ?? '';
  const de = clean(t['german']);
  const zh = clean(t['simplified_chinese']);
  return {
    en,
    ...(de && de !== en ? { de } : {}),
    ...(zh && zh !== en ? { zh } : {}),
  };
}

// --- Icons ---------------------------------------------------------------------------------------

const usedIcons = new Map<string, string>(); // params icon path -> file name (without folder)

/** Registers an icon and returns the file name the app will load it by, or undefined if params has none. */
function iconFor(iconPath: string | undefined): string | undefined {
  if (!iconPath || !(iconPath in params.icons)) return undefined;
  if (!usedIcons.has(iconPath)) {
    const base = path
      .basename(iconPath, path.extname(iconPath))
      .replace(/^icon_(2d|3d)_/, '')
      .replace(/[^A-Za-z0-9_-]/g, '_');
    let name = base;
    for (let n = 2; [...usedIcons.values()].includes(name + '.webp'); n++)
      name = `${base}_${n}`;
    usedIcons.set(iconPath, name + '.webp');
  }
  return usedIcons.get(iconPath);
}

// --- Selecting what the calculator uses -----------------------------------------------------------

const rawBuffs = new Map<number, any>(
  params.buildingBuffs.map((b: any) => [b.guid, b]),
);

/** A buff matters to a production calculator if it changes productivity, fuel use, inputs, outputs or workforce. */
function isProductionBuff(b: any): boolean {
  return (
    !!b.baseProductivityUpgrade ||
    !!b.productivityUpgrade ||
    !!b.fuelDurationPercent ||
    b.replaceInputs?.length > 0 ||
    b.additionalOutputs?.length > 0 ||
    !!b.replaceWorkforce?.newWorkforce ||
    !!b.workforceMaintenanceFactorUpgrade
  );
}

const keptBuffIds = new Set<number>();
const useBuffs = (ids: number[] | undefined): number[] => {
  const kept = (ids ?? []).filter(
    (id) => rawBuffs.has(id) && isProductionBuff(rawBuffs.get(id)),
  );
  kept.forEach((id) => keptBuffIds.add(id));
  return kept;
};

const workforceIds = new Set<number>(params.workforce.map((w: any) => w.guid));
const DENARII = 1010017;

// Products: every product that is a real good or workforce someone uses (not abstract service placeholders).
const factoriesRaw: any[] = params.factories;
const referencedProducts = new Set<number>();
for (const f of factoriesRaw) {
  for (const x of [...(f.inputs ?? []), ...(f.outputs ?? [])])
    referencedProducts.add(x.product);
}
for (const m of params.modules)
  for (const x of m.inputs ?? []) referencedProducts.add(x.product);
referencedProducts.add(params.constants.fuelProduct);

function productIdsInBuffs(buffIds: number[]): void {
  for (const id of buffIds) {
    const b = rawBuffs.get(id);
    for (const r of b.replaceInputs ?? []) {
      referencedProducts.add(r.newInput);
      if (r.oldInput) referencedProducts.add(r.oldInput);
    }
    for (const o of b.additionalOutputs ?? [])
      if (o.product) referencedProducts.add(o.product);
  }
}

// Factories.
const factories = factoriesRaw.map((f) => {
  const workforce = (f.maintenances ?? []).find((m: any) =>
    workforceIds.has(m.product),
  );
  const upkeep = (f.maintenances ?? []).find((m: any) => m.product === DENARII);
  const aqueductBuff =
    f.aqueductProductivityBuff && rawBuffs.has(f.aqueductProductivityBuff)
      ? f.aqueductProductivityBuff
      : undefined;
  if (aqueductBuff) useBuffs([aqueductBuff]);
  return {
    id: f.guid as number,
    name: loc(f),
    icon: iconFor(f.iconPath),
    cycleTime: f.cycleTime as number,
    inputs: (f.inputs ?? []).map((x: any) => ({
      product: x.product,
      amount: x.amount,
    })),
    outputs: (f.outputs ?? []).map((x: any) => ({
      product: x.product,
      amount: x.amount,
    })),
    regions: f.associatedRegions as string[],
    ...(workforce
      ? {
          workforce: {
            product: workforce.product as number,
            amount: workforce.amount as number,
          },
        }
      : {}),
    ...(upkeep ? { upkeep: upkeep.amount as number } : {}),
    ...(f.neededFertility ? { fertility: f.neededFertility as number } : {}),
    ...(f.needsFuelInput ? { fuel: true } : {}),
    ...(aqueductBuff ? { aqueductBuff } : {}),
    ...(f.additionalModule ? { module: f.additionalModule as number } : {}),
    ...(f.modulesLimit ? { modulesLimit: f.modulesLimit as number } : {}),
    ...(f.dlcUnlocks?.length ? { dlc: f.dlcUnlocks as number[] } : {}),
  };
});

// Modules (the silo).
const modulesRaw: any[] = params.modules;
const modules = modulesRaw.map((m) => ({
  id: m.guid as number,
  name: loc(m),
  icon: iconFor(m.iconPath),
  cycleTime: m.cycleTime as number,
  inputs: (m.inputs ?? []).map((x: any) => ({
    product: x.product,
    amount: x.amount,
  })),
  buffs: useBuffs(m.buffs),
  regions: m.associatedRegions as string[],
}));

// Effects (techs, island and session events, festivals, venerations), and items.
const KEPT_EFFECT_SOURCES = new Set([
  'tech',
  'island-event',
  'session-event',
  'festival',
  'veneration-effect',
  'mythical-item',
]);
const effectsRaw: any[] = params.effects;
const keptEffectIds = new Set<number>();
// Effects and items list the buildings they apply to; only factories matter to production
// (the rest are residences, markets and so on), and only buffs that change production are kept.
const factoryIds = new Set<number>(factories.map((f) => f.id));
const factoryTargets = (targets: number[] | undefined): number[] =>
  (targets ?? []).filter((id) => factoryIds.has(id));
const hasProductionBuff = (ids: number[] | undefined): boolean =>
  (ids ?? []).some(
    (id) => rawBuffs.has(id) && isProductionBuff(rawBuffs.get(id)),
  );

const effects = effectsRaw
  .filter((e) => KEPT_EFFECT_SOURCES.has(e.source))
  .filter(
    (e) =>
      hasProductionBuff(e.buffs) &&
      (e.targetsIsAllProduction || factoryTargets(e.targets).length > 0),
  )
  .map((e) => {
    keptEffectIds.add(e.guid);
    return {
      id: e.guid as number,
      name: loc(e),
      icon: iconFor(e.iconPath),
      source: e.source as string,
      scope: e.effectScope as string,
      targets: factoryTargets(e.targets),
      ...(e.targetsIsAllProduction ? { allProduction: true } : {}),
      buffs: useBuffs(e.buffs),
    };
  });

const items = (params.items as any[])
  .filter(
    (i) =>
      (hasProductionBuff(i.buffs) || hasProductionBuff(i.boostBuffs)) &&
      factoryTargets(i.targets).length > 0,
  )
  .map((i) => {
    const boostBuffs = useBuffs(i.boostBuffs);
    return {
      id: i.guid as number,
      name: loc(i),
      icon: iconFor(i.iconPath),
      rarity: i.rarity as string,
      scope: i.effectScope as string,
      targets: factoryTargets(i.targets),
      buffs: useBuffs(i.buffs),
      ...(boostBuffs.length ? { boostBuffs } : {}),
    };
  });

const areaBuffIds = new Set<number>(
  (params.areaBuffs as any[]).map((a) => a.guid),
);
const rawEffects = new Map<number, any>(effectsRaw.map((e) => [e.guid, e]));
const techs = (params.techs as any[]).map((t) => {
  // Some techs add a fertility to an island instead of changing productivity: their effect's
  // "buff" is then one of the area buffs.
  const areaBuffsOfTech = (t.effects ?? []).flatMap((id: number) =>
    (rawEffects.get(id)?.buffs ?? []).filter((b: number) => areaBuffIds.has(b)),
  );
  return {
    id: t.guid as number,
    name: loc(t),
    icon: iconFor(t.iconPath),
    effects: (t.effects ?? []).filter((id: number) =>
      keptEffectIds.has(id),
    ) as number[],
    ...(areaBuffsOfTech.length
      ? { areaBuffs: areaBuffsOfTech as number[] }
      : {}),
    ...(t.isRepeatable ? { repeatable: true as const } : {}),
  };
});

const patrons = (params.patrons as any[]).map((p) => ({
  id: p.guid as number,
  name: loc(p),
  icon: iconFor(p.iconPath),
  // Each local effect gets stronger at devotion milestones (buffScaling is a percentage of the effect).
  effects: (p.localEffects ?? [])
    .filter((l: any) => keptEffectIds.has(l.effect))
    .map((l: any) => ({
      effect: l.effect as number,
      milestones: (l.milestones ?? []).map((m: any) => ({
        devotion: m.devotion as number,
        scaling: m.buffScaling as number,
      })),
    })),
}));

// Fertilities, and the area buffs (techs) that add a fertility at 50% or 100%.
const fertilities = (params.fertilities as any[]).map((f) => ({
  id: f.guid as number,
  name: loc(f),
  icon: iconFor(f.iconPath),
  regions: (f.regions ?? []) as string[],
}));
const areaBuffs = (params.areaBuffs as any[]).map((a) => ({
  id: a.guid as number,
  name: loc(a),
  icon: iconFor(a.iconPath),
  fertility: a.addedFertility as number,
  percent: a.fertilityPercent as number,
}));

const workforce = (params.workforce as any[]).map((w) => ({
  id: w.guid as number,
  name: loc(w),
  icon: iconFor(w.iconPath),
}));

// Buffs: keep the fields the rules read.
const buffs = [...keptBuffIds]
  .sort((a, b) => a - b)
  .map((id) => {
    const b = rawBuffs.get(id);
    return {
      id,
      name: loc(b),
      icon: iconFor(b.iconPath),
      ...(b.baseProductivityUpgrade
        ? { baseProductivity: b.baseProductivityUpgrade as number }
        : {}),
      ...(b.productivityUpgrade
        ? { productivity: b.productivityUpgrade as number }
        : {}),
      ...(b.fuelDurationPercent
        ? { fuelDurationPercent: b.fuelDurationPercent as number }
        : {}),
      ...(b.replaceInputs?.length
        ? {
            replaceInputs: b.replaceInputs.map((r: any) => ({
              from: r.oldInput as number,
              to: r.newInput as number,
            })),
          }
        : {}),
      ...(b.additionalOutputs?.length
        ? {
            additionalOutputs: b.additionalOutputs.map((o: any) => ({
              // product 0 with forceProductSameAsFactoryOutput means "more of what the building makes"
              product: o.forceProductSameAsFactoryOutput
                ? 0
                : (o.product as number),
              amount: o.amount as number,
              everyCycles: o.additionalOutputCycle as number,
            })),
          }
        : {}),
      ...(b.replaceWorkforce?.newWorkforce
        ? {
            replaceWorkforce: {
              from: b.replaceWorkforce.oldWorkforce as number,
              to: b.replaceWorkforce.newWorkforce as number,
            },
          }
        : {}),
      ...(b.workforceMaintenanceFactorUpgrade
        ? {
            workforceMaintenancePercent:
              b.workforceMaintenanceFactorUpgrade as number,
          }
        : {}),
    };
  });
productIdsInBuffs([...keptBuffIds]);

// Products last, now that everything that references them is known.
const productsRaw: any[] = params.products;
const products = productsRaw
  .filter((p) => referencedProducts.has(p.guid) || workforceIds.has(p.guid))
  .map((p) => ({
    id: p.guid as number,
    name: loc(p),
    icon: iconFor(p.iconPath),
    ...(p.isAbstract ? { abstract: true } : {}),
  }));

// Sessions and regions the calculator offers for an island.
const regionNames = new Map<number, string>(
  (params.regions as any[]).map((r) => [
    r.guid,
    String(r.name).replace(/^Region /, ''),
  ]),
);
const sessions = (params.sessions as any[])
  .filter(
    (s) =>
      regionNames.get(s.region) === 'Roman' ||
      regionNames.get(s.region) === 'Celtic',
  )
  .map((s) => ({
    id: s.guid as number,
    name: loc(s),
    icon: iconFor(s.iconPath),
    region: regionNames.get(s.region)!,
  }));

const data = {
  source: {
    project: 'anno-mods/anno-117-calculator',
    file: 'js/params.js',
    note: 'Game names, icons and values are (c) Ubisoft. Generated by src/tools/anno117/convert-params.ts.',
  },
  constants: params.constants as {
    fuelProduct: number;
    fuelProductionTime: number;
  },
  sessions,
  products,
  workforce,
  factories,
  modules,
  buffs,
  effects,
  items,
  techs,
  patrons,
  fertilities,
  areaBuffs,
};

// --- Writing -------------------------------------------------------------------------------------

fs.mkdirSync(path.dirname(OUT_DATA), { recursive: true });
fs.writeFileSync(OUT_DATA, JSON.stringify(data) + '\n');

fs.rmSync(OUT_ICONS, { recursive: true, force: true });
fs.mkdirSync(OUT_ICONS, { recursive: true });
let iconBytes = 0;
for (const [iconPath, file] of usedIcons) {
  const m = /^data:image\/(\w+);base64,(.*)$/s.exec(params.icons[iconPath]);
  if (!m) throw new Error(`Icon ${iconPath} is not a base64 data URL`);
  if (m[1] !== 'webp')
    throw new Error(`Icon ${iconPath} is ${m[1]}, expected webp`);
  const bytes = Buffer.from(m[2], 'base64');
  iconBytes += bytes.length;
  fs.writeFileSync(path.join(OUT_ICONS, file), bytes);
}

const dataBytes = fs.statSync(OUT_DATA).size;
console.log(
  `Wrote ${path.relative('.', OUT_DATA)} (${(dataBytes / 1024).toFixed(0)} kB) and ${usedIcons.size} icons (${(iconBytes / 1024).toFixed(0)} kB).`,
);
const dropped = (label: string, total: number, kept: number) =>
  console.log(
    `  ${label.padEnd(12)} kept ${String(kept).padStart(3)} of ${total}`,
  );
dropped('products', productsRaw.length, products.length);
dropped('factories', factoriesRaw.length, factories.length);
dropped('buffs', params.buildingBuffs.length, buffs.length);
dropped('effects', effectsRaw.length, effects.length);
dropped('items', params.items.length, items.length);
dropped('techs', params.techs.length, techs.length);
const droppedSources = effectsRaw
  .filter((e) => !keptEffectIds.has(e.guid))
  .reduce<
    Record<string, number>
  >((m, e) => ((m[e.source] = (m[e.source] ?? 0) + 1), m), {});
console.log('  effects left out, by source:', JSON.stringify(droppedSources));
