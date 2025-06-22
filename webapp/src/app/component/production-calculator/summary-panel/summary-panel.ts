import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CardModule } from '../../card/card';
import { MatTable, MatTableModule } from '@angular/material/table';
import { FormattedNumberModule, GREEN_RED_FONT_SPEC } from "../../formatted-number/formatted-number";
import { WorldView } from '../../../mvc/views';
import { Good } from '../../../game/enums';

interface GoodSummaryRow {
  good: Good,
  totalProductionPerMin: number,
  netProductionPerMin: number,
};

@Component({
  selector: 'summary-panel',
  imports: [
    CardModule,
    MatTableModule,
    FormattedNumberModule,
  ],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.scss'
})
export class SummaryPanel implements OnInit {
  colorSpec = GREEN_RED_FONT_SPEC;

  displayColumns = [
    'good',
    'total-production-per-min',
    'net-production-per-min',
  ];

  computedData!: GoodSummaryRow[];

  @Input()
  world!: WorldView;

  @ViewChild(MatTable<GoodSummaryRow>)
  table!: MatTable<GoodSummaryRow>;

  ngOnInit(): void {
    this.update();
  }

  getOrDefault<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
    if (map.has(key)) {
      return map.get(key)!;
    }
    const val = defaultValue;
    map.set(key, val);
    return val;
  }

  update(): void {
    if (!this.world) {
      return;
    }
    let rows = new Map<Good, GoodSummaryRow>();
    for (const island of this.world.islands) {
      for (const pl of island.productionLines) {
        const row = this.getOrDefault(rows, pl.good, { good: pl.good, totalProductionPerMin: 0, netProductionPerMin: 0 });
        row.totalProductionPerMin += pl.goodsProducedPerMinute;
        for (const eg of pl.extraGoods) {
          const row = this.getOrDefault(rows, eg.good, { good: eg.good, totalProductionPerMin: 0, netProductionPerMin: 0 });
          row.totalProductionPerMin += eg.producedPerMinute;
        }
      }
    }
    this.computedData = Array.from(rows.values()).sort((r1, r2) => r1.good.localeCompare(r2.good));
    this.table?.renderRows();
  }

  // addValues(values: Iterable<number>): number {
  //   let total = 0;
  //   for (const value of values) {
  //     total += value;
  //   }
  //   return total;
  // }
}
