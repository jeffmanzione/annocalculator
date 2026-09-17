import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { CulturalSet, Good } from '../../../../../shared/game/enums';
import {
  CulturalSetInfo,
  lookupCulturalSetInfo,
} from '../../../../../shared/game/facts';

import { lookupGoodIconUrl } from '../../../../../shared/game/icons';
import { L10nText } from '../../../../../components/text/text';
import { L10nKey } from '../../../../../shared/l10n/l10n';

@Component({
  selector: 'cultural-set-tooltip',
  templateUrl: './cultural-set-tooltip.html',
  styleUrl: './cultural-set-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: CulturalSetTooltip }],
  imports: [L10nText],
})
export class CulturalSetTooltip extends EnumTooltip<CulturalSet> {
  setInfo: CulturalSetInfo | null = null;

  protected override onValueChange(value: CulturalSet): void {
    this.setInfo = lookupCulturalSetInfo(value)!;
  }

  iconCulturalSetUrlLookupFn(_: CulturalSet | null): string {
    return this.setInfo!.iconUrl;
  }

  iconGoodUrlLookupFn(good: Good | null | undefined): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  goodToLoc(good: Good | undefined): L10nKey {
    return (good ?? 'Extra Goods') as L10nKey;
  }
}
