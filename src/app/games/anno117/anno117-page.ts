import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AcButton } from '../../components/button/button';
import { CardModule } from '../../components/card/card';
import { EnumSelect } from '../../components/enum-select/enum-select';
import { L10nText } from '../../components/text/text';
import {
  SaveData,
  SaveDialog,
} from '../../pages/production-calculator/save-dialog/save-dialog';
import { SummaryPanel } from '../../pages/production-calculator/summary-panel/summary-panel';
import { TradeRoutesPanel } from '../../pages/production-calculator/trade-routes-panel/trade-routes-panel';
import { L10nService } from '../../services/l10n/l10n';
import {
  LocalStorageManager,
  StorageItem,
} from '../../services/local-storage/local-storage';
import { L10nKey } from '../../shared/l10n/l10n';
import { GAME } from '../game';
import { anno117Game, iconUrl, nameIn } from './anno117-game';
import { anno117Data, techsById } from './game/data';
import { Anno117Island } from './island/anno117-island';
import { defaultWorld117 } from './model/default-world';
import {
  InvalidSaveError,
  Save117,
  saveOf,
  World117,
  WORLD_KEY_117,
  worldFromSave,
} from './model/models';
import { World117Controller } from './model/world-controllers';
import { WorldStore117 } from './model/world-store-117';

/** The Anno 117 calculator page: the same layout as the Anno 1800 one, with Anno 117's islands and rules. */
@Component({
  selector: 'anno-117-page',
  imports: [
    AcButton,
    Anno117Island,
    CardModule,
    EnumSelect,
    FormsModule,
    L10nText,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatSnackBarModule,
    SummaryPanel,
    TradeRoutesPanel,
  ],
  templateUrl: './anno117-page.html',
  // The page lays out the same way as the Anno 1800 one.
  styleUrl: '../../pages/production-calculator/production-calculator.scss',
  providers: [
    { provide: GAME, useValue: anno117Game },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno117Page implements OnInit {
  readonly defaultActions: {
    icon: string;
    fn: () => void;
    tooltip: L10nKey;
  }[] = [
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
      fn: () => this.setWorldAndReload_(defaultWorld117),
      tooltip: 'Reset the inputs to a default example.',
    },
    {
      icon: 'delete',
      fn: () => this.setWorldAndReload_({ islands: [], tradeRoutes: [] }),
      tooltip: 'Completely clear the inputs.',
    },
  ];

  /** The world's source of truth, built once for the life of the page (import, reset and clear reload it). */
  private store_!: WorldStore117;
  world!: World117Controller;

  private readonly injector_ = inject(Injector);
  private readonly matDialog_ = inject(MatDialog);
  private readonly clipboard_ = inject(Clipboard);
  private readonly snackBar_ = inject(MatSnackBar);
  private readonly l10n_ = inject(L10nService);
  private readonly worldStorage_: StorageItem<Save117>;

  constructor(storageManager: LocalStorageManager) {
    this.worldStorage_ = storageManager.lookupObjectItem(WORLD_KEY_117);
  }

  // --- Choices for the discoveries ---

  readonly techChoices = anno117Data.techs.map((t) => t.id);
  readonly techName = (id: number | null): string =>
    nameIn(
      id ? techsById.get(id)?.name : undefined,
      this.l10n_.languageSignal(),
    );
  readonly techIcon = (id: number | null): string =>
    iconUrl(id ? techsById.get(id)?.icon : undefined);

  ngOnInit(): void {
    this.store_ = WorldStore117.fromWorld(this.loadWorld_());
    this.world = new World117Controller(this.store_);
    // Save whenever anything changes (this also runs once on load).
    effect(() => this.worldStorage_.set(saveOf(this.store_.toWorld())), {
      injector: this.injector_,
    });
  }

  /** The saved world, or the starter world for a first visit or if what is stored cannot be read. */
  private loadWorld_(): World117 {
    try {
      const stored = this.worldStorage_.get();
      if (stored) return worldFromSave(stored);
    } catch (error) {
      console.warn(
        'The saved Anno 117 world could not be read; starting from the default world.',
        error,
      );
    }
    return defaultWorld117;
  }

  setTechs(ids: number[]): void {
    this.world.techs = ids;
  }

  addIsland(): void {
    this.world.addIsland();
  }

  removeIsland(id: number): void {
    this.world.removeIsland(id);
  }

  // --- Default actions ---

  private setWorldAndReload_(world: World117): void {
    this.worldStorage_.set(saveOf(world));
    globalThis.location.reload();
  }

  private copyJsonToClipboard_(): void {
    this.clipboard_.copy(JSON.stringify(saveOf(this.store_.toWorld())));
  }

  private openSaveDialog_(): void {
    const config: MatDialogConfig<SaveData<Save117>> = {
      data: { obj: saveOf(this.store_.toWorld()) },
      width: '600px',
      height: '700px',
    };
    this.matDialog_
      .open(SaveDialog, config)
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        try {
          // Checked before anything is stored, so a world from the wrong game or a typo cannot break the page.
          this.setWorldAndReload_(worldFromSave(result));
        } catch (error) {
          const message =
            error instanceof InvalidSaveError
              ? error.message
              : 'This is not an Anno 117 world.';
          this.snackBar_.open(message, 'OK', { duration: 8000 });
        }
      });
  }
}
