import { computed, signal, Signal, WritableSignal } from '@angular/core';
import {
  BaseWorldStore,
  EntityId,
  flattenWorld,
  nestWorld,
  StoredIsland,
  StoredLine,
} from '../../../shared/engine/base-world-store';
import { anno117Data, factoriesById, itemsById, techsById } from '../game/data';
import { Anno117Factory } from '../game/data-types';
import {
  ALBION,
  Island117,
  LATIUM,
  ProductionLine117,
  TradeRoute117,
  World117,
} from './models';

/** The region an island is in, from its session. */
export const regionOfSession = (session: number): string =>
  anno117Data.sessions.find((s) => s.id === session)?.region ?? 'Roman';

/** Factories an island's province offers, in the game's order. */
export const factoriesForSession = (session: number): Anno117Factory[] => {
  const region = regionOfSession(session);
  return anno117Data.factories.filter((f) => f.regions.includes(region));
};

/** The factory of another province that makes the same good, if there is one (a Roman Bakery for a Celtic one). */
export function counterpart(
  factory: Anno117Factory,
  session: number,
): Anno117Factory | undefined {
  const region = regionOfSession(session);
  if (factory.regions.includes(region)) return factory;
  const good = factory.outputs[0]?.product;
  return anno117Data.factories.find(
    (f) => f.regions.includes(region) && f.outputs[0]?.product === good,
  );
}

/** What makes sense for a line after its building changed: items for other buildings, and modules it cannot have, are dropped. */
function tidyLine<L extends ProductionLine117>(line: L): L {
  const factory = factoriesById.get(line.building);
  const items = (line.items ?? []).filter((id) =>
    itemsById.get(id)?.targets.includes(line.building),
  );
  const tidy = {
    ...line,
    items,
    boostedItems: (line.boostedItems ?? []).filter((id) => items.includes(id)),
  };
  if (!factory?.aqueductBuff) tidy.aqueduct = false;
  if (!factory?.module) tidy.silo = false;
  return tidy;
}

/** The most times a repeatable discovery can be researched here. */
export const MAX_TECH_LEVEL = 99;

/** Techs as they are kept and saved: sorted, each once, except a repeatable one that is listed once per time researched. */
const SAVED_TECHS = (techs: readonly number[]) => {
  const times = new Map<number, number>();
  for (const id of techs) times.set(id, (times.get(id) ?? 0) + 1);
  return [...times.keys()]
    .sort((a, b) => a - b)
    .flatMap((id) =>
      Array<number>(
        techsById.get(id)?.repeatable
          ? Math.min(times.get(id)!, MAX_TECH_LEVEL)
          : 1,
      ).fill(id),
    );
};

/**
 * The Anno 117 calculator's world: islands, production lines and trade routes (see BaseWorldStore),
 * plus the techs researched. The rules that turn them into numbers are in game/rules.ts.
 */
export class WorldStore117 extends BaseWorldStore<
  Island117,
  ProductionLine117,
  TradeRoute117
