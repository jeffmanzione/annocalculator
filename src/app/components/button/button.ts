import { Component, input, output } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ac-button',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './button.html',
})
export class AcButton {
  text = input<string>();
  icon = input<string>();
  tooltip = input<string>();
  appearance = input<MatButtonAppearance | ''>('');
  color = input<string>();
  action = output<Event>();

  onClick(event: Event): void {
    this.action.emit(event);
  }
}
