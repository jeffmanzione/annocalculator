import {
  TooltipModel,
  TooltipPart,
  TooltipRow,
  TooltipSection,
} from '../../../components/info-tooltip/tooltip-model';
import { L10nKey, Language } from '../../../shared/l10n/l10n';
import { iconUrl, nameIn } from '../anno117-game';
import {
  anno117Data,
  buffsById,
  effectsById,
  factoriesById,
  fertilitiesById,
  itemsById,
  patronsById,
  productsById,
  techsById,
  workforceById,
} from '../game/data';
import { Anno117Buff, Anno117Name } from '../game/data-types';

export type { TooltipModel, TooltipPart, TooltipRow, TooltipSection };

export type TooltipKind =
  | 'building'
  | 'good'
  | 'item'
  | 'effect'
  | 'tech'
  | 'patron'
  | 'fertility'
  | 'module';

/** Lists longer than this are cut short, so that a good used everywhere does not make a page-long tooltip. */
const MAX_ROWS = 10;

const percent = (value: number): string =>
  `${value > 0 ? '+' : ''}${Number(value.toFixed(2))}%`;

/** A row for a thing with a name and an icon. */
const named = (
  thing: { name: Anno117Name; icon?: string } | undefined,
  language: Language,
  ...before: TooltipPart[]
): TooltipRow => ({
  icon: thing ? iconUrl(thing.icon) || undefined : undefined,
  parts: [...before, nameIn(thing?.name, language)],
});

/** What a buff does to the buildings it applies to, one line for each thing. */
export function buffRows(
  buff: Anno117Buff,
  language: Language,
  /** How strongly the buff acts (a patron's effect is written for 1 and scaled by its devotion milestone). */
  scale = 1,
): TooltipRow[] {
  const rows: TooltipRow[] = [];
  if (buff.productivity)
    rows.push({
      parts: [
        { key: 'Productivity' },
        `: ${percent(buff.productivity * scale)}`,
      ],
    });
  if (buff.baseProductivity)
    rows.push({
      parts: [
        { key: 'Productivity' },
        `: ${percent(buff.baseProductivity * scale)} (+)`,
      ],
    });
  if (buff.fuelDurationPercent)
    rows.push({
      parts: [
        { key: 'Fuel Duration' },
        `: ${percent(buff.fuelDurationPercent * scale)}`,
      ],
    });
  for (const { from, to } of buff.replaceInputs ?? []) {
    const fromProduct = productsById.get(from);
    const toProduct = to ? productsById.get(to) : undefined;
    rows.push({
      icon: toProduct ? iconUrl(toProduct.icon) : iconUrl(fromProduct?.icon),
      parts: [
        { key: 'Replaces' },
        `: ${nameIn(fromProduct?.name, language)} → ${toProduct ? nameIn(toProduct.name, language) : '–'}`,
      ],
    });
  }
  for (const extra of buff.additionalOutputs ?? []) {
    const product = extra.product ? productsById.get(extra.product) : undefined;
    rows.push({
      icon: product ? iconUrl(product.icon) : undefined,
      parts: [
        { key: 'Extra Output' },
        `: ${extra.amount}${product ? ' ' + nameIn(product.name, language) : ''} `,
        { key: 'Every' },
        ` ${extra.everyCycles} `,
        { key: 'Cycles' },
      ],
    });
  }
  return rows;
}

/** The buildings (by name, one for the Roman and Celtic copy of a building) a list of factory ids stands for. */
function buildingRows(
  ids: readonly number[],
  language: Language,
): TooltipRow[] {
  const seen = new Set<string>();
  const rows: TooltipRow[] = [];
  for (const id of ids) {
    const factory = factoriesById.get(id);
    if (!factory) continue;
    const name = nameIn(factory.name, language);
    if (seen.has(name)) continue;
    seen.add(name);
    rows.push(named(factory, language));
  }
  return rows.length > MAX_ROWS
    ? [...rows.slice(0, MAX_ROWS), { parts: ['…'] }]
    : rows;
}

