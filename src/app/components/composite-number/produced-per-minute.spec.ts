import { producedPerMinuteConstituents } from './produced-per-minute';

describe('producedPerMinuteConstituents', () => {
  const line = {
    numBuildings: 2,
    baseProcessTimeSeconds: 30,
    efficiency: 2,
    baseProducedPerMinute: 8,
  };

  it('explains the base output as buildings x 60 s / (process time / efficiency)', () => {
    const [base] = producedPerMinuteConstituents({ ...line, extras: [] });
    expect(base.value).toBe(8);
    expect(base.description).toBe('Base Production');
    expect(base.detail).toEqual([
      { value: 2 },
      '×',
      { value: 60, unit: 's' },
      '÷',
      '(',
      { value: 30, unit: 's' },
      '÷',
      { value: 2, isPercent: true },
      ')',
    ]);
  });

  it('adds one part for each extra, a fraction of the base output, so that the parts sum to the total', () => {
    const parts = producedPerMinuteConstituents({
      ...line,
      extras: [
        { description: 'Silo', rateNumerator: 1, rateDenominator: 3 },
        {
          description: 'Item',
          iconUrl: 'x.png',
          rateNumerator: 1,
          rateDenominator: 2,
        },
      ],
    });
    expect(parts.map((p) => p.description)).toEqual([
      'Base Production',
      'Silo',
      'Item',
    ]);
    expect(parts[1].value).toBeCloseTo(8 / 3);
    expect(parts[2].iconUrl).toBe('x.png');
    expect(parts[1].detail).toEqual([
      { value: 1 },
      '/',
      { value: 3 },
      '×',
      { value: 8, unit: '/m' },
    ]);
    expect(parts.reduce((sum, p) => sum + p.value, 0)).toBeCloseTo(
      8 + 8 / 3 + 4,
    );
  });
});
