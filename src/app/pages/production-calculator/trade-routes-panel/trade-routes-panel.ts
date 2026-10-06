import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { GAME, GoodId } from '../../../games/game';
import { EnumSelect } from '../../../components/enum-select/enum-select';
import { CardModule } from '../../../components/card/card';
import { TradeRouteId } from '../../../shared/mvc/models';
import { AcButton } from '../../../components/button/button';
import { L10nText } from '../../../components/text/text';
import {
  destinationOptions,
  goodOptions,
  IslandSummary,
  originOptions,
  TradeRouteEditor,
  TradeRoutesWorld,
} from './trade-routes-store';

/** A single trade-route table row: a stable form bound to one trade route, plus its currently-valid dropdown options. */
interface TradeRouteRow {
  id: TradeRouteId;
  formGroup: FormGroup<{
    sourceIslandId: FormControl<number | null>;
    targetIslandId: FormControl<number | null>;
    good: FormControl<GoodId | null>;
  }>;
  sourceIslandOptions: IslandSummary[];
  targetIslandOptions: IslandSummary[];
  sourceGoodOptions: GoodId[];
}

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
    L10nText,
  ],
  templateUrl: './trade-routes-panel.html',
  styleUrl: './trade-routes-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeRoutesPanel {
  readonly displayColumns = [
    'sourceIslandId',
    'targetIslandId',
    'good',
    'remove',
  ];

  // The root's store-backed world. Every read below goes through
  // WorldStore's signals, so rows() recomputes on its own whenever a trade
  // route or an island (name, production lines) changes anywhere -- no
  // mirror to refresh, and no "something changed elsewhere" hook needed
  // from the root. (This panel used to extend ControlComponent and keep a
  // TradeRoutesStore mirror of trade routes and islands that the root had
  // to refresh via afterPushChange(); see the design doc.)
  world = input.required<TradeRoutesWorld>();

  private readonly game_ = inject(GAME);

  // Form groups are kept stable across store updates (rather than recreated
  // on every change) so in-progress edits and open dropdowns aren't reset by
  // an unrelated change elsewhere, e.g. renaming an island.
  private readonly formGroups_ = new Map<
    TradeRouteId,
    TradeRouteRow['formGroup']
  >();

  private readonly islandSummaries_: Signal<IslandSummary[]> = computed(() =>
    this.world().islands.map(
      (island): IslandSummary => ({
        id: island.id,
        name: island.name,
        producedGoods: island.producedGoods,
      }),
    ),
  );

  readonly rows: Signal<TradeRouteRow[]> = computed(() => {
    const islands = this.islandSummaries_();
    return this.world().tradeRoutes.map((tr) => this.rowFor_(tr, islands));
  });

  // Keeps each row's DOM (and so any open dropdown) in place when rows()
  // produces fresh row objects for the same trade routes.
  readonly trackRowById = (_: number, row: TradeRouteRow) => row.id;

  addTradeRoute(): void {
    this.world().addTradeRoute();
  }

  removeTradeRouteAt(id: TradeRouteId): void {
    this.world().removeTradeRoute(id);
    this.formGroups_.delete(id);
  }

  readonly lookupGoodIconUrl = (good: GoodId | null): string => this.game_.goodIconUrl(good);

  private rowFor_(
    tradeRoute: TradeRouteEditor,
    islands: IslandSummary[],
  ): TradeRouteRow {
    return {
      id: tradeRoute.id,
      formGroup: this.formGroupFor_(tradeRoute),
      sourceIslandOptions: originOptions(tradeRoute, islands),
      targetIslandOptions: destinationOptions(tradeRoute, islands),
      sourceGoodOptions: goodOptions(tradeRoute, islands),
    };
  }

  private formGroupFor_(tradeRoute: TradeRouteEditor): TradeRouteRow['formGroup'] {
    const existing = this.formGroups_.get(tradeRoute.id);
    if (existing) {
      return existing;
    }
    const formGroup = new FormGroup({
      sourceIslandId: new FormControl(tradeRoute.sourceIslandId),
      targetIslandId: new FormControl(tradeRoute.targetIslandId),
      good: new FormControl(tradeRoute.good),
    });
    formGroup.valueChanges.subscribe((value) =>
      this.onRowEdited_(tradeRoute.id, value),
    );
    this.formGroups_.set(tradeRoute.id, formGroup);
    return formGroup;
  }

  private onRowEdited_(
    id: TradeRouteId,
    value: Partial<{
      sourceIslandId: number | null;
      targetIslandId: number | null;
      good: GoodId | null;
    }>,
  ): void {
    const controller = this.world().tradeRoutes.find((tr) => tr.id === id);
    if (!controller) {
      return;
    }
    if (value.sourceIslandId != null) {
      controller.sourceIslandId = value.sourceIslandId;
    }
    if (value.targetIslandId != null) {
      controller.targetIslandId = value.targetIslandId;
    }
    if (value.good != null) {
      controller.good = value.good;
    }
  }
}
