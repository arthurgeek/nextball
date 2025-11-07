import { MatchSimulationService } from '@/application/services/MatchSimulationService';

/**
 * Simple manual dependency injection container
 * Provides singleton instances of services
 */

let matchSimulationService: MatchSimulationService | null = null;

export function getMatchSimulationService(): MatchSimulationService {
  if (!matchSimulationService) {
    matchSimulationService = new MatchSimulationService();
  }
  return matchSimulationService;
}
