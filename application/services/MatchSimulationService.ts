import { Match } from '@/domain/entities/Match';
import { MatchResult } from '@/domain/value-objects/MatchResult';
import { poissonRandom } from '@/domain/utils/poisson';
import { generatePerformanceModifier } from '@/domain/utils/performanceModifier';
import { calculateBaseXG } from '@/domain/utils/xgCalculation';

/**
 * Service for simulating football matches using Poisson distribution
 * Implements realistic goal scoring based on:
 * - Logistic regression for xG calculation (S-curve based on team strength)
 * - Home advantage boost
 * - Performance variance (on-the-day form)
 */
export class MatchSimulationService {
  // Home advantage: percentage boost to expected goals for home team
  // 15% creates realistic home advantage (~45% home wins, ~28% away)
  private readonly HOME_ADVANTAGE_BOOST = 0.15;

  /**
   * Simulate a match between home and away teams
   * Uses Poisson distribution with:
   * - Logistic xG calculation based on team strength
   * - Home advantage boost
   * - Performance modifiers for realistic variance
   *
   * @param match - Match to simulate (must have home and away teams)
   * @returns New Match instance with result
   */
  simulate(match: Match): Match {
    const homeTeam = match.getHomeTeam();
    const awayTeam = match.getAwayTeam();

    // Calculate base expected goals (xG) using logistic regression
    // This creates an S-curve where mid-range strength differences matter more
    const homeBaseXG = calculateBaseXG(homeTeam.getStrength().getValue());
    const awayBaseXG = calculateBaseXG(awayTeam.getStrength().getValue());

    // Apply home advantage boost to home team only
    let homeXG = homeBaseXG * (1 + this.HOME_ADVANTAGE_BOOST);
    let awayXG = awayBaseXG; // No boost for away team

    // Apply performance modifiers to add variance
    // This simulates "on the day" performance - sometimes teams overperform or underperform
    const homePerformance = generatePerformanceModifier();
    const awayPerformance = generatePerformanceModifier();

    homeXG *= homePerformance;
    awayXG *= awayPerformance;

    // Generate actual goals using Poisson distribution
    const homeGoals = poissonRandom(homeXG);
    const awayGoals = poissonRandom(awayXG);

    // Create result and return new match instance
    const result = MatchResult.create({ homeGoals, awayGoals });
    return match.withResult(result);
  }
}
