import type { Form } from '@/domain/value-objects/Form';

/**
 * Calculate a numeric form score from recent results
 *
 * Converts Form (W/D/L results) to a score between -1.0 and 1.0
 * - Each win: +1
 * - Each draw: 0
 * - Each loss: -1
 * - Final score is averaged over number of results
 *
 * Examples:
 * - WWWWW: (5) / 5 = 1.0
 * - LLLLL: (-5) / 5 = -1.0
 * - WWWLD: (3 - 1) / 5 = 0.4
 * - No results: 0.0 (neutral)
 *
 * @param form Optional Form value object
 * @returns Numeric score from -1.0 to 1.0, or 0.0 if no form data
 */
export function calculateFormScore(form?: Form): number {
  if (!form) return 0.0; // Neutral for new seasons

  const results = form.getResults();
  if (results.length === 0) return 0.0;

  let score = 0;
  for (const result of results) {
    if (result === 'W') score += 1;
    else if (result === 'L') score -= 1;
    // 'D' adds 0
  }

  // Average over number of results
  return score / results.length;
}
