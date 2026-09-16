import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  Directive,
  effect,
  inject,
  input,
} from '@angular/core';

@Directive({ selector: '[tooltip]' })
export class TooltipDirective {}

@Component({
  selector: 'enum-tooltip',
  template: '',
  styles: [''],
})
export abstract class EnumTooltip<T> {
  private readonly changeDetectorRef_ = inject(ChangeDetectorRef);

  value = input<T | null>(null);

  constructor() {
    effect(() => {
      if (this.value()) {
        this.onValueChange(this.value()!);
        this.changeDetectorRef_.markForCheck();
      }
    });
  }

  protected abstract onValueChange(value: T): void;

  displayValueTransform = input<(value: T | null) => string>();

  displayValue = computed(() => {
    if (!this.displayValueTransform()) {
      return this.value() as string;
    }
    return this.displayValueTransform()!(this.value()!);
  });
}

@Component({
  selector: 'simple-tooltip',
  templateUrl: './simple-tooltip.html',
  styleUrl: './simple-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: SimpleTooltip }],
})
export class SimpleTooltip<T> extends EnumTooltip<T> {
  enumValue: T | null = null;

  iconUrlLookupFn = input<(value: T | null) => string>((_) => '');

  protected override onValueChange(value: T): void {
    this.enumValue = value;
  }
}
