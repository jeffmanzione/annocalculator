import { ChangeDetectionStrategy, Component, Directive, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductionLineController } from '../../../mvc/controllers';
import { MatInputModule } from '@angular/material/input';
import { BoostType, ProductionBuilding, Good, requiresElectricity, allowedBoosts } from '../../../mvc/models';
import { CommonModule, formatNumber, formatPercent } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, NG_VALIDATORS, ReactiveFormsModule, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

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
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    IntMinValidatorDirective
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } }
  ],
  templateUrl: './production-line.html',
  styleUrl: './production-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionLine implements OnInit {
  readonly productionBuildings = Object.values(ProductionBuilding).filter(pb => pb != ProductionBuilding.Unknown);
  readonly goods = Object.values(Good).filter(pb => pb != Good.Unknown);
  readonly boosts = Object.values(BoostType);

  allowedBoosts: Set<BoostType> = new Set();

  constructor(@Inject(LOCALE_ID) private readonly locale: string) { }

  @Input()
  controller?: ProductionLineController;

  @Input()
  formGroup?: FormGroup;

  @Output()
  remove = new EventEmitter<void>();

  efficiency: string = '-';
  buildingProcessTimeSeconds: string = '-';
  goodProcessTimeSeconds: string = '-';
  goodsProducedPerMinute: string = '-';

  allowBoostSelect: boolean = true;

  private formatPercent(value: number): string {
    return formatPercent(value, this.locale, '1.0-0');
  }

  private formatNumber(value: number): string {
    return formatNumber(value, this.locale, '1.0-1');
  }

  ngOnInit(): void {
    const controls: Record<string, FormControl> = {
      building: new FormControl(this.controller!.building),
      resource: new FormControl(this.controller!.good),
      numBuildings: new FormControl(this.controller!.numBuildings),
      goodsRateNumerator: new FormControl(this.controller!.goodsRateNumerator),
      goodsRateDenominator: new FormControl(this.controller!.goodsRateDenominator),
      boostType: new FormControl(this.controller!.boostType),
      hasTradeUnion: new FormControl(this.controller!.hasTradeUnion),
      tradeUnionItemsBonusPercent: new FormControl(this.controller!.tradeUnionItemsBonus * 100),
      efficiency: new FormControl(1.0),
      buildingProcessTime: new FormControl(0.0),
      goodProcessTime: new FormControl(0.0),
      productionPerMinute: new FormControl(0.0),
    };
    Object.keys(controls).forEach(name => this.formGroup!.addControl(name, controls[name]));

    this.update();
    this.formGroup!.valueChanges.subscribe(() => this.update());

  }

  private update(): void {
    this.controller!.building = this.formGroup!.value.building;

    if (requiresElectricity(this.controller!.building)) {
      this.formGroup!.controls['boostType'].setValue(BoostType.Electricity, { emitEvent: false });
      this.allowBoostSelect = false;
    } else {
      this.allowedBoosts = new Set(allowedBoosts(this.controller!.building));
      if (!this.allowedBoosts.has(this.formGroup!.value.boostType)) {
        this.formGroup!.controls['boostType'].setValue(BoostType.None, { emitEvent: false });
      }
      this.allowBoostSelect = true;
    }

    this.controller!.good = this.formGroup!.value.resource;
    this.controller!.numBuildings = this.formGroup!.value.numBuildings;
    this.controller!.goodsRateNumerator = this.formGroup!.value.goodsRateNumerator;
    this.controller!.goodsRateDenominator = this.formGroup!.value.goodsRateDenominator;
    this.controller!.boostType = this.formGroup!.value.boostType;
    this.controller!.tradeUnionItemsBonus = (this.formGroup!.value.tradeUnionItemsBonusPercent ?? 0) / 100;
    this.controller!.hasTradeUnion = this.formGroup!.value.hasTradeUnion;

    if (this.controller!.hasTradeUnion) {
      this.formGroup!.controls['tradeUnionItemsBonusPercent'].enable({ emitEvent: false });
    } else {
      this.formGroup!.controls['tradeUnionItemsBonusPercent'].setValue(0, { emitEvent: false });
      this.formGroup!.controls['tradeUnionItemsBonusPercent'].disable({ emitEvent: false });
    }

    this.efficiency = this.formatPercent(this.controller!.efficiency);
    this.buildingProcessTimeSeconds = this.formatNumber(this.controller!.buildingProcessTimeSeconds);
    this.goodProcessTimeSeconds = this.formatNumber(this.controller!.goodProcessTimeSeconds);
    this.goodsProducedPerMinute = this.formatNumber(this.controller!.goodsProducedPerMinute);
  }

  submitForm(): void {
    console.log(this.controller!.toJsonString());
  }

}

