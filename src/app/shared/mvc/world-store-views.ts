import { NumberConstituent } from '../../components/composite-number/composite-number';
import {
  Boost,
  Good,
  ProductionBuilding,
  DepartmentOfLaborPolicy,
  Region,
  Item,
  CulturalSet,
} from '../game/enums';
import {
  improvedByLandReformAct,
  improvedBySkilledLaborAct,
  lookupItemInfo,
  lookupProductionInfo,
  regionSupportsElectricty,
  buildingSupportsElectricity,
  lookupBoostInfo,
  lookupCulturalSetInfo,
} from '../game/facts';
import {
  lookupBoostIconUrl,
  lookupCulturalSetIconUrl,
  lookupHaciendaFertilizerWorksIconUrl,
  lookupItemIconUrl,
  lookupPolicyIconUrl,
} from '../game/icons';
import {
  DEFAULT_ISLAND_MODEL,
  DEFAULT_PRODUCTION_LINE_MODEL,
  Island,
  ExtraGood,
  DEFAULT_EXTRA_GOOD_MODEL,
  IslandId,
  ProductionLineId,
  TradeRoute,
  TradeRouteId,
} from './models';
import { ProductionLineEntity, WorldStore } from './world-store';

/**
 * Read-only, store-backed views of the world's entities, holding the app's
 * computed domain logic (efficiency, extra goods, produced/consumed rates,
 * ...). Each class takes a WorldStore and an id, reads the store's flat,
 * id-keyed maps, and reaches related entities by id lookup. They hold no
 * state of their own beyond the id and always re-read the store's current
 * maps, so they're cheap to construct.
 *
 * (Ported from the View classes in the now-deleted views.ts, which reached
 * related entities through a manually-threaded ViewContext instead; the
 * port was verified behaviorally identical with a side-by-side comparison
 * script when this file was added.)
 */

export class StoreExtraGoodView implements ExtraGood {
  constructor(
    private readonly model: ExtraGood,
    private readonly productionLine: StoreProductionLineView,
  ) {}

  get good(): Good {
    return this.model.good || this.productionLine.good;
  }

  get source():
    | Item
    | Boost
    | DepartmentOfLaborPolicy
    | 'Hacienda Fertilizer Works'
    | CulturalSet {
    return this.model.source ?? DEFAULT_EXTRA_GOOD_MODEL.source!;
  }

  get sourceType():
    | 'Item'
    | 'Boost'
    | 'ElectrifiedFarm'
    | 'DepartmentOfLaborPolicy'
    | 'HaciendaFertilizerWorks'
    | 'CulturalSet'
    | undefined {
    return this.model.sourceType ?? DEFAULT_EXTRA_GOOD_MODEL.sourceType;
  }

  get rateNumerator(): number {
    return this.model.rateNumerator ?? DEFAULT_EXTRA_GOOD_MODEL.rateNumerator!;
  }

  get rateDenominator(): number {
    return (
      this.model.rateDenominator ?? DEFAULT_EXTRA_GOOD_MODEL.rateDenominator!
    );
  }

  get rate(): number {
    return this.rateNumerator / this.rateDenominator;
  }

  get processTimeSeconds(): number {
    if (this.sourceType === 'ElectrifiedFarm') {
      return 60 / this.model.producedPerMinute!;
    }
    return this.productionLine.buildingProcessTimeSeconds;
  }

  get producedPerMinutePerBuilding(): number {
    return this.sourceType === 'ElectrifiedFarm'
      ? this.model.producedPerMinute!
      : (60 / this.processTimeSeconds) * this.rate;
  }

  get producedPerMinute(): number {
    return this.productionLine.numBuildings * this.producedPerMinutePerBuilding;
  }
}

