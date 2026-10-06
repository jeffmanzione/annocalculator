import { Anno117Buff, Anno117Factory } from './data-types';
import {
  anno117Data,
  buffsById,
  effectsById,
  factoriesById,
  itemsById,
  modulesById,
  patronsById,
  techsById,
  areaBuffsById,
} from './data';

// The Anno 117 production rules, as pure functions of a production line, its island and the world's
// settings. The numbers come from the game data (see data/NOTICE.md); the formulas follow the community
// calculator they come from:
//
//   productivity = fertility x (100 + sum of base bonuses) x (100 + sum of productivity bonuses) / 10000
//   cycles per minute of a building = 60 / cycle time x productivity
//
// Where the data leaves a rule open, the choice made here is noted next to it.

/** What the rules read of a production line. */
export interface LineSettings {
  building: number;
  items: readonly number[];
  /** The items (among `items`) that are boosted, which adds their boost buffs. */
  boostedItems: readonly number[];
  aqueduct: boolean;
  silo: boolean;
}

/** What the rules read of an island. */
export interface IslandSettings {
  /** Fertilities the island does not have naturally. */
  missingFertilities: readonly number[];
  patron: number | null;
  /** The devotion points the island has with its patron. */
  devotion: number;
  /** Events, festivals and other effects switched on for the island. */
  effects: readonly number[];
}

/** What the rules read of the whole world. */
export interface WorldSettings {
  /** Discoveries researched. */
  techs: readonly number[];
}

export type BuffSource =
  | 'item'
  | 'boostedItem'
  | 'effect'
  | 'tech'
  | 'patron'
  | 'aqueduct'
  | 'silo';

/** One buff that is acting on a line, and where it comes from. */
export interface BuffContribution {
  source: BuffSource;
  /** The id of the item, effect, tech, patron, or (for the aqueduct and silo) the buff itself. */
  sourceId: number;
  buff: Anno117Buff;
  /** How strongly it acts: 1, or for a patron's effect the percentage of its devotion milestone (10 to 150). */
  scaling: number;
}

/**
 * How strongly a patron's effect acts at a devotion: the scaling of the highest milestone reached, or 0.
 * The effect's buff is written for 1 and multiplied by this, so a +1 productivity buff at the 20 milestone
 * gives +20%.
 */
export function patronScaling(
  effectMilestones: readonly { devotion: number; scaling: number }[],
  devotion: number,
): number {
  let scaling = 0;
  for (const milestone of effectMilestones) {
    if (devotion >= milestone.devotion && milestone.scaling > scaling)
      scaling = milestone.scaling;
  }
  return scaling;
}

const affects = (
  targets: readonly number[],
  allProduction: boolean | undefined,
  building: number,
): boolean => allProduction === true || targets.includes(building);

/** Every buff acting on a line, in a stable order: aqueduct, silo, items, then effects. */
export function buffContributions(
  line: LineSettings,
  island: IslandSettings,
  world: WorldSettings,
): BuffContribution[] {
  const factory = factoriesById.get(line.building);
  if (!factory) return [];
  const result: BuffContribution[] = [];
  const add = (
    source: BuffSource,
    sourceId: number,
    buffIds: readonly number[],
    scaling = 1,
  ) => {
    for (const id of buffIds) {
      const buff = buffsById.get(id);
      if (buff) result.push({ source, sourceId, buff, scaling });
    }
  };

  if (line.aqueduct && factory.aqueductBuff)
    add('aqueduct', factory.aqueductBuff, [factory.aqueductBuff]);
  if (line.silo && factory.module)
    add('silo', factory.module, modulesById.get(factory.module)?.buffs ?? []);

  for (const itemId of line.items) {
    const item = itemsById.get(itemId);
    if (!item || !item.targets.includes(line.building)) continue;
    // A boosted item's buffs take the place of the item's own; they do not come on top of them.
    if (line.boostedItems.includes(item.id) && item.boostBuffs?.length)
      add('boostedItem', item.id, item.boostBuffs);
    else add('item', item.id, item.buffs);
  }

  // Effects, each counted once even if it is reachable in two ways.
  const seen = new Set<number>();
  const addEffect = (source: BuffSource, effectId: number, scaling: number) => {
    const effect = effectsById.get(effectId);
    if (!effect || seen.has(effectId) || scaling <= 0) return;
    if (!affects(effect.targets, effect.allProduction, line.building)) return;
    seen.add(effectId);
    add(source, effect.id, effect.buffs, scaling);
  };
  // A repeatable tech researched several times acts that many times over.
  for (const [techId, times] of researchedTimes(world.techs)) {
    const tech = techsById.get(techId);
    for (const effectId of tech?.effects ?? [])
      addEffect('tech', effectId, tech?.repeatable ? times : 1);
  }
  for (const effectId of island.effects) addEffect('effect', effectId, 1);
  const patron =
    island.patron != null ? patronsById.get(island.patron) : undefined;
  for (const patronEffect of patron?.effects ?? []) {
    addEffect(
      'patron',
      patronEffect.effect,
      patronScaling(patronEffect.milestones, island.devotion),
    );
  }
  return result;
}

