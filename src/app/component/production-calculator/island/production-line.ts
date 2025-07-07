import { FormControl, FormGroup } from "@angular/forms";
import { ExtraGoodController, ProductionLineController } from "../../../mvc/controllers";
import { ProductionLineView } from "../../../mvc/views";
import { MatTableDataSource } from "@angular/material/table";
import { Boost, ProductionBuilding } from "../../../game/enums";
import { lookupProductionInfo, requiresElectricity, lookupAllowedBoosts } from "../../../game/facts";
import { Control } from "../base/controller";


export class ProductionLineControl extends Control {

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

  allowedBoosts: Set<Boost> = new Set();

  efficiency: number = 0;
  buildingProcessTimeSeconds: number = 0;
  goodProcessTimeSeconds: number = 0;
  goodsProducedPerMinute: number = 0;

  constructor(private readonly controller: ProductionLineController) {
    super();
    this.formGroup = new FormGroup({
      building: new FormControl(this.controller.building),
      numBuildings: new FormControl(this.controller.numBuildings),
      inputGoods: new FormControl(this.controller.inputGoods),
      good: new FormControl(this.controller.good),
      boosts: new FormControl(this.controller.boosts),
      hasTradeUnion: new FormControl(this.controller.hasTradeUnion),
      tradeUnionItemsBonusPercent: new FormControl(this.controller.tradeUnionItemsBonus * 100),
      inRangeOfLocalDepartment: new FormControl(this.controller.inRangeOfLocalDepartment),
    });
    this.extraGoods = new MatTableDataSource(this.controller.extraGoods.map(eg => {
      const control = new ExtraGoodControl(eg);
      this.registerChildControl(control);
      control.afterPushChange();
      return control;
    }));
    // Show by default
    if (this.extraGoods.data.length > 0) {
      this.showExtraGoods = true;
    }
    this.beforeBubbleChange();
    this.afterPushChange();
    this.formGroup.valueChanges.subscribe(_ => this.pushUpChange());
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
      this.formGroup.controls['inputGoods'].setValue(productionInfo!.inputGoods ?? [], { emitEvent: false });
    }
    this.updateBoostOptions();
    // Some buildings require electricity, and if so, we automatically select it, otherwise, we
    // narrow the field down to possinble options.
    if (requiresElectricity(building)) {
      this.clearAndDisableControl('boosts', [Boost.Electricity]);
    } else if (this.allowedBoosts.size == 0) {
      this.clearAndDisableControl('boosts', []);
    } else {
      this.enableControl('boosts');
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
    this.allowedBoosts = new Set(lookupAllowedBoosts(this.formGroup.value.building));
    const selectedBoosts = (this.formGroup.value.boosts ?? []) as Boost[];

    if (!selectedBoosts.every(b => !this.allowedBoosts.has(b))) {
      this.formGroup.controls['boosts'].setValue(
        selectedBoosts.filter(b => this.allowedBoosts.has(b)),
        { emitEvent: false }
      );
    }
  }

  private enableControl(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false })
  }

  private clearAndDisableControl(controlName: string, clearedValue: any = 0): void {
    this.formGroup.controls[controlName].disable({ onlySelf: true, emitEvent: false });
    this.formGroup.controls[controlName].setValue(clearedValue, { onlySelf: true, emitEvent: false });
  }

  // Updates the model based on the states of the form.
  private updateModel(): void {
    this.controller.building = this.formGroup.value.building;
    this.controller.inputGoods = this.formGroup.value.inputGoods;
    this.controller.good = this.formGroup.value.good;
    this.controller.numBuildings = Number.parseInt(this.formGroup.value.numBuildings);
    // Must use getRawValue() as .disable() clears value.boosts
    this.controller.boosts = this.formGroup.controls['boosts'].getRawValue();
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

  override beforeBubbleChange(): void {
    // Form states must be adjusted separately and before model changes to prevent potential infinite
    // loops caused by interdependent component forms in the hierarchy.
    this.updateFormStates();
    this.updateModel();
  }

  override afterPushChange(): void {
    // Derived view fields must be after the model update so that they are fresh after the model update.
    this.updateAndFormatDerivedFields();
  }

  addExtraGood(): ExtraGoodControl {
    const control = new ExtraGoodControl(this.controller.addExtraGood());
    this.extraGoods!.data.push(control);
    this.registerChildControl(control);
    return control;
  }

  removeExtraGoodAt(index: number): void {
    this.controller.removeExtraGoodAt(index);
    const control = this.extraGoods?.data.splice(index, 1)[0]!;
    if (this.extraGoods?.data.length == 0) {
      this.showExtraGoods = false;
    }
    this.unregisterChildControl(control);
  }

  toggleShowExtraGoods(): void {
    if (this.extraGoods?.data.length == 0) {
      this.addExtraGood();
      this.pushUpChange();
    }
    this.showExtraGoods = !this.showExtraGoods;
  }
}

export class ExtraGoodControl extends Control {
  formGroup: FormGroup;

  processTimeSeconds: number = 0;
  producedPerMinute: number = 0;

  constructor(private readonly controller: ExtraGoodController) {
    super();
    this.formGroup = new FormGroup({
      good: new FormControl(this.controller.good),
      rateNumerator: new FormControl(this.controller.rateNumerator),
      rateDenominator: new FormControl(this.controller.rateDenominator),
    });
    this.formGroup.valueChanges.subscribe(_ => this.pushUpChange());
  }

  override beforeBubbleChange(): void {
    this.controller.good = this.formGroup.value.good;
    this.controller.rateNumerator = this.formGroup.value.rateNumerator;
    this.controller.rateDenominator = this.formGroup.value.rateDenominator;
    console.log(`beforeBubbleChange ${this.controller.rateNumerator} ${this.controller.rateDenominator}`);
  }

  override afterPushChange(): void {
    this.processTimeSeconds = this.controller.processTimeSeconds;
    this.producedPerMinute = this.controller.producedPerMinute;
  }
};

