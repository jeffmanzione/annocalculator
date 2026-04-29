import { ProductionLineController } from '../../../shared/mvc/controllers';
import { ExtraGoodView, ProductionLineView } from '../../../shared/mvc/views';
import {
  Boost,
  Good,
  Item,
  ProductionBuilding,
  Region,
} from '../../../shared/game/enums';
import {
  requiresElectricity,
  lookupAllowedBoosts,
  lookupAllowedItems,
  producesDung,
} from '../../../shared/game/facts';
import { FormGroupControl } from '../../../shared/control/control';
import { NumberConstituent } from '../../../components/composite-number/composite-number';
import { MatTableDataSource } from '@angular/material/table';

export class ProductionLineControl extends FormGroupControl<ProductionLineController> {
  extraGoods?: MatTableDataSource<ExtraGoodView>;
  hasExtraGoods = false;
  showExtraGoods = false;
  get expandExtraGoodsIcon(): string {
    if (this.showExtraGoods) {
      return 'arrow_drop_up';
    }
    if (this.extraGoods?.data.length == 0) {
      return 'check_indeterminate_small';
    }
    return 'arrow_drop_down';
  }

  allowedBoosts: Set<Boost> = new Set();
  allowedItems: Set<Item> = new Set();

  inputGoods: Good[] = [];
  // Will always be a list of size 1 since production lines only output 1 good type.
  outputGoods: Good[] = [];

  efficiency: number = 0;
  efficiencyConstituents: NumberConstituent[] = [];
  buildingProcessTimeSeconds: number = 0;
  goodsProducedPerMinute: number = 0;

  constructor(controller: ProductionLineController) {
    super(controller, [
      'building',
      {
        controlName: 'numBuildings',
        updateObject: (v, o) => (o.numBuildings = Number.parseInt(v)),
      },
      'boosts',
      'hasTradeUnion',
      'items',
      'inRangeOfLocalDepartment',
      'inRangeOfHaciendaFertiliserWorks',
    ]);
    this.extraGoods = new MatTableDataSource(this.controller.extraGoods);
    // Show by default
    if (this.extraGoods.data.length > 0) {
      this.hasExtraGoods = true;
      this.showExtraGoods = true;
    }
    this.beforeBubbleChange();
    this.afterPushChange();
  }

  get view(): ProductionLineView {
    return this.controller;
  }

  // Update the form states (without updating the model/controller).
  private updateFormStates(): void {
    const building: ProductionBuilding = this.formGroup.value.building;
    this.updateBoostOptions();
    // Some buildings require electricity, and if so, we automatically select it, otherwise, we
    // narrow the field down to possible options.
    if (requiresElectricity(building)) {
      this.clearAndDisableControl('boosts', [Boost.Electricity]);
    } else if (this.allowedBoosts.size == 0) {
      this.clearAndDisableControl('boosts', []);
    } else {
      this.enableControl('boosts');
    }

    // Items can only be slotted in trade unions.
    if (this.formGroup.value.hasTradeUnion) {
      this.updateItemOptions();
      this.enableControl('items');
    } else {
      this.clearAndDisableControl('items', false);
    }

    // Local department effects have no effect without a DoL on the island and a Trade Union in
    // range.
    if (
      (this.controller.region != Region.NewWorld &&
        !this.controller.islandHasDepartmentOfLabor) ||
      !this.formGroup.value.hasTradeUnion
    ) {
      this.clearAndDisableControl('inRangeOfLocalDepartment', false);
    } else {
      this.enableControl('inRangeOfLocalDepartment');
    }

    // Only new-world buildings can produce dung.
    if (
      this.controller.region == Region.NewWorld &&
      producesDung(this.controller.building)
    ) {
      this.enableControl('inRangeOfHaciendaFertiliserWorks');
    } else {
      this.clearAndDisableControl('inRangeOfHaciendaFertiliserWorks', false);
    }
  }

  private updateBoostOptions(): void {
    this.allowedBoosts = new Set(
      lookupAllowedBoosts(this.formGroup.value.building),
    );
    const selectedBoosts = (this.formGroup.value.boosts ?? []) as Boost[];

    if (!selectedBoosts.every((b) => !this.allowedBoosts.has(b))) {
      this.formGroup.controls['boosts'].setValue(
        selectedBoosts.filter((b) => this.allowedBoosts.has(b)),
        { emitEvent: false },
      );
    }
  }
  private updateItemOptions(): void {
    const newAllowedItems = new Set(
      lookupAllowedItems(this.formGroup.value.building),
    );
    if (!setsAreEqual(newAllowedItems, this.allowedItems)) {
      this.allowedItems = newAllowedItems;
    }

    const selectedItems = (this.formGroup.value.items || []) as Item[];

    if (selectedItems.some((i) => !this.allowedItems.has(i))) {
      this.formGroup.controls['items'].setValue(
        selectedItems.filter((i) => this.allowedItems.has(i)),
        { emitEvent: false },
      );
    }
  }

  private enableControl(controlName: string): void {
    this.formGroup.controls[controlName].enable({ emitEvent: false });
  }

  private clearAndDisableControl(
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

  private updateAndFormatDerivedFields(): void {
    this.inputGoods = this.controller.inputGoods;
    this.outputGoods = [this.controller.good];

    this.efficiency = this.controller.efficiency;
    this.efficiencyConstituents = this.controller.efficiencyConstituents;

    this.buildingProcessTimeSeconds =
      this.controller.buildingProcessTimeSeconds;
    this.goodsProducedPerMinute =
      this.controller.goodsProducedPerMinuteWithExtras;

    this.extraGoods!.data = this.controller.extraGoods;
    this.hasExtraGoods = this.extraGoods!.data.length > 0;
    this.showExtraGoods = this.showExtraGoods && this.hasExtraGoods;
  }

  override beforeModelUpdate(): void {
    // Form states must be adjusted separately and before model changes to prevent potential infinite
    // loops caused by interdependent component forms in the hierarchy.
    this.updateFormStates();
  }

  override afterPushChange(): void {
    this.updateFormStates();
    // Derived view fields must be after the model update so that they are fresh after the model update.
    this.updateAndFormatDerivedFields();
  }

  toggleShowExtraGoods(): void {
    this.showExtraGoods = !this.showExtraGoods && this.hasExtraGoods;
  }
}

const setsAreEqual = (s1: Set<any>, s2: Set<any>): boolean => {
  return s1.size === s2.size && [...s1].every((x) => s2.has(x));
};
