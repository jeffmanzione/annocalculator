import { CommonModule, formatNumber, formatPercent } from '@angular/common';
import {
  Component,
  Inject,
  input,
  LOCALE_ID,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { L10nText } from '../text/text';
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nService } from '../../services/l10n/l10n';

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
  imports: [CommonModule, L10nText],
})
export class FormattedNumber {
  private readonly l10nService_ = inject(L10nService);

  value = input.required<number>();
  isPercent = input<boolean>(false);
  format = input<string>();
  formatFontSpec = input<FormatFontSpec>();
  suffix = input<string>('');
  zeroOverride = input<string>();
  showPlusIfPositive = input<boolean>(false);

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
    return `${this.numberPrefix_()}${strValue}`;
  });

  suffixAsLoc = computed(() => this.suffix() as L10nKey);

  private formatAsPercent_(): string {
    return formatPercent(
      this.value(),
      this.l10nService_.localeSignal(),
      this.computedFormat(),
    );
  }

  private formatAsNumber_(): string {
    return formatNumber(
      this.value(),
      this.l10nService_.localeSignal(),
      this.computedFormat(),
    );
  }

  private numberPrefix_(): string {
    return this.showPlusIfPositive() && this.value() > 0 ? '+' : '';
  }
}
