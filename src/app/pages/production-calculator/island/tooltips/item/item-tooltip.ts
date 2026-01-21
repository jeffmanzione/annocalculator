import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { Good, Item, Rarity } from '../../../../../shared/game/enums';
import { ItemInfo, lookupItemInfo } from '../../../../../shared/game/facts';
import { CommonModule } from '@angular/common';
import { lookupGoodIconUrl } from '../../../../../shared/game/icons';

@Component({
  selector: 'item-tooltip',
  templateUrl: './item-tooltip.html',
  styleUrl: './item-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: ItemTooltip }],
  imports: [CommonModule],
})
export class ItemTooltip extends EnumTooltip<Item> {
  item: Item | null = null;
  itemInfo: ItemInfo | null = null;
  $: any;

  protected override onValueChange(value: Item): void {
    this.item = value;
    this.itemInfo = lookupItemInfo(value)!;
  }

  get backgroundClass(): string {
    return `background-${this.itemInfo?.rarity ?? Rarity.Unknown}`;
  }

  iconItemUrlLookupFn(_: Item | null): string {
    return this.itemInfo!.iconUrl;
  }

  iconGoodUrlLookupFn(good: Good | null): string {
    return lookupGoodIconUrl(good ?? Good.Unknown);
  }
}
