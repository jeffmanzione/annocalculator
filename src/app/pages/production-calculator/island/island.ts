import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IslandController } from '../../../shared/mvc/controllers';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
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
    ];
    if (
      this.controller.region == Region.OldWorld ||
      this.controller.region == Region.CapeTrelawney
    ) {
      columns.push('inRangeOfLocalDepartment');
    } else if (this.controller.region == Region.NewWorld) {
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

  private _productionLineControls!: ProductionLineControl[];
  Boost: any;

  get productionLineControls(): ProductionLineControl[] {
    if (this._productionLineControls.length == 0) {
      this.addProductionLine();
    }
    return this._productionLineControls;
  }

  productionLinesDataSource!: MatTableDataSource<ProductionLineControl>;

  @ViewChild('productionLinesTable')
  table!: MatTable<ProductionLineControl>;

  get multipleSelectLimit(): number {
    return this.controller.dolPolicy ==
      DepartmentOfLaborPolicy.UnionSubsidiesAct
      ? 4
      : 3;
  }

  get inRangeHeader(): string {
    return this.controller.region == Region.NewWorld
      ? 'Fert Works'
      : 'Local Dept';
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(this.controller.name),
      region: new FormControl(this.controller.region),
      dolPolicy: new FormControl(this.controller.dolPolicy),
    });
    this.formGroup.valueChanges.subscribe((_) => this.pushUpChange());
    this._productionLineControls = this.controller.productionLines.map((pl) => {
      const control = new ProductionLineControl(pl);
      this.registerChildControl(control);
      return control;
    });

    if (this._productionLineControls.length == 0) {
      this.addProductionLine();
    }

    this.productionLinesDataSource = new MatTableDataSource(
      this._productionLineControls,
    );
    this.afterPushChange();
  }

  override beforeBubbleChange(): void {
    this.controller.name = this.formGroup.value.name;
    this.controller.region = this.formGroup.value.region;
    this.controller.dolPolicy = this.formGroup.value.dolPolicy;
    if (this._productionLineControls.length == 0) {
      this.addProductionLine();
    }
  }

  override afterPushChange(): void {
    this.updateRegionSpecificSelectOptions();
    this.table?.renderRows();
  }

  private updateRegionSpecificSelectOptions(): void {
    const region = this.controller.region;
    this.productionBuildings = Object.values(ProductionBuilding).filter(
      (pb) =>
        (lookupProductionInfo(pb)?.allowedRegions?.indexOf(region) ?? -1) != -1,
    );
    this.dolPolicies =
      region == Region.OldWorld || region == Region.CapeTrelawney
        ? this.allDolPolicies
        : [DepartmentOfLaborPolicy.None];

    if (region == Region.OldWorld || region == Region.CapeTrelawney) {
      this.enableControl('dolPolicy');
    } else {
      this.clearAndDisableControl('dolPolicy', DepartmentOfLaborPolicy.None);
    }
  }

  addProductionLine(): void {
    const control = new ProductionLineControl(
      this.controller.addProductionLine(),
    );
    this.registerChildControl(control);
    this._productionLineControls.push(control);
    this.pushUpChange();
  }

  removeProductionLineAt(el: ProductionLineControl): void {
    const index = this._productionLineControls.indexOf(el);
    this.unregisterChildControl(
      this._productionLineControls.splice(index, 1)[0],
    );
    this.controller.removeProductionLineAt(index);
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

  extraGoodLookupIconUrlFn(extraGood: ExtraGoodView): (_: any) => string {
    if (extraGood.sourceType === 'Boost') {
      return lookupBoostIconUrl;
    } else if (extraGood.sourceType === 'DepartmentOfLaborPolicy') {
      return lookupPolicyIconUrl;
    }
    return lookupItemIconUrl;
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

  private enableControl(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false });
  }

  private clearAndDisableControl(
    controlName: string,
    clearedValue: any = 0,
  ): void {
    this.formGroup.controls[controlName].setValue(clearedValue, {
      emitEvent: false,
    });
    this.formGroup.controls[controlName].disable({ emitEvent: false });
  }
}
