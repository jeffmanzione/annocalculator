import { CommonModule, formatNumber, formatPercent } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID, NgModule, OnInit } from '@angular/core';

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
  standalone: false,
})
export class FormattedNumber implements OnInit {

  @Input()
  value!: number;

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

  constructor(@Inject(LOCALE_ID) private readonly locale: string) { }

  ngOnInit(): void {
    this.format ??= this.isPercent ? '1.0-0' : '1.0-1';
  }

  get color(): string | undefined {
    if (!this.formatFontSpec) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec();
    return fontSpec?.color;
  }

  get style(): string | undefined {
    if (!this.formatFontSpec) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec();
    return fontSpec?.style;
  }

  get weight(): string | undefined {
    if (!this.formatFontSpec) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec();
    return fontSpec?.weight;
  }

  private deriveFontSpec(): FontSpec | undefined {
    if (!this.formatFontSpec) {
      return undefined;
    }
    if (this.value < 0 && this.formatFontSpec.negative) {
      return this.formatFontSpec.negative;
    } else if (this.value > 0 && this.formatFontSpec.positive) {
      return this.formatFontSpec.positive;
    }
    return this.formatFontSpec.default;
  }

  private formatAsPercent(): string {
    return formatPercent(this.value, this.locale, this.format);
  }

  private formatAsNumber(): string {
    return formatNumber(this.value, this.locale, this.format);
  }

  get formattedValue(): string {
    if (this.zeroOverride && this.value == 0) {
      return this.zeroOverride;
    }
    const strValue = this.isPercent ? this.formatAsPercent() : this.formatAsNumber();
    return `${strValue}${this.suffix}`;
  }

}

@NgModule({
  declarations: [
    FormattedNumber,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    FormattedNumber,
  ]
})
export class FormattedNumberModule { }