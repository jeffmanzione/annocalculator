import {
  BaseWorldStore,
  flattenWorld,
  nestWorld,
  StoredIsland,
  StoredLine,
  TradeRouteShape,
} from './base-world-store';

interface TestIsland {
  id?: number;
  name: string;
  productionLines: TestLine[];
}
interface TestLine {
  id?: number;
  building: string;
  count: number;
  derived?: string;
}

class TestStore extends BaseWorldStore<TestIsland, TestLine, TradeRouteShape> {
  constructor(islands: TestIsland[] = [], routes: TradeRouteShape[] = []) {
    const flat = flattenWorld<TestIsland, TestLine, TradeRouteShape>(
      islands,
      routes,
    );
    super(flat.islands, flat.productionLines, flat.tradeRoutes);
  }
  protected newIsland() {
    return { name: 'New' };
  }
  protected newProductionLine(): TestLine {
    return { building: '', count: 1 };
  }
  protected newTradeRoute() {
    return { sourceIslandId: -1, targetIslandId: -1, good: '' };
  }
  protected override onProductionLineUpdated(
    updated: StoredLine<TestLine>,
    patch: Partial<TestLine>,
  ) {
    return 'building' in patch
      ? { ...updated, derived: `made in ${updated.building}` }
      : updated;
  }
  nested() {
    return nestWorld<TestIsland, TestLine>(
      this.islands().values(),
      this.productionLines().values(),
    );
  }
}

const world = (): TestIsland[] => [
  {
    id: 1,
    name: 'A',
    productionLines: [
      { id: 10, building: 'Mill', count: 2 },
      { building: 'Farm', count: 3 },
    ],
  },
  { name: 'B', productionLines: [] },
];

describe('flattenWorld and nestWorld', () => {
  it('keeps ids that exist and gives the rest new ones', () => {
    const { islands, productionLines } = flattenWorld<
      TestIsland,
      TestLine,
      TradeRouteShape
    >(world(), []);
    expect(islands.has(1)).toBe(true);
    expect(productionLines.has(10)).toBe(true);
    expect([...islands.keys()].every((id) => id >= 0)).toBe(true);
    expect(new Set([...islands.keys(), ...productionLines.keys()]).size).toBe(
      4,
    );
  });

  it('puts lines back under their islands, without the island they pointed at', () => {
    const store = new TestStore(world());
    const nested = store.nested();
    expect(nested.map((island) => island.name)).toEqual(['A', 'B']);
    expect(nested[0].productionLines.map((line) => line.building)).toEqual([
      'Mill',
      'Farm',
    ]);
    expect(
      nested[0].productionLines.every((line) => !('islandId' in line)),
    ).toBe(true);
    expect(nested[1].productionLines).toEqual([]);
    expect('productionLines' in store.islands().get(1)!).toBe(false);
  });

  it('gives every route an id', () => {
    const { tradeRoutes } = flattenWorld(
      [],
      [{ id: -1, sourceIslandId: 1, targetIslandId: 2, good: 'x' }],
    );
    expect([...tradeRoutes.keys()][0]).toBeGreaterThanOrEqual(0);
  });
});

describe('BaseWorldStore', () => {
  it('adds, updates and removes islands', () => {
    const store = new TestStore();
    const id = store.addIsland();
    expect(store.islands().get(id)).toEqual({ name: 'New', id });
    store.updateIsland(id, { name: 'Renamed' } as Partial<
      Omit<StoredIsland<TestIsland>, 'id'>
    >);
    expect(store.islands().get(id)!.name).toBe('Renamed');
    store.removeIsland(id);
    expect(store.islands().size).toBe(0);
  });

  it('removes an island together with its lines, and leaves trade routes alone', () => {
    const store = new TestStore(world(), [
      { id: 5, sourceIslandId: 1, targetIslandId: 2, good: 'x' },
    ]);
    store.removeIsland(1);
    expect(store.productionLines().size).toBe(0);
    expect(store.tradeRoutes().size).toBe(1);
  });

  it('adds lines to an island, and lets the game derive fields on update', () => {
    const store = new TestStore([{ id: 1, name: 'A', productionLines: [] }]);
    const id = store.addProductionLine(1);
    expect(store.productionLines().get(id)).toMatchObject({
      islandId: 1,
      building: '',
      count: 1,
    });
    store.updateProductionLine(id, { count: 4 });
    expect(store.productionLines().get(id)!.derived).toBeUndefined();
    store.updateProductionLine(id, { building: 'Bakery' });
    expect(store.productionLines().get(id)).toMatchObject({
      building: 'Bakery',
      count: 4,
      derived: 'made in Bakery',
    });
    store.removeProductionLine(id);
    expect(store.productionLines().size).toBe(0);
  });

  it('adds, updates and removes trade routes', () => {
    const store = new TestStore();
    const id = store.addTradeRoute();
    store.updateTradeRoute(id, { good: 'Bread' });
    expect(store.tradeRoutes().get(id)).toMatchObject({ id, good: 'Bread' });
    store.removeTradeRoute(id);
    expect(store.tradeRoutes().size).toBe(0);
  });

  it('warns and changes nothing for an id that does not exist', () => {
    const store = new TestStore(world());
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const before = store.islands();
    store.updateIsland(999, { name: 'x' } as Partial<
      Omit<StoredIsland<TestIsland>, 'id'>
    >);
    store.updateProductionLine(999, { count: 1 });
    store.updateTradeRoute(999, { good: 'x' });
    expect(store.islands()).toBe(before);
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });
});
