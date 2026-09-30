import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
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
import { Good } from '../../../shared/game/enums';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { EnumRow } from '../../../components/enum-row/enum-row';
import { lookupGoodIconUrl } from '../../../shared/game/icons';
import { L10nText } from '../../../components/text/text';
import {
  availableProduction as computeAvailableProduction,
  computeGoodSummaryRows,
  GoodSummaryCell,
  GoodSummaryRow,
  SummaryWorldSource,
} from './summary-panel-store';

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

  world = input<SummaryWorldSource>();
  table = viewChild.required(MatTable<GoodSummaryRow>);
  sort = viewChild.required(MatSort);
  islandTables = viewChildren(MatTable<GoodSummaryCell>);

  // world() reads WorldStore's signals, so rows_ recomputes on its own
  // whenever anything it depends on changes -- no external "please
  // recompute" call needed.
  private readonly rows_ = computed(() => {
    const world = this.world();
    return world ? computeGoodSummaryRows(world) : new Map<Good, GoodSummaryRow>();
  });

  constructor() {
    effect(() => this.applyRows_(this.rows_()));
  }

  ngOnInit(): void {
    this.tableData.filterPredicate = (
      data: GoodSummaryRow,
      _: string,
    ): boolean => {
      return data.islandSummaries.length > 0;
    };
    // MatTableDataSource only runs filterPredicate at all when `filter` is a
    // non-empty string -- an empty filter short-circuits to "show everything"
    // regardless of filterPredicate. This app has no user-facing filter box,
    // so the value itself is unused; it only needs to be non-empty to switch
    // filtering on.
    this.tableData.filter = 'show-goods-with-production-or-deficit';
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

  /** Replaces the table's data with a freshly computed row set, carrying forward which rows the user currently has expanded (computeGoodSummaryRows doesn't know about that -- it's UI state, not derived from the world). */
  private applyRows_(rows: Map<Good, GoodSummaryRow>): void {
    const expandedGoods = new Set(
      this.tableData.data.filter((r) => r.showIslandSummary).map((r) => r.good),
    );
    this.tableData.data = Array.from(rows.values()).map((row) => ({
      ...row,
      showIslandSummary: expandedGoods.has(row.good),
      showIslandSummaryIcon: expandedGoods.has(row.good)
        ? 'arrow_drop_up'
        : 'arrow_drop_down',
    }));
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

  lookupGoodIconUrl(good: Good | null | undefined): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  availableProduction(cell?: GoodSummaryCell): number {
    return computeAvailableProduction(cell);
  }
}
