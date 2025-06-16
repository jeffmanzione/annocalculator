import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { WorldController } from '../../mvc/controllers';
import { ProductionBuilding, Good, WorldModel, BoostType, DepartmentOfLaborPolicy } from '../../mvc/models';
import { Island } from "./island/island";
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SummaryPanel } from "./summary-panel/summary-panel";
import { CardModule } from '../card/card';

@Component({
  selector: 'production-calculator-page',
  imports: [
    CardModule,
    CommonModule,
    Island,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    SummaryPanel,
  ],
  templateUrl: './production-calculator.html',
  styleUrl: './production-calculator.scss',
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } }
  ],
})
export class ProductionCalculatorPage implements OnInit {
  worldModel: WorldModel = {
    tradeUnionBonus: 0.3,
    islands: [
      {
        name: 'Crown Falls',
        dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
        productionLines: [
          {
            building: ProductionBuilding.FlourMill,
            good: Good.Flour,
            numBuildings: 5,
            boostType: BoostType.Electricity,
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.15,
            inRangeOfLocalDepartment: true,
          },
          {
            building: ProductionBuilding.Bakery,
            good: Good.Bread,
            numBuildings: 10,
            boostType: BoostType.Electricity,
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.15,
            inRangeOfLocalDepartment: true,
          }
        ]
      },
      {
        name: 'Farm Island',
        dolPolicy: DepartmentOfLaborPolicy.LandReformAct,
        productionLines: [
          {
            building: ProductionBuilding.GrainFarm,
            good: Good.Grain,
            numBuildings: 5,
            boostType: BoostType.TracktorBarn,
            hasTradeUnion: true,
            inRangeOfLocalDepartment: true,
          }
        ]
      }
    ]
  };
  world: WorldController = WorldController.wrap(this.worldModel);

  formGroup?: FormGroup;

  @ViewChildren(Island)
  islandComponents!: QueryList<Island>;

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      tradeUnionBonusPercent: new FormControl(30),
    });
    this.formGroup.valueChanges.subscribe(() => this.update());
  }

  update(): void {
    this.world.tradeUnionBonus = this.formGroup!.value.tradeUnionBonusPercent / 100;

    if (this.islandComponents) {
      for (const i of this.islandComponents) {
        i.update();
      }
    }
    console.log(this.world.toJsonString());
  }

  addIsland(): void {
    this.world.addIsland();
  }

  removeIslandAt(index: number): void {
    this.world.removeIslandAt(index);
  }
}
