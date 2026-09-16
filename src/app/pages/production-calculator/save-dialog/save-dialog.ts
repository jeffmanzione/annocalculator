import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AcButton } from '../../../components/button/button';
import { JsonInput } from '../../../components/json-input/json-input';
import { L10nText } from '../../../components/text/text';

@Component({
  selector: 'save-dialog',
  imports: [AcButton, JsonInput, MatDialogModule, L10nText],
  templateUrl: './save-dialog.html',
  styleUrl: './save-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveDialog<T> {
  private readonly data_ = inject<SaveData<T>>(MAT_DIALOG_DATA);
  readonly obj = model(this.data_.obj);

  updateObject(newObj: T): void {
    this.data_.obj = newObj;
  }
}

export interface SaveData<T> {
  obj: T;
}
