import {
  EMPTY_TOOLTIP,
  TooltipModel,
  TooltipRow,
  TooltipSection,
} from '../../../components/info-tooltip/tooltip-model';
import { L10nKey } from '../../../shared/l10n/l10n';
import { ExtraGood } from '../../../shared/mvc/models';
import { InputGoodSource } from '../../../shared/mvc/world-store';
import {
  Boost,
  CulturalSet,
  DepartmentOfLaborPolicy,
  Good,
  Item,
  ProductionBuilding,
} from '../game/enums';
import {
  lookupBoostInfo,
  lookupCulturalSetInfo,
  lookupItemInfo,
  lookupPolicyInfo,
  lookupProductionInfo,
} from '../game/facts';
import {
  lookupBoostIconUrl,
  lookupBuildingIconUrl,
  lookupGoodIconUrl,
  lookupHaciendaFertilizerWorksIconUrl,
  lookupItemIconUrl,
  lookupPolicyIconUrl,
} from '../game/icons';

export type Anno1800TooltipKind =
  | 'good'
  | 'inputGood'
  | 'building'
  | 'boost'
  | 'policy'
  | 'hacienda'
  | 'item'
  | 'culturalSet';

/** The colour behind an item's card, by its rarity. */
const RARITY_BACKGROUNDS: Record<string, string> = {
  Common: '#e4d9bf',
  Uncommon: '#dce6c3',
  Rare: '#cfdcea',
  Epic: '#e3d1e6',
  Legendary: '#f0dca6',
};

/** A good's name as the app's translated phrase for it (its names are the English words). */
const goodKey = (good: Good | undefined): L10nKey =>
  (good ?? 'Extra Goods') as unknown as L10nKey;

const extraGoodRow = (extra: ExtraGood): TooltipRow => ({
  icon: extra.good ? lookupGoodIconUrl(extra.good) : undefined,
  parts: [
    { key: goodKey(extra.good) },
    `: ${extra.rateNumerator} / ${extra.rateDenominator}`,
  ],
});

const goodRow = (good: Good): TooltipRow => ({
  icon: lookupGoodIconUrl(good),
  parts: [{ key: goodKey(good) }],
});

/** Productivity written as a percentage already (items and cultural sets). */
const percentRow = (percent: number): TooltipRow => ({
  parts: [{ key: 'Productivity' }, `: ${percent}%`],
});

const yesRow = (): TooltipRow => ({
  parts: [{ key: 'Provides Electricity' }, ': ', { key: 'Yes' }],
});

const section = (rows: TooltipRow[], heading?: L10nKey): TooltipSection[] =>
  rows.length ? [{ heading, rows }] : [];

function buildingModel(value: ProductionBuilding): TooltipModel {
  const info = lookupProductionInfo(value);
  if (!info) return EMPTY_TOOLTIP;
  return {
    name: value,
    icon: lookupBuildingIconUrl(value) || undefined,
    sections: [
      {
        rows: [
          {
            parts: [
              { key: 'Building Process Time' },
              `: ${info.processingTimeSeconds} `,
              { key: 's' },
            ],
          },
        ],
      },
      ...section((info.inputGoods ?? []).map(goodRow), 'Inputs'),
      ...section(info.requiresElectricity ? [yesRow()] : []),
    ],
  };
}

/** Boosts and policies describe themselves the same way: a productivity fraction and an extra good. */
function effectModel(
  name: string,
  icon: string | undefined,
  info: {
    productivityEffect?: number;
    extraGood?: ExtraGood;
  },
): TooltipModel {
  const rows: TooltipRow[] = [];
  if ((info.productivityEffect ?? 0) > 0)
    rows.push(percentRow(info.productivityEffect! * 100));
  if (info.extraGood)
    rows.push({
      parts: [
        { key: 'Extra Good' },
        `: ${info.extraGood.rateNumerator ?? ''} / ${info.extraGood.rateDenominator ?? ''}`,
      ],
    });
  return { name, icon: icon || undefined, sections: section(rows) };
}

