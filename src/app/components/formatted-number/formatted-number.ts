import { CommonModule, formatNumber, formatPercent } from '@angular/common';
import {
  Component,
  Inject,
  input,
  LOCALE_ID,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';

export interface FontSpec {
  color?: string;
  style?: string;
  weight?: string;
}

export interface FormatFontSpec {
  default: FontSpec;
  positive?: FontSpec;
  negative?: FontSpec;
}

export const GREEN_RED_FONT_SPEC: FormatFontSpec = {
  default: { color: 'rgba(0, 0, 0, 0.62)' },
  positive: { color: 'rgb(0, 185, 56)' },
  negative: { color: 'rgb(217, 48, 37)', weight: 'bold' },
};

@Component({
  selector: 'formatted-number',
  templateUrl: './formatted-number.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule],
})
export class FormattedNumber {
  value = input.required<number>();
  isPercent = input<boolean>(false);
  format = input<string>();
  formatFontSpec = input<FormatFontSpec>();
  suffix = input<string>('');
  zeroOverride = input<string>();
  showPlusIfPositive = input<boolean>(false);

  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  computedFormat = computed(
    () => this.format() ?? (this.isPercent() ? '1.0-0' : '1.0-1'),
  );

  color = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec();
    return fontSpec?.color;
  });

  style = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec();
    return fontSpec?.style;
  });

  weight = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec();
    return fontSpec?.weight;
  });

  deriveFontSpec = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    if (this.value() < 0 && this.formatFontSpec()!.negative) {
      return this.formatFontSpec()!.negative;
    } else if (this.value() > 0 && this.formatFontSpec()!.positive) {
      return this.formatFontSpec()!.positive;
    }
    return this.formatFontSpec()!.default;
  });

  formattedValue = computed(() => {
    if (this.zeroOverride() && this.value() == 0) {
      return this.zeroOverride()!;
    }
    const strValue = this.isPercent()
      ? this.formatAsPercent_()
      : this.formatAsNumber_();
    return `${this.numberPrefix_()}${strValue}${this.suffix()}`;
  });

  private formatAsPercent_(): string {
    return formatPercent(this.value(), this.locale, this.computedFormat());
  }

  private formatAsNumber_(): string {
    return formatNumber(this.value(), this.locale, this.computedFormat());
  }

  private numberPrefix_(): string {
    return this.showPlusIfPositive() && this.value() > 0 ? '+' : '';
  }
}
