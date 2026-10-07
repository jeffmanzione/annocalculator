import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  Signal,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Island1800Controller } from '../model/world-controllers';
import { ProductionLineId } from '../model/models';
import { MatTableModule } from '@angular/material/table';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProductionLineControl } from './production-line';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormattedNumber } from '../../../components/formatted-number/formatted-number';
import { EnumSelect } from '../../../components/enum-select/enum-select';
import {
  Boost,
  Region,
  DepartmentOfLaborPolicy,
  Good,
  ProductionBuilding,
  Item,
  AdministrativeBuilding,
  CulturalSet,
} from '../game/enums';
import { lookupItemInfo, lookupProductionInfo } from '../game/facts';
import {
  lookupBuildingIconUrl,
  lookupGoodIconUrl,
  lookupBoostIconUrl,
  lookupRegionIconUrl,
  lookupPolicyIconUrl,
  lookupItemIconUrl,
  lookupHaciendaFertilizerWorksIconUrl,
  lookupCulturalSetIconUrl,
} from '../game/icons';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AcButton } from '../../../components/button/button';
import { ExtraGoodsTable } from '../../../components/extra-goods-table/extra-goods-table';
import { StepperInput } from '../../../components/stepper-input/stepper-input';
import { IslandEditor } from '../../../components/island-editor/island-editor';
import { EnumRow } from '../../../components/enum-row/enum-row';
import { Anno1800Tooltip } from '../tooltips/anno1800-tooltip';
import { CompositeNumber } from '../../../components/composite-number/composite-number';
import { ExtraGood1800View } from '../model/world-views';
import { L10nText } from '../../../components/text/text';
import { InputGoodSource } from '../model/world-store-1800';

