import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';


export abstract class Control {
  private readonly _change = new EventEmitter<Control>();
  public get change() { return this._change; }

  private readonly _children: Control[] = [];

  protected registerChildControl(control: Control): void {
    control.change.subscribe(child => this.pushUpChange(child));
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

  private privateBeforeBubbleChange(childChanged?: Control): void {
    for (const child of this._children) {
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

  beforeBubbleChange(): void { return }

  afterPushChange(): void { return }
}

@Component({
  selector: 'controller',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class ControlComponent<T> extends Control {

  private readonly changeDetector = inject(ChangeDetectorRef);

  @Input()
  controller!: T;

  @Output()
  override get change(): EventEmitter<Control> { return super.change; }

  protected override privateAfterPushChange(): void {
    super.privateAfterPushChange();
    this.changeDetector.markForCheck();
  }
}