function extraGoodSourceIconUrl(eg: StoreExtraGoodView): string {
  switch (eg.sourceType) {
    case 'Boost':
    case 'ElectrifiedFarm':
      return lookupBoostIconUrl(eg.source as Boost);
    case 'DepartmentOfLaborPolicy':
      return lookupPolicyIconUrl(eg.source as DepartmentOfLaborPolicy);
    case 'HaciendaFertilizerWorks':
      return lookupHaciendaFertilizerWorksIconUrl(null);
    case 'CulturalSet':
      return lookupCulturalSetIconUrl(eg.source as CulturalSet);
    default:
      return lookupItemIconUrl(eg.source as Item);
  }
}

export class StoreProductionLineView implements ProductionLineEntity {
  constructor(
    protected readonly store: WorldStore,
    protected readonly id_: ProductionLineId,
  ) {}

  private get model(): ProductionLineEntity {
    return this.store.productionLines().get(this.id_)!;
  }

  get id(): ProductionLineId {
    // Returns id_ directly rather than this.model.id: the two are always
    // equal while the entity exists, but this one stays readable after the
    // entity is removed from the store -- Angular's `@for (...; track
    // x.id)` re-reads the track key of already-removed items while
    // reconciling, and a store lookup there would throw.
    return this.id_;
  }

  get islandId(): IslandId {
    return this.model.islandId;
  }

  get island(): StoreIslandView {
    return new StoreIslandView(this.store, this.islandId);
  }

  get building(): ProductionBuilding {
    return this.model.building;
  }

  get inputGoods(): Good[] {
    return this.model.inputGoods ?? DEFAULT_PRODUCTION_LINE_MODEL.inputGoods!;
  }

  get good(): Good {
    return this.model.good;
  }

  get numBuildings(): number {
    return (
      this.model.numBuildings ?? DEFAULT_PRODUCTION_LINE_MODEL.numBuildings
    );
  }

  get boosts(): Boost[] {
    return this.model.boosts ?? DEFAULT_PRODUCTION_LINE_MODEL.boosts!;
  }

  get hasTradeUnion(): boolean {
    return (
      this.model.hasTradeUnion ?? DEFAULT_PRODUCTION_LINE_MODEL.hasTradeUnion!
    );
  }

  get items(): Item[] {
    return this.model.items ?? DEFAULT_PRODUCTION_LINE_MODEL.items!;
  }

  get itemProductivityBonus(): number {
    return (
      this.model.items
        ?.map((item) => (lookupItemInfo(item)?.productivityEffect ?? 0) / 100)
        ?.reduce((a, v) => a + v, 0) ?? 0
    );
  }

  get culturalSetProductivityBonus(): number {
    return (
      this.model.culturalSets
        ?.map(
          (set) => (lookupCulturalSetInfo(set)?.productivityEffect ?? 0) / 100,
        )
        ?.reduce((a, v) => a + v, 0) ?? 0
    );
  }

  get inRangeOfLocalDepartment(): boolean {
    return (
      this.model.inRangeOfLocalDepartment ??
      DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment!
    );
  }

  get inRangeOfHaciendaFertiliserWorks(): boolean {
    return (
      this.island.region == Region.NewWorld &&
      (this.model.inRangeOfHaciendaFertiliserWorks ?? false)
    );
  }

  get culturalSets(): CulturalSet[] {
    return (
      this.model.culturalSets ?? DEFAULT_PRODUCTION_LINE_MODEL.culturalSets!
    );
  }

  get efficiency(): number {
    let efficiency = 1;
    const boostSet = new Set<Boost>(this.boosts);
    if (
      regionSupportsElectricty(this.island.region ?? Region.Unknown) &&
      buildingSupportsElectricity(this.building) &&
      (boostSet.has(Boost.Electricity) ||
        this.items.some(
          (item) => lookupItemInfo(item)?.providesElectricity ?? false,
        ))
    ) {
      efficiency += 1;
      if (
        this.inRangeOfLocalDepartment &&
        this.island.dolPolicy == DepartmentOfLaborPolicy.GalvanicGrantsAct
      ) {
        efficiency += 0.5;
      }
    }
    if (boostSet.has(Boost.TractorBarn)) {
      efficiency += 2;
    }
    if (boostSet.has(Boost.Fertiliser)) {
      efficiency += 1;
    }
    if (boostSet.has(Boost.Silo)) {
      efficiency += 1;
    }

    if (this.hasTradeUnion) {
      if (
        this.inRangeOfLocalDepartment &&
        this.island.dolPolicy != DepartmentOfLaborPolicy.None
      ) {
        efficiency += this.store.tradeUnionBonus();
      }
      efficiency += this.itemProductivityBonus;
    }

    efficiency += this.culturalSetProductivityBonus;

    return efficiency;
  }

