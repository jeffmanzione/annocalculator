import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
} from '@angular/core';
import {
  FormatFontSpec,
  FormattedNumber,
} from '../formatted-number/formatted-number';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

export interface NumberConstituent {
  value: number;
  description: string;
}

@Component({
  selector: 'composite-number',
  templateUrl: './composite-number.html',
  styleUrl: './composite-number.scss',
  imports: [CommonModule, OverlayModule, FormattedNumber, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompositeNumber {
  changeDetectorRef = inject(ChangeDetectorRef);

  @Input()
  set constituentValues(nums: NumberConstituent[]) {
    this.constituentValues_ = nums;
    this.value = nums.reduce((a, v) => a + v.value, 0);
    this.changeDetectorRef.markForCheck();
  }
  get constituentValues(): NumberConstituent[] {
    return this.constituentValues_;
  }

  value = 0;

  constituentValues_: NumberConstituent[] = [];

  @Input()
  isPercent: boolean = false;

  @Input()
  format?: string;

  @Input()
  formatFontSpec?: FormatFontSpec;

  @Input()
  suffix: string = '';

  @Input()
  zeroOverride?: string;

  @Input()
  showPlusIfPositive: boolean = false;

  /** The timeout ID of any current timer set to show the tooltip */
  private showTimeoutId: ReturnType<typeof setTimeout> | undefined;
  showTooltip: boolean = false;

  hideTooltipAt(): void {
    if (this.showTimeoutId != null) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = undefined;
    }

    if (!this.showTooltip) {
      return;
    }
    this.showTooltip = false;
    this.changeDetectorRef.detectChanges();
  }

  showTooltipAt(): void {
    this.showTimeoutId = setTimeout(() => {
      this.showTooltip = true;
      this.showTimeoutId = undefined;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }
}
