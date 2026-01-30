import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { Boost } from '../../../../../shared/game/enums';
import { BoostInfo, lookupBoostInfo } from '../../../../../shared/game/facts';
import { CommonModule } from '@angular/common';
import { lookupBoostIconUrl } from '../../../../../shared/game/icons';

@Component({
  selector: 'boost-tooltip',
  templateUrl: './boost-tooltip.html',
  styleUrl: './boost-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: BoostTooltip }],
  imports: [CommonModule],
})
export class BoostTooltip extends EnumTooltip<Boost> {
  boost: Boost | null = null;
  boostInfo: BoostInfo | null = null;

  protected override onValueChange(value: Boost): void {
    this.boost = value;
    this.boostInfo = lookupBoostInfo(value)!;
  }

  iconGoodUrlLookupFn(boost: Boost | null | undefined): string {
    return lookupBoostIconUrl(boost ?? Boost.None) || Boost.None;
  }

  get extraGoodText(): string {
    return `Extra Goods: ${this.boostInfo?.extraGood?.rateNumerator} / ${this.boostInfo?.extraGood?.rateDenominator}`;
  }

  get productivityText(): string {
    return `Productivity: +${(this.boostInfo!.productivityEffect ?? 0) * 100}%`;
  }
}
