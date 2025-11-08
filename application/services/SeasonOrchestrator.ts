import { Season } from '@/domain/entities/Season';
import { LeagueCoordinator } from '../coordinators/LeagueCoordinator';
import { LeaguePersistenceService, type SerializedSeason } from './LeaguePersistenceService';

/**
 * SeasonOrchestrator handles the serialization boundary
 * between the UI layer (JSON) and the domain layer (entities).
 *
 * Orchestrates workflows across coordinator and persistence services,
 * keeping server actions thin and focused on HTTP concerns.
 */
export class SeasonOrchestrator {
  constructor(
    private readonly coordinator: LeagueCoordinator,
    private readonly persistence: LeaguePersistenceService
  ) {}

  /**
   * Simulate the next round - handles deserialization/serialization boundary
   */
  simulateNextRound(seasonData: SerializedSeason): SerializedSeason {
    // Deserialize from JSON to domain entity
    const season = this.persistence.deserializeSeason(seasonData);

    // Execute business logic
    const updatedSeason = this.coordinator.simulateNextRound(season);

    // Save championship if season complete
    this.saveChampionshipIfComplete(updatedSeason);

    // Serialize back to JSON
    return this.persistence.serializeSeason(updatedSeason);
  }

  /**
   * Save championship record if season is complete and has a champion
   */
  private saveChampionshipIfComplete(season: Season): void {
    if (season.isComplete() && season.hasChampion()) {
      const championId = season.getChampionId()!;
      const champion = season
        .getLeague()
        .getTeams()
        .find((t) => t.getId() === championId);

      if (champion) {
        this.persistence.saveChampionship({
          year: season.getYear(),
          teamId: championId,
          teamName: champion.getName(),
        });
      }
    }
  }
}
