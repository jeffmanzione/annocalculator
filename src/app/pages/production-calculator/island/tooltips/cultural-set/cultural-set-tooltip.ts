import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { CulturalSet, Good } from '../../../../../shared/game/enums';
import {
  CulturalSetInfo,
  lookupCulturalSetInfo,
} from '../../../../../shared/game/facts';
import { CommonModule } from '@angular/common';
import { lookupGoodIconUrl } from '../../../../../shared/game/icons';

@Component({
  selector: 'cultural-set-tooltip',
  templateUrl: './cultural-set-tooltip.html',
  styleUrl: './cultural-set-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: CulturalSetTooltip }],
  imports: [CommonModule],
})
export class CulturalSetTooltip extends EnumTooltip<CulturalSet> {
  set: CulturalSet | null = null;
  setInfo: CulturalSetInfo | null = null;

  protected override onValueChange(value: CulturalSet): void {
    this.set = value;
    this.setInfo = lookupCulturalSetInfo(value)!;
  }

  iconCulturalSetUrlLookupFn(_: CulturalSet | null): string {
    return this.setInfo!.iconUrl;
  }

  iconGoodUrlLookupFn(good: Good | null | undefined): string {
    return lookupGoodIconUrl((good ?? Good.Unknown) || Good.Unknown);
  }
}
