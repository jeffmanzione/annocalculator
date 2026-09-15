import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ac-button',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './button.html',
})
export class AcButton {
  @Input()
  text?: string;

  @Input()
  icon?: string;

  @Input()
  tooltip?: string;

  @Input()
  appearance: MatButtonAppearance | '' = '';

  @Input()
  color?: string;

  @Output()
  action = new EventEmitter<Event>();

  onClick(event: Event): void {
    this.action.emit(event);
  }
}