/** How many times each tech was researched (a repeatable one can be listed more than once). */
function researchedTimes(techs: readonly number[]): Map<number, number> {
  const times = new Map<number, number>();
  for (const id of techs) times.set(id, (times.get(id) ?? 0) + 1);
  return times;
}

/**
 * How much of its productivity a building keeps without the fertility or deposit it needs on the
 * island: techs can stand in for part of it (each area buff gives a share), and with none it gets 0.
 * A building that needs no fertility, or an island that has it, loses nothing.
 */
export function fertilityFactor(
  factory: Anno117Factory,
  island: IslandSettings,
  world: WorldSettings,
): number {
  if (
    !factory.fertility ||
    !island.missingFertilities.includes(factory.fertility)
  )
    return 1;
  let percent = 0;
  for (const techId of world.techs) {
    for (const areaBuffId of techsById.get(techId)?.areaBuffs ?? []) {
      const areaBuff = areaBuffsById.get(areaBuffId);
      if (areaBuff?.fertility === factory.fertility)
        percent += areaBuff.percent;
    }
  }
  return Math.min(1, percent / 100);
}

/** The smallest productivity the rules report, so that a building never produces exactly nothing. */
const MIN_PRODUCTIVITY = 0.0001;

/** A building's productivity as a multiple of its base speed (1 = 100%). */
export function productivity(
  contributions: readonly BuffContribution[],
  fertility = 1,
): number {
  let base = 0;
  let bonus = 0;
  for (const { buff, scaling } of contributions) {
    base += (buff.baseProductivity ?? 0) * scaling;
    bonus += (buff.productivity ?? 0) * scaling;
  }
  // The division comes last so that rounding errors don't show up as 315.01%.
  return Math.max(
    MIN_PRODUCTIVITY,
    (fertility * (100 + base) * (100 + bonus)) / 10000,
  );
}

/** The products a building consumes per cycle, after item replacements (the lowest buff id applies first). */
export function inputProducts(
  factory: Anno117Factory,
  contributions: readonly BuffContribution[],
): number[] {
  const inputs = factory.inputs.map((input) => input.product);
  const replacing = contributions
    .filter((c) => c.scaling > 0 && c.buff.replaceInputs?.length)
    .sort((a, b) => a.buff.id - b.buff.id);
  for (const { buff } of replacing) {
    for (const { from, to } of buff.replaceInputs!) {
      const at = inputs.indexOf(from);
      if (at === -1) continue;
      if (to) inputs[at] = to;
      else inputs.splice(at, 1);
    }
  }
  return inputs;
}

/** Extra output a building makes on top of its recipe, per cycle (e.g. a silo's extra grain every third cycle). */
export function extraOutputsPerCycle(
  factory: Anno117Factory,
  contributions: readonly BuffContribution[],
): { product: number; perCycle: number }[] {
  const totals = new Map<number, number>();
  for (const { buff, scaling } of contributions) {
    if (scaling <= 0) continue;
    for (const extra of buff.additionalOutputs ?? []) {
      // Product 0 means more of what the building makes.
      const product = extra.product || factory.outputs[0].product;
      totals.set(
        product,
        (totals.get(product) ?? 0) + extra.amount / extra.everyCycles,
      );
    }
  }
  return [...totals].map(([product, perCycle]) => ({ product, perCycle }));
}

/** Each extra output a building has, with what gives it (for listing them one by one). */
export function extraOutputDetails(
  factory: Anno117Factory,
  contributions: readonly BuffContribution[],
): {
  product: number;
  amount: number;
  everyCycles: number;
  source: BuffSource;
  sourceId: number;
}[] {
  return contributions
    .filter((c) => c.scaling > 0)
    .flatMap((c) =>
      (c.buff.additionalOutputs ?? []).map((extra) => ({
        // Product 0 means more of what the building makes.
        product: extra.product || factory.outputs[0].product,
        amount: extra.amount,
        everyCycles: extra.everyCycles,
        source: c.source,
        sourceId: c.sourceId,
      })),
    );
}

/**
 * Coal a building burns per minute: one unit lasts `fuelProductionTime` seconds, longer with fuel
 * saving buffs. (The community calculator derives this slightly differently, scaling with the cycle
 * time; this assumes fuel is used up with time, not per cycle. See the notes in the README.)
 */
export function fuelPerMinute(
  factory: Anno117Factory,
  contributions: readonly BuffContribution[],
): number {
  if (!factory.fuel) return 0;
  const percent = contributions.reduce(
    (sum, c) => sum + (c.buff.fuelDurationPercent ?? 0) * c.scaling,
    0,
  );
  return (
    60 /
    (anno117Data.constants.fuelProductionTime *
      Math.max(0.01, 1 + percent / 100))
  );
}

/** What a building's module (the silo) consumes per minute, if the line has it. */
export function moduleInputsPerMinute(
  line: LineSettings,
  factory: Anno117Factory,
): { product: number; perMinute: number }[] {
  if (!line.silo || !factory.module) return [];
  const module = modulesById.get(factory.module);
  if (!module) return [];
  return module.inputs.map((input) => ({
    product: input.product,
    perMinute: (input.amount * 60) / module.cycleTime,
  }));
}
