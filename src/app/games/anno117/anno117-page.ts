import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MobileSectionTabs } from '../../components/mobile-section-tabs/mobile-section-tabs';
import { EnumSelect } from '../../components/enum-select/enum-select';
import { StepperInput } from '../../components/stepper-input/stepper-input';
import { CalculatorColumn } from '../../pages/calculator/calculator-column/calculator-column';
import {
  CalculatorPage,
  calculatorProviders,
} from '../../pages/calculator/calculator-page';
import { SummaryPanel } from '../../pages/calculator/summary-panel/summary-panel';
import { TradeRoutesPanel } from '../../pages/calculator/trade-routes-panel/trade-routes-panel';
import { L10nService } from '../../services/l10n/l10n';
import { LocalStorageManager } from '../../services/local-storage/local-storage';
import { anno117Game, iconUrl, nameIn } from './anno117-game';
import { anno117Data, buffsById, effectsById, techsById } from './game/data';
import { Anno117Island } from './island/anno117-island';
import { defaultWorld117 } from './model/default-world';
import {
  InvalidSaveError,
  Save117,
  saveOf,
  WORLD_KEY_117,
  worldFromSave,
} from './model/models';
import { World117Controller } from './model/world-controllers';
import { Anno117Tooltip } from './tooltips/anno117-tooltip';
import { MAX_TECH_LEVEL, WorldStore117 } from './model/world-store-117';

/** The Anno 117 calculator page: the same layout as the Anno 1800 one, with Anno 117's islands and rules. */
@Component({
  selector: 'anno-117-page',
  imports: [
    MobileSectionTabs,
    Anno117Tooltip,
    Anno117Island,
    CalculatorColumn,
    EnumSelect,
    FormsModule,
    MatSnackBarModule,
    StepperInput,
    SummaryPanel,
    TradeRoutesPanel,
  ],
  templateUrl: './anno117-page.html',
  // The page lays out the same way as the Anno 1800 one.
  styleUrl: '../../pages/calculator/calculator-page.scss',
  providers: calculatorProviders(anno117Game),
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno117Page extends CalculatorPage<Save117> implements OnInit {
  /** The world's source of truth, built once for the life of the page (import, reset and clear reload it). */
  private store_!: WorldStore117;
  world!: World117Controller;

  private readonly snackBar_ = inject(MatSnackBar);
  private readonly l10n_ = inject(L10nService);

  constructor(storageManager: LocalStorageManager) {
    super(storageManager, WORLD_KEY_117);
  }

  protected override currentSave_(): Save117 {
    return saveOf(this.store_.toWorld());
  }
  protected override defaultSave_(): Save117 {
    return saveOf(defaultWorld117);
  }
  protected override emptySave_(): Save117 {
    return saveOf({ islands: [], tradeRoutes: [] });
  }
  protected override readSave_(edited: Save117): Save117 {
    return saveOf(worldFromSave(edited));
  }
  protected override rejectSave_(error: unknown): void {
    const message =
      error instanceof InvalidSaveError
        ? error.message
        : 'This is not an Anno 117 world.';
    this.snackBar_.open(message, 'OK', { duration: 8000 });
  }

  // --- Choices for the discoveries ---

  protected readonly techChoices = anno117Data.techs
    .filter((t) => !t.repeatable)
    .map((t) => t.id);
  protected readonly repeatableTechs = anno117Data.techs.filter(
    (t) => t.repeatable,
  );
  protected readonly maxTechLevel = MAX_TECH_LEVEL;
  protected readonly techName = (id: number | null): string =>
    nameIn(
      id ? techsById.get(id)?.name : undefined,
      this.l10n_.languageSignal(),
    );
  protected readonly techIcon = (id: number | null): string =>
    iconUrl(id ? techsById.get(id)?.icon : undefined);

  ngOnInit(): void {
    this.store_ = WorldStore117.fromWorld(worldFromSave(this.loadSave_()));
    this.world = new World117Controller(this.store_);
    this.persistWhenChanged_();
  }

  protected setTechs(ids: number[]): void {
    this.world.oneTimeTechs = ids;
  }

  /** What one level of a repeatable discovery adds, in percent (Beneath Bedrock: 5). */
  protected techStep(id: number): number {
    const effect = effectsById.get(techsById.get(id)?.effects[0] ?? 0);
    return buffsById.get(effect?.buffs[0] ?? 0)?.productivity || 1;
  }

  /** The bonus a repeatable discovery gives at its level, in percent. */
  protected techPercent(id: number): number {
    return this.world.techLevel(id) * this.techStep(id);
  }

  /** Sets the level from a percentage (already cut down to a step by the field). */
  protected setTechPercent(id: number, percent: number | null): void {
    this.world.setTechLevel(id, Math.floor((percent ?? 0) / this.techStep(id)));
  }
}
