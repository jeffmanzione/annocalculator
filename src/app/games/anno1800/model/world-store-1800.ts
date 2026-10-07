import { computed, Signal, signal, WritableSignal } from '@angular/core';
import {
  BaseWorldStore,
  flattenWorld,
  nestWorld,
  StoredIsland,
  StoredLine,
} from '../../../shared/engine/base-world-store';
import {
  BASE_ISLAND_MODEL,
  BASE_PRODUCTION_LINE_MODEL,
  BASE_TRADE_ROUTE_MODEL,
  DEFAULT_ISLAND_MODEL,
  DEFAULT_PRODUCTION_LINE_MODEL,
  Island1800,
  ProductionLine1800,
  TradeRoute1800,
  World1800,
} from './models';
import { Good, Item, ProductionBuilding } from '../game/enums';
import { lookupItemInfo, lookupProductionInfo } from '../game/facts';
import {
  palacePrestigeLevelForBonus,
  palaceTradeUnionBonus,
} from '../game/palace';

// Helpers below were moved here from controllers.ts (now deleted), their
// last remaining consumer being this file.

// Array-typed model fields (boosts/items/culturalSets) are compared
// against their defaults by content, not by reference: DEFAULT_*_MODEL's
// array fields are each one specific [] instance, so a freshly-created
// array from the UI (e.g. selecting then deselecting everything) is never
// == to it even when empty, and a plain == check here would silently fail
// to ever clear these fields. Order doesn't matter for these multi-select
// values, so this compares as sets.
export function arrayEqualsAsSet<T>(
  a: T[] | undefined,
  b: T[] | undefined,
): boolean {
  // Defensive: some form-control "cleared" values in production-line.ts are
  // (incorrectly) `false` rather than `[]` for these array-typed controls
  // (see clearAndDisableControl_ calls for 'items'/'culturalSets') -- treat
  // anything that isn't a real array as empty rather than throwing, same as
  // Array.isArray(a) ? a : [] would for iteration purposes.
  const setA = new Set(Array.isArray(a) ? a : []);
  const setB = new Set(Array.isArray(b) ? b : []);
  return setA.size === setB.size && [...setA].every((x) => setB.has(x));
}

export const resolveDuplicateReplacementGoods = (g1: Good, g2: Good): Good => {
  // Prefer Susanna the Steam Engineer (switches input from Steam Motors to
  // Filaments) over Maria Maravilla (switches input from Steam Motors to
  // Motors) because Filaments are much much easier to produce.
  if (g1 === Good.Filaments && g2 === Good.Motor) {
    return Good.Filaments;
  }
  return g2;
};

/**
 * A ProductionLine as held in the normalized store: the same shape as the saved model, plus the id of
 * the island it belongs to (a store-internal field that is not part of the saved JSON; `toWorld()`
 * nests each line back under its island and strips it).
 */
export type ProductionLineEntity = StoredLine<ProductionLine1800>;

/**
 * One input good of a production line, with how it came to be that good. An
 * input is a substitution when a specialist (item) swapped it for the building's
 * normal one: `replaces` is the good it stands in for and `item` the specialist
 * responsible. Both are absent for the building's normal inputs.
 */
export interface InputGoodSource {
  good: Good;
  replaces?: Good;
  item?: Item;
}

/**
 * The input goods of a `building` with the given `items` slotted in, and for
 * each substituted one, what it replaces and which item did it. Items can
 * replace some of the building's normal input goods -- see
 * resolveDuplicateReplacementGoods for what happens when two items replace the
 * same one. Goods that resolve to Unknown are left out.
 */