> {
  readonly techs: WritableSignal<number[]>;
  /** The techs that are researched once or not at all (not the repeatable ones, which have a level). */
  readonly oneTimeTechs: Signal<number[]> = computed(() =>
    [...new Set(this.techs())].filter((id) => !techsById.get(id)?.repeatable),
  );

  private constructor(
    islands: Map<EntityId, StoredIsland<Island117>>,
    lines: Map<EntityId, StoredLine<ProductionLine117>>,
    routes: Map<EntityId, TradeRoute117>,
    techs: number[],
  ) {
    super(islands, lines, routes);
    this.techs = signal(techs);
  }

  static fromWorld(world: World117): WorldStore117 {
    const flat = flattenWorld<Island117, ProductionLine117, TradeRoute117>(
      world.islands,
      world.tradeRoutes,
    );
    return new WorldStore117(
      flat.islands,
      flat.productionLines,
      flat.tradeRoutes,
      SAVED_TECHS(world.techs ?? []),
    );
  }

  /** The world as it is saved: nested, with defaults left out. */
  toWorld(): World117 {
    const islands = nestWorld<Island117, ProductionLine117>(
      this.islands().values(),
      this.productionLines().values(),
      stripLine,
    ).map(stripIsland);
    return {
      ...(this.techs().length ? { techs: SAVED_TECHS(this.techs()) } : {}),
      islands: islands as Island117[],
      tradeRoutes: [...this.tradeRoutes().values()],
    };
  }

  protected newIsland(): Omit<StoredIsland<Island117>, 'id'> {
    return { name: 'New Island', session: LATIUM };
  }

  protected newProductionLine(islandId: EntityId): ProductionLine117 {
    const session = this.islands().get(islandId)?.session ?? LATIUM;
    return { building: factoriesForSession(session)[0].id, numBuildings: 1 };
  }

  protected newTradeRoute(): Omit<TradeRoute117, 'id'> {
    return { sourceIslandId: -1, targetIslandId: -1, good: '' };
  }

  protected override onProductionLineUpdated(
    updated: StoredLine<ProductionLine117>,
    patch: Partial<ProductionLine117>,
  ) {
    return 'building' in patch ? tidyLine(updated) : updated;
  }

  /** Moving an island to the other province swaps its buildings for that province's equivalents where there are some. */
  override updateIsland(
    id: EntityId,
    patch: Partial<Omit<StoredIsland<Island117>, 'id'>>,
  ): void {
    super.updateIsland(id, patch);
    if (patch.session === undefined) return;
    const session = patch.session;
    this.productionLines.update((lines) => {
      const next = new Map(lines);
      for (const [lineId, line] of lines) {
        const factory = factoriesById.get(line.building);
        const swap =
          line.islandId === id && factory
            ? counterpart(factory, session)
            : undefined;
        if (swap && swap.id !== line.building)
          next.set(lineId, tidyLine({ ...line, building: swap.id }));
      }
      return next;
    });
  }

  /** Replaces the techs researched once, leaving the levels of the repeatable ones as they are. */
  setOneTimeTechs(ids: readonly number[]): void {
    this.techs.update((techs) =>
      SAVED_TECHS([
        ...ids.filter((id) => !techsById.get(id)?.repeatable),
        ...techs.filter((id) => techsById.get(id)?.repeatable),
      ]),
    );
  }

  /** Replaces the researched techs. */
  setTechs(ids: readonly number[]): void {
    this.techs.set(SAVED_TECHS(ids));
  }

  /** How many times a repeatable discovery was researched. */
  setTechLevel(id: number, level: number): void {
    const times = Math.max(0, Math.min(MAX_TECH_LEVEL, Math.trunc(level) || 0));
    this.techs.update((techs) =>
      SAVED_TECHS([
        ...techs.filter((t) => t !== id),
        ...Array<number>(times).fill(id),
      ]),
    );
  }

  /** Marks a tech researched or not. */
  setTech(id: number, researched: boolean): void {
    this.techs.update((techs) =>
      researched ? SAVED_TECHS([...techs, id]) : techs.filter((t) => t !== id),
    );
  }
}

// --- Leaving out what is the default when saving ---

function stripLine(line: ProductionLine117): ProductionLine117 {
  const { items, boostedItems, aqueduct, silo, ...rest } = line;
  return {
    ...rest,
    ...(items?.length ? { items } : {}),
    ...(boostedItems?.length ? { boostedItems } : {}),
    ...(aqueduct ? { aqueduct } : {}),
    ...(silo ? { silo } : {}),
  };
}

function stripIsland<I extends Island117>(island: I): I {
  const { missingFertilities, patron, devotion, effects, ...rest } = island;
  return {
    ...rest,
    ...(missingFertilities?.length ? { missingFertilities } : {}),
    ...(patron != null ? { patron } : {}),
    ...(patron != null && devotion ? { devotion } : {}),
    ...(effects?.length ? { effects } : {}),
  } as I;
}

export { ALBION, LATIUM };
