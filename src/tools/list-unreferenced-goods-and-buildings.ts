import { ProductionBuilding, Good } from '../app/games/anno1800/game/enums';
import { lookupProductionInfo, buildingInfo } from '../app/games/anno1800/game/facts';

console.log('All buildings without a production chain:');
for (const building of Object.values(ProductionBuilding)) {
  if (!lookupProductionInfo(building)) {
    console.log(`  ${building}`);
  }
}

console.log('All goods without a production chain:');
const usedGoods = new Set<Good>(buildingInfo.map((info) => info.good));
for (const good of Object.values(Good)) {
  if (!usedGoods.has(good)) {
    console.log(`  ${good}`);
  }
}
