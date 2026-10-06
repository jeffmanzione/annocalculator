// The Anno 117 calculator's world, as it is saved. Ids are the game's own ids (see game/data-types.ts).

export interface ProductionLine117 {
  id?: number;
  /** The id of the factory (building). */
  building: number;
  numBuildings: number;
  /** Items (specialists) placed near the buildings. */
  items?: number[];
  /** The items among `items` that are boosted. */
  boostedItems?: number[];
  /** Connected to an aqueduct. */
  aqueduct?: boolean;
  /** Has a silo. */
  silo?: boolean;
}

export interface Island117 {
  id?: number;
  name: string;
  /** The province, as the id of its session: Latium or Albion. */
  session: number;
  /** Fertilities and deposits the island does not have. */
  missingFertilities?: number[];
  /** The island's patron deity, and the devotion points it has with them. */
  patron?: number;
  devotion?: number;
  /** Events, festivals and the like switched on for the island. */
  effects?: number[];
  productionLines: ProductionLine117[];
}

export interface TradeRoute117 {
  id: number;
  sourceIslandId: number;
  targetIslandId: number;
  /** The product's id, as text. */
  good: string;
}

export interface World117 {
  /** Discoveries researched, which apply to every island. */
  techs?: number[];
  islands: Island117[];
  tradeRoutes: TradeRoute117[];
}

/** What is stored and exported: the world, labelled with its game and the format's version. */
export interface Save117 {
  game: 'anno117';
  version: 1;
  world: World117;
}

export const LATIUM = 3245;
export const ALBION = 6627;

export const WORLD_KEY_117 = 'anno-117-production-calculator-world';

export class InvalidSaveError extends Error {}

/** Checks that something parsed from storage or pasted in is an Anno 117 save, and returns its world. */
export function worldFromSave(value: unknown): World117 {
  const save = value as Partial<Save117> | null;
  if (typeof save !== 'object' || save === null)
    throw new InvalidSaveError('This is not an Anno 117 world.');
  if (save.game !== 'anno117') {
    throw new InvalidSaveError(
      (save as { game?: unknown }).game === undefined && 'islands' in save
        ? 'This looks like an Anno 1800 world. Import it on the Anno 1800 page.'
        : 'This is not an Anno 117 world.',
    );
  }
  if (save.version !== 1)
    throw new InvalidSaveError(
      `This world was saved by a newer version (format ${String(save.version)}).`,
    );
  const world = save.world;
  if (
    !world ||
    !Array.isArray(world.islands) ||
    !Array.isArray(world.tradeRoutes)
  ) {
    throw new InvalidSaveError('This Anno 117 world is incomplete.');
  }
  for (const island of world.islands) {
    if (
      typeof island?.name !== 'string' ||
      typeof island.session !== 'number' ||
      !Array.isArray(island.productionLines)
    ) {
      throw new InvalidSaveError(
        'An island in this Anno 117 world is incomplete.',
      );
    }
  }
  return world;
}

export const saveOf = (world: World117): Save117 => ({
  game: 'anno117',
  version: 1,
  world,
});
