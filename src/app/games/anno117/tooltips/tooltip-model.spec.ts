import { Language } from '../../../shared/l10n/l10n';
import { TooltipModel, TooltipPart, tooltipModel } from './tooltip-model';

// Ids: 3174 Bakery (Roman), 2069 Wheat, 160057 the Narcissium item, 80562 Mars, 38708 Better Bellows,
// 2206 the Mackerel fertility, 2693 Wheat Farm, 3075 Grain Mill, 2956 Scomber's Shack.

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

describe('tooltipModel', () => {
  it('describes a building: time, inputs, output, workforce and fuel', () => {
    const bakery = tooltipModel('building', 3174, Language.En);
    expect(bakery.name).toBe('Bakery');
    expect(bakery.icon).toContain('/icons/anno117/');
    expect(lines(bakery)).toEqual([
      '<Building Process Time>: 60 <s>',
      '# Inputs',
      'Flour',
      '# Output',
      'Bread',
      '<Workforce>: 3 Plebeian Workforce',
      '<Fuel>: Coal',
    ]);
  });

  it('mentions what a building can have: an aqueduct, a fertility', () => {
    expect(lines(tooltipModel('building', 2693, Language.En))).toContain(
      '<Aqueduct>: +50%',
    );
    expect(lines(tooltipModel('building', 2956, Language.En))).toContain(
      '<Fertility>: Mackerel Population',
    );
  });

  it('says where a good is made and used', () => {
    const wheat = tooltipModel('good', '2069', Language.En);
    expect(wheat.name).toBe('Wheat');
    const text = lines(wheat);
    expect(text.slice(0, 2)).toEqual(['# Made By', 'Wheat Farm']);
    expect(text).toContain('# Used By');
    expect(text).toContain('Grain Mill');
    // The Roman and Celtic copy of a building are one line.
    expect(text.filter((l) => l === 'Wheat Farm').length).toBe(1);
  });

  it('shows coal as used by the buildings that burn it', () => {
    expect(lines(tooltipModel('good', '2085', Language.En))).toContain(
      'Bakery',
    );
  });

  it('describes an item: its rarity, its effects and the buildings it is for', () => {
    const item = tooltipModel('item', 160057, Language.En);
    expect(item.subtitle).toEqual({ key: 'Mythic' });
    expect(lines(item)).toEqual([
      '<Productivity>: +30%',
      '<Replaces>: Silver → Iron',
      '# Boosted Items',
      '<Productivity>: +45%',
      '<Replaces>: Silver → Iron',
      '# Affects',
      'Narcissium',
    ]);
  });

  it('describes a discovery by what it does', () => {
    expect(lines(tooltipModel('tech', 38708, Language.En))[0]).toBe(
      '<Fuel Duration>: +20%',
    );
  });

  it('describes a discovery that gives a fertility', () => {
    expect(lines(tooltipModel('tech', 37858, Language.En))).toEqual([
      '<Fertility>: +50% Mackerel Population',
    ]);
  });

  it("describes a patron's effects and how devotion scales them", () => {
    const mars = tooltipModel('patron', 80562, Language.En);
    expect(mars.name).toBe('Mars');
    const text = lines(mars);
    // The effect is +1% per point of its milestone: 10 at 50 devotion, 150 at 300000.
    expect(text.slice(0, 5)).toEqual([
      'Armamentum',
      '<Devotion>: 50',
      '<Productivity>: +10%',
      '<Devotion>: 300000',
      '<Productivity>: +150%',
    ]);
    expect(text).toContain('Pig Farm');
  });

  it('describes an event or festival', () => {
    expect(lines(tooltipModel('effect', 80565, Language.En))).toContain(
      '<Productivity>: +1%',
    );
  });

  it('says what a fertility is for', () => {
    expect(lines(tooltipModel('fertility', 2206, Language.En))).toEqual([
      '# Used By',
      "Scomber's Shack",
    ]);
  });

  it("uses the game's German names", () => {
    expect(tooltipModel('good', '2069', Language.De).name).toBe('Weizen');
    expect(tooltipModel('building', 3174, Language.De).name).toBe('Bäckerei');
  });

  it('is empty for nothing, so the tooltip shows nothing', () => {
    for (const value of [null, undefined, '', 0]) {
      expect(tooltipModel('building', value, Language.En)).toEqual({
        name: '',
        sections: [],
      });
    }
    expect(tooltipModel('item', 99999999, Language.En).name).toBe('');
  });
});
