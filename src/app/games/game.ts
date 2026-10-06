import { InjectionToken } from '@angular/core';
import { Language } from '../shared/l10n/l10n';
import {
  SummaryIslandSource,
  SummaryProductionLineSource,
} from '../pages/production-calculator/summary-panel/summary-panel-store';

/** A good, by its id in a game's data (for Anno 1800 this is the good's English name). */
export type GoodId = string;

/**
 * What the shared calculator pieces (summary, trade routes, ...) need to know about the game
 * they are showing. Each supported game provides one through the GAME token; the game's own
 * rules and data stay in its folder under games/.
 */
export interface GameDefinition {
  readonly id: string;

  /** Every good in the game: the summary has a row for each one that is produced or short somewhere. */
  readonly goods: readonly GoodId[];

  goodIconUrl(good: GoodId | null | undefined): string;

  /** The good's name in the language shown (the game's own name for it, in the languages the game has). */
  goodName(good: GoodId | null | undefined, language: Language): string;

  /**
   * Goods a production line consumes on top of its recipe, per minute (positive numbers). Anno 1800's
   * Silo and Fertilizer boosts, for example, use up grain or fertilizer on their own.
   */
  extraConsumption(
    line: SummaryProductionLineSource,
    island: SummaryIslandSource,
  ): readonly { good: GoodId; perMinute: number }[];
}

/** The game the calculator on the current page is for. Provided by the page that hosts the calculator. */
export const GAME = new InjectionToken<GameDefinition>('GAME');
