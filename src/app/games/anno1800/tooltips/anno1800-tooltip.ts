import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { InfoTooltip } from '../../../components/info-tooltip/info-tooltip';
import { Anno1800TooltipKind, anno1800TooltipModel } from './tooltip-model';

/**
 * The hover card for one of Anno 1800's things (building, good, boost, policy, item, cultural set).
 * It describes the thing and the shared InfoTooltip draws it.
 */
@Component({
  selector: 'anno-1800-tooltip',
  imports: [InfoTooltip],
  template: '<info-tooltip [model]="model()"></info-tooltip>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Anno1800Tooltip {
  kind = input.required<Anno1800TooltipKind>();
  value = input<unknown>(null);

  readonly model = computed(() =>
    anno1800TooltipModel(this.kind(), this.value()),
  );
}
