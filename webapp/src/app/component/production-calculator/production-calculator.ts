import { Component } from '@angular/core';
import { WorldController } from '../../mvc/controllers';
import { ProductionBuilding, Good, IslandModel, ProductionLineModel, WorldModel } from '../../mvc/models';
import { Island } from "./island/island";

@Component({
  selector: 'production-calculator-page',
  imports: [Island],
  templateUrl: './production-calculator.html',
  styleUrl: './production-calculator.scss'
})
export class ProductionCalculatorPage {
  productionLineModel: ProductionLineModel = {
    building: ProductionBuilding.HeavyWeaponsFactory,
    good: Good.AdvancedWeapons,
    numBuildings: 5
  };
  islandModel: IslandModel = {
    name: 'Test',
    productionLines: [this.productionLineModel]
  };
  worldModel: WorldModel = {
    tradeUnionBonus: 0.3,
    islands: [this.islandModel]
  };
  world: WorldController = WorldController.wrap(this.worldModel);
  island = this.world.islands[0];
}
