import { GameDefinition } from '../game';
import {
  SummaryIslandSource,
  SummaryProductionLineSource,
} from '../../pages/production-calculator/summary-panel/summary-panel-store';
import { Boost, Good, Region } from './game/enums';
import { lookupGoodIconUrl } from './game/icons';

/** Anno 1800's Silo and Fertilizer boosts use 0.2 of a good per building per minute. */
const BOOST_UPKEEP_PER_BUILDING = 0.2;

/** The summary's view of a line, plus what the Anno 1800 upkeep rule reads. */
interface Anno1800Line extends SummaryProductionLineSource {
  boosts: Boost[];
}

interface Anno1800Island extends SummaryIslandSource {
  region: Region;
}

export const anno1800Game: GameDefinition = {
  id: 'anno1800',

  goods: Object.values(Good).filter((good) => good !== Good.Unknown),

  goodIconUrl: (good) =>
    lookupGoodIconUrl((good as Good | null | undefined) ?? Good.Unknown),

  extraConsumption(line: Anno1800Line, island: Anno1800Island) {
    const upkeep: { good: Good; perMinute: number }[] = [];
    // Silo and Fertiliser upkeep: these boosts consume a good on their own, independent of what the
    // building's production line otherwise inputs.
    if (line.boosts.includes(Boost.Silo)) {
      upkeep.push({
        good: island.region == Region.NewWorld ? Good.Corn : Good.Grain,
        perMinute: BOOST_UPKEEP_PER_BUILDING * line.numBuildings,
      });
    }
    if (line.boosts.includes(Boost.Fertiliser)) {
      upkeep.push({
        good: Good.Fertiliser,
        perMinute: BOOST_UPKEEP_PER_BUILDING * line.numBuildings,
      });
    }
    return upkeep;
  },
};
