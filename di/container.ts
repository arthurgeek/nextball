import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { LeagueService } from '@/application/services/LeagueService';
import { SeasonSimulationService } from '@/application/services/SeasonSimulationService';
import { LeaguePersistenceService } from '@/application/services/LeaguePersistenceService';
import { LeagueCoordinator } from '@/application/coordinators/LeagueCoordinator';
import { type StandingSorter } from '@/application/strategies/standings/StandingSorter';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';
import { PointsHeadToHeadSorter } from '@/application/strategies/standings/PointsHeadToHeadSorter';
import { PointsWinsSorter } from '@/application/strategies/standings/PointsWinsSorter';
import { type FixtureGenerator } from '@/application/strategies/fixtures/FixtureGenerator';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';
import { SingleRoundRobinGenerator } from '@/application/strategies/fixtures/SingleRoundRobinGenerator';

/**
 * Simple manual dependency injection container
 * Provides singleton instances of services and strategies
 */

let matchSimulationService: MatchSimulationService | null = null;
let leagueService: LeagueService | null = null;
let seasonSimulationService: SeasonSimulationService | null = null;
let leaguePersistenceService: LeaguePersistenceService | null = null;
let leagueCoordinator: LeagueCoordinator | null = null;

// Strategy instances
let standingSorters: Map<string, StandingSorter> | null = null;
let fixtureGenerators: Map<string, FixtureGenerator> | null = null;

function getStandingSorters(): Map<string, StandingSorter> {
  if (!standingSorters) {
    standingSorters = new Map();
    standingSorters.set('points-goal-difference', new PointsGoalDifferenceSorter());
    standingSorters.set('points-head-to-head', new PointsHeadToHeadSorter());
    standingSorters.set('points-wins', new PointsWinsSorter());
  }
  return standingSorters;
}

function getFixtureGenerators(): Map<string, FixtureGenerator> {
  if (!fixtureGenerators) {
    fixtureGenerators = new Map();
    fixtureGenerators.set('double-round-robin', new DoubleRoundRobinGenerator());
    fixtureGenerators.set('single-round-robin', new SingleRoundRobinGenerator());
  }
  return fixtureGenerators;
}

export function getMatchSimulationService(): MatchSimulationService {
  if (!matchSimulationService) {
    matchSimulationService = new MatchSimulationService();
  }
  return matchSimulationService;
}

export function getLeagueService(): LeagueService {
  if (!leagueService) {
    leagueService = new LeagueService(getStandingSorters());
  }
  return leagueService;
}

export function getSeasonSimulationService(): SeasonSimulationService {
  if (!seasonSimulationService) {
    seasonSimulationService = new SeasonSimulationService(getFixtureGenerators());
  }
  return seasonSimulationService;
}

export function getLeaguePersistenceService(): LeaguePersistenceService {
  if (!leaguePersistenceService) {
    leaguePersistenceService = new LeaguePersistenceService();
  }
  return leaguePersistenceService;
}

export function getLeagueCoordinator(): LeagueCoordinator {
  if (!leagueCoordinator) {
    leagueCoordinator = new LeagueCoordinator(
      getMatchSimulationService(),
      getLeagueService(),
      getSeasonSimulationService()
    );
  }
  return leagueCoordinator;
}
