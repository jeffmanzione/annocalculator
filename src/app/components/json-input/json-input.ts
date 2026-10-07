import {
  Component,
  ElementRef,
  effect,
  model,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'json-input',
  imports: [MatInputModule],
  templateUrl: './json-input.html',
  styleUrl: './json-input.scss',
})
export class JsonInput<T> {
  value = model<T>();

  private readonly textArea_ = viewChild<ElementRef<HTMLTextAreaElement>>('input');

  errorMessage: string = '';

  constructor() {
    effect(() => {
      if (this.textArea_()) {
        this.convertObjectToJsonString_();
      }
    });
  }

  private convertObjectToJsonString_(): void {
    this.textArea_()!.nativeElement.value = JSON.stringify(
      this.value(),
      /*replacer=*/ null,
      /*spaces=*/ 2,
    );
  }

  protected updateModel(): void {
    try {
      const jsonText = this.textArea_()!.nativeElement.value;
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
