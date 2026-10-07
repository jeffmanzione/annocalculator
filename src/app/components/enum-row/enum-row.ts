import { OverlayModule } from '@angular/cdk/overlay';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { L10nKey } from '../../shared/l10n/l10n';
import { isTouchDevice } from '../../shared/mobile';
import { L10nText } from '../text/text';

@Component({
  selector: 'enum-row',
  imports: [CommonModule, OverlayModule, L10nText],
  templateUrl: './enum-row.html',
  styleUrl: './enum-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumRow<T> implements AfterViewChecked {
  changeDetectorRef = inject(ChangeDetectorRef);
  private readonly element_ = inject<ElementRef<HTMLElement>>(ElementRef);

  tooltip = input<TemplateRef<any> | null | undefined>(null);
  values = input<(T | null)[]>([]);
  placeholderText = input('None');

  toLoc(text: string): L10nKey {
    return text as L10nKey;
  }
  iconUrlLookupFn = input<(_: T | null) => string>((_: T | null) => '');
  displayTextTransformer = input<(value: T | null) => string>();
  /** Marks values whose icon should get a glow, e.g. a substituted input good. */
  iconGlowFn = input<(_: T | null) => boolean>(() => false);

  showValues = computed(() =>
    this.values().map((v) => ({ value: v, shouldShowOverlay: false })),
  );

  /** The timeout ID of any current timer set to show the tooltip */
  private showTimeoutId_: ReturnType<typeof setTimeout> | undefined;

  displayTextForValue(value: T | null): string {
    if (!this.displayTextTransformer()) {
      return value as string;
    }
    return this.displayTextTransformer()!(value);
  }

  hasTooltip = false;

  hideTooltipAt(index: number): void {
    if (this.showTimeoutId_ != null) {
      clearTimeout(this.showTimeoutId_);
      this.showTimeoutId_ = undefined;
    }

    if (!this.showValues()[index].shouldShowOverlay) {
      return;
    }
    this.showValues()[index].shouldShowOverlay = false;
    this.changeDetectorRef.detectChanges();
  }

  /** Hides every tooltip and cancels any pending one, e.g. when the row's host closes. */
  hideAllTooltips(): void {
    if (this.showTimeoutId_ != null) {
      clearTimeout(this.showTimeoutId_);
      this.showTimeoutId_ = undefined;
    }
    let changed = false;
    for (const showValue of this.showValues()) {
      if (showValue.shouldShowOverlay) {
        showValue.shouldShowOverlay = false;
        changed = true;
      }
    }
    if (changed) {
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * On a touch screen, where nothing hovers: a tap shows a value's tooltip, and another tap anywhere hides it. Not
   * for a row inside a dropdown, where a tap opens the dropdown or picks an option.
   */
  toggleTooltipAt(index: number): void {
    if (!isTouchDevice() || this.isInsideSelect_()) {
      return;
    }
    const value = this.showValues()[index];
    const show = !value.shouldShowOverlay;
    this.hideAllTooltips();
    if (show) {
      value.shouldShowOverlay = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  /** A tap outside the tooltip closes it (on a touch screen; a mouse closes it by leaving). */
  hideOnOutsideTap(index: number): void {
    if (isTouchDevice()) {
      this.hideTooltipAt(index);
    }
  }

  private isInsideSelect_(): boolean {
    return !!this.element_.nativeElement.closest('mat-select, mat-option');
  }

  showTooltipAt(index: number): void {
    if (isTouchDevice()) {
      // A tap also reports a mouse entering, a moment late: the tap has already handled it.
      return;
    }
    this.showTimeoutId_ = setTimeout(() => {
      this.showValues()[index].shouldShowOverlay = true;
      this.showTimeoutId_ = undefined;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  ngAfterViewChecked(): void {
    this.hasTooltip = !!this.tooltip();
  }
}
