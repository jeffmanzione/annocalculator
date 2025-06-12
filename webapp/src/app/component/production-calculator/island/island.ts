import { Component, Input, OnInit } from '@angular/core';
import { IslandController, ProductionLineController } from '../../../mvc/controllers';
import { ProductionLine } from "../production-line/production-line";
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'island',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    ProductionLine,
    ReactiveFormsModule,
  ],

  templateUrl: './island.html',
  styleUrl: './island.scss'
})
export class Island implements OnInit {

  formGroup?: FormGroup;

  @Input()
  controller?: IslandController;

  productionLines: ProductionLineController[] = [];

  productionLineArray = new FormArray<FormGroup>([]);

  ngOnInit(): void {

    this.formGroup = new FormGroup({
      name: new FormControl(this.controller!.name),
      productionLines: this.productionLineArray,
    });
    this.controller!.productionLines.forEach(_ => this.productionLineArray.push(new FormGroup({}), { emitEvent: false }));
    this.formGroup.valueChanges.subscribe(() => this.update());
    this.update();
  }

  private update(): void {
    this.controller!.name = this.formGroup!.value.name;
    // this.productionLines = this.controller!.productionLines;
    console.log(this.controller!.toJsonString());
  }

  addProductionLine(): void {
    this.productionLineArray.push(new FormGroup({}), { emitEvent: false });
    this.controller!.addProductionLine();
    this.update();
  }

  removeProductionLineAt(index: number): void {
    this.productionLineArray.removeAt(index, { emitEvent: false });
    this.controller!.removeProductionLineAt(index);
    this.update();
  }
}
