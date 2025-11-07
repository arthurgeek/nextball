/**
 * Calculate base expected goals (xG) using multivariate logistic regression
 * Creates an S-curve relationship between team strength and xG
 * Treats home/away as a separate factor (not conflated with strength)
 *
 * This is more realistic than linear scaling because:
 * - Very weak teams (0-20) have very low xG (can barely create chances)
 * - Mid-range teams (40-60) show the biggest differences per strength point
 * - Elite teams (80-100) approach a realistic maximum asymptotically
 * - Home advantage is a separate additive factor in the logistic formula
 *
 * The logistic regression formula used:
 * z = strengthCoeff * strength + homeCoeff * (isHome ? 1 : 0) + intercept
 * xG = maxXG / (1 + e^(-z))
 *
 * This ensures home advantage is consistent across all strength levels
 * and doesn't interfere with the strength-to-xG relationship
 *
 * @param strength - Team strength (0-100)
 * @param isHome - Whether the team is playing at home
 * @returns Base expected goals for the team
 */
export function calculateBaseXG(strength: number, isHome: boolean = false): number {
  // Maximum xG a team can achieve (even elite teams rarely exceed 2.5 xG)
  const maxXG = 2.2;

  // Logistic regression coefficients
  // These are calibrated to produce realistic football scores
  const strengthCoeff = 0.06; // Impact of each strength point on logit
  const homeCoeff = 0.5; // Home advantage boost to logit (~0.15 boost to xG)
  const intercept = -3.0; // Baseline (centers the curve at strength ~50)

  // Minimum xG floor (even terrible teams can occasionally create chances)
  const minXG = 0.15;

  // Calculate logit (z) using multivariate logistic regression
  // z = β₁×strength + β₂×home + β₀
  const z = strengthCoeff * strength + homeCoeff * (isHome ? 1 : 0) + intercept;

  // Apply logistic function: xG = maxXG / (1 + e^(-z))
  const logisticValue = maxXG / (1 + Math.exp(-z));

  // Ensure we never go below the minimum
  return Math.max(logisticValue, minXG);
}
