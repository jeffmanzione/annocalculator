import { provideZonelessChangeDetection, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EnumTooltip } from '../../../../components/enum-tooltip/enum-tooltip';
import { L10nService } from '../../../../services/l10n/l10n';
import { Language } from '../../../../shared/l10n/l10n';
import {
  Boost,
  CulturalSet,
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
} from '../../../../games/anno1800/game/enums';
import { BoostTooltip } from './boost/boost-tooltip';
import { ProductionBuildingTooltip } from './building/building-tooltip';
import { CulturalSetTooltip } from './cultural-set/cultural-set-tooltip';
import { HaciendaTooltip } from './hacienda/hacienda-tooltip';
import { ItemTooltip } from './item/item-tooltip';
import { InputGoodTooltip } from './input-good/input-good-tooltip';
import { PolicyTooltip } from './policy/policy-tooltip';

const render = async <T>(type: Type<EnumTooltip<T>>, value: T) => {
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(type);
  fixture.componentRef.setInput('value', value);
  await fixture.whenStable();
  return {
    fixture,
    text: () =>
      (fixture.nativeElement as HTMLElement)
        .textContent!.replace(/\s+/g, ' ')
        .trim(),
  };
};

describe('enum tooltips', () => {
  describe('building', () => {
    it('shows the process time, inputs and electricity need', async () => {
      const { text } = await render(
        ProductionBuildingTooltip,
        ProductionBuilding.CabAssemblyLine,
      );
      expect(text()).toContain('Cab Assembly Line');
      expect(text()).toContain('Process Time : 60 s');
      expect(text()).toContain('Inputs');
      expect(text()).toContain('Provides Electricity');
    });

    it('omits inputs and electricity for a plain farm', async () => {
      const { text } = await render(
        ProductionBuildingTooltip,
        ProductionBuilding.GrainFarm,
      );
      expect(text()).not.toContain('Inputs');
      expect(text()).not.toContain('Electricity');
    });

    it('re-renders for a new value', async () => {
      const { fixture, text } = await render(
        ProductionBuildingTooltip,
        ProductionBuilding.GrainFarm,
      );
      fixture.componentRef.setInput(
        'value',
        ProductionBuilding.CabAssemblyLine,
      );
      await fixture.whenStable();
      expect(text()).toContain('Cab Assembly Line');
    });

    it('localizes its labels', async () => {
      const { fixture, text } = await render(
        ProductionBuildingTooltip,
        ProductionBuilding.CabAssemblyLine,
      );
      TestBed.inject(L10nService).setLanguage(Language.De);
      await fixture.whenStable();
      expect(text()).toContain('Dauer : 60 s');
      expect(text()).toContain('Eingangswaren');
    });
  });

  describe('boost', () => {
    it('shows the boost name and productivity', async () => {
      const { text } = await render(BoostTooltip, Boost.TractorBarn);
      expect(text()).toContain('Tractor Barn');
      expect(text()).toContain('Productivity');
      expect(text()).toContain('+200%');
    });

    it('shows an extra good rate when the boost has one', async () => {
      const { text } = await render(BoostTooltip, Boost.Silo);
      expect(text()).toContain('Extra Good');
      expect(text()).toContain('1 / 3');
    });
  });

  describe('policy', () => {
    it('shows the policy and its extra good', async () => {
      const { text } = await render(
        PolicyTooltip,
        DepartmentOfLaborPolicy.LandReformAct,
      );
      expect(text()).toContain('Land Reform Act');
      expect(text()).toContain('1 / 2');
    });
  });

  describe('cultural set', () => {
    it('shows the set and its productivity', async () => {
      const { text } = await render(CulturalSetTooltip, CulturalSet.BronzeAge);
      expect(text()).toContain('Bronze Age');
      expect(text()).toContain('5%');
      expect(text()).toContain('1 / 10');
    });
  });

  describe('item', () => {
    it('shows the specialist, rarity, productivity and extra goods', async () => {
      const { text } = await render(ItemTooltip, Item.AlexanderHancock);
      expect(text()).toContain('Alexander Hancock');
      expect(text()).toContain('80%');
      expect(text()).toContain('Potatoes');
      expect(text()).toContain('1 / 8');
    });

    it('says when an item provides electricity', async () => {
      const { text } = await render(
        ItemTooltip,
        Item.AngelaMegIverThePolyvalent,
      );
      expect(text()).toContain('Provides Electricity');
      expect(text()).toContain('Yes');
    });
  });

  describe('hacienda', () => {
    it('describes the dung it produces', async () => {
      const { text } = await render(
        HaciendaTooltip,
        'Hacienda Fertilizer Works',
      );
      expect(text()).toContain('Dung');
    });
  });

  describe('input good', () => {
    it('shows just the good for a normal input', async () => {
      const { text, fixture } = await render(InputGoodTooltip, {
        good: Good.Flour,
      });
      expect(text()).toBe('Flour');
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.substitution'),
      ).toBeNull();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '.good-icon-big.glow',
        ),
      ).toBeNull();
    });

    // The label and value of each "Replaces" / "Specialist" row, e.g. ['Replaces', 'Flour'].
    const rows = (el: HTMLElement) =>
      [...el.querySelectorAll('.substitution-row')].map((row) => [
        row.querySelector('.label')!.textContent!.trim(),
        row.querySelector('span:not(.label)')!.textContent!.trim(),
      ]);

    it('explains a substitution: what it replaces and which specialist did it', async () => {
      const { fixture } = await render(InputGoodTooltip, {
        good: Good.Grain,
        replaces: Good.Flour,
        item: Item.Baker,
      });
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.good-name')!.textContent).toBe('Grain');
      expect(rows(el)).toEqual([
        ['Replaces', 'Flour'],
        ['Specialist', 'Baker'],
      ]);
      // The good, the good it replaces and the specialist each get an icon.
      expect(el.querySelectorAll('img').length).toBe(3);
      expect(el.querySelector('.good-icon-big.glow')).not.toBeNull();
    });

    it('localizes its labels', async () => {
      const { fixture } = await render(InputGoodTooltip, {
        good: Good.Grain,
        replaces: Good.Flour,
        item: Item.Baker,
      });
      TestBed.inject(L10nService).setLanguage(Language.De);
      await fixture.whenStable();
      expect(rows(fixture.nativeElement as HTMLElement)).toEqual([
        ['Ersetzt', 'Flour'],
        ['Spezialist', 'Baker'],
      ]);
    });

    it('re-renders when the substitution changes', async () => {
      const { text, fixture } = await render(InputGoodTooltip, {
        good: Good.Flour,
      });
      fixture.componentRef.setInput('value', {
        good: Good.Filaments,
        replaces: Good.SteamMotors,
        item: Item.SusannahtheSteamEngineer,
      });
      await fixture.whenStable();
      expect(text()).toContain('Filaments');
      expect(text()).toContain('Susannah the Steam Engineer');
    });
  });
});
