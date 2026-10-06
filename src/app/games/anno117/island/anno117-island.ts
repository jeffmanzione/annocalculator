import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AcButton } from '../../../components/button/button';
import {
  CompositeNumber,
  NumberConstituent,
} from '../../../components/composite-number/composite-number';
import { EnumRow } from '../../../components/enum-row/enum-row';
import { EnumSelect } from '../../../components/enum-select/enum-select';
import { FormattedNumber } from '../../../components/formatted-number/formatted-number';
import { StepperInput } from '../../../components/stepper-input/stepper-input';
import { L10nText } from '../../../components/text/text';
import { L10nService } from '../../../services/l10n/l10n';
import { BuffSource } from '../game/rules';
import {
  describeSource,
  efficiencyConstituents,
  producedConstituents,
} from '../efficiency-constituents';
import { iconUrl, nameIn } from '../anno117-game';
import {
  anno117Data,
  effectsById,
  factoriesById,
  fertilitiesById,
  itemsById,
  patronsById,
  productsById,
} from '../game/data';
import { Anno117Name } from '../game/data-types';
import {
  Island117Controller,
  Line117Controller,
} from '../model/world-controllers';
import { Anno117Tooltip } from '../tooltips/anno117-tooltip';
import { TooltipKind } from '../tooltips/tooltip-model';
import { factoriesForSession, regionOfSession } from '../model/world-store-117';

/** What gives an extra output. */
interface ExtraSource {
  source: BuffSource;
  sourceId: number;
}

/** The value of the "no patron" choice, which a select can hold where it cannot hold null. */
const NO_PATRON = 0;

const sessionsById = new Map(anno117Data.sessions.map((s) => [s.id, s]));

/** Items for each building, so a line can offer only the ones that work with its building. */
const itemsByBuilding = new Map<number, number[]>();
for (const item of anno117Data.items) {
  for (const building of item.targets) {
    itemsByBuilding.set(building, [
      ...(itemsByBuilding.get(building) ?? []),
      item.id,
    ]);
  }
}

/** Effects an island can have switched on: events and festivals, not discoveries (global) and not a patron's own. */
const patronEffectIds = new Set(
  anno117Data.patrons.flatMap((p) => p.effects.map((e) => e.effect)),
);
const islandEffects = anno117Data.effects.filter(
  (e) => e.source !== 'tech' && !patronEffectIds.has(e.id),
);

interface Named {
  name: Anno117Name;
  icon?: string;
}

