'use server';

import { v4 as uuidv4 } from 'uuid';
import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Strength } from '@/domain/value-objects/Strength';
import { League } from '@/domain/entities/League';
import {
  getMatchSimulationService,
  getLeagueCoordinator,
  getLeaguePersistenceService,
} from '@/di/container';
import type {
  SerializedSeason,
  ChampionshipRecord,
} from '@/application/services/LeaguePersistenceService';

export interface SimulateMatchInput {
  homeTeamName: string;
  homeTeamStrength: number;
  awayTeamName: string;
  awayTeamStrength: number;
}

export interface SimulateMatchOutput {
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  score: string;
  result: 'home' | 'draw' | 'away';
}

export async function simulateMatch(
  input: SimulateMatchInput
): Promise<SimulateMatchOutput> {
  // Create teams
  const homeTeam = Team.create({
    id: uuidv4(),
    name: input.homeTeamName,
    strength: Strength.create(input.homeTeamStrength),
  });

  const awayTeam = Team.create({
    id: uuidv4(),
    name: input.awayTeamName,
    strength: Strength.create(input.awayTeamStrength),
  });

  // Create match
  const match = Match.create({
    id: uuidv4(),
    homeTeam,
    awayTeam,
  });

  // Simulate
  const simulationService = getMatchSimulationService();
  const simulatedMatch = simulationService.simulate(match);

  const matchResult = simulatedMatch.getResult();
  const homeGoals = matchResult?.getHomeGoals() ?? 0;
  const awayGoals = matchResult?.getAwayGoals() ?? 0;

  let result: 'home' | 'draw' | 'away';
  if (matchResult?.isHomeWin()) {
    result = 'home';
  } else if (matchResult?.isAwayWin()) {
    result = 'away';
  } else {
    result = 'draw';
  }

  return {
    homeTeamName: input.homeTeamName,
    awayTeamName: input.awayTeamName,
    homeGoals,
    awayGoals,
    score: simulatedMatch.getScore(),
    result,
  };
}

// ============================================================================
// League Actions
// ============================================================================

/**
 * Create a new league season with default teams
 */
export async function createNewSeason(
  year: number
): Promise<SerializedSeason> {
  const coordinator = getLeagueCoordinator();
  const persistenceService = getLeaguePersistenceService();

  // Create 10 teams with varying strengths
  const teams = [
    Team.create({
      id: uuidv4(),
      name: 'Manchester City',
      strength: Strength.create(90),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Arsenal',
      strength: Strength.create(88),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Liverpool',
      strength: Strength.create(87),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Chelsea',
      strength: Strength.create(82),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Newcastle',
      strength: Strength.create(80),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Tottenham',
      strength: Strength.create(79),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Brighton',
      strength: Strength.create(75),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Aston Villa',
      strength: Strength.create(74),
    }),
    Team.create({
      id: uuidv4(),
      name: 'West Ham',
      strength: Strength.create(72),
    }),
    Team.create({
      id: uuidv4(),
      name: 'Fulham',
      strength: Strength.create(70),
    }),
  ];

  const league = League.create({
    id: uuidv4(),
    name: 'Premier League',
    teams,
  });

  const season = coordinator.createSeason(league, year);

  return persistenceService.serializeSeason(season);
}

/**
 * Simulate the next round of matches
 */
export async function simulateNextRound(
  seasonData: SerializedSeason
): Promise<SerializedSeason> {
  const coordinator = getLeagueCoordinator();
  const persistenceService = getLeaguePersistenceService();

  const season = persistenceService.deserializeSeason(seasonData);
  const updatedSeason = coordinator.simulateNextRound(season);

  // If season is complete and has a champion, save to history
  if (updatedSeason.isComplete() && updatedSeason.hasChampion()) {
    const championId = updatedSeason.getChampionId()!;
    const champion = updatedSeason
      .getLeague()
      .getTeams()
      .find((t) => t.getId() === championId);

    if (champion) {
      persistenceService.saveChampionship({
        year: updatedSeason.getYear(),
        teamId: championId,
        teamName: champion.getName(),
      });
    }
  }

  return persistenceService.serializeSeason(updatedSeason);
}

/**
 * Get championship history
 */
export async function getChampionshipHistory(): Promise<ChampionshipRecord[]> {
  const persistenceService = getLeaguePersistenceService();
  return persistenceService.getChampionshipHistory();
}

/**
 * Get championship statistics
 */
export async function getChampionshipStats(): Promise<
  Array<{
    teamId: string;
    teamName: string;
    count: number;
    years: number[];
  }>
> {
  const persistenceService = getLeaguePersistenceService();
  const stats = persistenceService.getChampionshipStats();

  return Array.from(stats.entries()).map(([teamId, data]) => ({
    teamId,
    teamName: data.teamName,
    count: data.count,
    years: data.years,
  }));
}
