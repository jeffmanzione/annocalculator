import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TooltipModel,
  TooltipPart,
} from '../../../components/info-tooltip/tooltip-model';
import { L10nService } from '../../../services/l10n/l10n';
import { Language } from '../../../shared/l10n/l10n';
import {
  Boost,
  CulturalSet,
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
} from '../game/enums';
import { Anno1800Tooltip } from './anno1800-tooltip';
import { Anno1800TooltipKind, anno1800TooltipModel } from './tooltip-model';

/** A tooltip's lines as text, with translated phrases shown as <Key>. */
const lines = (model: TooltipModel): string[] =>
  model.sections.flatMap((s) => [
    ...(s.heading ? [`# ${s.heading}`] : []),
    ...s.rows.map((r) =>
      r.parts
        .map((p: TooltipPart) => (typeof p === 'string' ? p : `<${p.key}>`))
        .join(''),
    ),
  ]);

const render = async (kind: Anno1800TooltipKind, value: unknown) => {
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(Anno1800Tooltip);
  fixture.componentRef.setInput('kind', kind);
  fixture.componentRef.setInput('value', value);
  await fixture.whenStable();
  return {
    fixture,
    el: fixture.nativeElement as HTMLElement,
    text: () =>
      (fixture.nativeElement as HTMLElement)
        .textContent!.replace(/\s+/g, ' ')
        .trim(),
  };
};

describe('Anno 1800 tooltips', () => {
  describe('building', () => {
    it('shows the process time, inputs and electricity need', () => {
      const model = anno1800TooltipModel(
        'building',
        ProductionBuilding.CabAssemblyLine,
      );
      expect(model.name).toBe('Cab Assembly Line');
      const text = lines(model);
      expect(text[0]).toBe('<Building Process Time>: 60 <s>');
      expect(text).toContain('# Inputs');
      expect(text).toContain('<Provides Electricity>: <Yes>');
    });

    it('omits inputs and electricity for a plain farm', () => {
      const text = lines(
        anno1800TooltipModel('building', ProductionBuilding.GrainFarm),
      );
      expect(text).not.toContain('# Inputs');
      expect(text.join()).not.toContain('Electricity');
    });

    it('localizes its labels when drawn', async () => {
      const { fixture, text } = await render(
        'building',
        ProductionBuilding.CabAssemblyLine,
      );
      expect(text()).toContain('Cab Assembly Line');
      TestBed.inject(L10nService).setLanguage(Language.De);
      await fixture.whenStable();
      expect(text()).toContain('Dauer : 60 s');
      expect(text()).toContain('Eingangswaren');
    });
  });

  describe('boost', () => {
    it('shows the boost name and productivity', () => {
      const model = anno1800TooltipModel('boost', Boost.TractorBarn);
      expect(model.name).toBe('Tractor Barn');
      expect(lines(model)).toContain('<Productivity>: 200%');
    });

    it('shows an extra good rate when the boost has one', () => {
      expect(lines(anno1800TooltipModel('boost', Boost.Silo))).toContain(
        '<Extra Good>: 1 / 3',
      );
    });
  });

  describe('policy', () => {
    it('shows the policy and its extra good', () => {
      const model = anno1800TooltipModel(
        'policy',
        DepartmentOfLaborPolicy.LandReformAct,
      );
      expect(model.name).toBe('Land Reform Act');
      expect(lines(model).join()).toContain('1 / 2');
    });
  });

  describe('cultural set', () => {
    it('shows the set and its productivity', () => {
      const model = anno1800TooltipModel('culturalSet', CulturalSet.BronzeAge);
      expect(model.name).toBe('BRONZE AGE');
      const text = lines(model).join();
      expect(text).toContain('5%');
      expect(text).toContain('1 / 10');
    });
  });

  describe('item', () => {
    it('shows the rarity, productivity and extra goods', () => {
      const model = anno1800TooltipModel('item', Item.AlexanderHancock);
      expect(model.name).toBe('Alexander Hancock');
      expect(model.subtitle).toBeDefined();
      expect(model.background).toBeDefined();
      const text = lines(model).join();
      expect(text).toContain('80%');
      expect(text).toContain('<Potatoes>: 1 / 8');
    });

    it('says when an item provides electricity', () => {
      expect(
        lines(
          anno1800TooltipModel('item', Item.AngelaMegIverThePolyvalent),
        ).join(),
      ).toContain('<Provides Electricity>: <Yes>');
    });
  });

  describe('hacienda', () => {
    it('describes the dung it produces', () => {
      expect(
        lines(anno1800TooltipModel('hacienda', 'Hacienda Fertilizer Works')),
      ).toEqual(['<Dung>: 1 / 3']);
    });
  });

  describe('good', () => {
    it('is the good with its icon', () => {
      const model = anno1800TooltipModel('good', Good.Flour);
      expect(model.name).toBe('Flour');
      expect(model.icon).toBeTruthy();
    });
  });

  describe('input good', () => {
    it('shows just the good for a normal input', async () => {
      const { text, el } = await render('inputGood', { good: Good.Flour });
      expect(text()).toBe('Flour');
      expect(el.querySelector('.icon-big.glow')).toBeNull();
    });

    it('explains a substitution: what it replaces and which specialist did it', async () => {
      const source = {
        good: Good.Grain,
        replaces: Good.Flour,
        item: Item.Baker,
      };
      expect(lines(anno1800TooltipModel('inputGood', source))).toEqual([
        '<Replaces>: Flour',
        '<Specialist>: Baker',
      ]);
      const { el } = await render('inputGood', source);
      // The good, the good it replaces and the specialist each get an icon.
      expect(el.querySelectorAll('img').length).toBe(3);
      expect(el.querySelector('.icon-big.glow')).not.toBeNull();
    });

    it('localizes its labels', async () => {
      const { fixture, text } = await render('inputGood', {
        good: Good.Grain,
        replaces: Good.Flour,
        item: Item.Baker,
      });
      TestBed.inject(L10nService).setLanguage(Language.De);
      await fixture.whenStable();
      expect(text()).toContain('Ersetzt : Flour');
      expect(text()).toContain('Spezialist : Baker');
    });

    it('re-renders when the substitution changes', async () => {
      const { text, fixture } = await render('inputGood', {
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

  it('is empty for nothing', () => {
    expect(anno1800TooltipModel('item', null).name).toBe('');
  });
});
