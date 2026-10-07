import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import {
  FormatFontSpec,
  FormattedNumber,
  GREEN_RED_FONT_SPEC,
} from '../../../components/formatted-number/formatted-number';
import { L10nText } from '../../../components/text/text';
import {
  availableProduction as computeAvailableProduction,
  GoodSummaryCell,
  GoodSummaryRow,
} from './summary-panel-store';

/**
 * A good's net production, flagged as a warning because the world makes
 * enough of it overall but some island runs a deficit that no trade route
 * covers. Hovering explains the issue with the same per-island numbers as the
 * row's expanded island table.
 */
@Component({
  selector: 'summary-warning',
  imports: [OverlayModule, MatIconModule, FormattedNumber, L10nText],
  templateUrl: './summary-warning.html',
  styleUrl: './summary-warning.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryWarning {
  private readonly changeDetectorRef_ = inject(ChangeDetectorRef);

  row = input.required<GoodSummaryRow>();

  readonly colorSpec = GREEN_RED_FONT_SPEC;
  // Gold on the dark plate (see summary-warning.scss): high contrast on
  // parchment, in the same family as the title plate.
  protected readonly warningColorSpec: FormatFontSpec = {
    default: { color: '#ffd66b', weight: 'bold' },
  };

  /** The timeout ID of any current timer set to show the tooltip */
  private showTimeoutId_: ReturnType<typeof setTimeout> | undefined;
  showTooltip = false;

  showTooltipAt(): void {
    this.showTimeoutId_ = setTimeout(() => {
      this.showTooltip = true;
      this.showTimeoutId_ = undefined;
      this.changeDetectorRef_.detectChanges();
    }, 500);
  }

  hideTooltip(): void {
    if (this.showTimeoutId_ != null) {
      clearTimeout(this.showTimeoutId_);
      this.showTimeoutId_ = undefined;
    }
    if (!this.showTooltip) {
      return;
    }
    this.showTooltip = false;
    this.changeDetectorRef_.detectChanges();
  }

  availableProduction(cell?: GoodSummaryCell): number {
    return computeAvailableProduction(cell);
  }
}
