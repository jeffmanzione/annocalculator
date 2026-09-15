import {
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  effect,
  model,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'json-input',
  imports: [MatInputModule],
  templateUrl: './json-input.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './json-input.scss',
})
export class JsonInput<T> {
  value = model<T>();

  textArea = viewChild<ElementRef<HTMLTextAreaElement>>('input');

  errorMessage: string = '';

  constructor() {
    effect(() => {
      if (this.textArea()) {
        this.convertObjectToJsonString();
      }
    });
  }

  private convertObjectToJsonString(): void {
    this.textArea()!.nativeElement.value = JSON.stringify(
      this.value(),
      /*replacer=*/ null,
      /*spaces=*/ 2,
    );
  }

  updateModel(): void {
    try {
      const jsonText = this.textArea()!.nativeElement.value;
      this.value.set(JSON.parse(jsonText) as T);
      this.errorMessage = '';
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(e);
        this.errorMessage = e.message;
      }
    }
  }
}
