import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { L10nText } from '../../../../../components/text/text';
import { Good, Item } from '../../../../../shared/game/enums';
import {
  lookupGoodIconUrl,
  lookupItemIconUrl,
} from '../../../../../shared/game/icons';
import { InputGoodSource } from '../../../../../shared/mvc/world-store';

/**
 * Tooltip for one input good of a production line: its icon and name, and, when
 * a specialist substituted it for the building's normal input, which good it
 * replaces and which specialist did it.
 */
@Component({
  selector: 'input-good-tooltip',
  templateUrl: './input-good-tooltip.html',
  styleUrl: './input-good-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: InputGoodTooltip }],
  imports: [L10nText],
})
export class InputGoodTooltip extends EnumTooltip<InputGoodSource> {
  source: InputGoodSource | null = null;

  protected override onValueChange(value: InputGoodSource): void {
    this.source = value;
  }

  goodIconUrl(good: Good | null | undefined): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  itemIconUrl(item: Item | null | undefined): string {
    return lookupItemIconUrl(item ?? Item.Unknown);
  }
}
