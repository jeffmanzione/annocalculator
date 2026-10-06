import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
} from '@angular/core';
import { EnumRow } from '../enum-row/enum-row';
import { FormattedNumber } from '../formatted-number/formatted-number';
import { L10nText } from '../text/text';

/** One extra good a production line makes: what, from what, at what rate (numerator / denominator) and how much. */
export interface ExtraGoodsRow {
  good: unknown;
  /** What gives it (an item, a boost, ...): a value that stays the same object or string between updates. */
  source?: unknown;
  rateNumerator: number;
  rateDenominator: number;
  producedPerMinute: number;
}

/**
 * The table under a production line that lists its extra goods, the same in both games. A game says
 * how its goods and sources are drawn (icon, name, tooltip) and passes the rows.
 */
@Component({
  selector: 'extra-goods-table',
  imports: [EnumRow, FormattedNumber, L10nText],
  templateUrl: './extra-goods-table.html',
  styleUrl: './extra-goods-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraGoodsTable<R extends ExtraGoodsRow> {
  readonly rows = input.required<readonly R[]>();

  readonly goodIcon = input.required<(good: any) => string>();
  readonly goodName = input<(good: any) => string>();
  readonly goodTooltip = input<TemplateRef<any> | null>(null);

  /** How a row's source is drawn: its icon (from the row, since it depends on the kind of source) ... */
  readonly sourceIcon = input.required<(row: R) => (source: any) => string>();
  readonly sourceName = input<(source: any) => string>();
  /** ... and its tooltip. */
  readonly sourceTooltip = input<(row: R) => TemplateRef<any> | null>(
    () => null,
  );
}