@Component({
  selector: 'anno-1800-island',
  imports: [
    IslandEditor,
    AcButton,
    Anno1800Tooltip,
    CompositeNumber,
    ExtraGoodsTable,
    EnumRow,
    EnumSelect,
    FormattedNumber,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    StepperInput,
    TextFieldModule,
    L10nText,
  ],
  templateUrl: './anno1800-island.html',
  styleUrls: ['./anno1800-island.scss', './anno1800-island.mobile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno1800Island implements OnInit {
  // Replaces ControlComponent's inherited `controller` input -- this class
  // no longer extends the Control tree (see Decision 2 in the design doc;
  // production-line.ts was migrated off it the same way, in the commit
  // just before this one).
  controller = input.required<Island1800Controller>();

  readonly regions = Object.values(Region).filter((r) => r != Region.Unknown);
  readonly allDolPolicies = Object.values(DepartmentOfLaborPolicy);
  readonly goods = Object.values(Good).filter((g) => g != Good.Unknown);

  // Region-dependent option lists. controller().region reads WorldStore's
  // signals, so these recompute on their own when the region changes.
  readonly productionBuildings: Signal<ProductionBuilding[]> = computed(() => {
    const region = this.controller().region;
    return Object.values(ProductionBuilding).filter(
      (pb) =>
        (lookupProductionInfo(pb)?.allowedRegions?.indexOf(region) ?? -1) != -1,
    );
  });

  readonly dolPolicies: Signal<DepartmentOfLaborPolicy[]> = computed(() => {
    const region = this.controller().region;
    return region == Region.OldWorld || region == Region.CapeTrelawney
      ? this.allDolPolicies
      : [DepartmentOfLaborPolicy.None];
  });

  get productionLineColumns(): string[] {
    const columns = [
      'building',
      'numBuildings',
      'expandExtraGoods',
      'inputGoods',
      'good',
      'boosts',
      'hasTradeUnion',
      'items',
      'culturalSets',
    ];
    if (
      this.controller().region == Region.OldWorld ||
      this.controller().region == Region.CapeTrelawney
    ) {
      columns.push('inRangeOfLocalDepartment');
    } else if (this.controller().region == Region.NewWorld) {
      columns.push('inRangeOfHaciendaFertiliserWorks');
    }
    columns.push(
      'efficiency',
      'buildingProcessTimeSeconds',
      'goodsProducedPerMinute',
      'remove',
    );
    return columns;
  }

  formGroup!: FormGroup;

  private readonly productionLines_ = signal(
    new Map<ProductionLineId, ProductionLineControl>(),
  );

  readonly productionLineRows: Signal<ProductionLineControl[]> = computed(() =>
    Array.from(this.productionLines_().values()),
  );

  get multipleSelectLimit(): number {
    return this.controller().dolPolicy ==
      DepartmentOfLaborPolicy.UnionSubsidiesAct
      ? 4
      : 3;
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(this.controller().name),
      region: new FormControl(this.controller().region),
      dolPolicy: new FormControl(this.controller().dolPolicy),
    });
    this.formGroup.valueChanges.subscribe(() => this.notifyChanged_());

    // dolPolicy only applies in some regions; correct/clear it
    // synchronously in response to region's own valueChanges (which fires
    // before the whole FormGroup's, and so before notifyChanged_() commits
    // values to the model) -- same pattern as ProductionLineControl's
    // building/hasTradeUnion subscriptions, and for the same reason: this
    // is a correction to a same-row pending value, not a read of already-
    // committed state, so it can't wait until after the model write.
    this.formGroup.controls['region'].valueChanges.subscribe(() =>
      this.updateDolPolicyControlState_(),
    );

    const controls = new Map<ProductionLineId, ProductionLineControl>();
    for (const pl of this.controller().productionLines) {
      const control = new ProductionLineControl(pl, () =>
        this.notifyChanged_(),
      );
      controls.set(pl.id, control);
    }
    this.productionLines_.set(controls);

    if (controls.size == 0) {
      this.addProductionLine();
    }

    this.refresh_();
  }

  // Writes this island's own committed form values to its controller, adds
  // a first production line if none exist yet (same as the old
  // beforeBubbleChange()), then refreshes this island's own derived state,
  // refreshes every production line row (their derived state can depend on
  // this island's region/DOL policy, which may have just changed). This
  // replaced Control's tree-wide pushUpChange()/afterPushChange() bubble
  // with an explicit sequence scoped to this island and its own production
  // lines. Saving is no longer this method's concern: the root's persist
  // effect picks up every store write on its own.
  private notifyChanged_(): void {
    this.controller().name = this.formGroup.value.name;
    this.controller().region = this.formGroup.value.region;
    this.controller().dolPolicy = this.formGroup.value.dolPolicy;
    if (this.productionLines_().size == 0) {
      this.addProductionLine();
    }
    this.refresh_();
    for (const pl of this.productionLines_().values()) {
      pl.refresh();
    }
  }

  // Re-applies the dolPolicy enable/disable correction (renamed from the
  // old afterPushChange() override). The region subscription in ngOnInit
  // already does this on region changes; re-running it here keeps it
  // correct if dolPolicy state fell out of sync some other way -- cheap
  // and idempotent. (The region-dependent option lists used to be
  // refreshed here too, via a manual recompute counter; they're plain
  // store-tracking computed()s now.)
  private refresh_(): void {
    this.updateDolPolicyControlState_();
  }

  // Reads region from its own FormControl's .value, not the parent
  // FormGroup's aggregate this.formGroup.value -- when this runs from
  // region's own valueChanges subscription (see ngOnInit above), the
  // parent aggregate hasn't been recomputed yet, so reading it here would
  // compute off the pre-change region and (like the analogous
  // building/hasTradeUnion bug in production-line.ts's updateFormStates_)
  // send the correction to the controller one change late instead of on
  // this one. See that method's comment for the full explanation.
  private updateDolPolicyControlState_(): void {
    const region = this.formGroup.controls['region'].value;
    if (region == Region.OldWorld || region == Region.CapeTrelawney) {
      this.enableControl_('dolPolicy');
    } else {
      this.clearAndDisableControl_('dolPolicy', DepartmentOfLaborPolicy.None);
    }
  }

  addProductionLine(): void {
    const controller = this.controller().addProductionLine();
    const control = new ProductionLineControl(controller, () =>
      this.notifyChanged_(),
    );
    this.productionLines_.update((controls) =>
      new Map(controls).set(controller.id, control),
    );
    this.notifyChanged_();
  }

  removeProductionLine(el: ProductionLineControl): void {
    this.productionLines_.update((controls) => {
      const next = new Map(controls);
      next.delete(el.controller.id);
      return next;
    });
    this.controller().removeProductionLine(el.controller.id);
    this.notifyChanged_();
  }

  lookupBuildingIconUrl(building: ProductionBuilding | null): string {
    return lookupBuildingIconUrl(building ?? ProductionBuilding.Unknown);
  }

  // Inputs are shown from their InputGoodSource so a substituted good can be
  // marked and explained; these adapt that to enum-row's per-value callbacks.
  readonly lookupInputGoodIconUrl = (source: InputGoodSource | null): string =>
    lookupGoodIconUrl(source?.good ?? Good.Unknown);
  readonly inputGoodName = (source: InputGoodSource | null): string =>
    source?.good ?? '';
  readonly isSubstitutedInput = (source: InputGoodSource | null): boolean =>
    !!source?.replaces;

  lookupGoodIconUrl(good: Good | null): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  lookupBoostIconUrl(boost: Boost | null): string {
    return lookupBoostIconUrl(boost ?? Boost.None);
  }

  lookupItemIconUrl(item: Item | null): string {
    return lookupItemIconUrl(item ?? Item.Unknown);
  }

  lookupRegionIconUrl(region: Region | null): string {
    return lookupRegionIconUrl(region ?? Region.Unknown);
  }

  lookupPolicyIconUrl(policy: DepartmentOfLaborPolicy | null): string {
    return lookupPolicyIconUrl(policy ?? DepartmentOfLaborPolicy.None);
  }

  lookupCulturalSetIconUrl(set: CulturalSet | null): string {
    return lookupCulturalSetIconUrl(set ?? CulturalSet.Unknown);
  }

  extraGoodLookupIconUrlFn(extraGood: ExtraGood1800View): (_: any) => string {
    switch (extraGood.sourceType) {
      case 'Boost':
      case 'ElectrifiedFarm':
        return lookupBoostIconUrl;
      case 'DepartmentOfLaborPolicy':
        return lookupPolicyIconUrl;
      case 'HaciendaFertilizerWorks':
        return lookupHaciendaFertilizerWorksIconUrl;
      case 'CulturalSet':
        return lookupCulturalSetIconUrl;
      default:
        return lookupItemIconUrl;
    }
  }

  isHarborItem(item: Item): boolean {
    if (!item || item == Item.Unknown) {
      return false;
    }
    return (
      lookupItemInfo(item)!.administrativeBuilding ==
      AdministrativeBuilding.HarbourmastersOffice
    );
  }

  private enableControl_(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false });
  }

  private clearAndDisableControl_(
    controlName: string,
    clearedValue: any = 0,
  ): void {
    this.formGroup.controls[controlName].setValue(clearedValue, {
      emitEvent: false,
    });
    this.formGroup.controls[controlName].disable({ emitEvent: false });
  }

  private readonly boostTooltip_ =
    viewChild.required<TemplateRef<any>>('boostTooltip');
  private readonly policyTooltip_ =
    viewChild.required<TemplateRef<any>>('policyTooltip');
  private readonly haciendaTooltip_ =
    viewChild.required<TemplateRef<any>>('haciendaTooltip');
  private readonly itemTooltip_ =
    viewChild.required<TemplateRef<any>>('itemTooltip');
  private readonly culturalSetTooltip_ =
    viewChild.required<TemplateRef<any>>('culturalSetTooltip');

  /** How an extra good's source is drawn: its icon and its tooltip depend on what kind of source it is. */
  readonly extraGoodSourceIcon = (
    extraGood: ExtraGood1800View,
  ): ((_: any) => string) => this.extraGoodLookupIconUrlFn(extraGood);

  readonly extraGoodSourceTooltip = (
    extraGood: ExtraGood1800View,
  ): TemplateRef<any> => {
    switch (extraGood.sourceType) {
      case 'Boost':
      case 'ElectrifiedFarm':
        return this.boostTooltip_();
      case 'DepartmentOfLaborPolicy':
        return this.policyTooltip_();
      case 'HaciendaFertilizerWorks':
        return this.haciendaTooltip_();
      case 'CulturalSet':
        return this.culturalSetTooltip_();
      default:
        return this.itemTooltip_();
    }
  };

  transformCulturalSetName(value: CulturalSet | null): string {
    if (!value) {
      return 'NULL';
    }
    return (value as string).toUpperCase();
  }
}
