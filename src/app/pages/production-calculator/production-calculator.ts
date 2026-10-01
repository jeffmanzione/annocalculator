import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { WorldStore } from '../../shared/mvc/world-store';
import { StoreWorldView } from '../../shared/mvc/world-store-views';
import { StoreWorldController } from '../../shared/mvc/world-store-controllers';
import { IslandId } from '../../shared/mvc/models';
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
import { World } from '../../shared/mvc/models';
import { TradeRoutesPanel } from './trade-routes-panel/trade-routes-panel';
import { SaveData, SaveDialog } from './save-dialog/save-dialog';
import {
  LocalStorageManager,
  StorageItem,
} from '../../services/local-storage/local-storage';
import { Clipboard } from '@angular/cdk/clipboard';
import { AcButton } from '../../components/button/button';
import { L10nText } from '../../components/text/text';
import { defaultWorld } from './default-world';
const WORLD_KEY = 'anno-1800-production-calculator-world';

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
    L10nText,
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

  // The actual source of truth for the loaded world: a normalized, id-keyed
  // signal store (see world-store.ts). Constructed once per loaded world in
  // setWorld() -- import/reset/clear all go through setWorldAndReload(),
  // which reloads the page -- so this instance, and the per-id-cached
  // controllers `world` hands out, stay identity-stable for the page's
  // lifetime.
  private store_!: WorldStore;

  // Write-capable view of store_, handed to <island>/<trade-routes-panel>.
  world!: StoreWorldController;

  // Read-only view of the *same* store_, for summary-panel.ts (which only
  // aggregates). It reads live store state rather than a snapshot.
  worldSummary!: StoreWorldView;

  formGroup?: FormGroup;

  private readonly injector_ = inject(Injector);
  private readonly matDialog_ = inject(MatDialog);
  private readonly clipboard_ = inject(Clipboard);
  private readonly worldStorage_: StorageItem<World>;

  constructor(storageManager: LocalStorageManager) {
    this.worldStorage_ = storageManager.lookupObjectItem(WORLD_KEY);
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      tradeUnionBonusPercent: new FormControl(0),
    });
    this.formGroup.valueChanges.subscribe((value) => {
      this.world.tradeUnionBonus = value.tradeUnionBonusPercent / 100;
    });
    this.setWorld(this.worldStorage_.get() ?? defaultWorld);

    // Persist the world whenever anything in the store changes. toWorld()
    // reads every one of the store's signals, so this effect re-runs after
    // any write, from any component -- no child needs to tell the root
    // "something changed, please save" anymore. Effects are batched, so a
    // burst of writes from one user action saves once. This also runs once
    // on load, which rewrites an older save in normalized form (ids
    // assigned, defaults stripped) -- the same data either way.
    //
    // Created here rather than in the constructor because store_ only
    // exists once setWorld() has run. The store is never replaced for the
    // life of the page (import/reset/clear all reload the page), so the
    // effect doesn't need to track which store it's saving.
    effect(() => this.worldStorage_.set(this.store_.toWorld()), {
      injector: this.injector_,
    });
  }

  setWorld(worldModel?: World): void {
    if (!worldModel) {
      return;
    }
    this.store_ = WorldStore.fromWorld(worldModel);
    this.world = new StoreWorldController(this.store_);
    this.worldSummary = new StoreWorldView(this.store_);
    this.formGroup!.controls['tradeUnionBonusPercent'].setValue(
      this.world.tradeUnionBonus * 100,
      { emitEvent: false },
    );
  }

  addIsland(): void {
    this.world.addIsland();
  }

  removeIsland(id: IslandId): void {
    this.world.removeIsland(id);
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
    this.clipboard_.copy(JSON.stringify(this.store_.toWorld()));
  }

  private resetInputToDefault_(): void {
    this.setWorldAndReload(defaultWorld);
  }

  private clearInput_(): void {
    this.setWorldAndReload({ islands: [], tradeRoutes: [] });
  }

  private get dialogConfig_(): MatDialogConfig<SaveData<World>> {
    return {
      data: { obj: this.store_.toWorld() } as SaveData<World>,
      width: '600px',
      height: '700px',
    };
  }
}
