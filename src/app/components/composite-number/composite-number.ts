import { formatNumber, formatPercent } from '@angular/common';
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
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nText } from '../text/text';
import { L10nService } from '../../services/l10n/l10n';

export interface NumberConstituent {
  value: number;
  iconUrl?: string;
  description: string;
  /** Optional secondary line under the description, e.g. how the value was computed. */
  detail?: DetailToken[];
}

/**
 * One piece of a detail line: literal text such as an operator, or a number
 * that is formatted for the current locale (with an optional localized unit,
 * or as a percentage) when rendered. Keeping numbers and units as data, rather
 * than a finished string, is what lets the line follow the language.
 */
export type DetailToken =
  | string
  | { value: number; unit?: L10nKey; isPercent?: boolean };

@Component({
  selector: 'composite-number',
  templateUrl: './composite-number.html',
  styleUrl: './composite-number.scss',
  imports: [OverlayModule, FormattedNumber, MatIcon, L10nText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompositeNumber {
  changeDetectorRef = inject(ChangeDetectorRef);
  private readonly l10nService_ = inject(L10nService);

  constituentValues = input<NumberConstituent[]>([]);
  value = computed(() =>
    this.constituentValues().reduce((a, v) => a + v.value, 0),
  );

  /** Each constituent's detail line rendered in the current language, by index. */
  detailTexts = computed(() => {
    const language = this.l10nService_.languageSignal();
    const locale = this.l10nService_.localeSignal();
    return this.constituentValues().map((c) =>
      c.detail ? this.renderDetail_(c.detail, locale, language) : undefined,
    );
  });

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

  private renderDetail_(
    tokens: DetailToken[],
    locale: string,
    _language: unknown,
  ): string {
    let text = '';
    for (const token of tokens) {
      const piece =
        typeof token === 'string' ? token : this.renderNumber_(token, locale);
      const glued = text === '' || text.endsWith('(') || piece === ')';
      text += glued ? piece : ` ${piece}`;
    }
    return text;
  }

  private renderNumber_(
    token: Exclude<DetailToken, string>,
    locale: string,
  ): string {
    if (token.isPercent) {
      return formatPercent(token.value, locale, '1.0-2');
    }
    const unit = token.unit
      ? this.l10nService_.lookupLocalizedText(token.unit)
      : '';
    return `${formatNumber(token.value, locale, '1.0-2')}${unit}`;
  }

  toLoc(text: string): L10nKey {
    return text as L10nKey;
  }
}
