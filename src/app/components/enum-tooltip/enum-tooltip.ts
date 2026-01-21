import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Directive({ selector: '[tooltip]' })
export class TooltipDirective {}

@Component({
  selector: 'enum-tooltip',
  template: '',
  styles: [''],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class EnumTooltip<T> implements OnDestroy {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private readonly valueSubject = new Subject<T | null>();
  private valueSubscription: Subscription | null = null;

  @Input()
  set value(value: T | null) {
    this.valueSubscription ??= this.valueSubject.subscribe((value) => {
      if (value == null) {
        this.valueSubscription?.unsubscribe();
        this.valueSubscription = null;
      } else {
        this.onValueChange(value);
        this.changeDetectorRef.markForCheck();
      }
    });
    this.valueSubject.next(value);
  }

  protected abstract onValueChange(value: T): void;

  ngOnDestroy(): void {
    this.valueSubject.next(null);
    this.valueSubject.complete();
    this.valueSubscription?.unsubscribe();
    this.valueSubscription = null;
  }
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

  @Input()
  iconUrlLookupFn: (value: T | null) => string = (_) => '';

  protected override onValueChange(value: T): void {
    this.enumValue = value;
  }
}
