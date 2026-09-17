import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CardModule } from '../../../components/card/card';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  FormatFontSpec,
  FormattedNumber,
  GREEN_RED_FONT_SPEC,
} from '../../../components/formatted-number/formatted-number';
import {
  ExtraGoodView,
  IslandView,
  WorldView,
} from '../../../shared/mvc/views';
import { Boost, Good, Region } from '../../../shared/game/enums';
import { IslandId } from '../../../shared/mvc/models';
import { ReadonlyTable, Table } from '../../../../tools/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { EnumRow } from '../../../components/enum-row/enum-row';
import { lookupGoodIconUrl } from '../../../shared/game/icons';
import { L10nText } from '../../../components/text/text';

interface GoodSummaryCell {
  island: IslandView;
  good: Good;
  localProductionPerMin: number;
  localConsumptionPerMin: number;
  importedPerMin: number;
  exportedPerMin: number;
}

interface GoodSummaryRow {
  good: Good;
  totalProductionPerMin: number;
  netProductionPerMin: number;
  islandSummaries: GoodSummaryCell[];
  showIslandSummary: boolean;
  showIslandSummaryIcon: string;
  hasIssue?: boolean;
}

type UpdateStatFn = (
  island: IslandView,
  good: Good,
  netProductionPerMin: number,
) => void;

