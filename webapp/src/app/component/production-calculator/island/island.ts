import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { IslandController, ProductionLineController } from '../../../mvc/controllers';
import { ProductionLine } from "../production-line/production-line";
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DepartmentOfLaborPolicy } from '../../../mvc/models';
import { ControllerComponent } from '../base/controller';

@Component({
  selector: 'island',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    ProductionLine,
    ReactiveFormsModule,
  ],

  templateUrl: './island.html',
  styleUrl: './island.scss'
})
export class Island extends ControllerComponent<IslandController> implements OnInit {
  readonly dolPolicies = Object.values(DepartmentOfLaborPolicy);

  formGroup?: FormGroup;

  @ViewChildren(ProductionLine)
  productionLineComponents!: QueryList<ProductionLine>;

  get productionLines(): ProductionLineController[] {
    // So that islands cannot be without production lines.
    if (this.controller.productionLines.length == 0) {
      this.addProductionLine();
    }
    return this.controller.productionLines;
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl(this.controller.name),
      dolPolicy: new FormControl(this.controller.dolPolicy),
    });
    this.formGroup.valueChanges.subscribe(_ => this.change.emit());
  }

  update(): void {
    this.controller.name = this.formGroup!.value.name;
    this.controller.dolPolicy = this.formGroup!.value.dolPolicy;

    if (this.productionLineComponents) {
      for (const pl of this.productionLineComponents) {
        pl.update();
      }
    }
  }

  addProductionLine(): void {
    this.controller.addProductionLine();
  }

  removeProductionLineAt(index: number): void {
    this.controller.removeProductionLineAt(index);
  }

  onChange(): void {
    this.change.emit()
  }
}
