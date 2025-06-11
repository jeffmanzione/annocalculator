import { Component, Input, OnInit } from '@angular/core';
import { IslandController, ProductionLineController } from '../../../mvc/controllers';
import { ProductionLine } from "../production-line/production-line";
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'island',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    ProductionLine,
  ],

  templateUrl: './island.html',
  styleUrl: './island.scss'
})
export class Island implements OnInit {
  @Input()
  controller?: IslandController;

  productionLines: ProductionLineController[] = [];

  ngOnInit(): void {
    this.update();
  }

  private update(): void {
    this.productionLines = this.controller!.productionLines;
  }

  addProductionLine(): void {
    this.controller!.addProductionLine();
    this.update();
  }

  removeProductionLineAt(index: number): void {
    console.log(index);
    this.controller!.removeProductionLineAt(index);
    this.update();
  }
}
