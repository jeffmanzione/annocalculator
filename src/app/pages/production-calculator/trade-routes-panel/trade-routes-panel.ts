import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TradeRouteController,
  WorldController,
} from '../../../shared/mvc/controllers';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  ControlComponent,
  FormGroupControl,
} from '../../../shared/control/control';
import { MatSelectModule } from '@angular/material/select';
import { Good } from '../../../shared/game/enums';
import { lookupGoodIconUrl } from '../../../shared/game/icons';
import { EnumSelect } from '../../../components/enum-select/enum-select';
import { IslandView } from '../../../shared/mvc/views';
import { CardModule } from '../../../components/card/card';
import { TradeRouteId } from '../../../shared/mvc/models';
import { AcButton } from '../../../components/button/button';

@Component({
  selector: 'trade-routes-panel',
  imports: [
    AcButton,
    CardModule,
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
export class TradeRoutesPanel
  extends ControlComponent<WorldController>
  implements OnInit
{
  readonly displayColumns = [
    'sourceIslandId',
    'targetIslandId',
    'good',
    'remove',
  ];

  dataSource!: MatTableDataSource<TradeRouteControl>;

  @ViewChild('tradeRouteTable')
  table!: MatTable<TradeRouteControl>;

  tradeRoutes!: TradeRouteControl[];

  ngOnInit(): void {
    this.tradeRoutes = this.controller.tradeRoutes.map((tr) => {
      const control = new TradeRouteControl(tr);
      this.registerChildControl(control);
      return control;
    });
    this.dataSource = new MatTableDataSource(this.tradeRoutes);
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
    this.table.renderRows();
  }

  lookupGoodIconUrl(good: Good | null): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }
}

export class TradeRouteControl extends FormGroupControl<TradeRouteController> {
  get id(): TradeRouteId {
    return this.controller.id;
  }

  sourceIslandOptions: IslandView[] = [];
  targetIslandOptions: IslandView[] = [];
  sourceGoodOptions: Good[] = [];

  constructor(controller: TradeRouteController) {
    super(controller, ['sourceIslandId', 'targetIslandId', 'good']);
    this.beforeBubbleChange();
    this.afterPushChange();
  }

  override afterPushChange(): void {
    this.sourceIslandOptions = this.controller.world.islands.filter(
      (i) => i.id != this.controller.targetIslandId,
    );
    this.targetIslandOptions = this.controller.world.islands.filter(
      (i) => i.id != this.controller.sourceIslandId,
    );
    this.sourceGoodOptions = this.computeSourceGoods();
  }

  private computeSourceGoods(): Good[] {
    if (this.controller.sourceIslandId < 0) {
      return [];
    }
    const island = this.controller.world.lookupIslandById(
      this.controller.sourceIslandId,
    );
    return island.producedGoods;
  }
}