function buildingModel(id: number, language: Language): TooltipModel {
  const factory = factoriesById.get(id);
  const product = (productId: number) => productsById.get(productId);
  const sections: TooltipSection[] = [];
  if (!factory) return { name: '', sections };
  sections.push({
    rows: [
      {
        parts: [
          { key: 'Building Process Time' },
          `: ${factory.cycleTime} `,
          { key: 's' },
        ],
      },
    ],
  });
  if (factory.inputs.length) {
    sections.push({
      heading: 'Inputs',
      rows: factory.inputs.map((i) => named(product(i.product), language)),
    });
  }
  sections.push({
    heading: 'Output',
    rows: factory.outputs.map((o) => named(product(o.product), language)),
  });
  const details: TooltipRow[] = [];
  if (factory.workforce) {
    details.push({
      icon:
        iconUrl(workforceById.get(factory.workforce.product)?.icon) ||
        undefined,
      parts: [
        { key: 'Workforce' },
        `: ${factory.workforce.amount} ${nameIn(workforceById.get(factory.workforce.product)?.name, language)}`,
      ],
    });
  }
  if (factory.fertility)
    details.push(
      named(
        fertilitiesById.get(factory.fertility),
        language,
        { key: 'Fertility' },
        ': ',
      ),
    );
  if (factory.fuel)
    details.push(
      named(
        product(anno117Data.constants.fuelProduct),
        language,
        { key: 'Fuel' },
        ': ',
      ),
    );
  if (factory.aqueductBuff) {
    const buff = buffsById.get(factory.aqueductBuff);
    details.push({
      icon: iconUrl(buff?.icon) || undefined,
      parts: [{ key: 'Aqueduct' }, `: ${percent(buff?.productivity ?? 0)}`],
    });
  }
  if (factory.module) {
    details.push({
      parts: [
        { key: 'Silo' },
        ': ',
        ...(buffRows(
          buffsById.get(
            anno117Data.modules.find((m) => m.id === factory.module)
              ?.buffs[0] ?? 0,
          )!,
          language,
        )[0]?.parts ?? []),
      ],
    });
  }
  if (details.length) sections.push({ rows: details });
  return {
    name: nameIn(factory.name, language),
    icon: iconUrl(factory.icon) || undefined,
    sections,
  };
}

function goodModel(id: string, language: Language): TooltipModel {
  const productId = Number(id);
  const product = productsById.get(productId);
  const makers = anno117Data.factories.filter((f) =>
    f.outputs.some((o) => o.product === productId),
  );
  const users = anno117Data.factories.filter(
    (f) =>
      f.inputs.some((i) => i.product === productId) ||
      (f.fuel && productId === anno117Data.constants.fuelProduct),
  );
  const sections: TooltipSection[] = [];
  if (makers.length)
    sections.push({
      heading: 'Made By',
      rows: buildingRows(
        makers.map((f) => f.id),
        language,
      ),
    });
  if (users.length)
    sections.push({
      heading: 'Used By',
      rows: buildingRows(
        users.map((f) => f.id),
        language,
      ),
    });
  return {
    name: nameIn(product?.name, language),
    icon: iconUrl(product?.icon) || undefined,
    sections,
  };
}

function effectSections(
  buffIds: readonly number[],
  targets: readonly number[],
  allProduction: boolean | undefined,
  language: Language,
): TooltipSection[] {
  const sections: TooltipSection[] = [];
  const rows = buffIds.flatMap((buffId) =>
    buffsById.has(buffId) ? buffRows(buffsById.get(buffId)!, language) : [],
  );
  if (rows.length) sections.push({ rows });
  if (!allProduction && targets.length)
    sections.push({
      heading: 'Affects',
      rows: buildingRows(targets, language),
    });
  return sections;
}

function itemModel(id: number, language: Language): TooltipModel {
  const item = itemsById.get(id);
  if (!item) return { name: '', sections: [] };
  const sections = effectSections(item.buffs, item.targets, false, language);
  const boostRows = (item.boostBuffs ?? []).flatMap((b) =>
    buffsById.has(b) ? buffRows(buffsById.get(b)!, language) : [],
  );
  if (boostRows.length)
    sections.splice(1, 0, { heading: 'Boosted Items', rows: boostRows });
  return {
    name: nameIn(item.name, language),
    icon: iconUrl(item.icon) || undefined,
    subtitle: { key: item.rarity as L10nKey },
    sections,
  };
}

function effectModel(id: number, language: Language): TooltipModel {
  const effect = effectsById.get(id);
  if (!effect) return { name: '', sections: [] };
  return {
    name: nameIn(effect.name, language),
    icon: iconUrl(effect.icon) || undefined,
    sections: effectSections(
      effect.buffs,
      effect.targets,
      effect.allProduction,
      language,
    ),
  };
}

