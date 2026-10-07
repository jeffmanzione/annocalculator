import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  computed,
  input,
} from '@angular/core';
import { L10nService } from '../../services/l10n/l10n';
import { L10nKey } from '../../shared/l10n/l10n';

@Component({
  selector: '[textLoc]',
  imports: [CommonModule],
  template: '{{ localizedText() }}',
})
export class L10nText {
  private readonly l10nService_ = inject(L10nService);
  private readonly languageSignal_ = this.l10nService_.languageSignal;

  textLoc = input.required<L10nKey>();

  protected readonly localizedText = computed(() => {
    this.languageSignal_(); // Do not remove; makes text update when langauge changes.
    return this.l10nService_.lookupLocalizedText(this.textLoc());
  });
}
