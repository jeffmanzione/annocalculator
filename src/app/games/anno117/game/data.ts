import rawData from '../data/anno117-data.json';
import {
  Anno117AreaBuff,
  Anno117Buff,
  Anno117Data,
  Anno117Effect,
  Anno117Factory,
  Anno117Fertility,
  Anno117Item,
  Anno117Module,
  Anno117Patron,
  Anno117Product,
  Anno117Tech,
  Anno117Workforce,
} from './data-types';

/** The game data, with lookups by id. Everything here is read-only. */
export const anno117Data = rawData as unknown as Anno117Data;

const byId = <T extends { id: number }>(
  list: readonly T[],
): ReadonlyMap<number, T> => new Map(list.map((item) => [item.id, item]));

export const productsById: ReadonlyMap<number, Anno117Product> = byId(
  anno117Data.products,
);
export const workforceById: ReadonlyMap<number, Anno117Workforce> = byId(
  anno117Data.workforce,
);
export const factoriesById: ReadonlyMap<number, Anno117Factory> = byId(
  anno117Data.factories,
);
export const modulesById: ReadonlyMap<number, Anno117Module> = byId(
  anno117Data.modules,
);
export const buffsById: ReadonlyMap<number, Anno117Buff> = byId(
  anno117Data.buffs,
);
export const effectsById: ReadonlyMap<number, Anno117Effect> = byId(
  anno117Data.effects,
);
export const itemsById: ReadonlyMap<number, Anno117Item> = byId(
  anno117Data.items,
);
export const techsById: ReadonlyMap<number, Anno117Tech> = byId(
  anno117Data.techs,
);
export const patronsById: ReadonlyMap<number, Anno117Patron> = byId(
  anno117Data.patrons,
);
export const fertilitiesById: ReadonlyMap<number, Anno117Fertility> = byId(
  anno117Data.fertilities,
);
export const areaBuffsById: ReadonlyMap<number, Anno117AreaBuff> = byId(
  anno117Data.areaBuffs,
);
