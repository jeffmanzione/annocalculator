import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

export abstract class Control {
  private readonly _change = new EventEmitter<Control>();
  public get update() {
    return this._change;
  }

  private readonly _children: Control[] = [];

  protected registerChildControl(control: Control): void {
    control.update.subscribe((child) => this.pushUpChange(child));
    this._children.push(control);
  }

  protected unregisterChildControl(control: Control): void {
    this._children.splice(this._children.indexOf(control), 1);
  }

  pushUpChange(childChanged?: Control): void {
    this.privateBeforeBubbleChange(childChanged);
    this._change.emit(this);
    this.privateAfterPushChange();
  }

  protected privateBeforeBubbleChange(childChanged?: Control): void {
    for (const child of this._children) {
      // Avoid reprocessing the same nodes.
      if (child == childChanged) continue;
      child.privateBeforeBubbleChange();
    }
    this.beforeBubbleChange();
  }

  protected privateAfterPushChange(): void {
    this.afterPushChange();
    for (const child of this._children) {
      child.privateAfterPushChange();
    }
  }

  beforeBubbleChange(): void {
    return;
  }

  afterPushChange(): void {
    return;
  }
}

@Component({
  selector: 'controller',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class ControlComponent<T> extends Control {
  private readonly changeDetector = inject(ChangeDetectorRef);

  private _controller!: T;

  @Input()
  set controller(value: T) {
    this._controller = value;
    this.onSetController(value);
  }
  get controller(): T {
    return this._controller;
  }

  @Output()
  override get update(): EventEmitter<Control> {
    return super.update;
  }

  forceAfterPushChange(): void {
    this.privateAfterPushChange();
  }

  protected override privateAfterPushChange(): void {
    super.privateAfterPushChange();
    this.changeDetector.markForCheck();
  }

  protected onSetController(ctrlr: T): void {
    return;
  }
}

export interface ControlConverter<T> {
  controlName: string;
  disabled?: boolean;
  readObject?: (obj: T) => any;
  updateObject?: (value: any, obj: T) => void;
}

export abstract class FormGroupControl<T> extends Control {
  formGroup: FormGroup;

  converters: ControlConverter<T>[];

  constructor(
    public readonly controller: T,
    converters: (string | ControlConverter<T>)[],
  ) {
    super();
    this.formGroup = new FormGroup({});
    this.converters = converters.map((c) =>
      typeof c === 'string' ? { controlName: c } : c,
    );
    for (let converter of this.converters) {
      this.formGroup.addControl(
        converter.controlName,
        new FormControl({
          value: converter.readObject
            ? converter.readObject(this.controller)
            : // @ts-ignore
              this.controller[converter.controlName],
          disabled: converter.disabled,
        }),
        { emitEvent: false },
      );
    }
    this.formGroup.valueChanges.subscribe((_) => this.pushUpChange());
  }

  protected beforeModelUpdate(): void {
    return;
  }

  protected override privateBeforeBubbleChange(childChanged?: Control): void {
    this.beforeModelUpdate();
    for (const converter of this.converters) {
      if (converter.updateObject) {
        converter.updateObject(
          this.formGroup.value[converter.controlName],
          this.controller,
        );
      } else {
        // @ts-ignore
        this.controller[converter.controlName] =
          this.formGroup.controls[converter.controlName].getRawValue();
      }
    }
    super.privateBeforeBubbleChange(childChanged);
  }
}
