import { NumberConstituent } from '../../components/composite-number/composite-number';
import {
  Boost,
  Good,
  ProductionBuilding,
  DepartmentOfLaborPolicy,
  Region,
  Item,
} from '../game/enums';
import {
  improvedByLandReformAct,
  improvedBySkilledLaborAct,
  lookupItemInfo,
  lookupProductionInfo,
  regionSupportsElectricty,
  buildingSupportsElectricity,
  lookupBoostInfo,
} from '../game/facts';
import {
  DEFAULT_ISLAND_MODEL,
  DEFAULT_PRODUCTION_LINE_MODEL,
  DEFAULT_WORLD_MODEL,
  Island,
  Model,
  ProductionLine,
  World,
  TradeRoute,
  IslandId,
  TradeRouteId,
  ExtraGood,
  DEFAULT_EXTRA_GOOD_MODEL,
} from './models';

export interface ViewContext {
  world?: WorldView;
  island?: IslandView;
  productionLine?: ProductionLineView;
}

export abstract class View<M extends Model> {
  protected constructor(
    protected model: M,
    protected context: ViewContext,
  ) {}

  asView(): this {
    return this;
  }

  toJsonString(): string {
    return JSON.stringify(this.model);
  }
}

export class ExtraGoodView extends View<ExtraGood> implements ExtraGood {
  static wrap(model: ExtraGood, context: ViewContext): ExtraGoodView {
    return new ExtraGoodView(model, context);
  }

  get good(): Good {
    return this.model.good || this.context.productionLine?.good!;
  }

  get source():
    | Item
    | Boost
    | DepartmentOfLaborPolicy
    | 'Hacienda Fertilizer Works' {
    return this.model.source ?? DEFAULT_EXTRA_GOOD_MODEL.source!;
  }

  get sourceType():
    | 'Item'
    | 'Boost'
    | 'ElectrifiedFarm'
    | 'DepartmentOfLaborPolicy'
    | 'HaciendaFertilizerWorks'
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
    return this.context.productionLine!.buildingProcessTimeSeconds;
  }

  get producedPerMinutePerBuilding(): number {
    return this.sourceType === 'ElectrifiedFarm'
      ? this.model.producedPerMinute!
      : (60 / this.processTimeSeconds) * this.rate;
  }

  get producedPerMinute(): number {
    return (
      this.context.productionLine!.numBuildings *
      this.producedPerMinutePerBuilding
    );
  }
}

