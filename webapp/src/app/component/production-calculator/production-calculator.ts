import { ChangeDetectorRef, Component, inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { WorldController } from '../../mvc/controllers';
import { Island } from "./island/island";
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SummaryPanel } from "./summary-panel/summary-panel";
import { CardModule } from '../card/card';
import { Region, DepartmentOfLaborPolicy, ProductionBuilding, Good, Boost } from '../../game/enums';
import { WorldModel } from '../../mvc/models';
import { Control } from './base/controller';
import { TradeRoutesPanel } from "./trade-routes-panel/trade-routes-panel";
import { SaveData, SaveDialog } from './save-dialog/save-dialog';
import { LocalStorageManager, StorageItem } from '../../service/local-storage';
import { Clipboard } from '@angular/cdk/clipboard';

const WORLD_KEY = 'anno-1800-production-calculator-world';

const defaultWorld: WorldModel = {
  tradeUnionBonus: 0.3,
  islands: [
    {
      id: 1,
      name: 'Crown Falls',
      region: Region.CapeTrelawney,
      dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
      productionLines: [
        {
          building: ProductionBuilding.Bakery,
          inputGoods: [Good.Flour],
          good: Good.Bread,
          numBuildings: 10,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          tradeUnionItemsBonus: 0.5,
          inRangeOfLocalDepartment: true,
          extraGoods: [
            {
              good: Good.Chocolate,
              rateNumerator: 1,
              rateDenominator: 3,
            }
          ],
        },
        {
          building: ProductionBuilding.FlourMill,
          inputGoods: [Good.Grain],
          good: Good.Flour,
          numBuildings: 5,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          tradeUnionItemsBonus: 0.5,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.Brewery,
          inputGoods: [Good.Malt, Good.Hops],
          good: Good.Beer,
          numBuildings: 4,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          tradeUnionItemsBonus: 0.3,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.Malthouse,
          inputGoods: [Good.Grain],
          good: Good.Malt,
          numBuildings: 3,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          tradeUnionItemsBonus: 0.3,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.AdvancedCoffeeRoaster,
          inputGoods: [Good.Malt],
          good: Good.Coffee,
          numBuildings: 2,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.FurDealer,
          inputGoods: [Good.CottonFabric, Good.Furs],
          good: Good.FurCoats,
          numBuildings: 2,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
      ]
    },
    {
      id: 2,
      name: 'Farm Island',
      region: Region.OldWorld,
      dolPolicy: DepartmentOfLaborPolicy.LandReformAct,
      productionLines: [
        {
          building: ProductionBuilding.GrainFarm,
          good: Good.Grain,
          numBuildings: 8,
          boosts: [Boost.TracktorBarn],
          hasTradeUnion: true,
          tradeUnionItemsBonus: 0.5,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.HopFarm,
          good: Good.Hops,
          numBuildings: 3,
          boosts: [Boost.TracktorBarn],
          hasTradeUnion: true,
          tradeUnionItemsBonus: 0.5,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.HuntingCabin,
          good: Good.Furs,
          numBuildings: 10,
        },
      ]
    },
    {
      id: 3,
      name: 'Plantation Island',
      region: Region.NewWorld,
      productionLines: [
        {
          building: ProductionBuilding.CottonPlantation,
          good: Good.Cotton,
          numBuildings: 10,
        },
        {
          building: ProductionBuilding.CottonMill,
          good: Good.CottonFabric,
          inputGoods: [Good.Cotton],
          numBuildings: 5,
        },
      ]
    }
  ],
  tradeRoutes: [
    {
      id: 1,
      sourceIslandId: 2,
      targetIslandId: 1,
      good: Good.Grain,
    },
    {
      id: 2,
      sourceIslandId: 2,
      targetIslandId: 1,
      good: Good.Hops,
    },
    {
      id: 3,
      sourceIslandId: 2,
      targetIslandId: 1,
      good: Good.Furs,
    },
    {
      id: 4,
      sourceIslandId: 3,
      targetIslandId: 1,
      good: Good.CottonFabric,
    },
  ],
};


@Component({
  selector: 'production-calculator-page',
  imports: [
    CardModule,
    CommonModule,
    Island,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    SummaryPanel,
    TradeRoutesPanel,
  ],
  templateUrl: './production-calculator.html',
  styleUrl: './production-calculator.scss',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    }
  ],
})
export class ProductionCalculatorPage extends Control implements OnInit {
  world!: WorldController;

  formGroup?: FormGroup;

  private readonly changeDectorRef = inject(ChangeDetectorRef);
  private readonly matDialog = inject(MatDialog);
  private readonly worldStorage: StorageItem<WorldModel>;
  private readonly clipboard = inject(Clipboard);

  @ViewChildren(Island)
  islandComponents!: QueryList<Island>;

  @ViewChild(SummaryPanel)
  summaryPanel!: SummaryPanel;

  constructor(storageManager: LocalStorageManager) {
    super();
    this.worldStorage = storageManager.lookupObjectItem(WORLD_KEY);
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      tradeUnionBonusPercent: new FormControl(0),
    });
    this.setWorld(this.worldStorage.get() ?? defaultWorld);
    this.formGroup.valueChanges.subscribe(() => this.update());
  }

  setWorld(worldModel: WorldModel): void {
    if (!worldModel) {
      return;
    }
    this.world = WorldController.wrap(worldModel);
    this.formGroup!.controls['tradeUnionBonusPercent'].setValue(this.world.tradeUnionBonus * 100, { emitEvent: false });
  }

  update(): void {
    this.changeDectorRef.detectChanges();
    this.world.tradeUnionBonus = this.formGroup!.value.tradeUnionBonusPercent / 100;
    if (this.islandComponents) {
      for (const i of this.islandComponents) {
        i.afterPushChange();
      }
    }
    this.summaryPanel?.update();
    this.worldStorage.set(this.world.copyModel());
    console.log(this.world.toJsonString());
  }

  addIsland(): void {
    this.world.addIsland();
    this.update();
  }

  removeIslandAt(index: number): void {
    this.world.removeIslandAt(index);
    this.update();
  }

  openSaveDialog(): void {
    this.matDialog
      .open(SaveDialog, this.dialogConfig)
      .afterClosed()
      .subscribe((result) => this.setWorld(result));
  }

  copyJsonToClipboard(): void {
    this.clipboard.copy(this.world.toJsonString());
  }

  resetInput(): void {
    this.setWorld(defaultWorld);
    this.update();
  }

  clearInput(): void {
    this.setWorld({ islands: [], tradeRoutes: [] });
    this.update();
  }

  private get dialogConfig(): MatDialogConfig<SaveData<WorldModel>> {
    return {
      data: { obj: this.world.copyModel() } as SaveData<WorldModel>,
      width: '600px',
      height: '700px',
    };
  }
}
