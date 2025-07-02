import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { JsonInput } from "../../json-input/json-input";

@Component({
  selector: 'save-dialog',
  imports: [
    JsonInput,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './save-dialog.html',
  styleUrl: './save-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveDialog<T> {
  private readonly data = inject<SaveData<T>>(MAT_DIALOG_DATA);
  readonly obj = model(this.data.obj);

  updateObject(newObj: T): void {
    this.data.obj = newObj;
  }
}

export interface SaveData<T> {
  obj: T;
};