import { Component } from '@angular/core';
import { CardModule } from '../../card/card';
import { MatTableModule } from '@angular/material/table';
import { Good } from '../../../mvc/models';
import { FormattedNumberModule, GREEN_RED_FONT_SPEC } from "../../formatted-number/formatted-number";

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
export class SummaryPanel {


  colorSpec = GREEN_RED_FONT_SPEC;

  displayColumns = [
    'good',
    'total-production-per-min',
    'net-production-per-min',
  ];
  computedData: GoodSummaryRow[] = [
    {
      good: Good.Grain,
      totalProductionPerMin: 24.7,
      netProductionPerMin: 0.2,
    },
    {
      good: Good.Flour,
      totalProductionPerMin: 24.5,
      netProductionPerMin: 0.0,
    },
    {
      good: Good.Bread,
      totalProductionPerMin: 24.5,
      netProductionPerMin: -0.3,
    },
  ];
}
