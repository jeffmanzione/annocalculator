import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { Good, Item, Rarity } from '../../../../../shared/game/enums';
import { ItemInfo, lookupItemInfo } from '../../../../../shared/game/facts';
import { CommonModule } from '@angular/common';
import { lookupGoodIconUrl } from '../../../../../shared/game/icons';
import { L10nText } from '../../../../../components/text/text';
import { L10nKey } from '../../../../../shared/l10n/l10n';

@Component({
  selector: 'item-tooltip',
  templateUrl: './item-tooltip.html',
  styleUrl: './item-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: ItemTooltip }],
  imports: [CommonModule, L10nText],
})
export class ItemTooltip extends EnumTooltip<Item> {
  itemInfo: ItemInfo | null = null;

  protected override onValueChange(value: Item): void {
    this.itemInfo = lookupItemInfo(value)!;
  }

  get backgroundClass(): string {
    return `background-${this.itemInfo?.rarity ?? Rarity.Unknown}`;
  }

  get administrativeBuilding(): L10nKey {
    return this.itemInfo!.administrativeBuilding as L10nKey;
  }

  get itemRarity(): L10nKey {
    return this.itemInfo!.rarity as L10nKey;
  }

  iconItemUrlLookupFn(_: Item | null): string {
    return this.itemInfo!.iconUrl;
  }

  iconGoodUrlLookupFn(good: Good | null | undefined): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }

  goodToLoc(good: Good | undefined): L10nKey {
    return (good ?? 'Extra Goods') as L10nKey;
  }
}
