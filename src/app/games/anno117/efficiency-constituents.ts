import { NumberConstituent } from '../../components/composite-number/composite-number';
import { Language } from '../../shared/l10n/l10n';
import { BuffSource } from './game/rules';
import { anno117Data, effectsById, itemsById, productsById } from './game/data';
import { Anno117Name } from './game/data-types';
import { iconUrl, nameIn } from './anno117-game';
import { Line117Controller } from './model/world-controllers';

const named = (
  name: Anno117Name | undefined,
  icon: string | undefined,
  language: Language,
) => ({
  description: nameIn(name, language),
  iconUrl: iconUrl(icon) || undefined,
});

/** The name and icon of whatever gave a line a buff, in the language shown. */
function describeSource(source: BuffSource, id: number, language: Language) {
  switch (source) {
    case 'item':
    case 'boostedItem': {
      const item = itemsById.get(id);
      const detail = named(item?.name, item?.icon, language);
      return source === 'boostedItem'
        ? { ...detail, description: `${detail.description} (+)` }
        : detail;
    }
    case 'tech': {
      // The id is the effect's; the tech that has it carries the better name.
      const tech = anno117Data.techs.find((t) => t.effects.includes(id));
      const effect = effectsById.get(id);
      return tech
        ? named(tech.name, tech.icon, language)
        : named(effect?.name, effect?.icon, language);
    }
    case 'patron': {
      const patron = anno117Data.patrons.find((p) =>
        p.effects.some((e) => e.effect === id),
      );
      const effect = effectsById.get(id);
      return patron
        ? {
            ...named(patron.name, patron.icon, language),
            description: `${nameIn(patron.name, language)}: ${nameIn(effect?.name, language)}`,
          }
        : named(effect?.name, effect?.icon, language);
    }
    case 'effect': {
      const effect = effectsById.get(id);
      return named(effect?.name, effect?.icon, language);
    }
    case 'aqueduct':
    case 'silo': {
      const buff =
        anno117Data.buffs.find((b) => b.id === id) ??
        anno117Data.modules.find((m) => m.id === id);
      return named(buff?.name, buff?.icon, language);
    }
  }
}

/**
 * A line's efficiency as parts that add up to it, for the tooltip. The game multiplies two sums
 * ((100 + base bonuses) x (100 + productivity bonuses)), which expands into 1, plus each bonus, plus
 * what the two sums add by being multiplied together; a missing fertility then scales the whole.
 */
export function efficiencyConstituents(
  line: Line117Controller,
  language: Language,
): NumberConstituent[] {
  const constituents: NumberConstituent[] = [
    { value: 1, description: 'Base Productivity' },
  ];
  let base = 0;
  let bonus = 0;
  for (const c of line.contributions) {
    const described = describeSource(c.source, c.sourceId, language);
    // A repeatable discovery researched several times counts that many times.
    const detail =
      c.source === 'tech' && c.scaling > 1
        ? {
            ...described,
            description: `${described.description} x${c.scaling}`,
          }
        : described;
    const baseValue = ((c.buff.baseProductivity ?? 0) * c.scaling) / 100;
    const bonusValue = ((c.buff.productivity ?? 0) * c.scaling) / 100;
    base += baseValue;
    bonus += bonusValue;
    if (baseValue) constituents.push({ value: baseValue, ...detail });
    if (bonusValue) constituents.push({ value: bonusValue, ...detail });
  }
  const crossTerm = base * bonus;
  if (crossTerm)
    constituents.push({ value: crossTerm, description: 'Combined Bonuses' });
  const fertility = line.fertilityFactor;
  if (fertility !== 1) {
    constituents.push({
      value: (fertility - 1) * (1 + base) * (1 + bonus),
      description: 'Fertility',
    });
  }
  return constituents;
}

/** What the line makes of its main good per minute: the recipe's output, and any extra of the same good (a silo's). */
export function producedConstituents(
  line: Line117Controller,
  language: Language,
): NumberConstituent[] {
  const product = productsById.get(Number(line.good));
  const detail = named(product?.name, product?.icon, language);
  const extra = line.extraGoods
    .filter((e) => e.good === line.good)
    .reduce((sum, e) => sum + e.producedPerMinute, 0);
  return [
    { value: line.goodsProducedPerMinute, ...detail },
    ...(extra ? [{ value: extra, ...detail }] : []),
  ];
}
