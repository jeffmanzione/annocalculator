import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'json-input',
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './json-input.html',
  styleUrl: './json-input.scss'
})
export class JsonInput<T> implements OnInit {

  private _model!: T;

  @Input()
  set model(value: T) {
    this._model = value;
    if (this.textArea) {
      this.convertObjectToJsonString();
    }
  }

  @Output()
  change = new EventEmitter<T>;

  @ViewChild('input', { static: true, read: ElementRef })
  textArea!: ElementRef<HTMLTextAreaElement>;

  errorMessage: string = '';

  ngOnInit(): void {
    this.convertObjectToJsonString();
  }

  private convertObjectToJsonString(): void {
    this.textArea.nativeElement.value = JSON.stringify(this._model);
  }

  updateModel(): void {
    try {
      const jsonText = this.textArea.nativeElement.value;
      this._model = JSON.parse(jsonText) as T;
      this.change.emit(this._model);
      this.errorMessage = '';
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(e);
        this.errorMessage = e.message;
      }
    }
  }
}
