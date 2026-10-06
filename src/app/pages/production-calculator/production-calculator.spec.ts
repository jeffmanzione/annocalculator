import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProductionCalculatorPage } from './production-calculator';
import { defaultWorld } from './default-world';
import { World } from '../../shared/mvc/models';
import { WorldStore } from '../../shared/mvc/world-store';
import noIds from '../../shared/mvc/__fixtures__/legacy-saves/no-ids-with-trade-union-bonus.json';

// The page is what connects the saved world to the app: which localStorage key it lives
// under, loading it at start-up, and saving it again after every change. Users' saves sit
// under this key, so it must never change by accident.
const WORLD_KEY = 'anno-1800-production-calculator-world';

const open = async () => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(ProductionCalculatorPage);
  await fixture.whenStable();
  return fixture;
};

const stored = (): World => JSON.parse(localStorage.getItem(WORLD_KEY)!);

describe('ProductionCalculatorPage persistence', () => {
  beforeEach(() => localStorage.clear());

  it('starts a new visitor on the default world and saves it', async () => {
    await open();
    expect(stored().islands.map((island) => island.name)).toEqual(
      defaultWorld.islands.map((island) => island.name),
    );
  });

  it('loads the world saved under the 1800 key', async () => {
    localStorage.setItem(WORLD_KEY, JSON.stringify(noIds));
    const fixture = await open();
    expect(
      fixture.componentInstance.world.islands.map((island) => island.name),
    ).toEqual(['Old Isle', 'Second Isle']);
  });

  it('saves an older world in the normalized form on load', async () => {
    localStorage.setItem(WORLD_KEY, JSON.stringify(noIds));
    await open();
    const saved = stored();
    expect(saved.palacePrestigeLevel).toBe(10);
    expect('tradeUnionBonus' in saved).toBe(false);
    expect(saved.islands.every((island) => island.id !== undefined)).toBe(true);
    // Loading it again changes nothing.
    expect(JSON.stringify(WorldStore.fromWorld(saved).toWorld())).toBe(
      JSON.stringify(saved),
    );
  });

  it('saves a change the user makes', async () => {
    const fixture = await open();
    fixture.componentInstance.world.islands[0].name = 'Renamed';
    await fixture.whenStable();
    expect(stored().islands[0].name).toBe('Renamed');
  });

  it('saves the Palace prestige level', async () => {
    const fixture = await open();
    fixture.componentInstance.world.palacePrestigeLevel = 7;
    await fixture.whenStable();
    expect(stored().palacePrestigeLevel).toBe(7);
  });
});