/** The editor for one Anno 117 island: its settings and its production lines. */
@Component({
  selector: 'anno-117-island',
  imports: [
    AcButton,
    Anno117Tooltip,
    CompositeNumber,
    EnumRow,
    EnumSelect,
    FormattedNumber,
    FormsModule,
    L10nText,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    StepperInput,
  ],
  templateUrl: './anno117-island.html',
  styleUrl: './anno117-island.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno117Island {
  readonly controller = input.required<Island117Controller>();

  private readonly l10n_ = inject(L10nService);

  // --- Names and icons of the game's things, in the language shown ---

  private nameOf_(lookup: ReadonlyMap<number, Named>) {
    return (id: number | null | undefined): string =>
      id ? nameIn(lookup.get(id)?.name, this.l10n_.languageSignal()) : 'None';
  }

  private iconOf_(lookup: ReadonlyMap<number, Named>) {
    return (id: number | null | undefined): string =>
      id ? iconUrl(lookup.get(id)?.icon) : '';
  }

  readonly sessionName = this.nameOf_(sessionsById);
  readonly sessionIcon = this.iconOf_(sessionsById);
  readonly patronName = this.nameOf_(patronsById);
  readonly patronIcon = this.iconOf_(patronsById);
  readonly effectName = this.nameOf_(effectsById);
  readonly effectIcon = this.iconOf_(effectsById);
  readonly fertilityName = this.nameOf_(fertilitiesById);
  readonly fertilityIcon = this.iconOf_(fertilitiesById);
  readonly buildingName = this.nameOf_(factoriesById);
  readonly buildingIcon = this.iconOf_(factoriesById);
  readonly itemName = this.nameOf_(itemsById);
  readonly itemIcon = this.iconOf_(itemsById);

  readonly productName = (good: string | null | undefined): string =>
    good
      ? nameIn(
          productsById.get(Number(good))?.name,
          this.l10n_.languageSignal(),
        )
      : 'None';
  readonly productIcon = (good: string | null | undefined): string =>
    good ? iconUrl(productsById.get(Number(good))?.icon) : '';

  // --- Choices ---

  readonly provinces = anno117Data.sessions.map((s) => s.id);
  readonly patronChoices = [NO_PATRON, ...anno117Data.patrons.map((p) => p.id)];

  readonly effectChoices = computed(() => {
    const region = this.controller().region;
    const factoriesInRegion = new Set(
      anno117Data.factories
        .filter((f) => f.regions.includes(region))
        .map((f) => f.id),
    );
    return islandEffects
      .filter(
        (e) =>
          e.allProduction || e.targets.some((t) => factoriesInRegion.has(t)),
      )
      .map((e) => e.id);
  });

  readonly fertilityChoices = computed(() => {
    const region = this.controller().region;
    return anno117Data.fertilities
      .filter((f) => f.regions.length === 0 || f.regions.includes(region))
      .map((f) => f.id);
  });

  readonly buildingChoices = computed(() =>
    factoriesForSession(this.controller().session).map((f) => f.id),
  );

  readonly regionOf = regionOfSession;

  itemChoices(line: Line117Controller): number[] {
    return itemsByBuilding.get(line.building) ?? [];
  }

  /** The items on a line that have a stronger, boosted form. */
  boostableItems(line: Line117Controller): number[] {
    return line.items.filter((id) => itemsById.get(id)?.boostBuffs?.length);
  }

  // --- Editing ---

  get patronValue(): number {
    return this.controller().patron ?? NO_PATRON;
  }

  setPatron(value: number): void {
    this.controller().patron = value === NO_PATRON ? null : value;
  }

  setDevotion(value: string | number): void {
    this.controller().devotion = Number(value);
  }

  setNumBuildings(line: Line117Controller, count: number | null): void {
    line.numBuildings = count ?? 0;
  }

  setBuilding(line: Line117Controller, building: number): void {
    line.building = building;
  }

  // --- What a line works out to ---

  efficiencyOf(line: Line117Controller): NumberConstituent[] {
    return efficiencyConstituents(line, this.l10n_.languageSignal());
  }

  producedOf(line: Line117Controller): NumberConstituent[] {
    return producedConstituents(line, this.l10n_.languageSignal());
  }

  // The same object for the same source each time, so the row showing it is not rebuilt (which would
  // lose a tooltip being hovered) every time the numbers are worked out again.
  private readonly sourceValues_ = new Map<string, ExtraSource>();

  /** The value an extra output's source is shown as. */
  sourceValue(extra: ExtraSource): ExtraSource {
    const key = `${extra.source}:${extra.sourceId}`;
    let value = this.sourceValues_.get(key);
    if (!value) {
      value = { source: extra.source, sourceId: extra.sourceId };
      this.sourceValues_.set(key, value);
    }
    return value;
  }

  readonly sourceName = (extra: ExtraSource | null): string =>
    extra ? this.sourceOf(extra).description : '';
  readonly sourceIcon = (extra: ExtraSource | null): string =>
    (extra && this.sourceOf(extra).iconUrl) || '';

  /** Which tooltip describes the source of an extra output. */
  sourceKind(extra: ExtraSource): TooltipKind {
    switch (extra.source) {
      case 'item':
      case 'boostedItem':
        return 'item';
      case 'aqueduct':
      case 'silo':
        return 'module';
      default:
        return 'effect';
    }
  }

  // --- Showing and hiding a line's extra goods table (shown by default when it has any) ---

  private readonly collapsedLines_ = signal<ReadonlySet<number>>(new Set());

  showExtraGoods(line: Line117Controller): boolean {
    return (
      line.extraGoodRows.length > 0 && !this.collapsedLines_().has(line.id)
    );
  }

  extraGoodsIcon(line: Line117Controller): string {
    return this.showExtraGoods(line) ? 'arrow_drop_up' : 'arrow_drop_down';
  }

  toggleExtraGoods(line: Line117Controller): void {
    this.collapsedLines_.update((collapsed) => {
      const next = new Set(collapsed);
      if (!next.delete(line.id)) next.add(line.id);
      return next;
    });
  }

  /** Where an extra output comes from, with its icon, in the language shown. */
  sourceOf(extra: ExtraSource) {
    return describeSource(
      extra.source,
      extra.sourceId,
      this.l10n_.languageSignal(),
    );
  }

  removeProductionLine(line: Line117Controller): void {
    this.controller().removeProductionLine(line.id);
  }

  addProductionLine(): void {
    this.controller().addProductionLine();
  }
}
