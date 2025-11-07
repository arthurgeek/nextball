import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Round } from '@/domain/value-objects/Round';
import { v4 as uuidv4 } from 'uuid';

/**
 * SeasonSimulationService handles fixture generation for league seasons.
 * Uses the circle method (round-robin algorithm) for fair fixture scheduling.
 */
export class SeasonSimulationService {
  /**
   * Generate all fixtures for a complete season using round-robin algorithm.
   * Each team plays every other team twice (home and away).
   *
   * Algorithm: Circle method
   * - Fix one team, rotate others
   * - Alternate home/away in second half
   */
  generateFixtures(teams: Team[]): Round[] {
    if (teams.length < 2) {
      throw new Error('Need at least 2 teams to generate fixtures');
    }

    const rounds: Round[] = [];
    const teamCount = teams.length;
    const isEven = teamCount % 2 === 0;

    // If odd number of teams, add a "bye" (represented as null)
    const participants = isEven ? [...teams] : [...teams, null as any];
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

      if (matches.length > 0) {
        rounds.push(Round.create({ roundNumber: round + 1, matches }));
      }

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
