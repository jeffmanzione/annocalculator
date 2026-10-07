import {
  BaseWorldController,
  IslandLineControllers,
} from '../../../shared/engine/base-controllers';
import { GoodId } from '../../game';
import { Anno117Factory } from '../game/data-types';
import { factoriesById } from '../game/data';
import {
  buffContributions,
  BuffContribution,
  BuffSource,
  extraOutputDetails,
  extraOutputsPerCycle,
  fertilityFactor,
  fuelPerMinute,
  inputProducts,
  IslandSettings,
  LineSettings,
  moduleInputsPerMinute,
  productivity,
  WorldSettings,
} from '../game/rules';
import { Island117, ProductionLine117, TradeRoute117 } from './models';
import { regionOfSession, WorldStore117 } from './world-store-117';
import { anno117Data } from '../game/data';

/**
 * What a list of ids reads as when nothing is set. It is one shared array, not a new [] on every read: a
 * form control that is handed a new array each time believes the value changed and writes it back, forever.
 */
const NO_IDS: number[] = Object.freeze([]) as unknown as number[];

/** The id a product has as a "good" in the shared calculator pieces. */
export const goodIdOf = (product: number): GoodId => String(product);

/**
 * Read and write access to a world kept in a WorldStore117, one class per kind of entity (as in the
 * Anno 1800 calculator). Everything is read from the store's signals, so anything computed from these
 * getters updates by itself when the world changes. Controllers are cached per id, so that a component
 * showing one keeps getting the same object.
 */

export class Line117Controller {
  constructor(
    protected readonly store: WorldStore117,
    readonly id: number,
  ) {}

  protected get line() {
    return this.store.productionLines().get(this.id)!;
  }

  private get islandEntity() {
    return this.store.islands().get(this.line.islandId)!;
  }

  get islandId(): number {
    return this.line.islandId;
  }

  // --- What is set ---

  get building(): number {
    return this.line.building;
  }
  set building(value: number) {
    this.store.updateProductionLine(this.id, { building: value });
  }

  get numBuildings(): number {
    return this.line.numBuildings;
  }
  set numBuildings(value: number) {
    this.store.updateProductionLine(this.id, {
      numBuildings: Math.max(0, Math.trunc(value)),
    });
  }

  get items(): number[] {
    return this.line.items ?? NO_IDS;
  }
  set items(value: number[]) {
    const boosted = this.boostedItems.filter((id) => value.includes(id));
    this.store.updateProductionLine(this.id, {
      items: value,
      boostedItems: boosted,
    });
  }

  get boostedItems(): number[] {
    return this.line.boostedItems ?? NO_IDS;
  }
  set boostedItems(value: number[]) {
    this.store.updateProductionLine(this.id, { boostedItems: value });
  }

  get aqueduct(): boolean {
    return !!this.line.aqueduct && this.canHaveAqueduct;
  }
  set aqueduct(value: boolean) {
    this.store.updateProductionLine(this.id, { aqueduct: value });
  }

  get silo(): boolean {
    return !!this.line.silo && this.canHaveSilo;
  }
  set silo(value: boolean) {
    this.store.updateProductionLine(this.id, { silo: value });
  }

  // --- What the building is ---

  get factory(): Anno117Factory {
    return factoriesById.get(this.line.building)!;
  }
  get canHaveAqueduct(): boolean {
    return !!this.factory?.aqueductBuff;
  }
  get canHaveSilo(): boolean {
    return !!this.factory?.module;
  }

  // --- What it works out to ---

  get lineSettings(): LineSettings {
    return {
      building: this.line.building,
      items: this.items,
      boostedItems: this.boostedItems,
      aqueduct: this.aqueduct,
      silo: this.silo,
    };
  }

  private get islandSettings(): IslandSettings {
    return islandSettingsOf(this.islandEntity);
  }

  private get worldSettings(): WorldSettings {
    return { techs: this.store.techs() };
  }