  get affectedByGalvanicGrants(): boolean {
    return (
      this.inRangeOfLocalDepartment &&
      this.island.dolPolicy == DepartmentOfLaborPolicy.GalvanicGrantsAct
    );
  }

  private pushTradeUnionEfficiencyConstituents_(
    constituents: NumberConstituent[],
  ): void {
    if (
      this.inRangeOfLocalDepartment &&
      this.island.dolPolicy != DepartmentOfLaborPolicy.None
    ) {
      constituents.push({
        value: this.store.tradeUnionBonus(),
        description: 'Palace Trade Union Bonus',
        iconUrl: '/icons/others/palace.png',
      });
    }
    for (const item of this.items) {
      const itemInfo = lookupItemInfo(item)!;
      if ((itemInfo.productivityEffect ?? 0) > 0) {
        constituents.push({
          value: itemInfo.productivityEffect! / 100,
          description: item,
          iconUrl: lookupItemIconUrl(item),
        });
      }
    }
  }

  private pushBoostEfficiencyConstituents_(
    constituents: NumberConstituent[],
  ): void {
    const boostSet = new Set<Boost>(this.boosts);
    if (
      regionSupportsElectricty(this.island.region ?? Region.Unknown) &&
      buildingSupportsElectricity(this.building) &&
      (boostSet.has(Boost.Electricity) ||
        this.items.some(
          (item) => lookupItemInfo(item)?.providesElectricity ?? false,
        ))
    ) {
      constituents.push({
        value: 1,
        description: 'Electricity',
        iconUrl: lookupBoostIconUrl(Boost.Electricity),
      });
      if (this.affectedByGalvanicGrants) {
        constituents.push({
          value: 0.5,
          description: DepartmentOfLaborPolicy.GalvanicGrantsAct,
          iconUrl: lookupPolicyIconUrl(
            DepartmentOfLaborPolicy.GalvanicGrantsAct,
          ),
        });
      }
    }
    if (boostSet.has(Boost.TractorBarn)) {
      constituents.push({
        value: 2,
        description: Boost.TractorBarn,
        iconUrl: lookupBoostIconUrl(Boost.TractorBarn),
      });
    }
    if (boostSet.has(Boost.Fertiliser)) {
      constituents.push({
        value: 1,
        description: Boost.Fertiliser,
        iconUrl: lookupBoostIconUrl(Boost.Fertiliser),
      });
    }
    if (boostSet.has(Boost.Silo)) {
      constituents.push({
        value: 1,
        description: Boost.Silo,
        iconUrl: lookupBoostIconUrl(Boost.Silo),
      });
    }
  }

  get efficiencyConstituents(): NumberConstituent[] {
    const constituents: NumberConstituent[] = [
      { value: 1, description: 'Base Productivity' },
    ];

    this.pushBoostEfficiencyConstituents_(constituents);

    if (this.hasTradeUnion) {
      this.pushTradeUnionEfficiencyConstituents_(constituents);
    }

    for (const set of this.culturalSets) {
      const setInfo = lookupCulturalSetInfo(set)!;
      if ((setInfo.productivityEffect ?? 0) > 0) {
        constituents.push({
          value: setInfo.productivityEffect! / 100,
          description: set,
          iconUrl: lookupCulturalSetIconUrl(set),
        });
      }
    }

    return constituents;
  }

