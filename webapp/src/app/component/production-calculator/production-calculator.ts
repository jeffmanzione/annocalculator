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
import { Control } from './base/controller';
import { TradeRoutesPanel } from "./trade-routes-panel/trade-routes-panel";

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
    TradeRoutesPanel,
  ],
  templateUrl: './production-calculator.html',
  styleUrl: './production-calculator.scss',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    }
  ],
})
export class ProductionCalculatorPage extends Control implements OnInit {
  private readonly worldModel: WorldModel = {
    tradeUnionBonus: 0.3,
    islands: [
      {
        id: 1,
        name: 'Crown Falls',
        region: Region.CapeTrelawney,
        dolPolicy: DepartmentOfLaborPolicy.SkilledLaborAct,
        productionLines: [
          {
            building: ProductionBuilding.Bakery,
            inputGoods: [Good.Flour],
            good: Good.Bread,
            numBuildings: 10,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.5,
            inRangeOfLocalDepartment: true,
            extraGoods: [
              {
                good: Good.Chocolate,
                rateNumerator: 1,
                rateDenominator: 3,
              }
            ],
          },
          {
            building: ProductionBuilding.FlourMill,
            inputGoods: [Good.Grain],
            good: Good.Flour,
            numBuildings: 5,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.5,
            inRangeOfLocalDepartment: true,
          },
          {
            building: ProductionBuilding.Brewery,
            inputGoods: [Good.Malt, Good.Hops],
            good: Good.Beer,
            numBuildings: 4,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.3,
            inRangeOfLocalDepartment: true,
          },
          {
            building: ProductionBuilding.Malthouse,
            inputGoods: [Good.Grain],
            good: Good.Malt,
            numBuildings: 3,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.3,
            inRangeOfLocalDepartment: true,
          },
          {
            building: ProductionBuilding.AdvancedCoffeeRoaster,
            inputGoods: [Good.Malt],
            good: Good.Coffee,
            numBuildings: 2,
            boosts: [Boost.Electricity],
            hasTradeUnion: true,
            inRangeOfLocalDepartment: true,
          },
        ]
      },
      {
        id: 2,
        name: 'Farm Island',
        dolPolicy: DepartmentOfLaborPolicy.LandReformAct,
        productionLines: [
          {
            building: ProductionBuilding.GrainFarm,
            good: Good.Grain,
            numBuildings: 8,
            boosts: [Boost.TracktorBarn],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.5,
            inRangeOfLocalDepartment: true,
          },
          {
            building: ProductionBuilding.HopFarm,
            good: Good.Hops,
            numBuildings: 3,
            boosts: [Boost.TracktorBarn],
            hasTradeUnion: true,
            tradeUnionItemsBonus: 0.5,
            inRangeOfLocalDepartment: true,
          },
        ]
      }
    ],
    tradeRoutes: [
      {
        id: 1,
        sourceIsland: 2,
        targetIsland: 1,
        good: Good.Grain,
      },
      {
        id: 2,
        sourceIsland: 2,
        targetIsland: 1,
        good: Good.Hops,
      }
    ],
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
        i.afterPushChange();
      }
    }
    this.summaryPanel?.update();
    console.log(this.world.toJsonString());
  }

  addIsland(): void {
    this.world.addIsland();
    this.update();
  }

  removeIslandAt(index: number): void {
    this.world.removeIslandAt(index);
    this.update();
  }
}