  /** Every buff acting on the line, with where it comes from. */
  get contributions(): BuffContribution[] {
    return buffContributions(
      this.lineSettings,
      this.islandSettings,
      this.worldSettings,
    );
  }

  get fertilityFactor(): number {
    return fertilityFactor(
      this.factory,
      this.islandSettings,
      this.worldSettings,
    );
  }

  /** The line's productivity as a multiple (1 = 100%). */
  get efficiency(): number {
    return productivity(this.contributions, this.fertilityFactor);
  }

  get processTimeSeconds(): number {
    return this.factory.cycleTime / this.efficiency;
  }

  private get cyclesPerMinutePerBuilding(): number {
    return (60 / this.factory.cycleTime) * this.efficiency;
  }

  /** The product the line makes, as a good id. */
  get good(): GoodId {
    return goodIdOf(this.factory.outputs[0].product);
  }

  /** The products it uses, after any item has swapped one. */
  get inputGoods(): GoodId[] {
    return inputProducts(this.factory, this.contributions).map(goodIdOf);
  }

  get goodsProducedPerMinute(): number {
    return (
      this.numBuildings *
      this.cyclesPerMinutePerBuilding *
      this.factory.outputs[0].amount
    );
  }

  /** What it uses of each input per minute (every recipe takes one of each input per cycle). */
  get goodsConsumedPerMinute(): number {
    return this.numBuildings * this.cyclesPerMinutePerBuilding;
  }

  /** Extra output on top of the recipe, such as a silo's extra animal every third cycle. */
  get extraGoods(): { good: GoodId; producedPerMinute: number }[] {
    return extraOutputsPerCycle(this.factory, this.contributions).map(
      ({ product, perCycle }) => ({
        good: goodIdOf(product),
        producedPerMinute:
          this.numBuildings * this.cyclesPerMinutePerBuilding * perCycle,
      }),
    );
  }

  /** Each extra output with its source and rate, for the extra goods table. */
  get extraGoodRows(): {
    good: GoodId;
    source: BuffSource;
    sourceId: number;
    amount: number;
    everyCycles: number;
    producedPerMinute: number;
  }[] {
    return extraOutputDetails(this.factory, this.contributions).map((e) => ({
      good: goodIdOf(e.product),
      source: e.source,
      sourceId: e.sourceId,
      amount: e.amount,
      everyCycles: e.everyCycles,
      producedPerMinute:
        (this.numBuildings * this.cyclesPerMinutePerBuilding * e.amount) /
        e.everyCycles,
    }));
  }

  /** What the line uses besides its recipe: coal for fuel, and the silo's feed. */
  get extraConsumption(): { good: GoodId; perMinute: number }[] {
    const fuel =
      fuelPerMinute(this.factory, this.contributions) * this.numBuildings;
    const module = moduleInputsPerMinute(this.lineSettings, this.factory).map(
      ({ product, perMinute }) => ({
        good: goodIdOf(product),
        perMinute: perMinute * this.numBuildings,
      }),
    );
    return [
      ...(fuel > 0
        ? [
            {
              good: goodIdOf(anno117Data.constants.fuelProduct),
              perMinute: fuel,
            },
          ]
        : []),
      ...module,
    ];
  }
}

export function islandSettingsOf(
  island: Pick<
    Island117,
    'missingFertilities' | 'patron' | 'devotion' | 'effects'
  >,
): IslandSettings {
  return {
    missingFertilities: island.missingFertilities ?? NO_IDS,
    patron: island.patron ?? null,
    devotion: island.devotion ?? 0,
    effects: island.effects ?? NO_IDS,
  };
}

export class Island117Controller {
  private readonly lines_: IslandLineControllers<Line117Controller>;

  constructor(
    private readonly store: WorldStore117,
    readonly id: number,
  ) {
    this.lines_ = new IslandLineControllers(
      store,
      id,
      (lineId) => new Line117Controller(store, lineId),
    );
  }