  /** The building's process time before efficiency is applied. */
  get baseBuildingProcessTimeSeconds(): number {
    return lookupProductionInfo(this.building)?.processingTimeSeconds ?? 0;
  }

  get buildingProcessTimeSeconds(): number {
    return this.baseBuildingProcessTimeSeconds / this.efficiency;
  }

  get extraGoods(): StoreExtraGoodView[] {
    const extraGoods = [];

    if (this.inRangeOfHaciendaFertiliserWorks) {
      extraGoods.push(
        new StoreExtraGoodView(
          {
            good: Good.Dung,
            source: 'Hacienda Fertilizer Works',
            sourceType: 'HaciendaFertilizerWorks',
            rateNumerator: 1,
            rateDenominator: 3,
          },
          this,
        ),
      );
    }

    extraGoods.push(
      ...this.electricityExtraGoods,
      ...this.bonusExtraGoods,
      ...this.itemExtraGoods,
      ...this.culturalSetExtraGoods,
    );
    return extraGoods;
  }

  get bonusExtraGoods(): StoreExtraGoodView[] {
    const extraGoods: StoreExtraGoodView[] = [];

    if (this.hasTradeUnion && this.inRangeOfLocalDepartment) {
      if (
        improvedByLandReformAct.has(this.building) &&
        this.island.dolPolicy == DepartmentOfLaborPolicy.LandReformAct
      ) {
        // 1 extra good for every 2 produced.
        extraGoods.push(
          new StoreExtraGoodView(
            {
              good: this.good,
              source: DepartmentOfLaborPolicy.LandReformAct,
              sourceType: 'DepartmentOfLaborPolicy',
              rateNumerator: 1,
              rateDenominator: 2,
            },
            this,
          ),
        );
      } else if (
        improvedBySkilledLaborAct.has(this.building) &&
        this.island.dolPolicy == DepartmentOfLaborPolicy.SkilledLaborAct
      ) {
        extraGoods.push(
          new StoreExtraGoodView(
            {
              good: this.good,
              source: DepartmentOfLaborPolicy.SkilledLaborAct,
              sourceType: 'DepartmentOfLaborPolicy',
              rateNumerator: 1,
              rateDenominator: 3,
            },
            this,
          ),
        );
      }
    }

    for (const boost of this.boosts) {
      const boostInfo = lookupBoostInfo(boost)!;
      if (boostInfo.extraGood) {
        extraGoods.push(
          new StoreExtraGoodView(
            {
              good: this.good,
              source: boost,
              sourceType: 'Boost',
              rateNumerator: boostInfo.extraGood?.rateNumerator,
              rateDenominator: boostInfo.extraGood?.rateDenominator,
            },
            this,
          ),
        );
      }
    }
    return extraGoods;
  }

  get electricityExtraGoods(): StoreExtraGoodView[] {
    if (!this.boosts.includes(Boost.Electricity)) {
      return [];
    }
    const productionInfo = lookupProductionInfo(this.building);
    const extraGoods: StoreExtraGoodView[] = [];
    for (const eeg of productionInfo?.electricityExtraGoods ?? []) {
      extraGoods.push(
        new StoreExtraGoodView(
          {
            good: eeg.good,
            source: Boost.Electricity,
            sourceType: 'ElectrifiedFarm',
            producedPerMinute: 60 / eeg.processingTimeSeconds,
          },
          this,
        ),
      );
    }
    return extraGoods;
  }

  get itemExtraGoods(): StoreExtraGoodView[] {
    const extraGoods: StoreExtraGoodView[] = [];
    for (const item of this.items) {
      const itemInfo = lookupItemInfo(item);
      for (const eg of itemInfo?.extraGoods ?? []) {
        extraGoods.push(new StoreExtraGoodView({ ...eg, source: item }, this));
      }
    }
    extraGoods.sort((eg1, eg2) => {
      const goodNameCmp = eg1.good.localeCompare(eg2.good);
      if (goodNameCmp != 0) {
        return goodNameCmp;
      }
      return (
        eg2.rateNumerator / eg2.rateDenominator -
        eg1.rateNumerator / eg1.rateDenominator
      );
    });
    return extraGoods;
  }

