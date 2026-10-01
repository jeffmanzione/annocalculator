import {
  Component,
  forwardRef,
  TemplateRef,
  input,
  computed,
  signal,
  inject,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EnumRow } from '../enum-row/enum-row';

import { EnumTooltip } from '../enum-tooltip/enum-tooltip';
import { L10nText } from '../text/text';
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nService } from '../../services/l10n/l10n';

@Component({
  selector: 'enum-select',
  imports: [EnumRow, MatSelectModule, MatFormFieldModule, L10nText],
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
  tooltip = input<TemplateRef<EnumTooltip<T>> | null>(null);
  label = input<L10nKey>();
  options = input.required<T[]>();
  iconUrlLookupFn = input<(_: T | null) => string>((_: T | null) => '');
  wrapInMatFormField = input(true);
  multiple = input(false);
  multipleSelectLimit = input(Number.MAX_SAFE_INTEGER);
  valueIsExemptFromLimit = input<(_: T) => boolean>((_: T) => false);
  displayTextTransformer = input<(value: T | null) => string>();

  private readonly rows_ = viewChildren(EnumRow);

  private readonly l10nService_ = inject(L10nService);
  readonly noneText = computed(() => {
    this.l10nService_.languageSignal(); // Re-localize when the language changes.
    return this.l10nService_.lookupLocalizedText('None');
  });

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

  /**
   * Tooltips are hidden by mouseleave, which never fires for an option whose
   * element goes away with the closing panel, so hide them explicitly.
   */
  onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.rows_().forEach((row) => row.hideAllTooltips());
    }
  }

  shouldDisableOption(option: T): boolean {
    return (
      this.multiple() &&
      this.valueAsArray().length >= this.multipleSelectLimit() &&
      !this.valueAsArray().includes(option)
    );
  }
}
