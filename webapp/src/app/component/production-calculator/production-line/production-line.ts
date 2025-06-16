import { Component, Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductionLineController } from '../../../mvc/controllers';
import { MatInputModule } from '@angular/material/input';
import { BoostType, ProductionBuilding, Good, requiresElectricity, allowedBoosts as lookupAllowedBoosts, lookupProductionInfo } from '../../../mvc/models';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, NG_VALIDATORS, ReactiveFormsModule, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ControllerComponent } from '../base/controller';
import { FormattedNumberModule } from '../../formatted-number/formatted-number';

export function intMinValidator(intMin: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = /^\d+$/.test(control.value) && intMin <= control.value;
    return valid ? null : { intMin: { value: control.value } };
  };
};

@Directive({
  selector: '[intMin]',
  providers: [{ provide: NG_VALIDATORS, useExisting: IntMinValidatorDirective, multi: true }]
})
export class IntMinValidatorDirective implements Validator {
  @Input('intMin') intMin?: number;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.intMin ? intMinValidator(this.intMin)(control) : null;
  }
};

@Component({
  selector: '[production-line]',
  imports: [
    CommonModule,
    FormattedNumberModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    IntMinValidatorDirective,
  ],
  templateUrl: './production-line.html',
  styleUrl: './production-line.scss',
})
export class ProductionLine extends ControllerComponent<ProductionLineController> implements OnInit {
  readonly productionBuildings = Object.values(ProductionBuilding).filter(pb => pb != ProductionBuilding.Unknown);
  readonly goods = Object.values(Good).filter(pb => pb != Good.Unknown);
  readonly boosts = Object.values(BoostType);

  allowedBoosts: Set<BoostType> = new Set();

  @Output()
  remove = new EventEmitter<void>();

  formGroup?: FormGroup;
  efficiency: number = 0;
  buildingProcessTimeSeconds: number = 0;
  goodProcessTimeSeconds: number = 0;
  goodsProducedPerMinute: number = 0;

  allowBoostSelect: boolean = true;

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      building: new FormControl(this.controller.building),
      good: new FormControl(this.controller.good),
      numBuildings: new FormControl(this.controller.numBuildings),
      goodsRateNumerator: new FormControl(this.controller.goodsRateNumerator),
      goodsRateDenominator: new FormControl(this.controller.goodsRateDenominator),
      boostType: new FormControl(this.controller.boostType),
      hasTradeUnion: new FormControl(this.controller.hasTradeUnion),
      tradeUnionItemsBonusPercent: new FormControl(this.controller.tradeUnionItemsBonus * 100),
      efficiency: new FormControl(1.0),
      buildingProcessTime: new FormControl(0.0),
      goodProcessTime: new FormControl(0.0),
      productionPerMinute: new FormControl(0.0),
      inRangeOfLocalDepartment: new FormControl(this.controller.inRangeOfLocalDepartment),
    });
    this.update();
    this.formGroup.valueChanges.subscribe(_ => this.change.emit());
  }

  // Update the form states (without updating the model/controller).
  private updateFormStates(): void {
    const building: ProductionBuilding = this.formGroup!.value.building;
    // For convenience, set production good to the default good when selecting a building.
    if (this.controller.building != building) {
      const productionInfo = lookupProductionInfo(building);
      this.formGroup!.controls['good'].setValue(productionInfo.good, { emitEvent: false });
    }
    // Some buildings require electricity, and if so, we automatically select it, otherwise, we
    // narrow the field down to possinble options.
    if (requiresElectricity(building)) {
      this.formGroup!.controls['boostType'].setValue(BoostType.Electricity, { emitEvent: false });
      this.allowBoostSelect = false;
    } else {
      this.updateBoostOptions();
      this.allowBoostSelect = true;
    }
    // Local department effects have no effect without a DoL on the island and a Trade Union in
    // range.
    if (!this.controller.islandHasDepartmentOfLabor || !this.formGroup!.value.hasTradeUnion) {
      this.clearAndDisableControl('inRangeOfLocalDepartment', false);
    } else {
      this.enableControl('inRangeOfLocalDepartment');
    }
    // There cannot be any Trade Union bonuses without a trade union.
    if (this.formGroup!.value.hasTradeUnion) {
      this.enableControl('tradeUnionItemsBonusPercent');
    } else {
      this.clearAndDisableControl('tradeUnionItemsBonusPercent', false);
    }
  }

  private updateBoostOptions(): void {
    this.allowedBoosts = new Set(lookupAllowedBoosts(this.formGroup!.value.building));
    if (!this.allowedBoosts.has(this.formGroup!.value.boostType)) {
      this.formGroup!.controls['boostType'].setValue(BoostType.None, { emitEvent: false });
    }
  }

  private enableControl(controlName: string): void {
    this.formGroup!.controls[controlName].enable({ emitEvent: false })
  }

  private clearAndDisableControl(controlName: string, clearedValue: any = 0): void {
    this.formGroup!.controls[controlName].setValue(clearedValue, { emitEvent: false });
    this.formGroup!.controls[controlName].disable({ emitEvent: false });
  }

  // Updates the model based on the states of the form.
  private updateModel(): void {
    this.controller.building = this.formGroup!.value.building;
    this.controller.good = this.formGroup!.value.good;
    this.controller.numBuildings = Number.parseInt(this.formGroup!.value.numBuildings);
    this.controller.goodsRateNumerator = Number.parseInt(this.formGroup!.value.goodsRateNumerator);
    this.controller.goodsRateDenominator = Number.parseInt(this.formGroup!.value.goodsRateDenominator);
    this.controller.boostType = this.formGroup!.value.boostType;
    this.controller.tradeUnionItemsBonus = (this.formGroup!.value.tradeUnionItemsBonusPercent ?? 0) / 100;
    this.controller.inRangeOfLocalDepartment = this.formGroup!.value.inRangeOfLocalDepartment;
    this.controller.hasTradeUnion = this.formGroup!.value.hasTradeUnion;
  }

  private updateAndFormatDerivedFields(): void {
    this.efficiency = this.controller.efficiency;
    this.buildingProcessTimeSeconds = this.controller.buildingProcessTimeSeconds;
    this.goodProcessTimeSeconds = this.controller.goodProcessTimeSeconds;
    this.goodsProducedPerMinute = this.controller.goodsProducedPerMinute;
  }

  update(): void {
    // Form states must be adjusted separately and before model changes to prevent potential infinite
    // loops caused by interdependent component forms in the hierarchy.
    this.updateFormStates();
    this.updateModel();
    // Derived view fields must be after the model update so that they are fresh after the model update.
    this.updateAndFormatDerivedFields();
  }
}

