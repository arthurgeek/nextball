import { Standing } from '@/domain/entities/Standing';
import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { StandingSorter } from '../strategies/standings/StandingSorter';

/**
 * LeagueService handles league standings calculations.
 * Uses the Strategy pattern for flexible sorting rules.
 * Pure business logic - no framework dependencies.
 * Users can provide their own StandingSorter implementations.
 */
export class LeagueService {
  /**
   * Initialize standings for all teams in a league
   */
  initializeStandings(teams: Team[]): Standing[] {
    return teams.map((team) => Standing.create({ team }));
  }

  /**
   * Update standings after a match has been played
   */
  updateStandingsAfterMatch(
    standings: Standing[],
    match: Match
  ): Standing[] {
    const result = match.getResult();
    if (!result) {
      throw new Error('Cannot update standings for match without result');
    }

    const homeTeam = match.getHomeTeam();
    const awayTeam = match.getAwayTeam();
    const homeGoals = result.getHomeGoals();
    const awayGoals = result.getAwayGoals();

    // Determine form results
    let homeFormResult: 'W' | 'D' | 'L';
    let awayFormResult: 'W' | 'D' | 'L';

    if (result.isHomeWin()) {
      homeFormResult = 'W';
      awayFormResult = 'L';
    } else if (result.isDraw()) {
      homeFormResult = 'D';
      awayFormResult = 'D';
    } else {
      homeFormResult = 'L';
      awayFormResult = 'W';
    }

    // Update standings
    return standings.map((standing) => {
      const teamId = standing.getTeam().getId();

      if (teamId === homeTeam.getId()) {
        return standing.recordResult(homeGoals, awayGoals, homeFormResult);
      }

      if (teamId === awayTeam.getId()) {
        return standing.recordResult(awayGoals, homeGoals, awayFormResult);
      }

      return standing;
    });
  }

  /**
   * Sort standings using the provided strategy.
   * Pass any StandingSorter implementation directly.
   */
  sortStandings(standings: Standing[], sorter: StandingSorter): Standing[] {
    return sorter.sort(standings);
  }

  /**
   * Determine if a team has mathematically won the championship.
   * A team is champion if their points total cannot be caught by any other team.
   * When roundsRemaining = 0, always returns the leader (tiebreakers already applied).
   */
  determineChampion(
    standings: Standing[],
    roundsRemaining: number,
    sorter: StandingSorter
  ): string | undefined {
    if (standings.length === 0) return undefined;

    const sorted = this.sortStandings(standings, sorter);
    const leader = sorted[0];

    // If no rounds remaining, season is complete - leader is champion
    if (roundsRemaining === 0) {
      return leader.getTeam().getId();
    }

    const leaderPoints = leader.getPoints();

    // Maximum points any other team can get
    const maxPossiblePoints = roundsRemaining * 3;

    // Check if the leader's points are unbeatable
    for (let i = 1; i < sorted.length; i++) {
      const challenger = sorted[i];
      const challengerMaxPoints = challenger.getPoints() + maxPossiblePoints;

      // If any team can still catch the leader, no champion yet
      if (challengerMaxPoints >= leaderPoints) {
        return undefined;
      }
    }

    // Leader is mathematically the champion
    return leader.getTeam().getId();
  }

  /**
   * Get the current leader (team in 1st place)
   */
  getLeader(standings: Standing[], sorter: StandingSorter): Standing | undefined {
    const sorted = this.sortStandings(standings, sorter);
    return sorted[0];
  }

  /**
   * Find a standing by team ID
   */
  findStandingByTeamId(
    standings: Standing[],
    teamId: string
  ): Standing | undefined {
    return standings.find((s) => s.getTeam().getId() === teamId);
  }
}
