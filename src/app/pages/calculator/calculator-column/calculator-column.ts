import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AcButton } from '../../../components/button/button';
import { CardModule } from '../../../components/card/card';
import { L10nText } from '../../../components/text/text';
import { L10nKey } from '../../../shared/l10n/l10n';

/** A button in the "Default Actions" card. */
export interface DefaultAction {
  icon: string;
  fn: () => void;
  tooltip: L10nKey;
}

/** What the column needs to know about an island to list it. */
export interface ListedIsland {
  id: number;
  name: string;
}

/**
 * The left column of a calculator page, the same for both games: the default actions, a card for the
 * game's global parameters (put in as content marked `globalParameters`), the list of islands (each
 * one's editor comes from the game's own template) and the button that adds an island.
 */
@Component({
  selector: 'calculator-column',
  imports: [
    AcButton,
    CardModule,
    L10nText,
    MatExpansionModule,
    MatIconModule,
    NgTemplateOutlet,
  ],
  templateUrl: './calculator-column.html',
  styleUrl: './calculator-column.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorColumn<I extends ListedIsland> {
  readonly actions = input.required<DefaultAction[]>();
  readonly islands = input.required<readonly I[]>();
  /** How an island's editor looks: a template that gets the island as its implicit value. */
  readonly islandTemplate = input.required<TemplateRef<{ $implicit: I }>>();

  readonly addIsland = output<void>();
  readonly removeIsland = output<number>();
}
