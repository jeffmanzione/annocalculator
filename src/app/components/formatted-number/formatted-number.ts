import { CommonModule, formatNumber, formatPercent } from '@angular/common';
import {
  Component,
  input,
  computed,
  inject,
} from '@angular/core';
import { L10nText } from '../text/text';
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nService } from '../../services/l10n/l10n';

interface FontSpec {
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
  default: { color: 'rgba(74, 47, 18, 0.7)' },
  positive: { color: 'rgb(54, 118, 24)', weight: 'bold' },
  negative: { color: 'rgb(176, 55, 44)', weight: 'bold' },
};

@Component({
  selector: 'formatted-number',
  templateUrl: './formatted-number.html',
  styleUrl: './formatted-number.scss',
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

  private readonly computedFormat_ = computed(
    () => this.format() ?? (this.isPercent() ? '1.0-0' : '1.0-1'),
  );

  readonly color = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec_();
    return fontSpec?.color;
  });

  readonly style = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec_();
    return fontSpec?.style;
  });

  protected readonly weight = computed(() => {
    if (!this.formatFontSpec()) {
      return undefined;
    }
    const fontSpec = this.deriveFontSpec_();
    return fontSpec?.weight;
  });

  private readonly deriveFontSpec_ = computed(() => {
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

  protected readonly formattedValue = computed(() => {
    const strValue = this.isPercent()
      ? this.formatAsPercent_()
      : this.formatAsNumber_();
    return `${this.numberPrefix_()}${strValue}`;
  });

  protected readonly suffixAsLoc = computed(() => this.suffix() as L10nKey);

  private formatAsPercent_(): string {
    return formatPercent(
      this.value(),
      this.l10nService_.localeSignal(),
      this.computedFormat_(),
    );
  }

  private formatAsNumber_(): string {
    return formatNumber(
      this.value(),
      this.l10nService_.localeSignal(),
      this.computedFormat_(),
    );
  }

  private numberPrefix_(): string {
    return this.showPlusIfPositive() && this.value() > 0 ? '+' : '';
  }
}
