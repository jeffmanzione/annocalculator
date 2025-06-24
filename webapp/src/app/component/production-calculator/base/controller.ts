import { Component, EventEmitter, Input, Output } from '@angular/core';


export abstract class Control {
  private readonly _change = new EventEmitter<void>();
  public get change() {
    return this._change;
  }

  private readonly _children: Control[] = [];

  protected registerChildControl(control: Control): void {
    control.change.subscribe(_ => this.pushUpChange());
    this._children.push(control);
  }

  protected unregisterChildControl(control: Control): void {
    this._children.splice(this._children.indexOf(control), 1);
  }

  pushUpChange(): void {
    this.privateBeforeBubbleChange();
    this._change.emit();
    this.privateAfterPushChange();
  }

  private privateBeforeBubbleChange(): void {
    for (const child of this._children) {
      child.privateBeforeBubbleChange();
    }
    this.beforeBubbleChange();
  }

  private privateAfterPushChange(): void {
    this.afterPushChange();
    for (const child of this._children) {
      child.privateAfterPushChange();
    }
  }

  beforeBubbleChange(): void { }

  afterPushChange(): void { }
}

@Component({
  selector: 'controller',
  template: '',
})
export abstract class ControlComponent<T> extends Control {
  @Input()
  controller!: T;

  @Output()
  override get change(): EventEmitter<void> {
    return super.change;
  }
}