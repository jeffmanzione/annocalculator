import { OverlayModule } from '@angular/cdk/overlay';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'enum-row',
  imports: [CommonModule, OverlayModule],
  templateUrl: './enum-row.html',
  styleUrl: './enum-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumRow<T> implements AfterViewChecked {
  changeDetectorRef = inject(ChangeDetectorRef);

  @Input()
  tooltip: TemplateRef<any> | null | undefined = null;

  @Input()
  set values(value: (T | null)[]) {
    this.showValues = value.map((v) => {
      return { value: v, shouldShowOverlay: false };
    });
  }

  showValues: ShowValue<T>[] = [];

  /** The timeout ID of any current timer set to show the tooltip */
  private showTimeoutId: ReturnType<typeof setTimeout> | undefined;

  @Input()
  placeholderText = 'None';

  @Input()
  iconUrlLookupFn = (_: T | null) => '';

  hasTooltip = false;

  hideTooltipAt(index: number): void {
    if (this.showTimeoutId != null) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = undefined;
    }

    if (!this.showValues[index].shouldShowOverlay) {
      return;
    }
    this.showValues[index].shouldShowOverlay = false;
    this.changeDetectorRef.detectChanges();
  }

  showTooltipAt(index: number): void {
    this.showTimeoutId = setTimeout(() => {
      this.showValues[index].shouldShowOverlay = true;
      this.showTimeoutId = undefined;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  ngAfterViewChecked(): void {
    this.hasTooltip = !!this.tooltip;
  }
}

interface ShowValue<T> {
  value: T | null;
  shouldShowOverlay: boolean;
}
