import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Round } from '@/domain/value-objects/Round';
import { v4 as uuidv4 } from 'uuid';

/**
 * Strategy interface for generating league fixtures.
 * Allows different tournament formats (round-robin, knockout, groups, etc.)
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

/**
 * Round-robin (home and away) fixture generator.
 * Uses the circle method algorithm for fair scheduling.
 * Each team plays every other team twice (home and away).
 */
export class RoundRobinGenerator implements FixtureGenerator {
  getName(): string {
    return 'round-robin';
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
}

/**
 * Single round-robin (one match per pairing).
 * Each team plays every other team once.
 */
export class SingleRoundRobinGenerator implements FixtureGenerator {
  getName(): string {
    return 'single-round-robin';
  }

  getTotalRounds(teamCount: number): number {
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

    const participants = isEven ? [...teams] : [...teams, null as any];
    const totalTeams = participants.length;
    const roundsPerHalf = totalTeams - 1;

    // Generate only one half (single round-robin)
    for (let round = 0; round < roundsPerHalf; round++) {
      const matches: Match[] = [];

      for (let i = 0; i < totalTeams / 2; i++) {
        const home = participants[i];
        const away = participants[totalTeams - 1 - i];

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

      const lastTeam = participants.pop()!;
      participants.splice(1, 0, lastTeam);
    }

    return rounds;
  }
}

/**
 * Knockout tournament generator (single elimination).
 * Teams are paired in brackets, losers are eliminated.
 */
export class KnockoutGenerator implements FixtureGenerator {
  getName(): string {
    return 'knockout';
  }

  getTotalRounds(teamCount: number): number {
    // Number of rounds = log2(teamCount) rounded up
    return Math.ceil(Math.log2(teamCount));
  }

  generateFixtures(teams: Team[]): Round[] {
    if (teams.length < 2) {
      throw new Error('Need at least 2 teams for knockout');
    }

    const rounds: Round[] = [];
    let remainingTeams = [...teams];
    let roundNumber = 1;

    // Need to pad to next power of 2
    const targetSize = Math.pow(2, Math.ceil(Math.log2(teams.length)));

    // For now, just generate first round with available teams
    // Full knockout with byes would require more complex logic
    while (remainingTeams.length > 1) {
      const matches: Match[] = [];

      for (let i = 0; i < remainingTeams.length; i += 2) {
        if (i + 1 < remainingTeams.length) {
          matches.push(
            Match.create({
              id: uuidv4(),
              homeTeam: remainingTeams[i],
              awayTeam: remainingTeams[i + 1],
            })
          );
        }
      }

      if (matches.length > 0) {
        rounds.push(Round.create({ roundNumber, matches }));
      }

      // For now, just create structure - actual progression requires match results
      // This is a simplified version
      remainingTeams = remainingTeams.slice(0, Math.floor(remainingTeams.length / 2));
      roundNumber++;
    }

    return rounds;
  }
}
