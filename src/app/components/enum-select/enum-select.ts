import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EnumRow } from '../enum-row/enum-row';

@Component({
  selector: 'enum-select',
  imports: [EnumRow, MatSelectModule, MatFormFieldModule],
  templateUrl: './enum-select.html',
  styleUrl: './enum-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnumSelect),
      multi: true,
    },
  ],
})
export class EnumSelect<T> implements ControlValueAccessor {
  @Input()
  label?: string;

  @Input()
  options!: T[];

  @Input()
  iconUrlLookupFn = (_: T | null) => '';

  @Input()
  wrapInMatFormField = true;

  @Input()
  multiple = false;

  @Input()
  multipleSelectLimit = Number.MAX_SAFE_INTEGER;

  value: T[] | T | null = null;

  get valueAsArray(): (T | null)[] {
    return Array.isArray(this.value) ? this.value : [this.value];
  }

  isDisabled = false;
  onChange: any = (_: T) => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  shouldDisableOption(option: T): boolean {
    return (
      this.multiple &&
      this.valueAsArray.length >= this.multipleSelectLimit &&
      !this.valueAsArray.includes(option)
    );
  }
}
