import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { InfoTooltip } from '../../../components/info-tooltip/info-tooltip';
import { L10nService } from '../../../services/l10n/l10n';
import { TooltipKind, tooltipModel } from './tooltip-model';

/**
 * The hover card for one of Anno 117's things: what a building makes and needs, where a good comes from
 * and goes, what an item, discovery, patron or event does, and what a fertility is for. Used as the
 * tooltip of the island editor's dropdowns and rows; the shared InfoTooltip draws it.
 */
@Component({
  selector: 'anno-117-tooltip',
  imports: [InfoTooltip],
  template: '<info-tooltip [model]="model()"></info-tooltip>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno117Tooltip {
  kind = input.required<TooltipKind>();
  value = input<number | string | null>(null);

  private readonly l10n_ = inject(L10nService);

  readonly model = computed(() =>
    tooltipModel(this.kind(), this.value(), this.l10n_.languageSignal()),
  );
}
