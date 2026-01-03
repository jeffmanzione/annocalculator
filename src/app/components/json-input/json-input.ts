import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'json-input',
  imports: [MatInputModule],
  templateUrl: './json-input.html',
  styleUrl: './json-input.scss',
})
export class JsonInput<T> implements OnInit {
  private _value!: T;

  @Input()
  set value(value: T) {
    this._value = value;
    if (this.textArea) {
      this.convertObjectToJsonString();
    }
  }

  @Output()
  valueChange = new EventEmitter<T>();

  @ViewChild('input', { static: true, read: ElementRef })
  textArea!: ElementRef<HTMLTextAreaElement>;

  errorMessage: string = '';

  ngOnInit(): void {
    this.convertObjectToJsonString();
  }

  private convertObjectToJsonString(): void {
    this.textArea.nativeElement.value = JSON.stringify(
      this._value,
      /*replacer=*/ null,
      /*spaces=*/ 2,
    );
  }

  updateModel(): void {
    try {
      const jsonText = this.textArea.nativeElement.value;
      this._value = JSON.parse(jsonText) as T;
      this.valueChange.emit(this._value);
      this.errorMessage = '';
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(e);
        this.errorMessage = e.message;
      }
    }
  }
}
