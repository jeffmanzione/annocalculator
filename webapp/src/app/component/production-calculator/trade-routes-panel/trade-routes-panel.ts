import { Component, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TradeRouteController } from '../../../mvc/controllers';
import { IslandId } from '../../../mvc/models';

@Component({
  selector: 'trade-routes-panel',
  imports: [],
  templateUrl: './trade-routes-panel.html',
  styleUrl: './trade-routes-panel.scss'
})
export class TradeRoutesPanel {

}

export class TradeRouteControl {
  readonly change = new EventEmitter<void>();

  formGroup: FormGroup;

  constructor(private readonly controller: TradeRouteController) {
    this.formGroup = new FormGroup({
      sourceIsland: new FormControl(this.controller.sourceIsland),
      targetIsland: new FormControl(this.controller.targetIsland),
      good: new FormControl(this.controller.good),
    });
    this.update();
    this.formGroup.valueChanges.subscribe(_ => this.change.emit());
  }

  update(): void {
    this.controller.sourceIsland = this.formGroup.value.sourceIsland;
    this.controller.targetIsland = this.formGroup.value.targetIsland;
    this.controller.good = this.formGroup.value.good;
  }
}