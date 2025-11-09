import { Match } from '@/domain/entities/Match';
import { MatchResult } from '@/domain/value-objects/MatchResult';
import { poissonRandom } from '@/domain/utils/poisson';
import { generatePerformanceModifier } from '@/domain/utils/performanceModifier';
import { calculateBaseXG } from '@/domain/utils/xgCalculation';
import { calculateFormScore } from '@/domain/utils/formScore';
import type { Form } from '@/domain/value-objects/Form';

/**
 * Service for simulating football matches using Poisson distribution
 * Implements realistic goal scoring based on:
 * - Logistic regression for xG calculation (S-curve based on team strength)
 * - Home advantage boost
 * - Recent form impact
 * - Performance variance (on-the-day form)
 */
export class MatchSimulationService {
  /**
   * Simulate a match between home and away teams
   * Uses Poisson distribution with:
   * - Logistic xG calculation based on team strength (with home advantage baked in)
   * - Recent form as additional regression factor
   * - Performance modifiers for realistic variance
   *
   * @param match - Match to simulate (must have home and away teams)
   * @param homeForm - Recent form for home team
   * @param awayForm - Recent form for away team
   * @returns New Match instance with result
   */
  simulate(match: Match, homeForm: Form, awayForm: Form): Match {
    const homeTeam = match.getHomeTeam();
    const awayTeam = match.getAwayTeam();
    const isNeutral = match.isNeutralVenue();

    // Convert form to numeric scores for regression
    const homeFormScore = calculateFormScore(homeForm);
    const awayFormScore = calculateFormScore(awayForm);

    // Calculate expected goals (xG) using logistic regression
    // Home advantage is applied only for non-neutral venues
    // Form is included as a systematic factor in the regression
    let homeXG = calculateBaseXG(
      homeTeam.getStrength().getValue(),
      !isNeutral,
      homeFormScore
    );
    let awayXG = calculateBaseXG(
      awayTeam.getStrength().getValue(),
      false,
      awayFormScore
    );

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
