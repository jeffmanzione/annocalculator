import { NumberConstituent } from './composite-number';

/** One extra amount of the line's own good, at a rate of numerator / denominator of its base output. */
export interface ExtraProduction {
  /** What gives it (an item, a boost, a silo ...). */
  description: string;
  iconUrl?: string;
  rateNumerator: number;
  rateDenominator: number;
}

/**
 * Explains a production line's goods per minute, the same way in both games: the building's base output
 * (buildings x 60 s / (base process time / efficiency)), plus what each extra of the same good adds. The
 * values add up to the total. The math is spelled out with numbers and units, so no extra text needs
 * translating.
 */
export function producedPerMinuteConstituents(line: {
  numBuildings: number;
  baseProcessTimeSeconds: number;
  efficiency: number;
  baseProducedPerMinute: number;
  extras: readonly ExtraProduction[];
}): NumberConstituent[] {
  const constituents: NumberConstituent[] = [
    {
      value: line.baseProducedPerMinute,
      description: 'Base Production',
      detail: [
        { value: line.numBuildings },
        '×',
        { value: 60, unit: 's' },
        '÷',
        '(',
        { value: line.baseProcessTimeSeconds, unit: 's' },
        '÷',
        { value: line.efficiency, isPercent: true },
        ')',
      ],
    },
  ];
  for (const extra of line.extras) {
    constituents.push({
      value:
        line.baseProducedPerMinute *
        (extra.rateNumerator / extra.rateDenominator),
      description: extra.description,
      iconUrl: extra.iconUrl,
      detail: [
        { value: extra.rateNumerator },
        '/',
        { value: extra.rateDenominator },
        '×',
        { value: line.baseProducedPerMinute, unit: '/m' },
      ],
    });
  }
  return constituents;
}
