import { Team } from '@/domain/entities/Team';
import { Round } from '@/domain/value-objects/Round';
import { FixtureGenerator } from '../strategies/FixtureGenerator';

/**
 * SeasonSimulationService handles fixture generation for league seasons.
 * Uses the Strategy pattern for flexible tournament formats.
 */
export class SeasonSimulationService {
  constructor(private readonly generators: Map<string, FixtureGenerator>) {}

  /**
   * Generate all fixtures using the specified strategy.
   * Defaults to 'round-robin' if strategy not found.
   */
  generateFixtures(
    teams: Team[],
    strategyName: string = 'round-robin'
  ): Round[] {
    const generator = this.generators.get(strategyName);
    if (!generator) {
      throw new Error(
        `Unknown fixture generation strategy: ${strategyName}. Available: ${Array.from(this.generators.keys()).join(', ')}`
      );
    }
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
