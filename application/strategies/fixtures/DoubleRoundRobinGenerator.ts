import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Round } from '@/domain/value-objects/Round';
import { v4 as uuidv4 } from 'uuid';
import type { FixtureGenerator } from './FixtureGenerator';

/**
 * Double round-robin fixture generator (home and away).
 * Uses the circle method algorithm for fair scheduling.
 * Each team plays every other team twice (once at home, once away).
 *
 * Example for 10 teams:
 * - Total rounds: 18
 * - First 9 rounds: each team plays each other once
 * - Last 9 rounds: reverse fixtures (home becomes away)
 */
export class DoubleRoundRobinGenerator implements FixtureGenerator {
  getName(): string {
    return 'double-round-robin';
  }

  getTotalRounds(teamCount: number): number {
    // For even teams: (n-1) * 2 rounds
    // For odd teams: n * 2 rounds (includes bye weeks)
    const effectiveCount = teamCount % 2 === 0 ? teamCount : teamCount + 1;
    return (effectiveCount - 1) * 2;
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

    // Generate first half of season (each team plays each other once)
    for (let round = 0; round < roundsPerHalf; round++) {
      const matches: Match[] = [];

      // Generate matches for this round
      for (let i = 0; i < totalTeams / 2; i++) {
        const home = participants[i];
        const away = participants[totalTeams - 1 - i];

        // Skip if either team is null (bye week)
        if (home && away) {
          matches.push(
            Match.create({
              id: uuidv4(),
              homeTeam: home,
              awayTeam: away,
            })
          );
        }
      }

      rounds.push(Round.create({ roundNumber: round + 1, matches }));

      // Rotate teams (keep first team fixed, rotate others)
      const lastTeam = participants.pop()!;
      participants.splice(1, 0, lastTeam);
    }

    // Generate second half of season (reverse home/away)
    const firstHalfRounds = rounds.length;
    for (let round = 0; round < firstHalfRounds; round++) {
      const originalRound = rounds[round];
      const reversedMatches = originalRound.getMatches().map((match) =>
        Match.create({
          id: uuidv4(),
          homeTeam: match.getAwayTeam(), // Swap home and away
          awayTeam: match.getHomeTeam(),
        })
      );

      rounds.push(
        Round.create({
          roundNumber: firstHalfRounds + round + 1,
          matches: reversedMatches,
        })
      );
    }

    return rounds;
  }
}
