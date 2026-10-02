/**
 * The Palace's Labour department gives the Trade Union a productivity bonus
 * that grows with the Palace's prestige level: +10% at level 0 and 2% more per
 * level, up to +60% at level 25.
 */
export const MIN_PALACE_PRESTIGE_LEVEL = 0;
export const MAX_PALACE_PRESTIGE_LEVEL = 25;
const BASE_BONUS_PERCENT = 10;
const BONUS_PERCENT_PER_LEVEL = 2;

/** The Trade Union bonus (a fraction, 0.3 = +30%) at a prestige level, or 0 with no Palace. */
export function palaceTradeUnionBonus(
  level: number | null | undefined,
): number {
  if (level == null) return 0;
  return (BASE_BONUS_PERCENT + BONUS_PERCENT_PER_LEVEL * level) / 100;
}

/**
 * Converts a Trade Union bonus saved before the Palace level existed (a fraction)
 * to the nearest prestige level, or null if there was no bonus.
 */
export function palacePrestigeLevelForBonus(bonus: number): number | null {
  if (!(bonus > 0)) return null;
  const level = Math.round(
    (bonus * 100 - BASE_BONUS_PERCENT) / BONUS_PERCENT_PER_LEVEL,
  );
  return Math.min(
    MAX_PALACE_PRESTIGE_LEVEL,
    Math.max(MIN_PALACE_PRESTIGE_LEVEL, level),
  );
}
