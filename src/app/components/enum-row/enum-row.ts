import { Component, Input } from '@angular/core';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'enum-row',
  imports: [MatTooltipModule],
  templateUrl: './enum-row.html',
  styleUrl: './enum-row.scss',
})
export class EnumRow<T> {
  @Input()
  values!: (T | null)[];

  @Input()
  placeholderText = 'None';

  tooltipPosition: TooltipPosition = 'right';

  @Input()
  iconUrlLookupFn = (_: T | null) => '';
}
