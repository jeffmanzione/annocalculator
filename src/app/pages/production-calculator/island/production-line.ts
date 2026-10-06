import { StoreProductionLineController } from '../../../shared/mvc/world-store-controllers';
import { InputGoodSource } from '../../../shared/mvc/world-store';
import {
  StoreExtraGoodView,
  StoreProductionLineView,
} from '../../../shared/mvc/world-store-views';
import {
  Boost,
  CulturalSet,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../../../games/anno1800/game/enums';
import {
  requiresElectricity,
  lookupAllowedBoosts,
  lookupAllowedItems,
  producesDung,
  lookupAllowedCulturalSets,
} from '../../../games/anno1800/game/facts';
import { NumberConstituent } from '../../../components/composite-number/composite-number';
import { computed, Signal, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

// A plain (non-Control-tree) class -- this is the last consumer of the old
// FormGroupControl/Control bubbling machinery to be migrated off it (see
// Decision 2 in the design doc). Instead of writing form values through a
// generic "converters" table and bubbling a change event up through a
// parent/child Control tree, this class writes its own form's committed
// values straight to its ProductionLineController and calls the
// `notifyChanged` callback its owner (Island) passes in -- Island is the
// only caller, so there's no need for the old machinery's generality.
export class ProductionLineControl {
  readonly formGroup: FormGroup;

  // The derived fields below read `controller`'s getters, which read
  // WorldStore's signals, so each computed() recomputes on its own when
  // anything it depends on changes (this row, its island, or the world's
  // trade-union bonus).
  readonly extraGoodsRows: Signal<StoreExtraGoodView[]> = computed(() => {
    return this.controller.extraGoods;
  });
  readonly hasExtraGoods = computed(() => this.extraGoodsRows().length > 0);

  // UI-only: whether this production line's extra-goods breakdown is
  // expanded. Interaction state, not derived from the world (same
  // principle as the summary-panel spike's expanded-rows handling).
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
  // need to react to their own form controls' pending changes, not to
  // committed store state.
  readonly allowedBoosts = signal<Set<Boost>>(new Set());
  readonly allowedItems = signal<Set<Item>>(new Set());
  readonly allowedCulturalSets = signal<Set<CulturalSet>>(new Set());

  readonly inputGoods: Signal<Good[]> = computed(() => {
    return this.controller.inputGoods;
  });
  /** Each input good with the specialist that substituted it, if any. */
  readonly inputGoodSources: Signal<InputGoodSource[]> = computed(() => {
    return this.controller.inputGoodSources;
  });
  // Will always be a list of size 1 since production lines only output 1 good type.
  readonly outputGoods: Signal<Good[]> = computed(() => {
    return [this.controller.good];
  });

  readonly efficiency: Signal<number> = computed(() => {
    return this.controller.efficiency;
  });
  readonly efficiencyConstituents: Signal<NumberConstituent[]> = computed(
    () => {
      return this.controller.efficiencyConstituents;
    },
  );
  readonly buildingProcessTimeSeconds: Signal<number> = computed(() => {
    return this.controller.buildingProcessTimeSeconds;
  });
  readonly goodsProducedPerMinute: Signal<number> = computed(() => {
    return this.controller.goodsProducedPerMinuteWithExtras;
  });
  readonly goodsProducedPerMinuteConstituents: Signal<NumberConstituent[]> =
    computed(() => this.controller.goodsProducedPerMinuteConstituents);

  constructor(
    public readonly controller: StoreProductionLineController,
    private readonly notifyChanged_: () => void,
  ) {
    this.formGroup = new FormGroup({
      building: new FormControl(controller.building),
      numBuildings: new FormControl(controller.numBuildings),
      boosts: new FormControl(controller.boosts),
      hasTradeUnion: new FormControl(controller.hasTradeUnion),
      items: new FormControl(controller.items),
      inRangeOfLocalDepartment: new FormControl(
        controller.inRangeOfLocalDepartment,
      ),
      inRangeOfHaciendaFertiliserWorks: new FormControl(
        controller.inRangeOfHaciendaFertiliserWorks,
      ),
      culturalSets: new FormControl(controller.culturalSets),
    });
    // Writes this row's committed form values to its controller, then
    // notifies Island -- this replaces FormGroupControl's
    // privateBeforeBubbleChange()-driven converter loop plus pushUpChange().
    this.formGroup.valueChanges.subscribe(() => {
      this.writeFormValuesToController_();
      this.notifyChanged_();
    });

    // Show extra goods by default when there are any.
    this.showExtraGoodsRequested_.set(this.controller.extraGoods.length > 0);

    // building and hasTradeUnion are the only two of this row's own form
    // values that updateFormStates_() reads -- everything else it touches
    // (boosts/items/culturalSets/inRangeOf...) is an output, not an input.
    // Subscribing directly to those two controls' own valueChanges (rather
    // than the whole FormGroup's, which is what the constructor's own
    // valueChanges subscription above listens to) means the correction
    // always lands before this row's model gets written: Angular's
    // reactive forms fire a child control's valueChanges before its parent
    // FormGroup's, and it's the parent FormGroup's valueChanges that
    // writes committed values to the controller and calls
    // notifyChanged_(). This is what replaces the old
    // beforeModelUpdate()/afterPushChange() double-call dance from when
    // this class extended FormGroupControl -- each interdependent
    // relationship now reacts to the thing it actually depends on, instead
    // of everything re-running on a fixed before/after schedule regardless
    // of what changed.
    this.formGroup.controls['building'].valueChanges.subscribe(() =>
      this.updateFormStates_(),
    );
    this.formGroup.controls['hasTradeUnion'].valueChanges.subscribe(() =>
      this.updateFormStates_(),
    );

    this.writeFormValuesToController_();
    this.refresh();
  }

  private writeFormValuesToController_(): void {
    this.controller.building =
      this.formGroup.controls['building'].getRawValue();
    this.controller.numBuildings = Number.parseInt(
      this.formGroup.controls['numBuildings'].getRawValue(),
    );
    this.controller.boosts = this.formGroup.controls['boosts'].getRawValue();
    this.controller.hasTradeUnion =
      this.formGroup.controls['hasTradeUnion'].getRawValue();
    this.controller.items = this.formGroup.controls['items'].getRawValue();
    this.controller.inRangeOfLocalDepartment =
      this.formGroup.controls['inRangeOfLocalDepartment'].getRawValue();
    this.controller.inRangeOfHaciendaFertiliserWorks =
      this.formGroup.controls['inRangeOfHaciendaFertiliserWorks'].getRawValue();
    this.controller.culturalSets =
      this.formGroup.controls['culturalSets'].getRawValue();
  }

  get view(): StoreProductionLineView {
    return this.controller;
  }

  // Update the form states (without updating the model/controller). Reads
  // this row's own pending (not-yet-committed) building/hasTradeUnion
  // values when called from the constructor's direct subscriptions above,
  // and this island's already-committed region/department-of-labor state
  // when called from refresh() -- both are safe: see the constructor
  // comment for why the same-row inputs are safe here despite being
  // pending.
  //
  // Reads building/hasTradeUnion from their own FormControl's .value
  // (this.formGroup.controls[...].value), not from the parent FormGroup's
  // aggregate this.formGroup.value -- when this method runs from one of
  // those two controls' own valueChanges (see the constructor), the
  // control that just changed has already updated its own .value, but the
  // *parent* FormGroup's aggregate .value hasn't been recomputed yet
  // (Angular updates a control's own value/emits its own valueChanges
  // before walking up to recompute and emit the parent's -- see
  // AbstractControl.updateValueAndValidity() in @angular/forms). Reading
  // the parent aggregate here used to read one step behind, so a
  // correction this method makes (e.g. auto-selecting Electricity) would
  // compute off the stale pre-change building/hasTradeUnion value and,
  // even though the *form* control still ended up corrected via the
  // fallback below, the corrected value wouldn't reach the *controller*
  // until the next unrelated change (found and fixed after being
  // identified as a pre-existing bug during the Decision-2 migration).
  private updateFormStates_(): void {
    const building: ProductionBuilding =
      this.formGroup.controls['building'].value;
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
    if (this.formGroup.controls['hasTradeUnion'].value) {
      this.updateItemOptions_(building);
      this.enableControl_('items');
    } else {
      this.clearAndDisableControl_('items', []);
    }

    // Local department effects have no effect without a DoL on the island and a Trade Union in
    // range.
    if (
      (this.controller.region != Region.NewWorld &&
        !this.controller.islandHasDepartmentOfLabor) ||
      !this.formGroup.controls['hasTradeUnion'].value
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
      this.clearAndDisableControl_('culturalSets', []);
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

  // Called by Island whenever anything in this row's own subtree changed
  // (renamed from afterPushChange() -- Island now calls this directly
  // instead of it being invoked by Control's tree-wide bubble-down).
  // Refreshes the parts of updateFormStates_() that depend on this
  // island's already-committed state (region, department-of-labor
  // policy) -- safe to read only now, after the model write, unlike the
  // building/hasTradeUnion-triggered corrections handled by the
  // constructor's direct subscriptions above.
  refresh(): void {
    this.updateFormStates_();
  }

  toggleShowExtraGoods(): void {
    this.showExtraGoodsRequested_.update((shown) => !shown);
  }
}

const setsAreEqual = (s1: Set<any>, s2: Set<any>): boolean => {
  return s1.size === s2.size && [...s1].every((x) => s2.has(x));
};
