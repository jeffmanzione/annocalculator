import {
  // ExtraGoodController,
  ProductionLineController,
} from '../../../shared/mvc/controllers';
import { ProductionLineView } from '../../../shared/mvc/views';
// import { MatTableDataSource } from '@angular/material/table';
import {
  Boost,
  Good,
  Item,
  ProductionBuilding,
} from '../../../shared/game/enums';
import {
  lookupProductionInfo,
  requiresElectricity,
  lookupAllowedBoosts,
  lookupAllowedItems,
} from '../../../shared/game/facts';
import { FormGroupControl } from '../../../shared/control/control';

export class ProductionLineControl extends FormGroupControl<ProductionLineController> {
  // extraGoods?: MatTableDataSource<ExtraGoodControl>;
  // showExtraGoods = false;
  // get expandExtraGoodsIcon(): string {
  //   if (this.showExtraGoods) {
  //     return 'arrow_drop_up';
  //   }
  //   if (this.extraGoods?.data.length == 0) {
  //     return 'add';
  //   }
  //   return 'arrow_drop_down';
  // }

  allowedBoosts: Set<Boost> = new Set();
  hasElectricityFromItem: boolean = false;
  allowedItems: Set<Item> = new Set();

  inputGoods: Good[] = [];
  // Will always be a list of size 1 since production lines only output 1 good type.
  outputGoods: Good[] = [];

  efficiency: number = 0;
  buildingProcessTimeSeconds: number = 0;
  goodProcessTimeSeconds: number = 0;
  goodsProducedPerMinute: number = 0;

  constructor(controller: ProductionLineController) {
    super(controller, [
      'building',
      {
        controlName: 'numBuildings',
        updateObject: (v, o) => (o.numBuildings = Number.parseInt(v)),
      },
      'inputGoods',
      'good',
      'boosts',
      'hasTradeUnion',
      'items',
      // {
      //   controlName: 'tradeUnionItemsBonusPercent',
      //   readObject: (o) => (o.itemProductivityBonus ?? 0) * 100,
      //   updateObject: (v, o) => (o.itemProductivityBonus = (v ?? 0) / 100),
      // },
      'inRangeOfLocalDepartment',
    ]);
    // this.extraGoods = new MatTableDataSource(
    //   this.controller.extraGoods.map((eg) => {
    //     const control = new ExtraGoodControl(eg);
    //     this.registerChildControl(control);
    //     control.afterPushChange();
    //     return control;
    //   }),
    // );
    // // Show by default
    // if (this.extraGoods.data.length > 0) {
    //   this.showExtraGoods = true;
    // }
    this.beforeBubbleChange();
    this.afterPushChange();
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
      this.formGroup.controls['good'].setValue(productionInfo!.good, {
        emitEvent: false,
      });
      this.formGroup.controls['inputGoods'].setValue(
        productionInfo!.inputGoods ?? [],
        { emitEvent: false },
      );
    }
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
      !this.controller.islandHasDepartmentOfLabor ||
      !this.formGroup.value.hasTradeUnion
    ) {
      this.clearAndDisableControl('inRangeOfLocalDepartment', false);
    } else {
      this.enableControl('inRangeOfLocalDepartment');
    }
  }

  // private computeHasElectricityFromItem(): boolean {
  //   if (this.formGroup.value.hasTradeUnion) {
  //     const selectedItems = (this.formGroup.value.items || []) as Item[];
  //     this.hasElectricityFromItem = selectedItems.some(
  //       (input) => lookupItemInfo(input)?.providesElectricity,
  //     );
  //   } else {
  //     this.hasElectricityFromItem = false;
  //   }
  //   return this.hasElectricityFromItem;
  // }

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
    this.allowedItems = new Set(
      lookupAllowedItems(this.formGroup.value.building),
    );
    const selectedItems = (this.formGroup.value.items || []) as Item[];

    if (!selectedItems.every((i) => !this.allowedItems.has(i))) {
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
    this.buildingProcessTimeSeconds =
      this.controller.buildingProcessTimeSeconds;
    this.goodProcessTimeSeconds = this.controller.goodProcessTimeSeconds;
    this.goodsProducedPerMinute = this.controller.goodsProducedPerMinute;
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

  // addExtraGood(): ExtraGoodControl {
  //   const control = new ExtraGoodControl(this.controller.addExtraGood());
  //   this.extraGoods!.data.push(control);
  //   this.registerChildControl(control);
  //   return control;
  // }

  // removeExtraGoodAt(index: number): void {
  //   this.controller.removeExtraGoodAt(index);
  //   const control = this.extraGoods?.data.splice(index, 1)[0]!;
  //   if (this.extraGoods?.data.length == 0) {
  //     this.showExtraGoods = false;
  //   }
  //   this.unregisterChildControl(control);
  // }

  // toggleShowExtraGoods(): void {
  //   if (this.extraGoods?.data.length == 0) {
  //     // this.addExtraGood();
  //     this.pushUpChange();
  //   }
  //   this.showExtraGoods = !this.showExtraGoods;
  // }
}

// export class ExtraGoodControl extends FormGroupControl<ExtraGoodController> {
//   processTimeSeconds: number = 0;
//   producedPerMinute: number = 0;

//   constructor(controller: ExtraGoodController) {
//     super(controller, ['good', 'rateNumerator', 'rateDenominator']);
//   }

//   override afterPushChange(): void {
//     this.processTimeSeconds = this.controller.processTimeSeconds;
//     this.producedPerMinute = this.controller.producedPerMinute;
//   }
// }
