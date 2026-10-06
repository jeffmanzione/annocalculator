import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nText } from '../text/text';
import {
  isIconPart,
  isKeyPart,
  TooltipModel,
  TooltipPart,
} from './tooltip-model';

/**
 * The hover card both games use: an icon, a name, and sections of lines (each with an optional icon and
 * text that may include the app's translated phrases). A game describes its thing as a TooltipModel.
 */
@Component({
  selector: 'info-tooltip',
  imports: [L10nText],
  templateUrl: './info-tooltip.html',
  styleUrl: './info-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoTooltip {
  model = input.required<TooltipModel>();

  isKey(part: TooltipPart): part is { key: L10nKey } {
    return isKeyPart(part);
  }

  isIcon(part: TooltipPart): part is { icon: string } {
    return isIconPart(part);
  }
}