export function resolveInputGoods(
  building: ProductionBuilding,
  items: Item[] | undefined,
): InputGoodSource[] {
  const productionInfo = lookupProductionInfo(building);
  if (!productionInfo) {
    return [];
  }

  // Keyed by the building's normal input good; the value is what it became.
  const resolved = new Map<Good, InputGoodSource>(
    productionInfo.inputGoods?.map((ig) => [ig, { good: ig }]),
  );
  for (const item of items ?? []) {
    const itemInfo = lookupItemInfo(item)!;
    for (const replacementGood of itemInfo.replacementGoods ?? []) {
      const current = resolved.get(replacementGood.from);
      const good = resolveDuplicateReplacementGoods(
        current?.good as Good,
        replacementGood.to,
      );
      // If the earlier item wins (e.g. Susannah's Filaments over Maria's
      // Motors), it stays the one credited.
      resolved.set(
        replacementGood.from,
        good === current?.good
          ? current
          : { good, replaces: replacementGood.from, item },
      );
    }
  }

  return [...resolved.values()].filter((source) => source.good != Good.Unknown);
}

/**
 * Ported from the old ProductionLineController.updateGoods_() (in the now-deleted controllers.ts):
 * recomputes `good`/`inputGoods` from `building` (+ `items`, which can
 * replace some of the building's normal input goods -- see
 * resolveInputGoods). This is a real, eager side effect of
 * changing `building` or `items`, not an export-minimization nicety, so
 * updateProductionLine() below calls this whenever a patch touches either
 * field, rather than deferring it to toWorld() the way default-clearing is.
 */
function computeDerivedGoods(
  pl: Pick<ProductionLine1800, 'building' | 'items'>,
): Pick<ProductionLine1800, 'good' | 'inputGoods'> {
  const productionInfo = lookupProductionInfo(pl.building);
  if (!productionInfo) {
    return { good: Good.Unknown, inputGoods: [] };
  }

  return {
    good: productionInfo.good,
    inputGoods: resolveInputGoods(pl.building, pl.items).map((s) => s.good),
  };
}

/**
 * The Anno 1800 world store: the game-independent islands, lines and trade routes of BaseWorldStore, plus
 * the Palace's prestige level and the rules that run when a line changes. `fromWorld()`/`toWorld()` are
 * the load/save boundary and must round-trip existing saved data losslessly: real users have
 * un-versioned, un-validated JSON in their browsers' `localStorage`. An island, line or trade route
 * with no id yet (older saved data, or one just created) gets one in `fromWorld()`.
 */
export class WorldStore1800 extends BaseWorldStore<
  Island1800,
  ProductionLine1800,
  TradeRoute1800
