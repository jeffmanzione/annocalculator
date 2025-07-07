import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  islandSummaries: GoodSummaryCell[],
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
  styleUrl: './summary-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly tableData = new MatTableDataSource<GoodSummaryRow>();
  private readonly rows = new Map<Good, GoodSummaryRow>();

  @Input()
  set world(value: WorldView) {
    this._world = value;
    this.update();
  }
  get world(): WorldView {
    return this._world;
  }

  _world!: WorldView;

  @ViewChild(MatTable<GoodSummaryRow>)
  table!: MatTable<GoodSummaryRow>;

  @ViewChild(MatSort)
  sort!: MatSort;

  @ViewChildren(MatTable<GoodSummaryCell>)
  islandTables!: QueryList<MatTable<GoodSummaryCell>>;

  ngOnInit(): void {
    for (const good of Object.values(Good)) {
      if (good == Good.Unknown) continue;
      this.rows.set(good, this.createBaseGoodSummaryRow(good));
    }
    this.update();
    this.tableData.filterPredicate = (data: GoodSummaryRow, _: string): boolean => {
      return data.islandSummaries.length > 0;
    };
    this.tableData.data = Array.from(this.rows.values());
  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.sortingDataAccessor = (data: GoodSummaryRow, sortHeaderId: string): string | number => {
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
    if (!this._world || this.rows.size == 0) {
      return;
    }

    const baseTableCells = this.buildBaseTableCells();
    const tradesTable = this.buildTradesTable();

    for (const [sourceIsland, good, targetIslands] of tradesTable) {
      const cell = baseTableCells.get(sourceIsland, good);
      let totalAvailable = this.availableProduction(cell);
      if (totalAvailable <= 0) { continue; }

      const sortedIslands = targetIslands
        .map(id => baseTableCells.get(id, good))
        .filter(c => this.availableProduction(c) < 0)
        .map(c => c!)
        .sort((c1, c2) => this.availableProduction(c1) - this.availableProduction(c2));

      // First, distribute evenly what is available.
      for (let i = 0; i < sortedIslands.length; i++) {
        const targetCell = baseTableCells.get(sortedIslands[i].island.id, good);
        if (!targetCell) { continue; }
        const targetDistribution = totalAvailable / (sortedIslands.length - i);
        const distribution = Math.min(targetDistribution, -this.availableProduction(targetCell));
        targetCell.importedPerMin += distribution;
        cell!.exportedPerMin += distribution;
        totalAvailable -= distribution;
      }
      // If there is any left after distribution, sprinkle the last bit evenly.
      for (let i = 0; i < sortedIslands.length; i++) {
        const targetCell = baseTableCells.get(sortedIslands[i].island.id, good);
        if (!targetCell) { continue; }
        const distribution = totalAvailable / (sortedIslands.length - i);
        targetCell.importedPerMin += distribution;
        cell!.exportedPerMin += distribution;
        totalAvailable -= distribution;
      }
    }
    this.updateTableCells(baseTableCells);
    // Re-applies the filter. No idea why this is needed...
    this.tableData.filter = '-';

    this.table?.renderRows();

    this.changeDetector.markForCheck();
  }

  toggleIslandSummary(row: GoodSummaryRow): void {
    row.showIslandSummary = !row.showIslandSummary;
    row.showIslandSummaryIcon = row.showIslandSummary ? 'arrow_drop_up' : 'arrow_drop_down';
    this.islandTables.get(this.tableData.data.indexOf(row))?.renderRows();
  }

  availableProduction(cell?: GoodSummaryCell): number {
    if (!cell) return 0;
    return cell.localProductionPerMin - cell.localConsumptionPerMin + cell.importedPerMin - cell.exportedPerMin;
  }

  private buildBaseTableCells(): Table<IslandId, Good, GoodSummaryCell> {
    let cells = new Table<IslandId, Good, GoodSummaryCell>();

    const updateStats = (island: IslandView, good: Good, netProductionPerMin: number): void => {
      const tableCell = cells.getOrDefault(island.id, good, () => this.createGoodSummaryCell(island, good));
      if (netProductionPerMin > 0) {
        tableCell.localProductionPerMin += netProductionPerMin;
      } else {
        tableCell.localConsumptionPerMin -= netProductionPerMin;
      }
    };

    for (const island of this._world.islands) {
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
    for (const tr of this._world.tradeRoutes) {
      trades.getOrDefault(tr.sourceIslandId, tr.good, () => []).push(tr.targetIslandId);
    }
    return trades;
  }

  private updateTableCells(cellTable: ReadonlyTable<IslandId, Good, GoodSummaryCell>): void {
    for (const row of this.rows.values()) {
      clearRow(row);
    }
    cellTable.reduceLeft((good, cells) => {
      if (good == Good.Unknown) return;
      const row = this.rows.get(good)!;
      row.islandSummaries = Array.from(cells);
      for (const cell of cells) {
        row.totalProductionPerMin += cell.localProductionPerMin;
        row.netProductionPerMin += this.availableProduction(cell);
      }
    });
  }

  private createBaseGoodSummaryRow(good: Good): GoodSummaryRow {
    return {
      good: good,
      islandSummaries: [],
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

function clearRow(row: GoodSummaryRow): void {
  row.totalProductionPerMin = 0;
  row.netProductionPerMin = 0;
  row.islandSummaries = [];
}