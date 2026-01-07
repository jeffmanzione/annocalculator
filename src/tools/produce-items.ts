import * as fs from 'node:fs';
import { Rarity, AdministrativeBuilding, ProductionBuilding, Good, Item } from '../app/shared/game/enums';
import { ItemInfo } from '../app/shared/game/facts';

// --- Helper to map strings to Enum values ---
function getEnumValue<T>(enumObj: T, value: string): T[keyof T] | undefined {
  const entries = Object.entries(enumObj as object);
  const match = entries.find(([_, val]) => val === value);
  return match ? (match[1] as T[keyof T]) : undefined;
}

const allocationToAdminBuilding = new Map<string, AdministrativeBuilding>(
  [
    ['guildhouseitem', AdministrativeBuilding.TradeUnion],
    ['harborofficeitem', AdministrativeBuilding.HarbourmastersOffice],
    ['lodgeitem', AdministrativeBuilding.ArcticLodge],
  ]
);

const allocationToAdminBuildingName = new Map<string, string>([
  ['guildhouseitem', 'Trade Union'],
  ['harborofficeitem', "Harbourmaster's Office"],
  ['lodgeitem', 'ArcticLodge'],
]);

const typeToAdminBuilding = (type: string): AdministrativeBuilding => {
  return allocationToAdminBuilding.get(type) || AdministrativeBuilding.Unknown;
}

/**
 * Main function to transform the raw JSON data
 */
export function transformTradeUnionItems(rawData: any[]): ItemInfo[] {
  return rawData.map((raw) => {
    const item: ItemInfo = {
      item: getEnumValue(Item, raw.name) || getEnumValue(Item, `${raw.name} (${allocationToAdminBuildingName.get(raw.type)})`)!,

      iconUrl: `https://anno-toolkit.jansepke.de/${raw.icon}`,
      // Map rarity: "common" (JSON) -> Rarity.Common (Enum)
      rarity: getEnumValue(Rarity, raw.rarityLabel) || Rarity.Unknown,

      administrativeBuilding: typeToAdminBuilding(raw.type),

      // Map effect targets to ProductionBuilding enum
      targets: Array.from(new Set<ProductionBuilding>(raw.effectTargets
        .map((t: any) => getEnumValue(ProductionBuilding, t.label))
        .filter((t: any) => t !== undefined))),

      extraGoods: [],
      replacementGoods: [],
      productivityEffect: 0,
      providesElectricity: false,
    };

    // Process Upgrades array
    if (raw.upgrades) {
      raw.upgrades.forEach((upgrade: any) => {
        switch (upgrade.key) {
          case 'ProductivityUpgrade':
            item.productivityEffect = upgrade.value.Value;
            break;

          case 'ReplaceInputs':
            upgrade.value.Item.forEach((replacement: any) => {
              const fromGood = getEnumValue(Good, replacement.OldInput_label);
              const toGood = getEnumValue(Good, replacement.NewInput_label);
              if (fromGood && toGood) {
                item.replacementGoods?.push({ from: fromGood, to: toGood });
              }
            });
            break;

          case 'AdditionalOutput':
            upgrade.value.Item.forEach((output: any) => {
              const good = getEnumValue(Good, output.Product_label);
              if (good) {
                item.extraGoods?.push({
                  good: good,
                  rateNumerator: output.Amount,
                  rateDenominator: output.AdditionalOutputCycle,
                });
              }
            });
            break;

          case 'ProvideIndustrialization':
            // Some items (like Magnetar) provide electricity
            item.providesElectricity = true;
            break;

          case 'InputAmountUpgrade':
            // If Amount is -1 (100% reduction), it's essentially a replacement/removal
            // Handle logic for removed inputs if your interface expands
            break;
        }
      });
    }

    // Clean up optional arrays if they are empty
    if (item.extraGoods?.length === 0) delete item.extraGoods;
    if (item.replacementGoods?.length === 0) delete item.replacementGoods;

    return item;
  });
}

// --- Execution ---
import * as tradeUnionItems from './tradeunionitem.json';
import * as harbourmasterItems from './harbourmasteritem.json';
import * as arcticLodgeItems from './arcticlodgeitem.json';

const allItems = [
  ...tradeUnionItems,
  ...harbourmasterItems,
  ...arcticLodgeItems,
];

const items: ItemInfo[] = transformTradeUnionItems(allItems);

fs.writeFile('./tmp.json', JSON.stringify(items, null, 2), (err: any) => {
  if (err) {
    return console.error(err);
  }
  console.log('File created!');
});
