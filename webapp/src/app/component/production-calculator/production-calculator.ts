import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { WorldController } from '../../mvc/controllers';
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
import { Region, DepartmentOfLaborPolicy, ProductionBuilding, Good, Boost } from '../../game/enums';
import { WorldModel } from '../../mvc/models';

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
        region: Region.CapeTrelawney,
        dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
        productionLines: [
          {
            building: ProductionBuilding.FlourMill,
            inputGoods: [Good.Grain],
            good: Good.Flour,
            numBuildings: 5,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.15,
            inRangeOfLocalDepartment: true,
            extraGoods: [],
          },
          {
            building: ProductionBuilding.Bakery,
            inputGoods: [Good.Flour],
            good: Good.Bread,
            numBuildings: 10,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.15,
            inRangeOfLocalDepartment: true,
            extraGoods: [
              {
                good: Good.Chocolate,
                rateNumerator: 1,
                rateDenominator: 3,
              }
            ],
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
            boosts: [Boost.TracktorBarn],
            hasTradeUnion: true,
            inRangeOfLocalDepartment: true,
            extraGoods: [],
          }
        ]
      }
    ]
  };
  world: WorldController = WorldController.wrap(this.worldModel);

  formGroup?: FormGroup;

  @ViewChildren(Island)
  islandComponents!: QueryList<Island>;

  @ViewChild(SummaryPanel)
  summaryPanel!: SummaryPanel;

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
    this.summaryPanel?.update();
    console.log(this.world.toJsonString());
  }

  addIsland(): void {
    this.world.addIsland();
  }

  removeIslandAt(index: number): void {
    this.world.removeIslandAt(index);
  }
}
