import { ProductionLineController } from '../../../shared/mvc/controllers';
import { ExtraGoodView, ProductionLineView } from '../../../shared/mvc/views';
import {
  Boost,
  CulturalSet,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../../../shared/game/enums';
import {
  requiresElectricity,
  lookupAllowedBoosts,
  lookupAllowedItems,
  producesDung,
  lookupAllowedCulturalSets,
} from '../../../shared/game/facts';
import { FormGroupControl } from '../../../shared/control/control';
import { NumberConstituent } from '../../../components/composite-number/composite-number';
import { computed, Signal, signal } from '@angular/core';

export class ProductionLineControl extends FormGroupControl<ProductionLineController> {
  // Bumped after every model update (see afterPushChange()) so the computed
  // fields below -- which read plain, non-observable controller state --
  // recompute. Same pattern as SummaryPanel.recomputeTrigger_.
  private readonly recomputeTrigger_ = signal(0);

  readonly extraGoodsRows: Signal<ExtraGoodView[]> = computed(() => {
    this.recomputeTrigger_();
    return this.controller.extraGoods;
  });
  readonly hasExtraGoods = computed(() => this.extraGoodsRows().length > 0);

  // UI-only: whether this production line's extra-goods breakdown is
  // expanded. Deliberately not gated on recomputeTrigger_ -- it's
  // interaction state, not derived from the world (same principle as the
  // summary-panel spike's expanded-rows handling).
  private readonly showExtraGoodsRequested_ = signal(false);
  readonly showExtraGoods = computed(
    () => this.showExtraGoodsRequested_() && this.hasExtraGoods(),
  );
  readonly expandExtraGoodsIcon = computed(() => {
    if (this.showExtraGoods()) {
      return 'arrow_drop_up';
    }
    if (this.extraGoodsRows().length == 0) {
      return 'check_indeterminate_small';
    }
    return 'arrow_drop_down';
  });

  // allowedBoosts/allowedItems/allowedCulturalSets stay plain fields, kept
  // in sync by updateFormStates_() -- see the comment on beforeModelUpdate()
  // below for why these can't be computed()s: they must reflect the form's
  // pending (uncommitted) building value, not the last-committed one, or
  // the correction-before-model-write logic breaks.
  allowedBoosts: Set<Boost> = new Set();
  allowedItems: Set<Item> = new Set();
  allowedCulturalSets: Set<CulturalSet> = new Set();

  readonly inputGoods: Signal<Good[]> = computed(() => {
    this.recomputeTrigger_();
    return this.controller.inputGoods;
  });
  // Will always be a list of size 1 since production lines only output 1 good type.
  readonly outputGoods: Signal<Good[]> = computed(() => {
    this.recomputeTrigger_();
    return [this.controller.good];
  });

  readonly efficiency: Signal<number> = computed(() => {
    this.recomputeTrigger_();
    return this.controller.efficiency;
  });
  readonly efficiencyConstituents: Signal<NumberConstituent[]> = computed(
    () => {
      this.recomputeTrigger_();
      return this.controller.efficiencyConstituents;
    },
  );
  readonly buildingProcessTimeSeconds: Signal<number> = computed(() => {
    this.recomputeTrigger_();
    return this.controller.buildingProcessTimeSeconds;
  });
  readonly goodsProducedPerMinute: Signal<number> = computed(() => {
    this.recomputeTrigger_();
    return this.controller.goodsProducedPerMinuteWithExtras;
  });

  constructor(controller: ProductionLineController) {
    super(controller, [
      'building',
      {
        controlName: 'numBuildings',
        updateObject: (v, o) => (o.numBuildings = Number.parseInt(v)),
      },
      'boosts',
      'hasTradeUnion',
      'items',
      'inRangeOfLocalDepartment',
      'inRangeOfHaciendaFertiliserWorks',
      'culturalSets',
    ]);
    // Show extra goods by default when there are any.
    this.showExtraGoodsRequested_.set(this.controller.extraGoods.length > 0);
    this.beforeBubbleChange();
    this.afterPushChange();
  }

  get view(): ProductionLineView {
    return this.controller;
  }

  // Update the form states (without updating the model/controller).
  private updateFormStates_(): void {
    const building: ProductionBuilding = this.formGroup.value.building;
    this.updateBoostOptions_();
    // Some buildings require electricity, and if so, we automatically select it, otherwise, we
    // narrow the field down to possible options.
    if (requiresElectricity(building)) {
      this.clearAndDisableControl_('boosts', [Boost.Electricity]);
    } else if (this.allowedBoosts.size == 0) {
      this.clearAndDisableControl_('boosts', []);
    } else {
      this.enableControl_('boosts');
    }

    // Items can only be slotted in trade unions.
    if (this.formGroup.value.hasTradeUnion) {
      this.updateItemOptions_();
      this.enableControl_('items');
    } else {
      this.clearAndDisableControl_('items', false);
    }

    // Local department effects have no effect without a DoL on the island and a Trade Union in
    // range.
    if (
      (this.controller.region != Region.NewWorld &&
        !this.controller.islandHasDepartmentOfLabor) ||
      !this.formGroup.value.hasTradeUnion
    ) {
      this.clearAndDisableControl_('inRangeOfLocalDepartment', false);
    } else {
      this.enableControl_('inRangeOfLocalDepartment');
    }

    // Only new-world buildings can produce dung.
    if (
      this.controller.region == Region.NewWorld &&
      producesDung(this.controller.building)
    ) {
      this.enableControl_('inRangeOfHaciendaFertiliserWorks');
    } else {
      this.clearAndDisableControl_('inRangeOfHaciendaFertiliserWorks', false);
    }

    this.updateCulturalSetOptions_();
  }

  private updateCulturalSetOptions_() {
    this.allowedCulturalSets = new Set(
      lookupAllowedCulturalSets(this.formGroup.value.building),
    );

    if (this.allowedCulturalSets.size == 0) {
      this.clearAndDisableControl_('culturalSets', false);
      return;
    }

    const selectedCulturalSets = (this.formGroup.value.culturalSets ??
      []) as CulturalSet[];
    if (
      selectedCulturalSets &&
      !selectedCulturalSets.every((s) => !this.allowedCulturalSets.has(s))
    ) {
      this.formGroup.controls['culturalSets'].setValue(
        selectedCulturalSets.filter((s) => this.allowedCulturalSets.has(s)),
        { emitEvent: false },
      );
    }
  }

  private updateBoostOptions_(): void {
    this.allowedBoosts = new Set(
      lookupAllowedBoosts(this.formGroup.value.building),
    );
    const selectedBoosts = (this.formGroup.value.boosts ?? []) as Boost[];

    if (!selectedBoosts.every((b) => !this.allowedBoosts.has(b))) {
      this.formGroup.controls['boosts'].setValue(
        selectedBoosts.filter((b) => this.allowedBoosts.has(b)),
        { emitEvent: false },
      );
    }
  }
  private updateItemOptions_(): void {
    const newAllowedItems = new Set(
      lookupAllowedItems(this.formGroup.value.building),
    );
    if (!setsAreEqual(newAllowedItems, this.allowedItems)) {
      this.allowedItems = newAllowedItems;
    }

    const selectedItems = (this.formGroup.value.items || []) as Item[];

    if (selectedItems.some((i) => !this.allowedItems.has(i))) {
      this.formGroup.controls['items'].setValue(
        selectedItems.filter((i) => this.allowedItems.has(i)),
        { emitEvent: false },
      );
    }
  }

  private enableControl_(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false });
  }

  private clearAndDisableControl_(
    controlName: string,
    clearedValue: any = 0,
  ): void {
    this.formGroup.controls[controlName].disable({
      onlySelf: true,
      emitEvent: false,
    });
    this.formGroup.controls[controlName].setValue(clearedValue, {
      onlySelf: true,
      emitEvent: false,
    });
  }

  override beforeModelUpdate(): void {
    // Form states must be adjusted separately and before model changes to prevent potential infinite
    // loops caused by interdependent component forms in the hierarchy.
    this.updateFormStates_();
  }

  override afterPushChange(): void {
    this.updateFormStates_();
    // Bumping after updateFormStates_() (which may itself correct/clear
    // form values before they're written to the model) ensures the
    // computed fields above are fresh after the model update -- the same
    // ordering the old updateAndFormatDerivedFields_() relied on.
    this.recomputeTrigger_.update((v) => v + 1);
  }

  toggleShowExtraGoods(): void {
    this.showExtraGoodsRequested_.update((shown) => !shown);
  }
}

const setsAreEqual = (s1: Set<any>, s2: Set<any>): boolean => {
  return s1.size === s2.size && [...s1].every((x) => s2.has(x));
};
