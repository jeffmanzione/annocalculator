import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  Signal,
  signal,
  TemplateRef,
} from '@angular/core';
import { IslandController } from '../../../shared/mvc/controllers';
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
import { ControlComponent } from '../../../shared/control/control';
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
import { ExtraGoodView } from '../../../shared/mvc/views';
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
export class Island
  extends ControlComponent<IslandController>
  implements OnInit
{
  readonly regions = Object.values(Region).filter((r) => r != Region.Unknown);
  readonly allDolPolicies = Object.values(DepartmentOfLaborPolicy);
  readonly goods = Object.values(Good).filter((g) => g != Good.Unknown);

  dolPolicies!: DepartmentOfLaborPolicy[];
  productionBuildings!: ProductionBuilding[];

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
    this.formGroup.valueChanges.subscribe((_) => this.pushUpChange());

    const controls = new Map<ProductionLineId, ProductionLineControl>();
    for (const pl of this.controller().productionLines) {
      const control = new ProductionLineControl(pl);
      this.registerChildControl(control);
      controls.set(pl.id, control);
    }
    this.productionLines_.set(controls);

    if (controls.size == 0) {
      this.addProductionLine();
    }

    this.afterPushChange();
  }

  override beforeBubbleChange(): void {
    this.controller().name = this.formGroup.value.name;
    this.controller().region = this.formGroup.value.region;
    this.controller().dolPolicy = this.formGroup.value.dolPolicy;
    if (this.productionLines_().size == 0) {
      this.addProductionLine();
    }
  }

  override afterPushChange(): void {
    this.updateRegionSpecificSelectOptions_();
  }

  private updateRegionSpecificSelectOptions_(): void {
    const region = this.controller().region;
    this.productionBuildings = Object.values(ProductionBuilding).filter(
      (pb) =>
        (lookupProductionInfo(pb)?.allowedRegions?.indexOf(region) ?? -1) != -1,
    );
    this.dolPolicies =
      region == Region.OldWorld || region == Region.CapeTrelawney
        ? this.allDolPolicies
        : [DepartmentOfLaborPolicy.None];

    if (region == Region.OldWorld || region == Region.CapeTrelawney) {
      this.enableControl_('dolPolicy');
    } else {
      this.clearAndDisableControl_('dolPolicy', DepartmentOfLaborPolicy.None);
    }
  }

  addProductionLine(): void {
    const controller = this.controller().addProductionLine();
    const control = new ProductionLineControl(controller);
    this.registerChildControl(control);
    this.productionLines_.update((controls) =>
      new Map(controls).set(controller.id, control),
    );
    this.pushUpChange();
  }

  removeProductionLine(el: ProductionLineControl): void {
    this.unregisterChildControl(el);
    this.productionLines_.update((controls) => {
      const next = new Map(controls);
      next.delete(el.controller.id);
      return next;
    });
    this.controller().removeProductionLineById(el.controller.id);
    this.pushUpChange();
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

  extraGoodLookupIconUrlFn(extraGood: ExtraGoodView): (_: any) => string {
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
    extraGood: ExtraGoodView,
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
