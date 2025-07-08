import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TradeRouteController, WorldController } from '../../../shared/mvc/controllers';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Control, ControlComponent } from '../base/controller';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Good } from '../../../shared/game/enums';
import { lookupGoodIconUrl } from '../../../shared/game/icons';
import { EnumSelect } from '../../../shared/components/enum-select/enum-select';
import { IslandView } from '../../../shared/mvc/views';
import { CardModule } from '../../../shared/components/card/card';
import { TradeRouteId } from '../../../shared/mvc/models';
import { AcButton } from '../../../shared/components/button/button';

@Component({
  selector: 'trade-routes-panel',
  imports: [
    AcButton,
    CardModule,
    CommonModule,
    EnumSelect,
    FormsModule,
    MatTableModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './trade-routes-panel.html',
  styleUrl: './trade-routes-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeRoutesPanel extends ControlComponent<WorldController> implements OnInit {
  readonly displayColumns = [
    'sourceIsland',
    'targetIsland',
    'good',
    'remove',
  ];

  dataSource!: MatTableDataSource<TradeRouteControl>;

  @ViewChild('tradeRouteTable')
  table!: MatTable<TradeRouteControl>;

  tradeRoutes!: TradeRouteControl[];

  ngOnInit(): void {
    this.loadDataFromModel();
  }

  addTradeRoute() {
    const control = new TradeRouteControl(this.controller.addTradeRoute());
    this.registerChildControl(control);
    this.tradeRoutes.push(control);
    this.pushUpChange();
  }

  removeTradeRouteAt(el: TradeRouteControl) {
    const index = this.tradeRoutes.indexOf(el);
    this.unregisterChildControl(this.tradeRoutes.splice(index, 1)[0]);
    this.controller.removeTradeRoute(el.id);
    this.pushUpChange();
  }

  override afterPushChange(): void {
    this.loadDataFromModel();
    this.table.renderRows();
  }

  lookupGoodIconUrl(good: Good | null): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  private loadDataFromModel(): void {
    if (this.tradeRoutes) {
      for (const control of this.tradeRoutes) {
        this.unregisterChildControl(control);
      }
    }
    this.tradeRoutes = this.controller.tradeRoutes.map(tr => {
      const control = new TradeRouteControl(tr);
      this.registerChildControl(control);
      return control;
    });
    this.dataSource = new MatTableDataSource(this.tradeRoutes);
  }
}

export class TradeRouteControl extends Control {

  formGroup: FormGroup;

  get id(): TradeRouteId {
    return this.controller.id;
  }

  sourceIslandOptions: IslandView[] = [];
  targetIslandOptions: IslandView[] = [];
  sourceGoodOptions: Good[] = [];

  constructor(private readonly controller: TradeRouteController) {
    super();
    this.formGroup = new FormGroup({
      sourceIsland: new FormControl(this.controller.sourceIslandId),
      targetIsland: new FormControl(this.controller.targetIslandId),
      good: new FormControl(this.controller.good),
    });
    this.formGroup.valueChanges.subscribe(_ => this.pushUpChange());
    this.beforeBubbleChange();
    this.afterPushChange();
  }

  override beforeBubbleChange(): void {
    this.controller.sourceIslandId = this.formGroup.value.sourceIsland;
    this.controller.targetIslandId = this.formGroup.value.targetIsland;
    this.controller.good = this.formGroup.value.good;
  }

  override afterPushChange(): void {
    this.sourceIslandOptions = this.controller.world.islands.filter(i => i.id != this.controller.targetIslandId);
    this.targetIslandOptions = this.controller.world.islands.filter(i => i.id != this.controller.sourceIslandId);
    this.sourceGoodOptions = this.computeSourceGoods();
  }

  private computeSourceGoods(): Good[] {
    if (this.controller.sourceIslandId < 0) {
      return [];
    }
    const island = this.controller.world.lookupIslandById(this.controller.sourceIslandId);
    return island.producedGoods;
  }
}