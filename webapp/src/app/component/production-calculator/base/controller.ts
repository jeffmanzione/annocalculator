import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'controller',
  template: '',
})
export abstract class ControllerComponent<T> {
  @Input()
  controller!: T;

  @Output()
  change = new EventEmitter<void>();

  abstract update(): void;
}