  get culturalSetExtraGoods(): StoreExtraGoodView[] {
    const extraGoods: StoreExtraGoodView[] = [];
    for (const set of this.culturalSets) {
      const setInfo = lookupCulturalSetInfo(set);
      for (const eg of setInfo?.extraGoods ?? []) {
        extraGoods.push(
          new StoreExtraGoodView(
            { ...eg, sourceType: 'CulturalSet', source: set },
            this,
          ),
        );
      }
    }
    extraGoods.sort((eg1, eg2) => {
      const goodNameCmp = eg1.good.localeCompare(eg2.good);
      if (goodNameCmp != 0) {
        return goodNameCmp;
      }
      return (
        eg2.rateNumerator / eg2.rateDenominator -
        eg1.rateNumerator / eg1.rateDenominator
      );
    });
    return extraGoods;
  }

  get goodsConsumedPerMinute(): number {
    return (this.numBuildings * 60) / this.buildingProcessTimeSeconds;
  }

  get goodsProducedPerMinute(): number {
    return (this.numBuildings * 60) / this.buildingProcessTimeSeconds;
  }

  /**
   * Explains goodsProducedPerMinuteWithExtras: the building's base output plus
   * what each extra good of the same good adds. The values sum to the total.
   */
  get goodsProducedPerMinuteConstituents(): NumberConstituent[] {
    const baseProducedPerMinute = this.goodsProducedPerMinute;
    // buildings x 60s / (base process time / efficiency), spelled out with
    // language-neutral math so no extra text needs localizing.
    const constituents: NumberConstituent[] = [
      {
        value: baseProducedPerMinute,
        description: 'Base Production',
        detail: [
          { value: this.numBuildings },
          '×',
          { value: 60, unit: 's' },
          '÷',
          '(',
          { value: this.baseBuildingProcessTimeSeconds, unit: 's' },
          '÷',
          { value: this.efficiency, isPercent: true },
          ')',
        ],
      },
    ];
    for (const eg of this.extraGoods) {
      if (eg.good !== this.good) {
        continue;
      }
      constituents.push({
        value: baseProducedPerMinute * (eg.rateNumerator / eg.rateDenominator),
        description: eg.source,
        iconUrl: extraGoodSourceIconUrl(eg),
        detail: [
          { value: eg.rateNumerator },
          '/',
          { value: eg.rateDenominator },
          '×',
          { value: baseProducedPerMinute, unit: '/m' },
        ],
      });
    }
    return constituents;
  }

  get goodsProducedPerMinuteWithExtras(): number {
    return this.goodsProducedPerMinuteConstituents.reduce(
      (total, c) => total + c.value,
      0,
    );
  }

  get islandHasDepartmentOfLabor(): boolean {
    return this.island.dolPolicy != DepartmentOfLaborPolicy.None;
  }

  get region(): Region {
    return this.island.region ?? Region.Unknown;
  }
}

export class StoreTradeRouteView implements TradeRoute {
  constructor(
    protected readonly store: WorldStore,
    protected readonly id_: TradeRouteId,
  ) {}

  private get model(): TradeRoute {
    return this.store.tradeRoutes().get(this.id_)!;
  }

  get id(): TradeRouteId {
    // Returns id_ directly rather than this.model.id: the two are always
    // equal while the entity exists, but this one stays readable after the
    // entity is removed from the store -- Angular's `@for (...; track
    // x.id)` re-reads the track key of already-removed items while
    // reconciling, and a store lookup there would throw.
    return this.id_;
  }

  get sourceIslandId(): IslandId {
    return this.model.sourceIslandId;
  }

  get sourceIsland(): StoreIslandView {
    return new StoreIslandView(this.store, this.model.sourceIslandId);
  }

  get targetIslandId(): IslandId {
    return this.model.targetIslandId;
  }

