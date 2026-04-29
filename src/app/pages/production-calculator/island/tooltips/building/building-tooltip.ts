import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { Good, ProductionBuilding } from '../../../../../shared/game/enums';
import {
  ProductionInfo,
  lookupProductionInfo,
} from '../../../../../shared/game/facts';
import { CommonModule } from '@angular/common';
import {
  lookupBuildingIconUrl,
  lookupGoodIconUrl,
} from '../../../../../shared/game/icons';

@Component({
  selector: 'building-tooltip',
  templateUrl: './building-tooltip.html',
  styleUrl: './building-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: ProductionBuildingTooltip }],
  imports: [CommonModule],
})
export class ProductionBuildingTooltip extends EnumTooltip<ProductionBuilding> {
  building: ProductionBuilding | null = null;
  productionInfo: ProductionInfo | null = null;

  protected override onValueChange(value: ProductionBuilding): void {
    this.building = value;
    this.productionInfo = lookupProductionInfo(value)!;
  }

  buildingIconUrlLookupFn(
    building: ProductionBuilding | null | undefined,
  ): string {
    return (
      lookupBuildingIconUrl(building ?? ProductionBuilding.Unknown) ||
      ProductionBuilding.Unknown
    );
  }

  goodIconUrlLookupFn(good: Good): string {
    return lookupGoodIconUrl(good);
  }

  get processTimeSeconds(): number {
    return this.productionInfo?.processingTimeSeconds ?? 0;
  }

  get good(): Good {
    return this.productionInfo?.good ?? Good.Unknown;
  }

  get inputGoods(): Good[] {
    return this.productionInfo?.inputGoods ?? [];
  }

  get requiresElectricity(): boolean {
    return this.productionInfo?.requiresElectricity ?? false;
  }
}
