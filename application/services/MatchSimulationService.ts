import { Match } from '@/domain/entities/Match';
import { MatchResult } from '@/domain/value-objects/MatchResult';
import { poissonRandom } from '@/domain/utils/poisson';

/**
 * Service for simulating football matches using Poisson distribution
 * Implements realistic goal scoring based on team strength and home advantage
 */
export class MatchSimulationService {
  // Base rate: average goals per team per match (1.5 gives good score distribution)
  private readonly BASE_GOAL_RATE = 1.5;

  // Home advantage: percentage boost to expected goals for home team
  // 15% creates realistic home advantage (~45% home wins, ~28% away)
  private readonly HOME_ADVANTAGE_BOOST = 0.15;

  /**
   * Simulate a match between home and away teams
   * Uses Poisson distribution with team strength and home advantage
   *
   * @param match - Match to simulate (must have home and away teams)
   * @returns New Match instance with result
   */
  simulate(match: Match): Match {
    const homeTeam = match.getHomeTeam();
    const awayTeam = match.getAwayTeam();

    // Calculate expected goals (xG) based on team strength (0-100)
    const homeBaseXG = (homeTeam.getStrength().getValue() / 100) * this.BASE_GOAL_RATE;
    const awayBaseXG = (awayTeam.getStrength().getValue() / 100) * this.BASE_GOAL_RATE;

    // Apply home advantage boost to home team only
    const homeXG = homeBaseXG * (1 + this.HOME_ADVANTAGE_BOOST);
    const awayXG = awayBaseXG; // No boost for away team

    // Generate actual goals using Poisson distribution
    const homeGoals = poissonRandom(homeXG);
    const awayGoals = poissonRandom(awayXG);

    // Create result and return new match instance
    const result = MatchResult.create({ homeGoals, awayGoals });
    return match.withResult(result);
  }
}