export class ProductionLineView
  extends View<ProductionLine>
  implements ProductionLine
{
  static wrap(model: ProductionLine, context: ViewContext): ProductionLineView {
    return new ProductionLineView(model, context);
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

  get inRangeOfLocalDepartment(): boolean {
    return (
      this.model.inRangeOfLocalDepartment ??
      DEFAULT_PRODUCTION_LINE_MODEL.inRangeOfLocalDepartment!
    );
  }

  get inRangeOfHaciendaFertiliserWorks(): boolean {
    return (
      this.context.island?.region == Region.NewWorld &&
      (this.model.inRangeOfHaciendaFertiliserWorks ?? false)
    );
  }

  get efficiency(): number {
    let efficiency = 1;
    const boostSet = new Set<Boost>(this.boosts);
    if (
      regionSupportsElectricty(this.context.island?.region ?? Region.Unknown) &&
      buildingSupportsElectricity(this.building) &&
      (boostSet.has(Boost.Electricity) ||
        this.items.some(
          (item) => lookupItemInfo(item)?.providesElectricity ?? false,
        ))
    ) {
      efficiency += 1;
      if (
        this.inRangeOfLocalDepartment &&
        this.context.island!.dolPolicy ==
          DepartmentOfLaborPolicy.GalvanicGrantsAct
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
        this.context.island!.dolPolicy != DepartmentOfLaborPolicy.None
      ) {
        efficiency += this.context.world!.tradeUnionBonus;
      }
      efficiency += this.itemProductivityBonus;
    }
    return efficiency;
  }

  get affectedByGalvanicGrants(): boolean {
    return (
      this.inRangeOfLocalDepartment &&
      this.context.island!.dolPolicy ==
        DepartmentOfLaborPolicy.GalvanicGrantsAct
    );
  }

  get efficiencyConstituents(): NumberConstituent[] {
    const constituents: NumberConstituent[] = [
      { value: 1, description: 'Base Productivity' },
    ];

    const boostSet = new Set<Boost>(this.boosts);
    if (
      regionSupportsElectricty(this.context.island?.region ?? Region.Unknown) &&
      buildingSupportsElectricity(this.building) &&
      (boostSet.has(Boost.Electricity) ||
        this.items.some(
          (item) => lookupItemInfo(item)?.providesElectricity ?? false,
        ))
    ) {
      constituents.push({ value: 1, description: 'Electricity' });
      if (this.affectedByGalvanicGrants) {
        constituents.push({
          value: 0.5,
          description: DepartmentOfLaborPolicy.GalvanicGrantsAct,
        });
      }
    }
    if (boostSet.has(Boost.TractorBarn)) {
      constituents.push({ value: 2, description: Boost.TractorBarn });
    }
    if (boostSet.has(Boost.Fertiliser)) {
      constituents.push({ value: 1, description: Boost.Fertiliser });
    }
    if (boostSet.has(Boost.Silo)) {
      constituents.push({ value: 1, description: Boost.Silo });
    }

    if (this.hasTradeUnion) {
      if (
        this.inRangeOfLocalDepartment &&
        this.context.island!.dolPolicy != DepartmentOfLaborPolicy.None
      ) {
        constituents.push({
          value: this.context.world!.tradeUnionBonus,
          description: 'Palace Trade Union Bonus',
        });
      }
      for (const item of this.items) {
        const itemInfo = lookupItemInfo(item)!;
        if ((itemInfo.productivityEffect ?? 0) > 0) {
          constituents.push({
            value: itemInfo.productivityEffect! / 100,
            description: item,
          });
        }
      }
    }
    return constituents;
  }

  get buildingProcessTimeSeconds(): number {
    return (
      (lookupProductionInfo(this.building)?.processingTimeSeconds ?? 0) /
      this.efficiency
    );
  }

  get extraGoods(): ExtraGoodView[] {
    const extraGoods = [];

    if (this.inRangeOfHaciendaFertiliserWorks) {
      extraGoods.push(
        ExtraGoodView.wrap(
          {
            good: Good.Dung,
            source: 'Hacienda Fertilizer Works',
            sourceType: 'HaciendaFertilizerWorks',
            rateNumerator: 1,
            rateDenominator: 3,
          },
          { productionLine: this, ...this.context },
        ),
      );
    }

    extraGoods.push(
      ...this.electricityExtraGoods,
      ...this.bonusExtraGoods,
      ...this.itemExtraGoods,
    );
    return extraGoods;
  }

  get bonusExtraGoods(): ExtraGoodView[] {
    const extraGoods: ExtraGoodView[] = [];

    if (this.hasTradeUnion && this.inRangeOfLocalDepartment) {
      if (
        improvedByLandReformAct.has(this.building) &&
        this.context.island?.dolPolicy == DepartmentOfLaborPolicy.LandReformAct
      ) {
        // 1 extra good for every 2 produced.
        extraGoods.push(
          ExtraGoodView.wrap(
            {
              good: this.good,
              source: DepartmentOfLaborPolicy.LandReformAct,
              sourceType: 'DepartmentOfLaborPolicy',
              rateNumerator: 1,
              rateDenominator: 2,
            },
            { productionLine: this, ...this.context },
          ),
        );
      } else if (
        improvedBySkilledLaborAct.has(this.building) &&
        this.context.island?.dolPolicy ==
          DepartmentOfLaborPolicy.SkilledLaborAct
      ) {
        extraGoods.push(
          ExtraGoodView.wrap(
            {
              good: this.good,
              source: DepartmentOfLaborPolicy.SkilledLaborAct,
              sourceType: 'DepartmentOfLaborPolicy',
              rateNumerator: 1,
              rateDenominator: 3,
            },
            { productionLine: this, ...this.context },
          ),
        );
      }
    }

    for (const boost of this.boosts) {
      const boostInfo = lookupBoostInfo(boost)!;
      extraGoods.push(
        ExtraGoodView.wrap(
          {
            good: this.good,
            source: boost,
            sourceType: 'Boost',
            rateNumerator: boostInfo.extraGood?.rateNumerator,
            rateDenominator: boostInfo.extraGood?.rateDenominator,
          },
          { productionLine: this, ...this.context },
        ),
      );
    }
    return extraGoods;
  }

  get electricityExtraGoods(): ExtraGoodView[] {
    if (!this.boosts.includes(Boost.Electricity)) {
      return [];
    }
    const productionInfo = lookupProductionInfo(this.building);
    const extraGoods: ExtraGoodView[] = [];
    for (const eeg of productionInfo?.electricityExtraGoods ?? []) {
      extraGoods.push(
        ExtraGoodView.wrap(
          {
            good: eeg.good,
            source: Boost.Electricity,
            sourceType: 'ElectrifiedFarm',
            producedPerMinute: 60 / eeg.processingTimeSeconds,
          },
          { productionLine: this, ...this.context },
        ),
      );
    }
    return extraGoods;
  }

  get itemExtraGoods(): ExtraGoodView[] {
    const extraGoods: ExtraGoodView[] = [];
    for (const item of this.items) {
      const itemInfo = lookupItemInfo(item);
      for (const eg of itemInfo?.extraGoods ?? []) {
        extraGoods.push(
          ExtraGoodView.wrap(
            { ...eg, source: item },
            { productionLine: this, ...this.context },
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

  get goodsProducedPerMinuteWithExtras(): number {
    const extraGoods = this.extraGoods;
    let rateModifier = 1;

    for (const eg of extraGoods) {
      if (eg.good !== this.good) {
        continue;
      }
      rateModifier *=
        (eg.rateNumerator + eg.rateDenominator) / eg.rateDenominator;
    }
    return this.goodsProducedPerMinute * rateModifier;
  }

  get islandHasDepartmentOfLabor(): boolean {
    return this.context.island?.dolPolicy != DepartmentOfLaborPolicy.None;
  }

  get region(): Region {
    return this.context.island?.region ?? Region.Unknown;
  }
}

export class TradeRouteView extends View<TradeRoute> implements TradeRoute {
  static wrap(model: TradeRoute, context: ViewContext): TradeRouteView {
    return new TradeRouteView(model, context);
  }

  get id(): TradeRouteId {
    return this.model.id;
  }

  get sourceIslandId(): IslandId {
    return this.model.sourceIslandId;
  }

  get sourceIsland(): IslandView {
    return this.world.lookupIslandById(this.model.sourceIslandId);
  }

  get targetIslandId(): IslandId {
    return this.model.targetIslandId;
  }

  get targetIsland(): IslandView {
    return this.world.lookupIslandById(this.model.targetIslandId);
  }

  get good(): Good {
    return this.model.good;
  }

  get world(): WorldView {
    return this.context.world!;
  }
}

export class IslandView extends View<Island> implements Island {
  static wrap(model: Island, context: ViewContext): IslandView {
    return new IslandView(model, context);
  }

  get id(): IslandId {
    return this.model.id!;
  }

  get name(): string {
    return this.model.name;
  }

  get region(): Region {
    return this.model.region ?? DEFAULT_ISLAND_MODEL.region!;
  }

  get productionLines(): ProductionLineView[] {
    return this.model.productionLines.map((pl) =>
      ProductionLineView.wrap(pl, { ...this.context, island: this }),
    );
  }

  get dolPolicy(): DepartmentOfLaborPolicy {
    return this.model.dolPolicy ?? DEFAULT_ISLAND_MODEL.dolPolicy!;
  }

  get outgoingTradeRoutes(): TradeRouteView[] {
    return this.context.world!.lookupTradeRoutesStartingFrom(this);
  }

  get incomingTradeRoutes(): TradeRouteView[] {
    return this.context.world!.lookupTradeRoutesEndingAt(this);
  }

  get producedGoods(): Good[] {
    return Array.from(
      new Set<Good>(
        this.model.productionLines.flatMap((pl) => {
          const goods = [pl.good];
          pl.items
            ?.flatMap((item) => lookupItemInfo(item)?.extraGoods ?? [])
            ?.forEach((eg) =>
              goods.push(eg.good ?? this.context.productionLine?.good!),
            );
          return goods;
        }),
      ),
    );
  }
}

export class WorldView extends View<World> implements World {
  static wrap(model: World): WorldView {
    return new WorldView(model, {});
  }

  get tradeUnionBonus(): number {
    return this.model.tradeUnionBonus ?? DEFAULT_WORLD_MODEL.tradeUnionBonus!;
  }

  get islands(): IslandView[] {
    return this.model.islands.map((i) => IslandView.wrap(i, this.selfContext));
  }

  lookupIslandById(id: IslandId): IslandView {
    return IslandView.wrap(
      this.model.islands.find((i) => i.id == id)!,
      this.selfContext,
    );
  }

  get tradeRoutes(): TradeRouteView[] {
    return this.model.tradeRoutes.map((tr) =>
      TradeRouteView.wrap(tr, this.selfContext),
    );
  }

  public lookupTradeRoutesStartingFrom(
    island: IslandId | IslandView,
  ): TradeRouteView[] {
    const id = typeof island === 'number' ? island : island.id;
    return this.model.tradeRoutes
      .filter((tr) => tr.sourceIslandId == id)
      .map((tr) => TradeRouteView.wrap(tr, this.selfContext));
  }

  public lookupTradeRoutesEndingAt(
    island: IslandId | IslandView,
  ): TradeRouteView[] {
    const id = typeof island === 'number' ? island : island.id;
    return this.model.tradeRoutes
      .filter((tr) => tr.targetIslandId == id)
      .map((tr) => TradeRouteView.wrap(tr, this.selfContext));
  }

  private get selfContext(): ViewContext {
    return { world: this };
  }
}
