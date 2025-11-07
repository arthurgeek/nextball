import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { LeagueService } from '@/application/services/LeagueService';
import { SeasonSimulationService } from '@/application/services/SeasonSimulationService';
import { LeaguePersistenceService } from '@/application/services/LeaguePersistenceService';
import { LeagueCoordinator } from '@/application/coordinators/LeagueCoordinator';
import {
  PremierLeagueSorter,
  LaLigaSorter,
  MLSSorter,
  type StandingSorter,
} from '@/application/strategies/StandingSorter';
import {
  RoundRobinGenerator,
  SingleRoundRobinGenerator,
  KnockoutGenerator,
  type FixtureGenerator,
} from '@/application/strategies/FixtureGenerator';

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
    standingSorters.set('premier-league', new PremierLeagueSorter());
    standingSorters.set('la-liga', new LaLigaSorter());
    standingSorters.set('mls', new MLSSorter());
  }
  return standingSorters;
}

function getFixtureGenerators(): Map<string, FixtureGenerator> {
  if (!fixtureGenerators) {
    fixtureGenerators = new Map();
    fixtureGenerators.set('round-robin', new RoundRobinGenerator());
    fixtureGenerators.set('single-round-robin', new SingleRoundRobinGenerator());
    fixtureGenerators.set('knockout', new KnockoutGenerator());
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
