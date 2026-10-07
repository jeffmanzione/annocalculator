// The shape of src/app/games/anno117/data/anno117-data.json, which src/tools/anno117/convert-params.ts
// generates from the community calculator's game data (see the credits in the README). Ids are the
// game's own numeric ids.

/** A name in the languages the game ships in that this app also has (the game has no Dutch). */
export interface Anno117Name {
  en: string;
  de?: string;
  zh?: string;
}

/** The two provinces of the base game. */
type Anno117Region = 'Roman' | 'Celtic';

interface Anno117Session {
  id: number;
  name: Anno117Name;
  icon?: string;
  region: Anno117Region;
}

export interface Anno117Product {
  id: number;
  name: Anno117Name;
  icon?: string;
  abstract?: true;
}

interface Anno117Amount {
  product: number;
  amount: number;
}

export interface Anno117Factory {
  id: number;
  name: Anno117Name;
  icon?: string;
  /** Seconds per production cycle at 100% productivity. */
  cycleTime: number;
  inputs: Anno117Amount[];
  outputs: Anno117Amount[];
  regions: string[];
  /** The workforce tier it employs, and how many workers each building needs. */
  workforce?: Anno117Amount;
  /** Denarii upkeep per building (per minute). */
  upkeep?: number;
  /** The fertility or deposit an island needs to have for this building. */
  fertility?: number;
  /** Burns coal. */
  fuel?: true;
  /** The buff a connected aqueduct gives this building. */
  aqueductBuff?: number;
  /** The module (silo) this building can have. */
  module?: number;
  modulesLimit?: number;
  dlc?: number[];
}

export interface Anno117Module {
  id: number;
  name: Anno117Name;
  icon?: string;
  cycleTime: number;
  inputs: Anno117Amount[];
  buffs: number[];
  regions: string[];
}

export interface Anno117Buff {
  id: number;
  name: Anno117Name;
  icon?: string;
  /** Percentage points added to the 100 base before the other bonuses multiply it. */
  baseProductivity?: number;
  /** Percentage added to the productivity multiplier. */
  productivity?: number;
  /** Percentage change of how long a unit of fuel lasts. */
  fuelDurationPercent?: number;
  /** Swaps one input for another (to: 0 drops the input). */
  replaceInputs?: { from: number; to: number }[];
  /** Extra output every `everyCycles` cycles; product 0 means more of what the building makes. */
  additionalOutputs?: {
    product: number;
    amount: number;
    everyCycles: number;
  }[];
  replaceWorkforce?: { from: number; to: number };
  workforceMaintenancePercent?: number;
}

type Anno117EffectSource =
  | 'tech'
  | 'island-event'
  | 'session-event'
  | 'festival'
  | 'veneration-effect'
  | 'mythical-item';

export interface Anno117Effect {
  id: number;
  name: Anno117Name;
  icon?: string;
  source: Anno117EffectSource;
  scope: string;
  targets: number[];
  allProduction?: true;
  buffs: number[];
}

export interface Anno117Item {
  id: number;
  name: Anno117Name;
  icon?: string;
  rarity: string;
  scope: string;
  /** The factories it affects. */
  targets: number[];
  buffs: number[];
  /** Buffs it adds on top when boosted. */
  boostBuffs?: number[];
}

export interface Anno117Tech {
  id: number;
  name: Anno117Name;
  icon?: string;
  effects: number[];
  /** Fertility buffs the tech gives instead of productivity. */
  areaBuffs?: number[];
  /** Can be researched again and again, each time adding its effect once more. */
  repeatable?: true;
}

export interface Anno117Patron {
  id: number;
  name: Anno117Name;
  icon?: string;
  effects: {
    effect: number;
    milestones: { devotion: number; scaling: number }[];
  }[];
}

export interface Anno117Fertility {
  id: number;
  name: Anno117Name;
  icon?: string;
  regions: string[];
}

export interface Anno117AreaBuff {
  id: number;
  name: Anno117Name;
  icon?: string;
  fertility: number;
  /** How much of the fertility's full productivity it provides. */
  percent: number;
}

export interface Anno117Workforce {
  id: number;
  name: Anno117Name;
  icon?: string;
}

export interface Anno117Data {
  source: { project: string; file: string; note: string };
  constants: { fuelProduct: number; fuelProductionTime: number };
  sessions: Anno117Session[];
  products: Anno117Product[];
  workforce: Anno117Workforce[];
  factories: Anno117Factory[];
  modules: Anno117Module[];
  buffs: Anno117Buff[];
  effects: Anno117Effect[];
  items: Anno117Item[];
  techs: Anno117Tech[];
  patrons: Anno117Patron[];
  fertilities: Anno117Fertility[];
  areaBuffs: Anno117AreaBuff[];
}
