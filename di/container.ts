import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { LeagueService } from '@/application/services/LeagueService';
import { SeasonSimulationService } from '@/application/services/SeasonSimulationService';
import { LeaguePersistenceService } from '@/application/services/LeaguePersistenceService';
import { LeagueCoordinator } from '@/application/coordinators/LeagueCoordinator';

/**
 * Simple manual dependency injection container
 * Provides singleton instances of services
 */

let matchSimulationService: MatchSimulationService | null = null;
let leagueService: LeagueService | null = null;
let seasonSimulationService: SeasonSimulationService | null = null;
let leaguePersistenceService: LeaguePersistenceService | null = null;
let leagueCoordinator: LeagueCoordinator | null = null;

export function getMatchSimulationService(): MatchSimulationService {
  if (!matchSimulationService) {
    matchSimulationService = new MatchSimulationService();
  }
  return matchSimulationService;
}

export function getLeagueService(): LeagueService {
  if (!leagueService) {
    leagueService = new LeagueService();
  }
  return leagueService;
}

export function getSeasonSimulationService(): SeasonSimulationService {
  if (!seasonSimulationService) {
    seasonSimulationService = new SeasonSimulationService();
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