@Component({
  selector: 'summary-panel',
  imports: [
    CardModule,
    FormattedNumber,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    EnumRow,
    L10nText,
  ],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPanel implements OnInit, AfterViewInit {
  readonly colorSpec = GREEN_RED_FONT_SPEC;
  readonly warningColorSpec: FormatFontSpec = {
    default: {
      color: '#FFD700',
      weight: 'bold',
      style: `text-shadow: 0 0 4px  rgba(255, 255, 255, 1.0),
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 16px rgba(255, 255, 255, 0.6);`,
    },
  };

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

  private readonly changeDetector_ = inject(ChangeDetectorRef);

  readonly tableData = new MatTableDataSource<GoodSummaryRow>();
  private readonly rows_ = new Map<Good, GoodSummaryRow>();

  world = input<WorldView>();
  table = viewChild.required(MatTable<GoodSummaryRow>);
  sort = viewChild.required(MatSort);
  islandTables = viewChildren(MatTable<GoodSummaryCell>);

  constructor() {
    effect(() => {
      this.update();
    });
  }

  ngOnInit(): void {
    for (const good of Object.values(Good)) {
      if (good == Good.Unknown) continue;
      this.rows_.set(good, this.createBaseGoodSummaryRow_(good));
    }
    this.update();
    this.tableData.filterPredicate = (
      data: GoodSummaryRow,
      _: string,
    ): boolean => {
      return data.islandSummaries.length > 0;
    };
    this.tableData.data = Array.from(this.rows_.values());
  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort();
    this.tableData.sortingDataAccessor = (
      data: GoodSummaryRow,
      sortHeaderId: string,
    ): string | number => {
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
    if (!this.world() || this.rows_.size == 0) {
      return;
    }

    const baseTableCells = this.buildBaseTableCells_();
    const tradesTable = this.buildTradesTable_();

    for (const [sourceIsland, good, targetIslands] of tradesTable) {
      const cell = baseTableCells.get(sourceIsland, good);
      let totalAvailable = this.availableProduction(cell);
      if (totalAvailable <= 0) {
        continue;
      }

      const sortedIslands = targetIslands
        .map((id) => baseTableCells.get(id, good))
        .filter((c) => this.availableProduction(c) < 0)
        .map((c) => c!)
        .sort(
          (c1, c2) =>
            this.availableProduction(c1) - this.availableProduction(c2),
        );

      // First, distribute evenly what is available.
      for (let i = 0; i < sortedIslands.length; i++) {
        const targetCell = baseTableCells.get(sortedIslands[i].island.id, good);
        if (!targetCell) {
          continue;
        }
        const targetDistribution = totalAvailable / (sortedIslands.length - i);
        const distribution = Math.min(
          targetDistribution,
          -this.availableProduction(targetCell),
        );
        targetCell.importedPerMin += distribution;
        cell!.exportedPerMin += distribution;
        totalAvailable -= distribution;
      }
      // If there is any left after distribution, sprinkle the last bit evenly.
      for (let i = 0; i < sortedIslands.length; i++) {
        const targetCell = baseTableCells.get(sortedIslands[i].island.id, good);
        if (!targetCell) {
          continue;
        }
        const distribution = totalAvailable / (sortedIslands.length - i);
        targetCell.importedPerMin += distribution;
        cell!.exportedPerMin += distribution;
        totalAvailable -= distribution;
      }
    }
    this.updateTableCells_(baseTableCells);
    // Re-applies the filter. No idea why this is needed...
    this.tableData.filter = '-';

    this.table()?.renderRows();

    this.changeDetector_.markForCheck();
  }

  toggleIslandSummary(row: GoodSummaryRow): void {
    row.showIslandSummary = !row.showIslandSummary;
    row.showIslandSummaryIcon = row.showIslandSummary
      ? 'arrow_drop_up'
      : 'arrow_drop_down';
    this.islandTables()[this.tableData.data.indexOf(row)]?.renderRows();
  }

  availableProduction(cell?: GoodSummaryCell): number {
    if (!cell) return 0;
    return (
      cell.localProductionPerMin -
      cell.localConsumptionPerMin +
      cell.importedPerMin -
      cell.exportedPerMin
    );
  }

  lookupGoodIconUrl(good: Good | null | undefined): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  private createUpdateStatsFn_(
    cells: Table<IslandId, Good, GoodSummaryCell>,
  ): UpdateStatFn {
    return (
      island: IslandView,
      good: Good,
      netProductionPerMin: number,
    ): void => {
      const tableCell = cells.getOrDefault(island.id, good, () =>
        this.createGoodSummaryCell_(island, good),
      );
      if (netProductionPerMin > 0) {
        tableCell.localProductionPerMin += netProductionPerMin;
      } else {
        tableCell.localConsumptionPerMin -= netProductionPerMin;
      }
    };
  }

  private updateIslandStats_(
    island: IslandView,
    updateStats: UpdateStatFn,
  ): void {
    for (const pl of island.productionLines) {
      updateStats(island, pl.good, pl.goodsProducedPerMinute);
      for (const eg of pl.extraGoods) {
        const egView = ExtraGoodView.wrap(eg, { productionLine: pl });
        updateStats(island, egView.good, egView.producedPerMinute);
      }
      for (const ig of pl.inputGoods) {
        updateStats(island, ig, -pl.goodsConsumedPerMinute);
      }
      if (pl.boosts.includes(Boost.Silo)) {
        updateStats(
          island,
          island.region == Region.NewWorld ? Good.Corn : Good.Grain,
          -0.2 * pl.numBuildings,
        );
      }
      if (pl.boosts.includes(Boost.Fertiliser)) {
        updateStats(island, Good.Fertiliser, -0.2 * pl.numBuildings);
      }
    }
  }

  private buildBaseTableCells_(): Table<IslandId, Good, GoodSummaryCell> {
    let cells = new Table<IslandId, Good, GoodSummaryCell>();
    const updateStats = this.createUpdateStatsFn_(cells);

    for (const island of this.world()!.islands) {
      this.updateIslandStats_(island, updateStats);
    }
    return cells;
  }

  private buildTradesTable_(): ReadonlyTable<IslandId, Good, IslandId[]> {
    const trades = new Table<IslandId, Good, IslandId[]>();
    for (const tr of this.world()!.tradeRoutes) {
      trades
        .getOrDefault(tr.sourceIslandId, tr.good, () => [])
        .push(tr.targetIslandId);
    }
    return trades;
  }

  private updateTableCells_(
    cellTable: ReadonlyTable<IslandId, Good, GoodSummaryCell>,
  ): void {
    for (const row of this.rows_.values()) {
      clearRow(row);
    }
    cellTable.reduceLeft((good, cells) => {
      if (good == Good.Unknown) return;
      const row = this.rows_.get(good)!;
      row.hasIssue = false;
      row.islandSummaries = Array.from(cells);
      let hasDefecitOnIsland = false;
      for (const cell of cells) {
        row.totalProductionPerMin += cell.localProductionPerMin;

        const availableProduction = this.availableProduction(cell);
        row.netProductionPerMin += availableProduction;
        if (availableProduction < 0) {
          hasDefecitOnIsland = true;
        }
      }
      // Call out missing trade route.
      if (row.netProductionPerMin >= 0 && hasDefecitOnIsland) {
        row.hasIssue = true;
      }
    });
  }

  private createBaseGoodSummaryRow_(good: Good): GoodSummaryRow {
    return {
      good: good,
      islandSummaries: [],
      totalProductionPerMin: 0,
      netProductionPerMin: 0,
      showIslandSummary: false,
      showIslandSummaryIcon: 'arrow_drop_down',
    };
  }

  private createGoodSummaryCell_(
    island: IslandView,
    good: Good,
  ): GoodSummaryCell {
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
