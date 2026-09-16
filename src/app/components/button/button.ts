import { Component, input, output } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { L10nText } from '../text/text';
import { L10nKey } from '../../shared/l10n/l10n';

@Component({
  selector: 'ac-button',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, L10nText],
  templateUrl: './button.html',
})
export class AcButton {
  text = input<L10nKey>();
  icon = input<string>();
  tooltip = input<string>();
  appearance = input<MatButtonAppearance | ''>('');
  color = input<string>();
  action = output<Event>();

  onClick(event: Event): void {
    this.action.emit(event);
  }
}
