import * as fs from 'node:fs';
import * as tradeUnionItems from './tradeunionitem.json';
import * as harbourmasterItems from './harbourmasteritem.json';
import * as arcticLodgeItems from './arcticlodgeitem.json';

const allItems = [
  ...tradeUnionItems,
  ...harbourmasterItems,
  ...arcticLodgeItems,
];

const EXPECTED_DUPLICATE_ENUM_NAMES = new Set<string>(['Carpenter']);

const allocationToAdminBuildingName = new Map<string, string>([
  ['guildhouseitem', 'Trade Union'],
  ['harborofficeitem', "Harbourmaster's Office"],
  ['lodgeitem', 'ArcticLodge'],
]);

const allocationToAdminBuildingSuffix = new Map<string, string>([
  ['guildhouseitem', '_TradeUnion'],
  ['harborofficeitem', '_HarbourmastersOffice'],
  ['lodgeitem', '_ArcticLodge'],
]);

const convertNameToEnum = (name: string): string => {
  return name
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[\s_\-,'":.?!#]+/g, '');
};

let itemEnumTextParts = [
  'export enum Item {',
  '  Unknown = "Unknown",',
];

for (const itemObj of allItems) {
  const name = itemObj.name;
  const escapedName = name.replaceAll('\n', '').replaceAll('"', String.raw`\"`);
  const enumName = convertNameToEnum(name);
  if (EXPECTED_DUPLICATE_ENUM_NAMES.has(enumName)) {
    itemEnumTextParts.push(
      `  enumName${allocationToAdminBuildingSuffix.get(itemObj.type)} = "${escapedName} (${allocationToAdminBuildingName.get(itemObj.type)})",`,
    );
  } else {
    itemEnumTextParts.push(`  ${enumName} = "${escapedName}",`);
  }
}
itemEnumTextParts.push('}');

fs.writeFile('./tmp.ts', itemEnumTextParts.join('\n'), (err: any) => {
  if (err) {
    return console.error(err);
  }
  console.log('File created!');
});
