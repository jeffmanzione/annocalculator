import { FormControl, FormGroup } from "@angular/forms";
import { ExtraGoodController, ProductionLineController } from "../../mvc/controllers";
import { ProductionLineView } from "../../mvc/views";
import { BoostType, lookupAllowedBoosts, lookupProductionInfo, ProductionBuilding, requiresElectricity } from "../../mvc/models";
import { EventEmitter } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";


export class ProductionLineControl {
  change = new EventEmitter<void>();

  formGroup: FormGroup;

  extraGoods?: MatTableDataSource<ExtraGoodControl>;
  showExtraGoods = false;
  get expandExtraGoodsIcon(): string {
    if (this.showExtraGoods) {
      return 'arrow_drop_up';
    }
    if (this.extraGoods?.data.length == 0) {
      return 'add';
    }
    return 'arrow_drop_down';
  }

  allowBoostSelect: boolean = true;
  allowedBoosts: Set<BoostType> = new Set();

  efficiency: number = 0;
  buildingProcessTimeSeconds: number = 0;
  goodProcessTimeSeconds: number = 0;
  goodsProducedPerMinute: number = 0;

  constructor(private readonly controller: ProductionLineController) {
    this.formGroup = new FormGroup({
      building: new FormControl(this.controller.building),
      numBuildings: new FormControl(this.controller.numBuildings),
      good: new FormControl(this.controller.good),
      boosts: new FormControl(this.controller.boosts),
      hasTradeUnion: new FormControl(this.controller.hasTradeUnion),
      tradeUnionItemsBonusPercent: new FormControl(this.controller.tradeUnionItemsBonus * 100),
      inRangeOfLocalDepartment: new FormControl(this.controller.inRangeOfLocalDepartment),
    });
    this.extraGoods = new MatTableDataSource(this.controller.extraGoods.map(eg => {
      const control = new ExtraGoodControl(eg);
      control.change.subscribe(_ => this.change.emit());
      return control;
    }));
    // Show by default
    if (this.extraGoods.data.length > 0) {
      this.showExtraGoods = true;
    }
    this.update();
    this.formGroup.valueChanges.subscribe(_ => this.change.emit());
  }

  get view(): ProductionLineView {
    return this.controller;
  }

  // Update the form states (without updating the model/controller).
  private updateFormStates(): void {
    const building: ProductionBuilding = this.formGroup.value.building;
    // For convenience, set production good to the default good when selecting a building.
    if (this.controller.building != building) {
      const productionInfo = lookupProductionInfo(building);
      this.formGroup.controls['good'].setValue(productionInfo!.good, { emitEvent: false });
    }

    this.updateBoostOptions();
    // Some buildings require electricity, and if so, we automatically select it, otherwise, we
    // narrow the field down to possinble options.
    if (requiresElectricity(building)) {
      this.formGroup.controls['boosts'].setValue([BoostType.Electricity], { emitEvent: false });
      this.formGroup.controls['boosts'].disable({ emitEvent: false });
    } else {
      this.formGroup.controls['boosts'].enable({ emitEvent: false });
      this.allowBoostSelect = true;
    }
    // Local department effects have no effect without a DoL on the island and a Trade Union in
    // range.
    if (!this.controller.islandHasDepartmentOfLabor || !this.formGroup.value.hasTradeUnion) {
      this.clearAndDisableControl('inRangeOfLocalDepartment', false);
    } else {
      this.enableControl('inRangeOfLocalDepartment');
    }
    // There cannot be any Trade Union bonuses without a trade union.
    if (this.formGroup.value.hasTradeUnion) {
      this.enableControl('tradeUnionItemsBonusPercent');
    } else {
      this.clearAndDisableControl('tradeUnionItemsBonusPercent', 0);
    }
  }

  private updateBoostOptions(): void {
    console.log(this.formGroup.value.building);
    this.allowedBoosts = new Set(lookupAllowedBoosts(this.formGroup.value.building));
    if (!this.allowedBoosts.has(this.formGroup.value.boosts)) {
      this.formGroup.controls['boosts'].setValue(
        ((this.formGroup.value.boosts ?? []) as BoostType[])
          .filter(b => this.allowedBoosts.has(b)),
        { emitEvent: false });
    }
    console.log(this.allowedBoosts);
  }

  private enableControl(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false })
  }

  private clearAndDisableControl(controlName: string, clearedValue: any = 0): void {
    this.formGroup.controls[controlName].setValue(clearedValue, { emitEvent: false });
    this.formGroup.controls[controlName].disable({ emitEvent: false });
  }

  // Updates the model based on the states of the form.
  private updateModel(): void {
    this.controller.building = this.formGroup.value.building;
    this.controller.good = this.formGroup.value.good;
    this.controller.numBuildings = Number.parseInt(this.formGroup.value.numBuildings);
    this.controller.boosts = this.formGroup.value.boosts;
    this.controller.tradeUnionItemsBonus = (this.formGroup.value.tradeUnionItemsBonusPercent ?? 0) / 100;
    this.controller.inRangeOfLocalDepartment = this.formGroup.value.inRangeOfLocalDepartment;
    this.controller.hasTradeUnion = this.formGroup.value.hasTradeUnion;
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

    if (this.extraGoods) {
      for (const extraGood of this.extraGoods.data) {
        extraGood.update();
      }
    }

    // Derived view fields must be after the model update so that they are fresh after the model update.
    this.updateAndFormatDerivedFields();
  }

  addExtraGood(): ExtraGoodControl {
    const control = new ExtraGoodControl(this.controller.addExtraGood());
    this.extraGoods!.data.push(control);
    control.change.subscribe(_ => this.change.emit());
    return control;
  }

  removeExtraGoodAt(index: number): void {
    this.extraGoods?.data.splice(index, 1);
    if (this.extraGoods?.data.length == 0) {
      this.showExtraGoods = false;
    }
  }

  toggleShowExtraGoods(): void {
    if (this.extraGoods?.data.length == 0) {
      this.addExtraGood();
    }
    this.showExtraGoods = !this.showExtraGoods;
  }
}

export class ExtraGoodControl {
  change = new EventEmitter<void>();

  formGroup: FormGroup;


  processTimeSeconds: number = 0;
  producedPerMinute: number = 0;


  constructor(private readonly controller: ExtraGoodController) {
    this.formGroup = new FormGroup({
      good: new FormControl(this.controller.good),
      rateNumerator: new FormControl(this.controller.rateNumerator),
      rateDenominator: new FormControl(this.controller.rateDenominator),
    });
    this.update();
    this.formGroup.valueChanges.subscribe(_ => this.change.emit());
  }

  update(): void {
    this.controller.good = this.formGroup.value.good;
    this.controller.rateNumerator = this.formGroup.value.rateNumerator;
    this.controller.rateDenominator = this.formGroup.value.rateDenominator;

    this.processTimeSeconds = this.controller.processTimeSeconds;
    this.producedPerMinute = this.controller.producedPerMinute;
  }
};