> {
  /** The Palace's prestige level; null when there is no Palace. */
  readonly palacePrestigeLevel: WritableSignal<number | null>;
  /** The Trade Union bonus (a fraction) the Palace's level gives. */
  readonly tradeUnionBonus: Signal<number>;

  private constructor(
    flat: ReturnType<
      typeof flattenWorld<Island1800, ProductionLine1800, TradeRoute1800>
    >,
    palacePrestigeLevel: number | null,
  ) {
    super(flat.islands, flat.productionLines, flat.tradeRoutes);
    this.palacePrestigeLevel = signal(palacePrestigeLevel);
    this.tradeUnionBonus = computed(() =>
      palaceTradeUnionBonus(this.palacePrestigeLevel()),
    );
  }

  static fromWorld(world: World1800): WorldStore1800 {
    return new WorldStore1800(
      flattenWorld<Island1800, ProductionLine1800, TradeRoute1800>(
        world.islands,
        world.tradeRoutes,
      ),
      // Worlds saved before the Palace level existed stored the bonus itself.
      world.palacePrestigeLevel ??
        palacePrestigeLevelForBonus(world.tradeUnionBonus ?? 0),
    );
  }

  toWorld(): World1800 {
    const islands = nestWorld<Island1800, ProductionLine1800>(
      this.islands().values(),
      this.productionLines().values(),
      stripProductionLineDefaults,
    ).map((island) => stripIslandDefaults(island as unknown as Island1800));
    return stripWorldDefaults({
      palacePrestigeLevel: this.palacePrestigeLevel() ?? undefined,
      islands,
      tradeRoutes: [...this.tradeRoutes().values()],
    });
  }

  // Defaults are not cleared when a field is set: that happens once, in toWorld(), at save time (see
  // the strip functions below). The exception is a line's `good` and `inputGoods`, which are real
  // derived state read before any save, so they are recomputed as soon as the building or items change.

  protected override newIsland(): Omit<StoredIsland<Island1800>, 'id'> {
    // Like a saved island, a new one carries an (empty) productionLines key, which keeps the order of
    // its keys in the saved JSON what it has always been.
    return structuredClone(BASE_ISLAND_MODEL) as unknown as Omit<
      StoredIsland<Island1800>,
      'id'
    >;
  }

  protected override newProductionLine(): ProductionLine1800 {
    return structuredClone(BASE_PRODUCTION_LINE_MODEL);
  }

  protected override newTradeRoute(): Omit<TradeRoute1800, 'id'> {
    return structuredClone(BASE_TRADE_ROUTE_MODEL);
  }

  protected override onProductionLineUpdated(
    updated: ProductionLineEntity,
    patch: Partial<ProductionLine1800>,
  ): ProductionLineEntity {
    // Items can only be slotted in a trade union, so turning it off clears any selected items right
    // away rather than leaving them in the model pointing at a now-unreachable UI state.
    if (patch.hasTradeUnion === false) {
      updated = { ...updated, items: [] };
    }
    if ('building' in patch || 'items' in patch) {
      updated = { ...updated, ...computeDerivedGoods(updated) };
    }
    return updated;
  }

  setPalacePrestigeLevel(value: number | null): void {
    this.palacePrestigeLevel.set(value);
  }
}

// --- Export-time default clearing ---
//
// Ported from the "delete if equals default" setters in controllers.ts
// (ProductionLineController.boosts/items/hasTradeUnion/
// inRangeOfLocalDepartment/inRangeOfHaciendaFertiliserWorks/culturalSets,
// IslandController.dolPolicy, WorldController.tradeUnionBonus), moved to
// run once here instead of on every individual field write -- see the
// design doc's "Proposed target architecture" section. Array-typed fields
// compare by content (arrayEqualsAsSet), not by reference, for the same
// reason the original setters did: DEFAULT_*_MODEL's array fields are each
// one specific `[]` instance, so a freshly-created empty array is never
// `==` to it.

function stripProductionLineDefaults(
  pl: ProductionLine1800,
): ProductionLine1800 {
  const result = { ...pl };
  if (arrayEqualsAsSet(result.boosts, DEFAULT_PRODUCTION_LINE_MODEL.boosts)) {
    delete result.boosts;
  }
  if (arrayEqualsAsSet(result.items, DEFAULT_PRODUCTION_LINE_MODEL.items)) {
    delete result.items;
  }
  if (
    arrayEqualsAsSet(
      result.culturalSets,
      DEFAULT_PRODUCTION_LINE_MODEL.culturalSets,
    )
  ) {
    delete result.culturalSets;
  }
  if (result.hasTradeUnion == DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion) {
    delete result.hasTradeUnion;
  }
  if (
    result.inRangeOfLocalDepartment ==
    DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment
  ) {
    delete result.inRangeOfLocalDepartment;
  }
  if (
    result.inRangeOfHaciendaFertiliserWorks ==
    DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfHaciendaFertiliserWorks
  ) {
    delete result.inRangeOfHaciendaFertiliserWorks;
  }
  return result;
}

function stripIslandDefaults(island: Island1800): Island1800 {
  const result = { ...island };
  if (result.dolPolicy == DEFAULT_ISLAND_MODEL.dolPolicy) {
    delete result.dolPolicy;
  }
  return result;
}

function stripWorldDefaults(world: World1800): World1800 {
  const result = { ...world };
  if (result.palacePrestigeLevel == null) {
    delete result.palacePrestigeLevel;
  }
  delete result.tradeUnionBonus;
  return result;
}
