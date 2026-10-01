import {
  DepartmentOfLaborPolicy,
  Good,
  ProductionBuilding,
} from '../game/enums';
import { defaultWorld } from '../../pages/production-calculator/default-world';
import { WorldStore } from './world-store';
import { StoreWorldView } from './world-store-views';
import { featureWorld, round, viewOf } from './test-worlds';

// Characterization tests: the snapshots pin the current behavior (bugs
// included) of the game math; the hand-derived tests below them check rules
// that are well understood independently of the implementation.

const lineTable = (world: StoreWorldView) =>
  world.islands.flatMap((island) =>
    island.productionLines.map((pl) => ({
      island: island.name,
      building: pl.building,
      good: pl.good,
      numBuildings: pl.numBuildings,
      efficiency: round(pl.efficiency),
      constituents: pl.efficiencyConstituents.map(
        (c) => `${c.description}: ${round(c.value)}`,
      ),
      processTimeSeconds: round(pl.buildingProcessTimeSeconds),
      producedPerMin: round(pl.goodsProducedPerMinute),
      producedPerMinWithExtras: round(pl.goodsProducedPerMinuteWithExtras),
      consumedPerMin: round(pl.goodsConsumedPerMinute),
      extraGoods: pl.extraGoods.map(
        (eg) =>
          `${eg.good} <- ${eg.source}: ${round(eg.producedPerMinute)}/min`,
      ),
    })),
  );

const islandTable = (world: StoreWorldView) =>
  world.islands.map((island) => ({
    island: island.name,
    producedGoods: island.producedGoods,
    dolPolicy: island.dolPolicy,
    hasDol: island.productionLines.map((pl) => pl.islandHasDepartmentOfLabor),
    hacienda: island.productionLines.map(
      (pl) => pl.inRangeOfHaciendaFertiliserWorks,
    ),
  }));

describe('default world', () => {
  const world = () => viewOf(defaultWorld);

  it('per-line numbers', () => {
    expect(lineTable(world())).toMatchSnapshot();
  });

  it('per-island numbers', () => {
    expect(islandTable(world())).toMatchSnapshot();
  });

  it("Crown Falls' Bakery drops from 230% to 200% without its DOL policy", () => {
    const store = WorldStore.fromWorld(structuredClone(defaultWorld));
    const view = new StoreWorldView(store);
    const crownFalls = view.islands.find((i) => i.name === 'Crown Falls')!;
    const bakery = () =>
      crownFalls.productionLines.find(
        (pl) => pl.building === ProductionBuilding.Bakery,
      )!;

    expect(bakery().efficiency).toBeCloseTo(2.3);
    expect(bakery().goodsProducedPerMinute).toBeCloseTo(23);

    store.updateIsland(crownFalls.id, {
      dolPolicy: DepartmentOfLaborPolicy.None,
    });
    expect(bakery().efficiency).toBeCloseTo(2.0);
    expect(bakery().goodsProducedPerMinute).toBeCloseTo(20);
  });
});

describe('feature world', () => {
  const world = () => viewOf(featureWorld());

  it('per-line numbers', () => {
    expect(lineTable(world())).toMatchSnapshot();
  });

  it('per-island numbers', () => {
    expect(islandTable(world())).toMatchSnapshot();
  });
});

describe('hand-derived rules', () => {
  const line = (island: string, id: number) =>
    viewOf(featureWorld())
      .islands.find((i) => i.name === island)!
      .productionLines.find((pl) => pl.id === id)!;

  it('electricity adds 100%, the trade union bonus applies with a DOL in range', () => {
    // Steelworks: base 1 + electricity 1 + trade union bonus 0.3.
    expect(line('Old Isle', 11).efficiency).toBeCloseTo(2.3);
  });

  it('trade union bonus needs the building to be in range of the DOL', () => {
    const w = featureWorld();
    w.islands[0].productionLines[0].inRangeOfLocalDepartment = false;
    const pl = viewOf(w).islands[0].productionLines[0];
    expect(pl.efficiency).toBeCloseTo(2);
  });

  it('Galvanic Grants adds 50% on top of electricity when in range', () => {
    expect(line('Galvanic Isle', 31).efficiency).toBeCloseTo(2.5);
  });

  it('tractor barn, fertiliser and an item stack additively', () => {
    // 1 + tractor barn 2 + fertiliser 1 + trade union 0.3 + Alexander Hancock 0.8.
    expect(line('Old Isle', 13).efficiency).toBeCloseTo(5.1);
  });

  it('Silo gives +100% efficiency', () => {
    expect(line('Old Isle', 12).efficiency).toBeCloseTo(2);
  });

  it('cultural sets add their productivity effect without a trade union', () => {
    expect(line('Old Isle', 15).efficiency).toBeCloseTo(1.05);
  });

  it('Skilled Labor Act adds 1 extra good per 3 for improved buildings', () => {
    const pl = line('Old Isle', 11);
    const extra = pl.extraGoods.find(
      (eg) => eg.source === DepartmentOfLaborPolicy.SkilledLaborAct,
    )!;
    expect(extra.good).toBe(Good.SteelBeams);
    expect(extra.rate).toBeCloseTo(1 / 3);
  });

  it('Land Reform Act adds 1 extra good per 2 for improved buildings', () => {
    const pl = line('Land Reform Isle', 21);
    const extra = pl.extraGoods.find(
      (eg) => eg.source === DepartmentOfLaborPolicy.LandReformAct,
    )!;
    expect(extra.rate).toBeCloseTo(1 / 2);
    // 5 grain farms, 1 / 1 efficiency (base 1 + 0.3 trade union): 5 * 60 / (process / 1.3)
    expect(pl.goodsProducedPerMinuteWithExtras).toBeCloseTo(
      pl.goodsProducedPerMinute * 1.5,
    );
  });

  it('Hacienda Fertiliser Works only counts in the New World', () => {
    expect(line('New Isle', 42).inRangeOfHaciendaFertiliserWorks).toBe(true);
    const w = featureWorld();
    w.islands[0].productionLines.push({
      building: ProductionBuilding.CottonPlantation,
      good: Good.Cotton,
      numBuildings: 1,
      inRangeOfHaciendaFertiliserWorks: true,
    });
    const old = viewOf(w).islands[0].productionLines.at(-1)!;
    expect(old.inRangeOfHaciendaFertiliserWorks).toBe(false);
  });

  it('consumption equals production (inputs scale one-to-one)', () => {
    const pl = line('Old Isle', 11);
    expect(pl.goodsConsumedPerMinute).toBe(pl.goodsProducedPerMinute);
  });

  it('island producedGoods include item extra goods', () => {
    const goods = viewOf(featureWorld()).islands[0].producedGoods;
    expect(goods).toContain(Good.Potatoes);
    expect(goods).toContain(Good.Chocolate);
  });
});
