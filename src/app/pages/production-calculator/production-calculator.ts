import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WorldStore } from '../../shared/mvc/world-store';
import { StoreWorldView } from '../../shared/mvc/world-store-views';
import { StoreWorldController } from '../../shared/mvc/world-store-controllers';
import { IslandId } from '../../shared/mvc/models';
import { Island } from './island/island';
import { MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { SummaryPanel } from './summary-panel/summary-panel';
import { World } from '../../shared/mvc/models';
import { TradeRoutesPanel } from './trade-routes-panel/trade-routes-panel';
import { CalculatorColumn } from './calculator-column/calculator-column';
import { CalculatorPage } from './calculator-page';
import { LocalStorageManager } from '../../services/local-storage/local-storage';
import { defaultWorld } from './default-world';
import { GAME } from '../../games/game';
import { anno1800Game } from '../../games/anno1800/anno1800-game';
import { EnumSelect } from '../../components/enum-select/enum-select';
import {
  MAX_PALACE_PRESTIGE_LEVEL,
  palaceTradeUnionBonus,
} from '../../games/anno1800/game/palace';

/** The form's value for "no Palace" (a select can't hold null as a choice). */
const NO_PALACE = -1;
const WORLD_KEY = 'anno-1800-production-calculator-world';

@Component({
  selector: 'production-calculator-page',
  imports: [
    CalculatorColumn,
    EnumSelect,
    Island,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SummaryPanel,
    TradeRoutesPanel,
  ],
  templateUrl: './production-calculator.html',
  styleUrl: './production-calculator.scss',
  providers: [
    { provide: GAME, useValue: anno1800Game },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionCalculatorPage
  extends CalculatorPage<World>
  implements OnInit
{
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

  readonly palacePrestigeLevels = [
    NO_PALACE,
    ...Array.from({ length: MAX_PALACE_PRESTIGE_LEVEL + 1 }, (_, i) => i),
  ];

  readonly lookupPalaceIconUrl = () => '/icons/others/palace.png';

  /** E.g. "10 (+30%)": the level and the Trade Union bonus it gives. */
  readonly palaceLevelText = (level: number | null): string =>
    level == null || level === NO_PALACE
      ? 'None'
      : `${level} (+${Math.round(palaceTradeUnionBonus(level) * 100)}%)`;

  constructor(storageManager: LocalStorageManager) {
    super(storageManager, WORLD_KEY);
  }

  protected override currentSave_(): World {
    return this.store_.toWorld();
  }
  protected override defaultSave_(): World {
    return defaultWorld;
  }
  protected override emptySave_(): World {
    return { islands: [], tradeRoutes: [] };
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      palacePrestigeLevel: new FormControl(NO_PALACE),
    });
    this.formGroup.valueChanges.subscribe((value) => {
      this.world.palacePrestigeLevel =
        value.palacePrestigeLevel === NO_PALACE
          ? null
          : value.palacePrestigeLevel;
    });
    this.setWorld(this.worldStorage_.get() ?? defaultWorld);

    // Created here rather than in the constructor because store_ only exists once setWorld() has run.
    // The store is never replaced for the life of the page (import/reset/clear all reload the page), so
    // the effect doesn't need to track which store it's saving.
    this.persistWhenChanged_();
  }

  setWorld(worldModel?: World): void {
    if (!worldModel) {
      return;
    }
    this.store_ = WorldStore.fromWorld(worldModel);
    this.world = new StoreWorldController(this.store_);
    this.worldSummary = new StoreWorldView(this.store_);
    this.formGroup!.controls['palacePrestigeLevel'].setValue(
      this.world.palacePrestigeLevel ?? NO_PALACE,
      { emitEvent: false },
    );
  }

  addIsland(): void {
    this.world.addIsland();
  }

  removeIsland(id: IslandId): void {
    this.world.removeIsland(id);
  }
}
