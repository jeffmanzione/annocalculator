import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CardModule } from '../../card/card';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormattedNumberModule, GREEN_RED_FONT_SPEC } from "../../formatted-number/formatted-number";
import { IslandView, WorldView } from '../../../mvc/views';
import { Good } from '../../../game/enums';
import { IslandId } from '../../../mvc/models';
import { ReadonlyTable, Table } from '../../../tools/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';

interface GoodSummaryCell {
  island: IslandView,
  good: Good,
  localProductionPerMin: number,
  localConsumptionPerMin: number,
  importedPerMin: number,
  exportedPerMin: number,
};

interface GoodSummaryRow {
  good: Good,
  totalProductionPerMin: number,
  netProductionPerMin: number,
  islandSummaries: MatTableDataSource<GoodSummaryCell>,
  showIslandSummary: boolean,
  showIslandSummaryIcon: string,
};

@Component({
  selector: 'summary-panel',
  imports: [
    CardModule,
    CommonModule,
    FormattedNumberModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
  ],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.scss'
})
export class SummaryPanel implements OnInit, AfterViewInit {
  readonly colorSpec = GREEN_RED_FONT_SPEC;

  readonly outerColumns = [
    'good',
    'show-islands',
    'total-production-per-min',
    'net-production-per-min',
  ];

  readonly innerColumns = [
    'island',
    'local-production-per-min',
    'local-consumption-per-min',
    'imported-per-min',
    'exported-per-min',
    'net-per-min',
  ];

  readonly computedData = new MatTableDataSource<GoodSummaryRow>();

  @Input()
  world!: WorldView;

  @ViewChild(MatTable<GoodSummaryRow>)
  table!: MatTable<GoodSummaryRow>;

  @ViewChild(MatSort)
  sort!: MatSort;

  @ViewChildren(MatTable<GoodSummaryCell>)
  islandTables!: QueryList<MatTable<GoodSummaryCell>>;

  ngOnInit(): void {
    this.update();
  }

  ngAfterViewInit(): void {
    this.computedData.sort = this.sort;
    this.computedData.sortingDataAccessor = (data: GoodSummaryRow, sortHeaderId: string): string | number => {
      switch (sortHeaderId) {
        case 'good':
          return data.good.toLocaleLowerCase();
        case 'total-production-per-min':
          return data.totalProductionPerMin;
        case 'net-production-per-min':
          return data.netProductionPerMin;
      }
      return 0;
    };
  }

  update(): void {
    if (!this.world) {
      return;
    }

    const baseTable = this.buildBaseTable();
    const tradesTable = this.buildTradesTable();

    for (const [sourceIsland, good, targetIslands] of tradesTable) {
      const cell = baseTable.get(sourceIsland, good);
      let totalAvailable = this.availableProduction(cell);
      if (totalAvailable <= 0) { continue; }

      const sortedIslands = targetIslands
        .map(id => baseTable.get(id, good))
        .filter(c => this.availableProduction(c) < 0)
        .map(c => c!)
        .sort((c1, c2) => this.availableProduction(c1) - this.availableProduction(c2));

      // First, distribute evenly what is available.
      for (let i = 0; i < sortedIslands.length; i++) {
        const targetCell = baseTable.get(sortedIslands[i].island.id, good);
        if (!targetCell) { continue; }
        const targetDistribution = totalAvailable / (sortedIslands.length - i);
        const distribution = Math.min(targetDistribution, -this.availableProduction(targetCell));
        targetCell.importedPerMin += distribution;
        cell!.exportedPerMin += distribution;
        totalAvailable -= distribution;
      }
      // If there is any left after distribution, sprinkle the last bit evenly.
      for (let i = 0; i < sortedIslands.length; i++) {
        const targetCell = baseTable.get(sortedIslands[i].island.id, good);
        if (!targetCell) { continue; }
        const distribution = totalAvailable / (sortedIslands.length - i);
        targetCell.importedPerMin += distribution;
        cell!.exportedPerMin += distribution;
        totalAvailable -= distribution;
      }
    }

    this.computedData.data = this.groupByGood(baseTable);
    this.table?.renderRows();
  }

  toggleIslandSummary(row: GoodSummaryRow): void {
    row.showIslandSummary = !row.showIslandSummary;
    row.showIslandSummaryIcon = row.showIslandSummary ? 'arrow_drop_up' : 'arrow_drop_down';
    this.islandTables.get(this.computedData.data.indexOf(row))?.renderRows();
  }

  availableProduction(cell?: GoodSummaryCell): number {
    if (!cell) return 0;
    return cell.localProductionPerMin - cell.localConsumptionPerMin + cell.importedPerMin - cell.exportedPerMin;
  }

  private buildBaseTable(): Table<IslandId, Good, GoodSummaryCell> {
    let cells = new Table<IslandId, Good, GoodSummaryCell>();

    const updateStats = (island: IslandView, good: Good, netProductionPerMin: number): void => {
      const tableCell = cells.getOrDefault(island.id, good, () => this.createGoodSummaryCell(island, good));
      if (netProductionPerMin > 0) {
        tableCell.localProductionPerMin += netProductionPerMin;
      } else {
        tableCell.localConsumptionPerMin -= netProductionPerMin;
      }
    };

    for (const island of this.world.islands) {
      for (const pl of island.productionLines) {
        updateStats(island, pl.good, pl.goodsProducedPerMinute);
        for (const eg of pl.extraGoods) {
          updateStats(island, eg.good, eg.producedPerMinute);
        }
        for (const ig of pl.inputGoods) {
          updateStats(island, ig, -pl.goodsConsumedPerMinute);
        }
      }
    }
    return cells;
  }

  private buildTradesTable(): ReadonlyTable<IslandId, Good, IslandId[]> {
    const trades = new Table<IslandId, Good, IslandId[]>();
    for (const tr of this.world.tradeRoutes) {
      trades.getOrDefault(tr.sourceIslandId, tr.good, () => []).push(tr.targetIslandId);
    }
    return trades;
  }

  private groupByGood(cellTable: ReadonlyTable<IslandId, Good, GoodSummaryCell>): GoodSummaryRow[] {
    let rows = cellTable.reduceLeft((good, cells) => {
      const row = this.createGoodSummaryRow(good, cells);
      for (const cell of cells) {
        row.totalProductionPerMin += cell.localProductionPerMin;
        row.netProductionPerMin += this.availableProduction(cell);
      }
      return row;
    });
    return Array.from(rows.values()).sort((r1, r2) => r1.good.localeCompare(r2.good));
  }

  private createGoodSummaryRow(good: Good, cells: Iterable<GoodSummaryCell>): GoodSummaryRow {
    return {
      good: good,
      islandSummaries: new MatTableDataSource(Array.from(cells).sort((c1, c2) => c1.island.name.localeCompare(c2.island.name))),
      totalProductionPerMin: 0,
      netProductionPerMin: 0,
      showIslandSummary: false,
      showIslandSummaryIcon: 'arrow_drop_down',
    };
  }

  private createGoodSummaryCell(island: IslandView, good: Good): GoodSummaryCell {
    return {
      island: island,
      good: good,
      localProductionPerMin: 0,
      importedPerMin: 0,
      exportedPerMin: 0,
      localConsumptionPerMin: 0,
    };
  }
}
