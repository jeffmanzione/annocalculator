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

  // Written imperatively by updateFormStates_() rather than derived with
  // computed() -- see the constructor comment for why these specifically
  // need to react to their own form controls' changes, not to
  // recomputeTrigger_.
  readonly allowedBoosts = signal<Set<Boost>>(new Set());
  readonly allowedItems = signal<Set<Item>>(new Set());
  readonly allowedCulturalSets = signal<Set<CulturalSet>>(new Set());

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

    // building and hasTradeUnion are the only two of this row's own form
    // values that updateFormStates_() reads -- everything else it touches
    // (boosts/items/culturalSets/inRangeOf...) is an output, not an input.
    // Subscribing directly to those two controls' own valueChanges (rather
    // than the whole FormGroup's, which is what pushUpChange() below
    // listens to) means the correction always lands before this row's
    // model gets written: Angular's reactive forms fire a child control's
    // valueChanges before its parent FormGroup's, and it's the parent
    // FormGroup's valueChanges that triggers pushUpChange() (see
    // FormGroupControl's constructor), which is what commits form values
    // to the model. This is what replaces the old
    // beforeModelUpdate()/afterPushChange() double-call dance -- each
    // interdependent relationship now reacts to the thing it actually
    // depends on, instead of everything re-running on a fixed
    // before/after schedule regardless of what changed.
    this.formGroup.controls['building'].valueChanges.subscribe(() =>
      this.updateFormStates_(),
    );
    this.formGroup.controls['hasTradeUnion'].valueChanges.subscribe(() =>
      this.updateFormStates_(),
    );

    this.beforeBubbleChange();
    this.afterPushChange();
  }

  get view(): ProductionLineView {
    return this.controller;
  }

  // Update the form states (without updating the model/controller). Reads
  // this row's own pending (not-yet-committed) building/hasTradeUnion
  // values when called from the constructor's direct subscriptions above,
  // and this island's already-committed region/department-of-labor state
  // when called from afterPushChange() -- both are safe: see the
  // constructor comment for why the same-row inputs are safe here despite
  // being pending.
  private updateFormStates_(): void {
    const building: ProductionBuilding = this.formGroup.value.building;
    this.updateBoostOptions_(building);
    // Some buildings require electricity, and if so, we automatically select it, otherwise, we
    // narrow the field down to possible options.
    if (requiresElectricity(building)) {
      this.clearAndDisableControl_('boosts', [Boost.Electricity]);
    } else if (this.allowedBoosts().size == 0) {
      this.clearAndDisableControl_('boosts', []);
    } else {
      this.enableControl_('boosts');
    }

    // Items can only be slotted in trade unions.
    if (this.formGroup.value.hasTradeUnion) {
      this.updateItemOptions_(building);
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

    this.updateCulturalSetOptions_(building);
  }

  private updateCulturalSetOptions_(building: ProductionBuilding): void {
    const allowedCulturalSets = new Set(lookupAllowedCulturalSets(building));
    this.allowedCulturalSets.set(allowedCulturalSets);

    if (allowedCulturalSets.size == 0) {
      this.clearAndDisableControl_('culturalSets', false);
      return;
    }

    const selectedCulturalSets = (this.formGroup.value.culturalSets ??
      []) as CulturalSet[];
    if (
      selectedCulturalSets &&
      !selectedCulturalSets.every((s) => !allowedCulturalSets.has(s))
    ) {
      this.formGroup.controls['culturalSets'].setValue(
        selectedCulturalSets.filter((s) => allowedCulturalSets.has(s)),
        { emitEvent: false },
      );
    }
  }

  private updateBoostOptions_(building: ProductionBuilding): void {
    const allowedBoosts = new Set(lookupAllowedBoosts(building));
    this.allowedBoosts.set(allowedBoosts);
    const selectedBoosts = (this.formGroup.value.boosts ?? []) as Boost[];

    if (!selectedBoosts.every((b) => !allowedBoosts.has(b))) {
      this.formGroup.controls['boosts'].setValue(
        selectedBoosts.filter((b) => allowedBoosts.has(b)),
        { emitEvent: false },
      );
    }
  }

  private updateItemOptions_(building: ProductionBuilding): void {
    const newAllowedItems = new Set(lookupAllowedItems(building));
    if (!setsAreEqual(newAllowedItems, this.allowedItems())) {
      this.allowedItems.set(newAllowedItems);
    }

    const selectedItems = (this.formGroup.value.items || []) as Item[];

    if (selectedItems.some((i) => !newAllowedItems.has(i))) {
      this.formGroup.controls['items'].setValue(
        selectedItems.filter((i) => newAllowedItems.has(i)),
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

  override afterPushChange(): void {
    // Refreshes the parts of updateFormStates_() that depend on this
    // island's already-committed state (region, department-of-labor
    // policy) -- safe to read only now, after the model write, unlike the
    // building/hasTradeUnion-triggered corrections handled by the
    // constructor's direct subscriptions above.
    this.updateFormStates_();
    this.recomputeTrigger_.update((v) => v + 1);
  }

  toggleShowExtraGoods(): void {
    this.showExtraGoodsRequested_.update((shown) => !shown);
  }
}

const setsAreEqual = (s1: Set<any>, s2: Set<any>): boolean => {
  return s1.size === s2.size && [...s1].every((x) => s2.has(x));
};
