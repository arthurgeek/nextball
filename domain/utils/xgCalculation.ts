/**
 * Calculate base expected goals (xG) using logistic regression
 * Creates an S-curve relationship between team strength and xG
 *
 * This is more realistic than linear scaling because:
 * - Very weak teams (0-20) have very low xG (can barely create chances)
 * - Mid-range teams (40-60) show the biggest differences per strength point
 * - Elite teams (80-100) approach a realistic maximum asymptotically
 *
 * The logistic function used is:
 * xG = maxXG / (1 + e^(-steepness * (strength - midpoint)))
 *
 * @param strength - Team strength (0-100)
 * @returns Base expected goals for the team
 */
export function calculateBaseXG(strength: number): number {
  // Maximum xG a team can achieve (even elite teams rarely exceed 2.5 xG)
  const maxXG = 2.2;

  // Midpoint of the curve (strength value that gives half of maxXG)
  // Setting this to 50 means a strength-50 team gets ~1.1 xG
  const midpoint = 50;

  // Steepness of the curve (higher = steeper S-curve)
  // 0.06 creates a curve with more pronounced differences in mid-to-high range
  const steepness = 0.06;

  // Minimum xG floor (even terrible teams can occasionally create chances)
  const minXG = 0.15;

  // Logistic function: f(x) = L / (1 + e^(-k(x - x0)))
  const logisticValue = maxXG / (1 + Math.exp(-steepness * (strength - midpoint)));

  // Ensure we never go below the minimum
  return Math.max(logisticValue, minXG);
}
