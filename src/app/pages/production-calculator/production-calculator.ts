import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  viewChild,
  viewChildren,
} from '@angular/core';
import { WorldController } from '../../shared/mvc/controllers';
import { Island } from './island/island';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SummaryPanel } from './summary-panel/summary-panel';
import { CardModule } from '../../components/card/card';
import {
  Region,
  DepartmentOfLaborPolicy,
  ProductionBuilding,
  Good,
  Boost,
} from '../../shared/game/enums';
import { World } from '../../shared/mvc/models';
import { TradeRoutesPanel } from './trade-routes-panel/trade-routes-panel';
import { SaveData, SaveDialog } from './save-dialog/save-dialog';
import {
  LocalStorageManager,
  StorageItem,
} from '../../services/local-storage/local-storage';
import { Clipboard } from '@angular/cdk/clipboard';
import { AcButton } from '../../components/button/button';

const WORLD_KEY = 'anno-1800-production-calculator-world';

const defaultWorld: World = {
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
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.FlourMill,
          inputGoods: [Good.Grain],
          good: Good.Flour,
          numBuildings: 5,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.Brewery,
          inputGoods: [Good.Malt, Good.Hops],
          good: Good.Beer,
          numBuildings: 4,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.Malthouse,
          inputGoods: [Good.Grain],
          good: Good.Malt,
          numBuildings: 3,
          boosts: [Boost.Electricity],
          hasTradeUnion: true,
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
      ],
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
          boosts: [Boost.TractorBarn],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.HopFarm,
          good: Good.Hops,
          numBuildings: 3,
          boosts: [Boost.TractorBarn],
          hasTradeUnion: true,
          inRangeOfLocalDepartment: true,
        },
        {
          building: ProductionBuilding.HuntingCabin,
          good: Good.Furs,
          numBuildings: 10,
        },
      ],
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
      ],
    },
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
    AcButton,
    CardModule,
    Island,
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
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionCalculatorPage implements OnInit {
  readonly defaultActions = [
    {
      icon: 'content_copy',
      fn: () => this.copyJsonToClipboard_(),
      tooltip: 'Copy the JSON representation of your inputs to your clipboard.',
    },
    {
      icon: 'edit_square',
      fn: () => this.openSaveDialog_(),
      tooltip: 'Manually edit the JSON inputs.',
    },
    {
      icon: 'refresh',
      fn: () => this.resetInputToDefault_(),
      tooltip: 'Reset the inputs to a default example.',
    },
    {
      icon: 'delete',
      fn: () => this.clearInput_(),
      tooltip: 'Completely clear the inputs.',
    },
  ];

  world!: WorldController;

  formGroup?: FormGroup;

  private readonly changeDectorRef_ = inject(ChangeDetectorRef);
  private readonly matDialog_ = inject(MatDialog);
  private readonly clipboard_ = inject(Clipboard);
  private readonly worldStorage_: StorageItem<World>;

  islandComponents = viewChildren(Island);
  summaryPanel = viewChild.required(SummaryPanel);
  tradeRoutesPanel = viewChild(TradeRoutesPanel);

  constructor(storageManager: LocalStorageManager) {
    this.worldStorage_ = storageManager.lookupObjectItem(WORLD_KEY);
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      tradeUnionBonusPercent: new FormControl(0),
    });
    this.formGroup.valueChanges.subscribe(() => this.update());
    this.setWorld(this.worldStorage_.get() ?? defaultWorld);
  }

  setWorld(worldModel?: World): void {
    if (!worldModel) {
      return;
    }
    this.world = WorldController.wrap(worldModel);
    this.formGroup!.controls['tradeUnionBonusPercent'].setValue(
      this.world.tradeUnionBonus * 100,
      { emitEvent: false },
    );
  }

  update(): void {
    this.changeDectorRef_.detectChanges();
    this.world.tradeUnionBonus =
      this.formGroup!.value.tradeUnionBonusPercent / 100;
    if (this.islandComponents) {
      for (const i of this.islandComponents()) {
        i.forceAfterPushChange();
      }
    }
    this.tradeRoutesPanel()?.afterPushChange();
    this.summaryPanel()?.update();
    this.worldStorage_.set(this.world.copyModel());
    // Convert this into a debug-only print.
    // console.log(this.world.toJsonString());
  }

  addIsland(): void {
    this.world.addIsland();
    this.update();
  }

  removeIslandAt(index: number): void {
    this.world.removeIslandAt(index);
    this.update();
  }

  setWorldAndReload(worldModel: World): void {
    if (!worldModel) return;
    this.worldStorage_.set(worldModel);
    globalThis.location.reload();
  }

  private openSaveDialog_(): void {
    this.matDialog_
      .open(SaveDialog, this.dialogConfig_)
      .afterClosed()
      .subscribe((result) => this.setWorldAndReload(result));
  }

  private copyJsonToClipboard_(): void {
    this.clipboard_.copy(this.world.toJsonString());
  }

  private resetInputToDefault_(): void {
    this.setWorldAndReload(defaultWorld);
  }

  private clearInput_(): void {
    this.setWorldAndReload({ islands: [], tradeRoutes: [] });
  }

  private get dialogConfig_(): MatDialogConfig<SaveData<World>> {
    return {
      data: { obj: this.world.copyModel() } as SaveData<World>,
      width: '600px',
      height: '700px',
    };
  }
}
