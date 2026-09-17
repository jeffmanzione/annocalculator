import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { Boost } from '../../../../../shared/game/enums';
import { BoostInfo, lookupBoostInfo } from '../../../../../shared/game/facts';

import { lookupBoostIconUrl } from '../../../../../shared/game/icons';
import { L10nText } from '../../../../../components/text/text';

@Component({
  selector: 'boost-tooltip',
  templateUrl: './boost-tooltip.html',
  styleUrl: './boost-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: BoostTooltip }],
  imports: [L10nText],
})
export class BoostTooltip extends EnumTooltip<Boost> {
  boostInfo: BoostInfo | null = null;

  protected override onValueChange(value: Boost): void {
    this.boostInfo = lookupBoostInfo(value)!;
  }

  boostIconUrlLookupFn(boost: Boost | null | undefined): string {
    return lookupBoostIconUrl(boost ?? Boost.None) || Boost.None;
  }

  get extraGoodText(): string {
    return `${this.boostInfo?.extraGood?.rateNumerator} / ${this.boostInfo?.extraGood?.rateDenominator}`;
  }

  get productivityText(): string {
    return `+${(this.boostInfo!.productivityEffect ?? 0) * 100}%`;
  }
}
