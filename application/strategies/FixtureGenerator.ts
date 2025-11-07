import { Team } from '@/domain/entities/Team';
import { Round } from '@/domain/value-objects/Round';

/**
 * Strategy interface for generating league fixtures.
 * Implementations provide different tournament formats.
 */
export interface FixtureGenerator {
  /**
   * Generate all fixtures for a tournament
   */
  generateFixtures(teams: Team[]): Round[];

  /**
   * Get the name of this fixture generation strategy
   */
  getName(): string;

  /**
   * Calculate total number of rounds for this format
   */
  getTotalRounds(teamCount: number): number;
}
