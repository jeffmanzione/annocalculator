import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { AcButton } from '../button/button';

/**
 * What both games' island editors share: a row for the island's settings (put in as content wrapped in
 * `<ng-container ngProjectAs="[settings]">`), the button that adds a production line, and a place for the
 * production lines table, which scrolls sideways when the panel is too narrow for it.
 */
@Component({
  selector: 'island-editor',
  imports: [AcButton],
  templateUrl: './island-editor.html',
  styleUrl: './island-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IslandEditor {
  readonly addLine = output<void>();
}
