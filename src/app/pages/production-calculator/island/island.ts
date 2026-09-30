import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  Signal,
  signal,
  TemplateRef,
} from '@angular/core';
import { StoreIslandController } from '../../../shared/mvc/world-store-controllers';
import { ProductionLineId } from '../../../shared/mvc/models';
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
} from '../../../shared/game/enums';
import {
  lookupItemInfo,
  lookupProductionInfo,
} from '../../../shared/game/facts';
import {
  lookupBuildingIconUrl,
  lookupGoodIconUrl,
  lookupBoostIconUrl,
  lookupRegionIconUrl,
  lookupPolicyIconUrl,
  lookupItemIconUrl,
  lookupHaciendaFertilizerWorksIconUrl,
  lookupCulturalSetIconUrl,
} from '../../../shared/game/icons';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AcButton } from '../../../components/button/button';
import { EnumRow } from '../../../components/enum-row/enum-row';
import { ItemTooltip } from './tooltips/item/item-tooltip';
import {
  SimpleTooltip,
  TooltipDirective,
} from '../../../components/enum-tooltip/enum-tooltip';
import { CompositeNumber } from '../../../components/composite-number/composite-number';
import { StoreExtraGoodView } from '../../../shared/mvc/world-store-views';
import { BoostTooltip } from './tooltips/boost/boost-tooltip';
import { ProductionBuildingTooltip } from './tooltips/building/building-tooltip';
import { CulturalSetTooltip } from './tooltips/cultural-set/cultural-set-tooltip';
import { L10nText } from '../../../components/text/text';
import { PolicyTooltip } from './tooltips/policy/policy-tooltip';
import { HaciendaTooltip } from './tooltips/hacienda/hacienda-tooltip';

@Component({
  selector: 'island',
  imports: [
    AcButton,
    CompositeNumber,
    EnumRow,
    EnumSelect,
    FormattedNumber,
    FormsModule,
    ItemTooltip,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    SimpleTooltip,
    TextFieldModule,
    TooltipDirective,
    BoostTooltip,
    ProductionBuildingTooltip,
    CulturalSetTooltip,
    L10nText,
    PolicyTooltip,
    HaciendaTooltip,
  ],
  templateUrl: './island.html',
  styleUrl: './island.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Island implements OnInit {
  // Replaces ControlComponent's inherited `controller` input -- this class
  // no longer extends the Control tree (see Decision 2 in the design doc;
  // production-line.ts was migrated off it the same way, in the commit
  // just before this one).
  controller = input.required<StoreIslandController>();

  // Emitted whenever anything in this island's own form or any of its
  // production lines' forms changes -- replaces Control's `.update`
  // EventEmitter. production-calculator.ts subscribes to this exactly the
  // way it subscribed to `.update` before.
  readonly changed = output<void>();

  readonly regions = Object.values(Region).filter((r) => r != Region.Unknown);
  readonly allDolPolicies = Object.values(DepartmentOfLaborPolicy);
  readonly goods = Object.values(Good).filter((g) => g != Good.Unknown);

  // Bumped in refresh_() so the computed()s below -- which read plain,
  // non-observable controller state -- recompute. Same pattern as
  // ProductionLineControl.recomputeTrigger_.
  private readonly recomputeTrigger_ = signal(0);

  readonly productionBuildings: Signal<ProductionBuilding[]> = computed(() => {
    this.recomputeTrigger_();
    const region = this.controller().region;
    return Object.values(ProductionBuilding).filter(
      (pb) =>
        (lookupProductionInfo(pb)?.allowedRegions?.indexOf(region) ?? -1) !=
        -1,
    );
  });

  readonly dolPolicies: Signal<DepartmentOfLaborPolicy[]> = computed(() => {
    this.recomputeTrigger_();
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

  readonly extraGoodColumns = [
    'good',
    'source',
    'rateNumerator',
    'divideSymbol',
    'rateDenominator',
    'producedPerMinute',
  ];

  formGroup!: FormGroup;

  private readonly productionLines_ = signal(
    new Map<ProductionLineId, ProductionLineControl>(),
  );

  readonly productionLineRows: Signal<ProductionLineControl[]> = computed(
    () => Array.from(this.productionLines_().values()),
  );

  get multipleSelectLimit(): number {
    return this.controller().dolPolicy ==
      DepartmentOfLaborPolicy.UnionSubsidiesAct
      ? 4
      : 3;
  }

  get inRangeHeader(): string {
    return this.controller().region == Region.NewWorld
      ? 'Fert Works'
      : 'Local Dept';
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
  // this island's region/DOL policy, which may have just changed), and
  // finally emits `changed` -- replacing Control's tree-wide
  // pushUpChange()/afterPushChange() bubble with an explicit, equivalent
  // sequence scoped to exactly this island and its own production lines.
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
    this.changed.emit();
  }

  // This island's own derived state only (region/dolPolicy-dependent
  // option lists) -- renamed from the old afterPushChange() override.
  private refresh_(): void {
    // Also re-applied here (not just from the region subscription above)
    // to stay correct if this island's region was somehow set to a value
    // and dolPolicy state fell out of sync some other way -- cheap and
    // idempotent, so there's no harm re-running it on every change.
    this.updateDolPolicyControlState_();
    this.recomputeTrigger_.update((v) => v + 1);
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
    this.controller().removeProductionLineById(el.controller.id);
    this.notifyChanged_();
  }

  lookupBuildingIconUrl(building: ProductionBuilding | null): string {
    return lookupBuildingIconUrl(building ?? ProductionBuilding.Unknown);
  }

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

  extraGoodLookupIconUrlFn(extraGood: StoreExtraGoodView): (_: any) => string {
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

  selectTooltip(
    extraGood: StoreExtraGoodView,
    boostTooltip: TemplateRef<any>,
    policyTooltip: TemplateRef<any>,
    haciendaTooltip: TemplateRef<any>,
    itemTooltip: TemplateRef<any>,
    culturalSetTooltip: TemplateRef<any>,
  ): TemplateRef<any> {
    switch (extraGood.sourceType) {
      case 'Boost':
      case 'ElectrifiedFarm':
        return boostTooltip;
      case 'DepartmentOfLaborPolicy':
        return policyTooltip;
      case 'HaciendaFertilizerWorks':
        return haciendaTooltip;
      case 'CulturalSet':
        return culturalSetTooltip;
      default:
        return itemTooltip;
    }
  }

  transformCulturalSetName(value: CulturalSet | null): string {
    if (!value) {
      return 'NULL';
    }
    return (value as string).toUpperCase();
  }
}
