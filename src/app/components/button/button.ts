import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { L10nText } from '../text/text';
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nService } from '../../services/l10n/l10n';

@Component({
  selector: 'ac-button',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, L10nText],
  templateUrl: './button.html',
})
export class AcButton {
  text = input<L10nKey>();
  icon = input<string>();
  tooltip = input<L10nKey>();
  appearance = input<MatButtonAppearance | ''>('');
  color = input<string>();
  action = output<Event>();

  private readonly l10nService_ = inject(L10nService);
  readonly tooltipText = computed(() => {
    this.l10nService_.languageSignal(); // Re-localize when the language changes.
    const tooltip = this.tooltip();
    return tooltip ? this.l10nService_.lookupLocalizedText(tooltip) : '';
  });

  onClick(event: Event): void {
    this.action.emit(event);
  }
}
