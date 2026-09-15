import { OverlayModule } from '@angular/cdk/overlay';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
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

  tooltip = input<TemplateRef<any> | null | undefined>(null);
  values = input<(T | null)[]>([]);
  placeholderText = input('None');
  iconUrlLookupFn = input<(_: T | null) => string>((_: T | null) => '');
  displayTextTransformer = input<(value: T | null) => string>();

  showValues = computed(() =>
    this.values().map((v) => ({ value: v, shouldShowOverlay: false })),
  );

  /** The timeout ID of any current timer set to show the tooltip */
  private showTimeoutId: ReturnType<typeof setTimeout> | undefined;

  displayTextForValue(value: T | null): string {
    if (!this.displayTextTransformer()) {
      return value as string;
    }
    return this.displayTextTransformer()!(value);
  }

  hasTooltip = false;

  hideTooltipAt(index: number): void {
    if (this.showTimeoutId != null) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = undefined;
    }

    if (!this.showValues()[index].shouldShowOverlay) {
      return;
    }
    this.showValues()[index].shouldShowOverlay = false;
    this.changeDetectorRef.detectChanges();
  }

  showTooltipAt(index: number): void {
    this.showTimeoutId = setTimeout(() => {
      this.showValues()[index].shouldShowOverlay = true;
      this.showTimeoutId = undefined;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  ngAfterViewChecked(): void {
    this.hasTooltip = !!this.tooltip();
  }
}

interface ShowValue<T> {
  value: T | null;
  shouldShowOverlay: boolean;
}