  get targetIsland(): StoreIslandView {
    return new StoreIslandView(this.store, this.model.targetIslandId);
  }

  get good(): Good {
    return this.model.good;
  }
}

export class StoreIslandView implements Island {
  constructor(
    protected readonly store: WorldStore,
    protected readonly id_: IslandId,
  ) {}

  private get model(): Island {
    return this.store.islands().get(this.id_)!;
  }

  get id(): IslandId {
    // Returns id_ directly rather than this.model.id: the two are always
    // equal while the entity exists, but this one stays readable after the
    // entity is removed from the store -- Angular's `@for (...; track
    // x.id)` re-reads the track key of already-removed items while
    // reconciling, and a store lookup there would throw.
    return this.id_;
  }

  get name(): string {
    return this.model.name;
  }

  get region(): Region {
    return this.model.region ?? DEFAULT_ISLAND_MODEL.region!;
  }

  /** This island's production lines, looked up by islandId rather than a nested array -- see ProductionLineEntity in world-store.ts. */
  get productionLines(): StoreProductionLineView[] {
    return [...this.store.productionLines().values()]
      .filter((pl) => pl.islandId === this.id_)
      .map((pl) => new StoreProductionLineView(this.store, pl.id!));
  }

  get dolPolicy(): DepartmentOfLaborPolicy {
    return this.model.dolPolicy ?? DEFAULT_ISLAND_MODEL.dolPolicy!;
  }

  get outgoingTradeRoutes(): StoreTradeRouteView[] {
    return [...this.store.tradeRoutes().values()]
      .filter((tr) => tr.sourceIslandId == this.id_)
      .map((tr) => new StoreTradeRouteView(this.store, tr.id));
  }

  get incomingTradeRoutes(): StoreTradeRouteView[] {
    return [...this.store.tradeRoutes().values()]
      .filter((tr) => tr.targetIslandId == this.id_)
      .map((tr) => new StoreTradeRouteView(this.store, tr.id));
  }

  get producedGoods(): Good[] {
    const productionLines = [...this.store.productionLines().values()].filter(
      (pl) => pl.islandId === this.id_,
    );
    return Array.from(
      new Set<Good>(
        productionLines.flatMap((pl) => {
          const goods = [pl.good];
          pl.items
            ?.flatMap((item) => lookupItemInfo(item)?.extraGoods ?? [])
            ?.forEach((eg) => goods.push(eg.good ?? pl.good));
          return goods;
        }),
      ),
    );
  }
}

/** Store-backed equivalent of WorldView -- see the module doc comment above. */
export class StoreWorldView {
  constructor(private readonly store: WorldStore) {}

  get tradeUnionBonus(): number {
    return this.store.tradeUnionBonus();
  }

  get islands(): StoreIslandView[] {
    return [...this.store.islands().keys()].map(
      (id) => new StoreIslandView(this.store, id),
    );
  }

  lookupIslandById(id: IslandId): StoreIslandView {
    return new StoreIslandView(this.store, id);
  }

  get tradeRoutes(): StoreTradeRouteView[] {
    return [...this.store.tradeRoutes().keys()].map(
      (id) => new StoreTradeRouteView(this.store, id),
    );
  }

  lookupTradeRoutesStartingFrom(
    island: IslandId | StoreIslandView,
  ): StoreTradeRouteView[] {
    const id = typeof island === 'number' ? island : island.id;
    return [...this.store.tradeRoutes().values()]
      .filter((tr) => tr.sourceIslandId == id)
      .map((tr) => new StoreTradeRouteView(this.store, tr.id));
  }

  lookupTradeRoutesEndingAt(
    island: IslandId | StoreIslandView,
  ): StoreTradeRouteView[] {
    const id = typeof island === 'number' ? island : island.id;
    return [...this.store.tradeRoutes().values()]
      .filter((tr) => tr.targetIslandId == id)
      .map((tr) => new StoreTradeRouteView(this.store, tr.id));
  }
}