function techModel(id: number, language: Language): TooltipModel {
  const tech = techsById.get(id);
  if (!tech) return { name: '', sections: [] };
  const sections = tech.effects.flatMap((effectId) => {
    const effect = effectsById.get(effectId);
    return effect
      ? effectSections(
          effect.buffs,
          effect.targets,
          effect.allProduction,
          language,
        )
      : [];
  });
  for (const areaBuffId of tech.areaBuffs ?? []) {
    const area = anno117Data.areaBuffs.find((a) => a.id === areaBuffId);
    if (area)
      sections.push({
        rows: [
          named(
            fertilitiesById.get(area.fertility),
            language,
            { key: 'Fertility' },
            `: ${percent(area.percent)} `,
          ),
        ],
      });
  }
  return {
    name: nameIn(tech.name, language),
    icon: iconUrl(tech.icon) || undefined,
    sections,
  };
}

function patronModel(id: number, language: Language): TooltipModel {
  const patron = patronsById.get(id);
  if (!patron) return { name: '', sections: [] };
  const sections: TooltipSection[] = [];
  for (const { effect: effectId, milestones } of patron.effects) {
    const effect = effectsById.get(effectId);
    if (!effect) continue;
    // The effect is written for 1 and grows with devotion: show what the first and the last milestone give.
    const shown = [milestones[0], milestones[milestones.length - 1]].filter(
      (m, i, all) => m && all.indexOf(m) === i,
    );
    const rows: TooltipRow[] = [named(effect, language)];
    for (const milestone of shown) {
      rows.push({
        parts: [{ key: 'Devotion' } as TooltipPart, `: ${milestone.devotion}`],
      });
      for (const buffId of effect.buffs) {
        const buff = buffsById.get(buffId);
        if (buff) rows.push(...buffRows(buff, language, milestone.scaling));
      }
    }
    sections.push({ rows });
    if (!effect.allProduction && effect.targets.length) {
      sections.push({
        heading: 'Affects',
        rows: buildingRows(effect.targets, language),
      });
    }
  }
  return {
    name: nameIn(patron.name, language),
    icon: iconUrl(patron.icon) || undefined,
    sections,
  };
}

function fertilityModel(id: number, language: Language): TooltipModel {
  const fertility = fertilitiesById.get(id);
  const users = anno117Data.factories.filter((f) => f.fertility === id);
  return {
    name: nameIn(fertility?.name, language),
    icon: iconUrl(fertility?.icon) || undefined,
    sections: users.length
      ? [
          {
            heading: 'Used By',
            rows: buildingRows(
              users.map((f) => f.id),
              language,
            ),
          },
        ]
      : [],
  };
}

/** An aqueduct or a silo: what it gives a building. */
function moduleModel(id: number, language: Language): TooltipModel {
  const module = anno117Data.modules.find((m) => m.id === id);
  const buff = module ? undefined : buffsById.get(id);
  const thing = module ?? buff;
  if (!thing) return { name: '', sections: [] };
  const buffs = module ? module.buffs.map((b) => buffsById.get(b)) : [buff];
  const rows = buffs.flatMap((b) => (b ? buffRows(b, language) : []));
  return {
    name: nameIn(thing.name, language),
    icon: iconUrl(thing.icon) || undefined,
    sections: rows.length ? [{ rows }] : [],
  };
}

/** What the tooltip for a building, good, item, effect, discovery, patron or fertility says, in the language shown. */
export function tooltipModel(
  kind: TooltipKind,
  value: number | string | null | undefined,
  language: Language,
): TooltipModel {
  if (value === null || value === undefined || value === '' || value === 0)
    return { name: '', sections: [] };
  switch (kind) {
    case 'building':
      return buildingModel(Number(value), language);
    case 'good':
      return goodModel(String(value), language);
    case 'item':
      return itemModel(Number(value), language);
    case 'effect':
      return effectModel(Number(value), language);
    case 'tech':
      return techModel(Number(value), language);
    case 'patron':
      return patronModel(Number(value), language);
    case 'fertility':
      return fertilityModel(Number(value), language);
    case 'module':
      return moduleModel(Number(value), language);
  }
}
