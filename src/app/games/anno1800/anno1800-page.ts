import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WorldStore1800 } from './model/world-store-1800';
import { World1800View } from './model/world-views';
import { World1800Controller } from './model/world-controllers';
import { Anno1800Island } from './island/anno1800-island';
import { MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SummaryPanel } from '../../pages/calculator/summary-panel/summary-panel';
import { World1800 } from './model/models';
import { TradeRoutesPanel } from '../../pages/calculator/trade-routes-panel/trade-routes-panel';
import { CalculatorColumn } from '../../pages/calculator/calculator-column/calculator-column';
import {
  CalculatorPage,
  calculatorProviders,
} from '../../pages/calculator/calculator-page';
import { LocalStorageManager } from '../../services/local-storage/local-storage';
import { defaultWorld } from './model/default-world';
import { anno1800Game } from './anno1800-game';
import { EnumSelect } from '../../components/enum-select/enum-select';
import {
  MAX_PALACE_PRESTIGE_LEVEL,
  palaceTradeUnionBonus,
} from './game/palace';

/** The form's value for "no Palace" (a select can't hold null as a choice). */
const NO_PALACE = -1;
const WORLD_KEY = 'anno-1800-production-calculator-world';

@Component({
  selector: 'anno-1800-page',
  imports: [
    CalculatorColumn,
    EnumSelect,
    Anno1800Island,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SummaryPanel,
    TradeRoutesPanel,
  ],
  templateUrl: './anno1800-page.html',
  styleUrl: '../../pages/calculator/calculator-page.scss',
  providers: calculatorProviders(anno1800Game),
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno1800Page extends CalculatorPage<World1800> implements OnInit {
  // The actual source of truth for the loaded world: a normalized, id-keyed
  // signal store (see world-store.ts). Constructed once per loaded world in
  // setWorld() -- import/reset/clear all go through setWorldAndReload(),
  // which reloads the page -- so this instance, and the per-id-cached
  // controllers `world` hands out, stay identity-stable for the page's
  // lifetime.
  private store_!: WorldStore1800;

  // Write-capable view of store_, handed to <island>/<trade-routes-panel>.
  world!: World1800Controller;

  // Read-only view of the *same* store_, for summary-panel.ts (which only
  // aggregates). It reads live store state rather than a snapshot.
  worldSummary!: World1800View;

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

  protected override currentSave_(): World1800 {
    return this.store_.toWorld();
  }
  protected override defaultSave_(): World1800 {
    return defaultWorld;
  }
  protected override emptySave_(): World1800 {
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
    this.setWorld(this.loadSave_());

    // Created here rather than in the constructor because store_ only exists once setWorld() has run.
    // The store is never replaced for the life of the page (import/reset/clear all reload the page), so
    // the effect doesn't need to track which store it's saving.
    this.persistWhenChanged_();
  }

  setWorld(worldModel?: World1800): void {
    if (!worldModel) {
      return;
    }
    this.store_ = WorldStore1800.fromWorld(worldModel);
    this.world = new World1800Controller(this.store_);
    this.worldSummary = new World1800View(this.store_);
    this.formGroup!.controls['palacePrestigeLevel'].setValue(
      this.world.palacePrestigeLevel ?? NO_PALACE,
      { emitEvent: false },
    );
  }
}
