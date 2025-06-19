import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'enum-select',
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './enum-select.html',
  styleUrl: './enum-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnumSelect),
      multi: true,
    }
  ]
})
export class EnumSelect<T> implements ControlValueAccessor {
  @Input()
  options!: T[];

  @Input()
  iconUrlLookupFn = (_: T | null) => '';

  @Input()
  wrapInMatFormField = true;

  @Input()
  multiple = false;

  value: T[] | T | null = null;

  get valueAsArray(): (T | null)[] {
    return Array.isArray(this.value) ? this.value : [this.value];
  }

  isDisabled = false;
  onChange: any = (_: T) => { };
  onTouched: any = () => { };

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
}