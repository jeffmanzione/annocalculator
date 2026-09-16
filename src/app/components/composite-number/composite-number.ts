import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  FormatFontSpec,
  FormattedNumber,
} from '../formatted-number/formatted-number';
import { OverlayModule } from '@angular/cdk/overlay';

import { MatIcon } from '@angular/material/icon';

export interface NumberConstituent {
  value: number;
  description: string;
}

@Component({
  selector: 'composite-number',
  templateUrl: './composite-number.html',
  styleUrl: './composite-number.scss',
  imports: [OverlayModule, FormattedNumber, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompositeNumber {
  changeDetectorRef = inject(ChangeDetectorRef);

  constituentValues = input<NumberConstituent[]>([]);
  value = computed(() =>
    this.constituentValues().reduce((a, v) => a + v.value, 0),
  );

  isPercent = input(false);
  format = input<string>();
  formatFontSpec = input<FormatFontSpec>();
  suffix = input('');
  zeroOverride = input<string>();
  showPlusIfPositive = input(false);

  /** The timeout ID of any current timer set to show the tooltip */
  private showTimeoutId_: ReturnType<typeof setTimeout> | undefined;
  showTooltip: boolean = false;

  hideTooltipAt(): void {
    if (this.showTimeoutId_ != null) {
      clearTimeout(this.showTimeoutId_);
      this.showTimeoutId_ = undefined;
    }

    if (!this.showTooltip) {
      return;
    }
    this.showTooltip = false;
    this.changeDetectorRef.detectChanges();
  }

  showTooltipAt(): void {
    this.showTimeoutId_ = setTimeout(() => {
      this.showTooltip = true;
      this.showTimeoutId_ = undefined;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }
}
