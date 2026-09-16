import {
  Component,
  forwardRef,
  TemplateRef,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EnumRow } from '../enum-row/enum-row';

import { EnumTooltip } from '../enum-tooltip/enum-tooltip';
import { L10nText } from '../text/text';
import { L10nKey } from '../../shared/l10n/l10n';

@Component({
  selector: 'enum-select',
  imports: [EnumRow, MatSelectModule, MatFormFieldModule, L10nText],
  templateUrl: './enum-select.html',
  styleUrl: './enum-select.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnumSelect),
      multi: true,
    },
  ],
})
export class EnumSelect<T> implements ControlValueAccessor {
  tooltip = input<TemplateRef<EnumTooltip<T>> | null>(null);
  label = input<L10nKey>();
  options = input.required<T[]>();
  iconUrlLookupFn = input<(_: T | null) => string>((_: T | null) => '');
  wrapInMatFormField = input(true);
  multiple = input(false);
  multipleSelectLimit = input(Number.MAX_SAFE_INTEGER);
  valueIsExemptFromLimit = input<(_: T) => boolean>((_: T) => false);
  displayTextTransformer = input<(value: T | null) => string>();

  value = signal<T[] | T | null>(null);

  valueAsArray = computed<(T | null)[]>(() => {
    return (
      Array.isArray(this.value()) ? this.value() : [this.value()]
    ) as (T | null)[];
  });

  valuesNotExemptFromLimit = computed(
    () =>
      this.valueAsArray().filter((v) => !this.valueIsExemptFromLimit()(v as T))
        .length,
  );

  isDisabled = false;
  onChange: any = (_: T) => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = (s: any) => fn(s());
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  shouldDisableOption(option: T): boolean {
    return (
      this.multiple() &&
      this.valueAsArray().length >= this.multipleSelectLimit() &&
      !this.valueAsArray().includes(option)
    );
  }
}
