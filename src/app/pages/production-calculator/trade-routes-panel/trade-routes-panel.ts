import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorldController } from '../../../shared/mvc/controllers';
import { MatTableModule } from '@angular/material/table';
import { ControlComponent } from '../../../shared/control/control';
import { MatSelectModule } from '@angular/material/select';
import { Good } from '../../../shared/game/enums';
import { lookupGoodIconUrl } from '../../../shared/game/icons';
import { EnumSelect } from '../../../components/enum-select/enum-select';
import { CardModule } from '../../../components/card/card';
import { TradeRoute, TradeRouteId } from '../../../shared/mvc/models';
import { AcButton } from '../../../components/button/button';
import { L10nText } from '../../../components/text/text';
import { IslandSummary, TradeRoutesStore } from './trade-routes-store';
import { StoreWorldView } from '../../../shared/mvc/world-store-views';

/** A single trade-route table row: a stable form bound to one trade route, plus its currently-valid dropdown options. */
interface TradeRouteRow {
  id: TradeRouteId;
  formGroup: FormGroup<{
    sourceIslandId: FormControl<number | null>;
    targetIslandId: FormControl<number | null>;
    good: FormControl<Good | null>;
  }>;
  sourceIslandOptions: IslandSummary[];
  targetIslandOptions: IslandSummary[];
  sourceGoodOptions: Good[];
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
export class TradeRoutesPanel extends ControlComponent<WorldController> {
  readonly displayColumns = [
    'sourceIslandId',
    'targetIslandId',
    'good',
    'remove',
  ];

  private readonly store_ = new TradeRoutesStore();

  // A normalized, read-only mirror of the whole world, rebuilt by the root
  // component on every change (see production-calculator.ts's
  // refreshWorldSummary_()) -- this is what refreshIslandSummaries_() below
  // reads from now, instead of reconstructing IslandSummary objects from
  // `this.controller().islands` itself. Trade routes themselves still go
  // through `controller` (WorldController remains their source of truth;
  // see the design doc's "World-level normalization" section for why).
  world = input<StoreWorldView>();

  // Form groups are kept stable across store updates (rather than recreated
  // on every change) so in-progress edits and open dropdowns aren't reset by
  // an unrelated change elsewhere, e.g. renaming an island.
  private readonly formGroups_ = new Map<
    TradeRouteId,
    TradeRouteRow['formGroup']
  >();

  readonly rows: Signal<TradeRouteRow[]> = computed(() =>
    this.store_.tradeRoutes().map((tr) => this.rowFor_(tr)),
  );

  protected override onSetController(controller: WorldController): void {
    this.store_.loadTradeRoutes(controller.tradeRoutes);
    this.refreshIslandSummaries_();
  }

  // The root component calls this on every world-wide change (an island
  // rename, an island add/remove, another trade route's edit, ...) via
  // production-calculator.ts's update(). Re-reading island summaries here,
  // rather than only when this panel's own rows change, is what keeps the
  // origin/destination/good dropdowns correct after an edit made elsewhere
  // -- fixes a bug where they'd otherwise go stale until this panel's own
  // state next changed.
  override afterPushChange(): void {
    this.refreshIslandSummaries_();
  }

  addTradeRoute(): void {
    const added = this.controller().addTradeRoute();
    this.store_.addTradeRoute({
      id: added.id,
      sourceIslandId: added.sourceIslandId,
      targetIslandId: added.targetIslandId,
      good: added.good,
    });
    this.refreshIslandSummaries_();
    this.pushUpChange();
  }

  removeTradeRouteAt(id: TradeRouteId): void {
    this.controller().removeTradeRoute(id);
    this.store_.removeTradeRoute(id);
    this.formGroups_.delete(id);
    this.refreshIslandSummaries_();
    this.pushUpChange();
  }

  lookupGoodIconUrl(good: Good | null): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  /** Re-derives the island name/produced-goods summary the dropdowns read from. Islands live outside this store, so this is a manual refresh rather than a subscription -- see the store's doc comment. */
  private refreshIslandSummaries_(): void {
    const world = this.world();
    if (!world) {
      return;
    }
    this.store_.loadIslands(
      world.islands.map(
        (island): IslandSummary => ({
          id: island.id,
          name: island.name,
          producedGoods: island.producedGoods,
        }),
      ),
    );
  }

  private rowFor_(tradeRoute: TradeRoute): TradeRouteRow {
    return {
      id: tradeRoute.id,
      formGroup: this.formGroupFor_(tradeRoute),
      sourceIslandOptions: this.store_.originOptions(tradeRoute.id),
      targetIslandOptions: this.store_.destinationOptions(tradeRoute.id),
      sourceGoodOptions: this.store_.goodOptions(tradeRoute.id),
    };
  }

  private formGroupFor_(tradeRoute: TradeRoute): TradeRouteRow['formGroup'] {
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
      good: Good | null;
    }>,
  ): void {
    const controller = this.controller().tradeRoutes.find((tr) => tr.id === id);
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
    this.store_.updateTradeRoute(id, {
      sourceIslandId: controller.sourceIslandId,
      targetIslandId: controller.targetIslandId,
      good: controller.good,
    });
    this.refreshIslandSummaries_();
    this.pushUpChange();
  }
}
