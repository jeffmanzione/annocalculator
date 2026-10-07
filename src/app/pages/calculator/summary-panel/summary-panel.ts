import { isMobileWidth } from '../../../shared/mobile';
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
  FormattedNumber,
  GREEN_RED_FONT_SPEC,
} from '../../../components/formatted-number/formatted-number';
import { GAME, GoodId } from '../../../games/game';
import { L10nService } from '../../../services/l10n/l10n';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { EnumRow } from '../../../components/enum-row/enum-row';
import { L10nText } from '../../../components/text/text';
import {
  availableProduction as computeAvailableProduction,
  computeGoodSummaryRows,
  GoodSummaryCell,
  GoodSummaryRow,
  SummaryWorldSource,
} from './summary-panel-store';
import { SummaryWarning } from './summary-warning';

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
    SummaryWarning,
  ],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPanel implements OnInit, AfterViewInit {
  readonly colorSpec = GREEN_RED_FONT_SPEC;
  protected readonly outerColumns = [
    'good',
    'show-islands',
    'total-production-per-min',
    'net-production-per-min',
  ];

  protected readonly innerColumns = [
    'island',
    'local-production-per-min',
    'local-consumption-per-min',
    'imported-per-min',
    'exported-per-min',
    'net-per-min',
  ];

  private readonly changeDetector_ = inject(ChangeDetectorRef);
  private readonly game_ = inject(GAME);
  private readonly l10n_ = inject(L10nService);

  protected readonly tableData = new MatTableDataSource<GoodSummaryRow>();

  world = input<SummaryWorldSource>();
  table = viewChild.required(MatTable<GoodSummaryRow>);
  sort = viewChild.required(MatSort);
  private readonly islandTables_ = viewChildren(MatTable<GoodSummaryCell>);

  // world() reads WorldStore's signals, so rows_ recomputes on its own
  // whenever anything it depends on changes -- no external "please
  // recompute" call needed.
  private readonly rows_ = computed(() => {
    const world = this.world();
    return world
      ? computeGoodSummaryRows(world, this.game_)
      : new Map<GoodId, GoodSummaryRow>();
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
          return this.goodName(data.good).toLocaleLowerCase();
        case 'total-production-per-min':
          return data.totalProductionPerMin;
        case 'net-production-per-min':
          return data.netProductionPerMin;
      }
      return 0;
    };
  }

  /** Replaces the table's data with a freshly computed row set, carrying forward which rows the user currently has expanded (computeGoodSummaryRows doesn't know about that -- it's UI state, not derived from the world). */
  private applyRows_(rows: Map<GoodId, GoodSummaryRow>): void {
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

  /**
   * On a phone a tap anywhere on a good's row shows or hides its islands (the small arrow is hard to hit). The arrow
   * and the warning keep doing their own thing. A desktop window has only the arrow.
   */
  protected onRowClick(row: GoodSummaryRow, event: Event): void {
    if (!isMobileWidth()) {
      return;
    }
    if ((event.target as HTMLElement).closest('button, summary-warning')) {
      return;
    }
    this.toggleIslandSummary(row);
  }

  protected toggleIslandSummary(row: GoodSummaryRow): void {
    row.showIslandSummary = !row.showIslandSummary;
    row.showIslandSummaryIcon = row.showIslandSummary
      ? 'arrow_drop_up'
      : 'arrow_drop_down';
    this.islandTables_()[this.tableData.data.indexOf(row)]?.renderRows();
  }

  readonly lookupGoodIconUrl = (good: GoodId | null | undefined): string =>
    this.game_.goodIconUrl(good);

  /** The good's name in the current language (read from the language signal, so the table follows a change of language). */
  readonly goodName = (good: GoodId | null | undefined): string =>
    this.game_.goodName(good, this.l10n_.languageSignal());

  availableProduction(cell?: GoodSummaryCell): number {
    return computeAvailableProduction(cell);
  }
}