  private get island() {
    return this.store.islands().get(this.id)!;
  }

  get name(): string {
    return this.island.name;
  }
  set name(value: string) {
    this.store.updateIsland(this.id, { name: value });
  }

  get session(): number {
    return this.island.session;
  }
  set session(value: number) {
    this.store.updateIsland(this.id, { session: value });
  }

  get region(): string {
    return regionOfSession(this.island.session);
  }

  get missingFertilities(): number[] {
    return this.island.missingFertilities ?? NO_IDS;
  }
  set missingFertilities(value: number[]) {
    this.store.updateIsland(this.id, { missingFertilities: value });
  }

  get patron(): number | null {
    return this.island.patron ?? null;
  }
  set patron(value: number | null) {
    this.store.updateIsland(this.id, { patron: value ?? undefined });
  }

  get devotion(): number {
    return this.island.devotion ?? 0;
  }
  set devotion(value: number) {
    this.store.updateIsland(this.id, {
      devotion: Math.max(0, Math.trunc(value) || 0),
    });
  }

  get effects(): number[] {
    return this.island.effects ?? NO_IDS;
  }
  set effects(value: number[]) {
    this.store.updateIsland(this.id, { effects: value });
  }

  get productionLines(): Line117Controller[] {
    return this.lines_.list();
  }

  lineController(id: number): Line117Controller {
    return this.lines_.get(id);
  }

  addProductionLine(): Line117Controller {
    return this.lines_.add();
  }

  removeProductionLine(id: number): void {
    this.lines_.remove(id);
  }

  /** Everything the island makes, for the goods a trade route can carry. */
  get producedGoods(): GoodId[] {
    const goods = new Set<GoodId>();
    for (const line of this.productionLines) {
      goods.add(line.good);
      line.extraGoods.forEach((extra) => goods.add(extra.good));
    }
    return [...goods];
  }
}

export class TradeRoute117Controller {
  constructor(
    private readonly store: WorldStore117,
    readonly id: number,
  ) {}

  private get route(): TradeRoute117 {
    return this.store.tradeRoutes().get(this.id)!;
  }

  get sourceIslandId(): number {
    return this.route.sourceIslandId;
  }
  set sourceIslandId(value: number) {
    this.store.updateTradeRoute(this.id, { sourceIslandId: value });
  }

  get targetIslandId(): number {
    return this.route.targetIslandId;
  }
  set targetIslandId(value: number) {
    this.store.updateTradeRoute(this.id, { targetIslandId: value });
  }

  get good(): GoodId {
    return this.route.good;
  }
  set good(value: GoodId) {
    this.store.updateTradeRoute(this.id, { good: value });
  }
}

export class World117Controller extends BaseWorldController<
  WorldStore117,
  Island117Controller,
  TradeRoute117Controller
> {
  protected override createIslandController(id: number): Island117Controller {
    return new Island117Controller(this.store, id);
  }

  protected override createTradeRouteController(
    id: number,
  ): TradeRoute117Controller {
    return new TradeRoute117Controller(this.store, id);
  }

  get techs(): number[] {
    return this.store.techs();
  }
  set techs(value: number[]) {
    this.store.setTechs(value);
  }

  /** The techs researched once, which the discoveries list shows (a repeatable one has a level instead). */
  get oneTimeTechs(): number[] {
    return this.store.oneTimeTechs();
  }
  set oneTimeTechs(value: number[]) {
    this.store.setOneTimeTechs(value);
  }

  techLevel(id: number): number {
    return this.store.techs().filter((t) => t === id).length;
  }
  setTechLevel(id: number, level: number): void {
    this.store.setTechLevel(id, level);
  }

  setTech(id: number, researched: boolean): void {
    this.store.setTech(id, researched);
  }
}

export type { Island117, ProductionLine117 };
