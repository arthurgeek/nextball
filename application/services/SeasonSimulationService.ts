import { Team } from '@/domain/entities/Team';
import { Round } from '@/domain/value-objects/Round';
import { FixtureGenerator } from '../strategies/fixtures/FixtureGenerator';

/**
 * SeasonSimulationService handles fixture generation for league seasons.
 * Uses the Strategy pattern for flexible tournament formats.
 * Users can provide their own FixtureGenerator implementations.
 */
export class SeasonSimulationService {
  /**
   * Generate all fixtures using the provided strategy.
   * Pass any FixtureGenerator implementation directly.
   */
  generateFixtures(teams: Team[], generator: FixtureGenerator): Round[] {
    return generator.generateFixtures(teams);
  }

  /**
   * Get the next unplayed round
   */
  getNextRound(rounds: Round[]): Round | undefined {
    return rounds.find((round) => !round.isComplete());
  }

  /**
   * Count remaining rounds
   */
  countRemainingRounds(rounds: Round[]): number {
    return rounds.filter((round) => !round.isComplete()).length;
  }

  /**
   * Check if all rounds are complete
   */
  isSeasonComplete(rounds: Round[]): boolean {
    return rounds.every((round) => round.isComplete());
  }
}
