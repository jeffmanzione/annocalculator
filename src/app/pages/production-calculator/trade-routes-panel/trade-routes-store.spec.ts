import { Good } from '../../../shared/game/enums';
import { TradeRoute } from '../../../shared/mvc/models';
import {
  destinationOptions,
  goodOptions,
  IslandSummary,
  originOptions,
} from './trade-routes-store';

const islands: IslandSummary[] = [
  { id: 1, name: 'Crown Falls', producedGoods: [Good.Bread, Good.Beer] },
  { id: 2, name: 'Farm Island', producedGoods: [Good.Grain, Good.Hops] },
  { id: 3, name: 'Plantation Island', producedGoods: [] },
];

const route = (sourceIslandId: number, targetIslandId: number): TradeRoute => ({
  id: 100,
  sourceIslandId,
  targetIslandId,
  good: Good.Grain,
});

const names = (options: IslandSummary[]) => options.map((i) => i.name);

describe('trade-route dropdown options', () => {
  it('offers every island except the destination as an origin', () => {
    expect(names(originOptions(route(2, 1), islands))).toEqual([
      'Farm Island',
      'Plantation Island',
    ]);
  });

  it('offers every island except the origin as a destination', () => {
    expect(names(destinationOptions(route(2, 1), islands))).toEqual([
      'Crown Falls',
      'Plantation Island',
    ]);
  });

  it('offers only the goods the origin island produces', () => {
    expect(goodOptions(route(2, 1), islands)).toEqual([Good.Grain, Good.Hops]);
    expect(goodOptions(route(3, 1), islands)).toEqual([]);
  });

  it('handles a new route whose islands are still unassigned', () => {
    // A freshly added route uses the -1 "unassigned" sentinel for both ends
    // (BASE_TRADE_ROUTE_MODEL): every island is selectable, but there are no
    // goods until an origin is picked.
    const unassigned = route(-1, -1);
    expect(originOptions(unassigned, islands)).toHaveLength(3);
    expect(destinationOptions(unassigned, islands)).toHaveLength(3);
    expect(goodOptions(unassigned, islands)).toEqual([]);
  });
});