function itemModel(value: Item): TooltipModel {
  const info = lookupItemInfo(value);
  if (!info) return EMPTY_TOOLTIP;
  const details: TooltipRow[] = [
    {
      parts: [
        { key: 'Building' },
        ': ',
        { key: info.administrativeBuilding as L10nKey },
      ],
    },
  ];
  if ((info.productivityEffect ?? 0) > 0)
    details.push(percentRow(info.productivityEffect!));
  if (info.providesElectricity) details.push(yesRow());
  return {
    name: value,
    icon: info.iconUrl,
    subtitle: { key: info.rarity as L10nKey },
    background: RARITY_BACKGROUNDS[info.rarity],
    sections: [
      { rows: details },
      ...section((info.extraGoods ?? []).map(extraGoodRow)),
      ...section(
        (info.replacementGoods ?? []).map(({ from, to }) => ({
          parts: [
            { icon: lookupGoodIconUrl(from) },
            { key: goodKey(from) },
            ' → ',
            { icon: lookupGoodIconUrl(to) },
            { key: goodKey(to) },
          ],
        })),
        'Replaces',
      ),
    ],
  };
}

function culturalSetModel(value: CulturalSet): TooltipModel {
  const info = lookupCulturalSetInfo(value);
  if (!info) return EMPTY_TOOLTIP;
  return {
    name: (value as string).toUpperCase(),
    icon: info.iconUrl,
    sections: [
      ...section(
        (info.productivityEffect ?? 0) > 0
          ? [percentRow(info.productivityEffect!)]
          : [],
      ),
      ...section((info.extraGoods ?? []).map(extraGoodRow)),
    ],
  };
}

function inputGoodModel(source: InputGoodSource): TooltipModel {
  const rows: TooltipRow[] = [];
  if (source.replaces)
    rows.push({
      icon: lookupGoodIconUrl(source.replaces),
      parts: [{ key: 'Replaces' }, `: ${source.replaces}`],
    });
  if (source.replaces && source.item)
    rows.push({
      icon: lookupItemIconUrl(source.item),
      parts: [{ key: 'Specialist' }, `: ${source.item}`],
    });
  return {
    name: source.good,
    icon: lookupGoodIconUrl(source.good),
    iconGlow: !!source.replaces,
    sections: section(rows),
  };
}

/** What the tooltip for a building, good, boost, policy, item or cultural set says. */
export function anno1800TooltipModel(
  kind: Anno1800TooltipKind,
  value: unknown,
): TooltipModel {
  if (value === null || value === undefined || value === '')
    return EMPTY_TOOLTIP;
  switch (kind) {
    case 'good':
      return {
        name: String(value),
        icon: lookupGoodIconUrl(value as Good),
        sections: [],
      };
    case 'inputGood':
      return inputGoodModel(value as InputGoodSource);
    case 'building':
      return buildingModel(value as ProductionBuilding);
    case 'boost': {
      const info = lookupBoostInfo(value as Boost);
      return info
        ? effectModel(String(value), lookupBoostIconUrl(value as Boost), info)
        : EMPTY_TOOLTIP;
    }
    case 'policy': {
      const info = lookupPolicyInfo(value as DepartmentOfLaborPolicy);
      return info
        ? effectModel(
            String(value),
            lookupPolicyIconUrl(value as DepartmentOfLaborPolicy),
            info,
          )
        : EMPTY_TOOLTIP;
    }
    case 'hacienda':
      return {
        name: String(value),
        icon: lookupHaciendaFertilizerWorksIconUrl(null),
        sections: [
          {
            rows: [
              extraGoodRow({
                good: Good.Dung,
                rateNumerator: 1,
                rateDenominator: 3,
              } as ExtraGood),
            ],
          },
        ],
      };
    case 'item':
      return itemModel(value as Item);
    case 'culturalSet':
      return culturalSetModel(value as CulturalSet);
  }
}
