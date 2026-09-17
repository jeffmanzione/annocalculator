import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { Boost, Good } from '../../../../../shared/game/enums';
import {
  lookupGoodIconUrl,
  lookupHaciendaFertilizerWorksIconUrl,
} from '../../../../../shared/game/icons';
import { L10nKey } from '../../../../../shared/l10n/l10n';
import { L10nText } from '../../../../../components/text/text';

@Component({
  selector: 'hacienda-tooltip',
  templateUrl: './hacienda-tooltip.html',
  styleUrl: './hacienda-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: HaciendaTooltip }],
  imports: [L10nText],
})
export class HaciendaTooltip extends EnumTooltip<any> {
  protected override onValueChange(value: Boost): void {}

  get haciendaUrl(): string {
    return lookupHaciendaFertilizerWorksIconUrl(null);
  }

  get dungUrl(): string {
    return lookupGoodIconUrl(Good.Dung);
  }

  get dungName(): L10nKey {
    return 'Dung' as L10nKey;
  }
}
