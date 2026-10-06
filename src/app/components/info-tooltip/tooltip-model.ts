import { L10nKey } from '../../shared/l10n/l10n';

/** A piece of a tooltip line: text as it is, or a translated phrase from the app's own text. */
export type TooltipPart = string | { key: L10nKey };

export interface TooltipRow {
  icon?: string;
  parts: TooltipPart[];
}

export interface TooltipSection {
  /** A heading above the rows, such as "Made By". */
  heading?: L10nKey;
  rows: TooltipRow[];
}

/** What an info tooltip shows: a game fills this in, and the shared InfoTooltip draws it. */
export interface TooltipModel {
  name: string;
  icon?: string;
  /** Lights the icon up (an input an item has swapped in). */
  iconGlow?: boolean;
  /** A line under the name (an item's rarity). */
  subtitle?: TooltipPart;
  /** A colour behind the card's contents (an item's rarity). */
  background?: string;
  sections: TooltipSection[];
}

/** What a tooltip with nothing to show looks like. */
export const EMPTY_TOOLTIP: TooltipModel = { name: '', sections: [] };
