import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Round } from '@/domain/value-objects/Round';
import { v4 as uuidv4 } from 'uuid';
import type { FixtureGenerator } from './FixtureGenerator';

/**
 * Single round-robin fixture generator.
 * Each team plays every other team once on neutral grounds.
 * Uses the circle method algorithm for fair scheduling.
 *
 * Note: Matches are created with home/away designations for structural purposes,
 * but should be played on neutral venues (no home advantage in simulation).
 *
 * Example for 10 teams:
 * - Total rounds: 9
 * - Each team plays 9 matches (one against each opponent)
 */
export class SingleRoundRobinGenerator implements FixtureGenerator {
  getName(): string {
    return 'single-round-robin';
  }

  getTotalRounds(teamCount: number): number {
    // For even teams: n-1 rounds
    // For odd teams: n rounds (includes bye weeks)
    const effectiveCount = teamCount % 2 === 0 ? teamCount : teamCount + 1;
    return effectiveCount - 1;
  }

  generateFixtures(teams: Team[]): Round[] {
    if (teams.length < 2) {
      throw new Error('Need at least 2 teams to generate fixtures');
    }

    const rounds: Round[] = [];
    const teamCount = teams.length;
    const isEven = teamCount % 2 === 0;

    // If odd number of teams, add a "bye" (represented as null)
    const participants: Array<Team | null> = isEven ? [...teams] : [...teams, null];
    const totalTeams = participants.length;
    const roundsPerHalf = totalTeams - 1;

    // Generate single round-robin using circle method
    for (let round = 0; round < roundsPerHalf; round++) {
      const matches: Match[] = [];

      // Generate matches for this round
      for (let i = 0; i < totalTeams / 2; i++) {
        const home = participants[i];
        const away = participants[totalTeams - 1 - i];

        // Skip if either team is null (bye week)
        if (home && away) {
          // Single round robin uses neutral venues (no home advantage)
          matches.push(
            Match.create({
              id: uuidv4(),
              homeTeam: home,
              awayTeam: away,
              isNeutralVenue: true,
            })
          );
        }
      }

      rounds.push(Round.create({ roundNumber: round + 1, matches }));

      // Rotate teams (keep first team fixed, rotate others)
      const lastTeam = participants.pop()!;
      participants.splice(1, 0, lastTeam);
    }

    return rounds;
  }
}
