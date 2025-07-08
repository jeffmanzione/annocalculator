import { ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IslandController } from '../../../shared/mvc/controllers';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ControlComponent } from '../base/controller';
import { ExtraGoodControl, ProductionLineControl } from './production-line';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormattedNumberModule } from '../../../shared/components/formatted-number/formatted-number';
import { EnumSelect } from '../../../shared/components/enum-select/enum-select';
import { Boost, Region, DepartmentOfLaborPolicy, Good, ProductionBuilding } from '../../../shared/game/enums';
import { lookupProductionInfo } from '../../../shared/game/facts';
import { lookupBuildingIconUrl, lookupGoodIconUrl, lookupBoostIconUrl, lookupRegionIconUrl, lookupPolicyIconUrl } from '../../../shared/game/icons';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AcButton } from '../../../shared/components/button/button';

@Component({
  selector: 'island',
  imports: [
    AcButton,
    CommonModule,
    EnumSelect,
    FormattedNumberModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    TextFieldModule,
  ],
  templateUrl: './island.html',
  styleUrl: './island.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Island extends ControlComponent<IslandController> implements OnInit {
  readonly regions = Object.values(Region).filter(r => r != Region.Unknown);
  readonly allDolPolicies = Object.values(DepartmentOfLaborPolicy);
  readonly goods = Object.values(Good).filter(g => g != Good.Unknown);

  dolPolicies!: DepartmentOfLaborPolicy[];
  productionBuildings!: ProductionBuilding[];

  readonly productionLineColumns = [
    'building',
    'numBuildings',
    'expandExtraGoods',
    'inputGoods',
    'good',
    'boosts',
    'hasTradeUnion',
    'tradeUnionItemsBonusPercent',
    'inRangeOfLocalDepartment',
    'efficiency',
    'buildingProcessTimeSeconds',
    'goodProcessTimeSeconds',
    'goodsProducedPerMinute',
    'remove',
  ];

  readonly extraGoodColumns = [
    'good',
    'rateNumerator',
    'divideSymbol',
    'rateDenominator',
    'processTimeSeconds',
    'producedPerMinute',
    'remove',
  ];

  formGroup!: FormGroup;

  private _productionLineControls!: ProductionLineControl[];

  get productionLineControls(): ProductionLineControl[] {
    if (this._productionLineControls.length == 0) {
      this.addProductionLine();
    }
    return this._productionLineControls;
  }

  productionLinesDataSource!: MatTableDataSource<ProductionLineControl>;

  @ViewChild('productionLinesTable')
  table!: MatTable<ProductionLineControl>;

  @ViewChildren('extraGoodTables')
  extraGoodTables!: QueryList<MatTable<ExtraGoodControl>>;

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(this.controller.name),
      region: new FormControl(this.controller.region),
      dolPolicy: new FormControl(this.controller.dolPolicy),
    });
    this.formGroup.valueChanges.subscribe(_ => this.pushUpChange());
    this._productionLineControls = this.controller.productionLines.map(pl => {
      const control = new ProductionLineControl(pl);
      this.registerChildControl(control);
      return control;
    });

    if (this._productionLineControls.length == 0) {
      this.addProductionLine();
    }

    this.productionLinesDataSource = new MatTableDataSource(this._productionLineControls);
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
    if (this.extraGoodTables) {
      for (const extraGoodTable of this.extraGoodTables) {
        extraGoodTable.renderRows();
      }
    }
    this.table?.renderRows();
  }

  private updateRegionSpecificSelectOptions(): void {
    const region = this.controller.region;
    this.productionBuildings = Object.values(ProductionBuilding)
      .filter(pb => (lookupProductionInfo(pb)?.allowedRegions?.indexOf(region) ?? -1)
        != -1);
    this.dolPolicies = (region == Region.OldWorld || region == Region.CapeTrelawney) ? this.allDolPolicies : [DepartmentOfLaborPolicy.None];

    if (region == Region.OldWorld || region == Region.CapeTrelawney) {
      this.enableControl('dolPolicy');
    } else {
      this.clearAndDisableControl('dolPolicy', DepartmentOfLaborPolicy.None);
    }
  }

  addProductionLine(): void {
    const control = new ProductionLineControl(this.controller.addProductionLine());
    this.registerChildControl(control);
    this._productionLineControls.push(control);
    this.pushUpChange();
  }

  removeProductionLineAt(el: ProductionLineControl): void {
    const index = this._productionLineControls.indexOf(el);
    this.unregisterChildControl(this._productionLineControls.splice(index, 1)[0]);
    this.controller.removeProductionLineAt(index);
    this.pushUpChange();
  }

  toggleShowExtraGoods(productionLine: ProductionLineControl): void {
    productionLine.toggleShowExtraGoods();
    this.extraGoodTables.get(this._productionLineControls.indexOf(productionLine))?.renderRows();
  }

  addExtraGood(productionLine: ProductionLineControl): void {
    productionLine.addExtraGood();
    this.pushUpChange();
  }

  removeExtraGoodAt(productionLine: ProductionLineControl, extraGood: ExtraGoodControl): void {
    const index = productionLine.extraGoods?.data.indexOf(extraGood)!;
    productionLine.removeExtraGoodAt(index);
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

  lookupRegionIconUrl(region: Region | null): string {
    return lookupRegionIconUrl(region ?? Region.Unknown);
  }

  lookupPolicyIconUrl(policy: DepartmentOfLaborPolicy | null): string {
    return lookupPolicyIconUrl(policy ?? DepartmentOfLaborPolicy.None);
  }

  private enableControl(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false })
  }

  private clearAndDisableControl(controlName: string, clearedValue: any = 0): void {
    this.formGroup.controls[controlName].setValue(clearedValue, { emitEvent: false });
    this.formGroup.controls[controlName].disable({ emitEvent: false });
  }
}
