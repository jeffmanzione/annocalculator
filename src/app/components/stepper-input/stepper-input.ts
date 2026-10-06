import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * A number field with up and down arrows that move it by `step` (used for a production line's count and
 * for a repeatable discovery's percentage). Numbers are cut down to a multiple of the step, never below
 * `min` or above `max` when stepping. It works with `ngModel` and with reactive forms.
 *
 * With `commit="input"` the value is passed on as it is typed; with `commit="change"` only when the
 * field is left or Enter is pressed (and what was typed is then shown cut down to the step).
 */
@Component({
  selector: 'stepper-input',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './stepper-input.html',
  styleUrl: './stepper-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StepperInput),
      multi: true,
    },
  ],
})
export class StepperInput implements ControlValueAccessor {
  readonly step = input(1);
  readonly min = input<number | null>(0);
  readonly max = input<number | null>(null);
  readonly label = input('');
  readonly suffix = input('');
  readonly ariaLabel = input('');
  readonly commit = input<'input' | 'change'>('input');

  private readonly field_ = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly value = signal<number | null>(null);
  protected readonly disabled = signal(false);

  private onChange_: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange_ = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  /** The number cut down to a multiple of the step, or null for an empty or unreadable field. */
  private snapped_(raw: string): number | null {
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed)) return null;
    const step = this.step();
    return Math.floor(parsed / step) * step;
  }

  protected onInput(event: Event): void {
    if (this.commit() !== 'input') return;
    this.emit_(this.snapped_((event.target as HTMLInputElement).value));
  }

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = this.snapped_(target.value);
    if (this.commit() === 'change') this.emit_(value);
    // Show what was kept, even when it is the same as before (a typed 17 reads 15 again).
    target.value = value === null ? '' : String(value);
  }

  protected stepBy(direction: 1 | -1): void {
    const step = this.step();
    // From what the field shows now, which is what the person sees even if a write is still on its way.
    const shown = Number.parseFloat(this.field_()?.nativeElement.value ?? '');
    let next =
      (Number.isNaN(shown) ? (this.value() ?? 0) : shown) + direction * step;
    const min = this.min();
    const max = this.max();
    if (min !== null) next = Math.max(min, next);
    if (max !== null) next = Math.min(max, next);
    // Shown at once, not on the next change detection, so what is read from the field is never behind.
    const field = this.field_()?.nativeElement;
    if (field) field.value = String(next);
    this.emit_(next);
  }

  private emit_(value: number | null): void {
    this.value.set(value);
    this.onChange_(value);
  }
}
