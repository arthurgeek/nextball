import { Season } from '@/domain/entities/Season';
import { League } from '@/domain/entities/League';
import { Team } from '@/domain/entities/Team';
import { Standing } from '@/domain/entities/Standing';
import { Round } from '@/domain/value-objects/Round';
import { Match } from '@/domain/entities/Match';
import { MatchResult } from '@/domain/value-objects/MatchResult';
import { Strength } from '@/domain/value-objects/Strength';
import { Form, FormResult } from '@/domain/value-objects/Form';
import type { StandingSorter } from '@/application/strategies/standings/StandingSorter';
import type { FixtureGenerator } from '@/application/strategies/fixtures/FixtureGenerator';

/**
 * Championship record for a single season
 */
export interface ChampionshipRecord {
  year: number;
  teamId: string;
  teamName: string;
}

/**
 * Serialized format for persistence
 */
export interface SerializedSeason {
  id: string;
  year: number;
  league: {
    id: string;
    name: string;
    sortingStrategy: string;
    teams: {
      id: string;
      name: string;
      strength: number;
    }[];
  };
  rounds: {
    roundNumber: number;
    matches: {
      id: string;
      homeTeamId: string;
      awayTeamId: string;
      result?: {
        homeGoals: number;
        awayGoals: number;
      };
    }[];
  }[];
  standings: {
    teamId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    form: FormResult[];
    position: number;
    previousPosition: number;
  }[];
  currentRound: number;
  fixtureGenerationStrategy: string;
  championId?: string;
}

/**
 * LeaguePersistenceService handles serialization and persistence of league data.
 */
export class LeaguePersistenceService {
  constructor(
    private readonly standingSorters: Map<string, StandingSorter>,
    private readonly fixtureGenerators: Map<string, FixtureGenerator>
  ) {}
  /**
   * Serialize a season to JSON-compatible format
   */
  serializeSeason(season: Season): SerializedSeason {
    const league = season.getLeague();
    const teams = league.getTeams();

    return {
      id: season.getId(),
      year: season.getYear(),
      league: {
        id: league.getId(),
        name: league.getName(),
        sortingStrategy: league.getSorter().getName(),
        teams: teams.map((team) => ({
          id: team.getId(),
          name: team.getName(),
          strength: team.getStrength().getValue(),
        })),
      },
      rounds: season.getRounds().map((round) => ({
        roundNumber: round.getRoundNumber(),
        matches: round.getMatches().map((match) => ({
          id: match.getId(),
          homeTeamId: match.getHomeTeam().getId(),
          awayTeamId: match.getAwayTeam().getId(),
          result: match.getResult()
            ? {
                homeGoals: match.getResult()!.getHomeGoals(),
                awayGoals: match.getResult()!.getAwayGoals(),
              }
            : undefined,
        })),
      })),
      standings: season.getStandings().map((standing) => ({
        teamId: standing.getTeam().getId(),
        played: standing.getPlayed(),
        won: standing.getWon(),
        drawn: standing.getDrawn(),
        lost: standing.getLost(),
        goalsFor: standing.getGoalsFor(),
        goalsAgainst: standing.getGoalsAgainst(),
        form: standing.getForm().getResults(),
        position: standing.getPosition(),
        previousPosition: standing.getPreviousPosition(),
      })),
      currentRound: season.getCurrentRound(),
      fixtureGenerationStrategy: season.getGenerator().getName(),
      championId: season.getChampionId(),
    };
  }

  /**
   * Deserialize a season from JSON format
   */
  deserializeSeason(data: SerializedSeason): Season {
    // Reconstruct teams
    const teams = data.league.teams.map((teamData) =>
      Team.create({
        id: teamData.id,
        name: teamData.name,
        strength: Strength.create(teamData.strength),
      })
    );

    const teamMap = new Map(teams.map((team) => [team.getId(), team]));

    // Map sorting strategy string to class instance
    const sorter = this.standingSorters.get(data.league.sortingStrategy);
    if (!sorter) {
      throw new Error(
        `Unknown sorting strategy: ${data.league.sortingStrategy}`
      );
    }

    // Reconstruct league
    const league = League.create({
      id: data.league.id,
      name: data.league.name,
      teams,
      sorter,
    });

    // Reconstruct rounds with matches
    const rounds = data.rounds.map((roundData) => {
      const matches = roundData.matches.map((matchData) => {
        const homeTeam = teamMap.get(matchData.homeTeamId)!;
        const awayTeam = teamMap.get(matchData.awayTeamId)!;

        let match = Match.create({
          id: matchData.id,
          homeTeam,
          awayTeam,
        });

        if (matchData.result) {
          const result = MatchResult.create({
            homeGoals: matchData.result.homeGoals,
            awayGoals: matchData.result.awayGoals,
          });
          match = match.withResult(result);
        }

        return match;
      });

      return Round.create({
        roundNumber: roundData.roundNumber,
        matches,
      });
    });

    // Reconstruct standings
    const standings = data.standings.map((standingData) => {
      const team = teamMap.get(standingData.teamId)!;
      return Standing.create({
        team,
        played: standingData.played,
        won: standingData.won,
        drawn: standingData.drawn,
        lost: standingData.lost,
        goalsFor: standingData.goalsFor,
        goalsAgainst: standingData.goalsAgainst,
        form: Form.create({ results: standingData.form }),
        position: standingData.position,
        previousPosition: standingData.previousPosition,
      });
    });

    // Map fixture generation strategy string to class instance
    const generator = this.fixtureGenerators.get(
      data.fixtureGenerationStrategy
    );
    if (!generator) {
      throw new Error(
        `Unknown fixture generation strategy: ${data.fixtureGenerationStrategy}`
      );
    }

    return Season.create({
      id: data.id,
      year: data.year,
      league,
      generator,
      rounds,
      standings,
      currentRound: data.currentRound,
      championId: data.championId,
    });
  }

  /**
   * Save championship record
   */
  saveChampionship(record: ChampionshipRecord): void {
    if (typeof window === 'undefined') return;

    const history = this.getChampionshipHistory();
    history.push(record);
    localStorage.setItem('championship-history', JSON.stringify(history));
  }

  /**
   * Get all championship records
   */
  getChampionshipHistory(): ChampionshipRecord[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem('championship-history');
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get championship statistics (team name -> win count and years)
   */
  getChampionshipStats(): Map<
    string,
    { count: number; years: number[]; teamName: string }
  > {
    const history = this.getChampionshipHistory();
    const stats = new Map<
      string,
      { count: number; years: number[]; teamName: string }
    >();

    for (const record of history) {
      const existing = stats.get(record.teamId);
      if (existing) {
        existing.count++;
        existing.years.push(record.year);
        existing.years.sort((a, b) => b - a); // Sort descending
      } else {
        stats.set(record.teamId, {
          count: 1,
          years: [record.year],
          teamName: record.teamName,
        });
      }
    }

    return stats;
  }

  /**
   * Save current season to localStorage
   */
  saveSeason(season: Season): void {
    if (typeof window === 'undefined') return;

    const serialized = this.serializeSeason(season);
    localStorage.setItem('current-season', JSON.stringify(serialized));
  }

  /**
   * Load current season from localStorage
   */
  loadSeason(): Season | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem('current-season');
    if (!data) return null;

    try {
      const serialized = JSON.parse(data);
      return this.deserializeSeason(serialized);
    } catch (error) {
      console.error('Failed to load season:', error);
      return null;
    }
  }

  /**
   * Clear current season
   */
  clearSeason(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('current-season');
  }
}
