import { Season } from '@/domain/entities/Season';
import { League } from '@/domain/entities/League';
import { Team } from '@/domain/entities/Team';
import { MatchSimulationService } from '../services/MatchSimulationService';
import { LeagueService } from '../services/LeagueService';
import { SeasonSimulationService } from '../services/SeasonSimulationService';
import { v4 as uuidv4 } from 'uuid';

/**
 * LeagueCoordinator orchestrates complex league simulation workflows.
 * Coordinates multiple services to manage season simulation.
 */
export class LeagueCoordinator {
  constructor(
    private readonly matchSimulationService: MatchSimulationService,
    private readonly leagueService: LeagueService,
    private readonly seasonSimulationService: SeasonSimulationService
  ) {}

  /**
   * Create a new season for a league
   */
  createSeason(
    league: League,
    year: number,
    fixtureGenerationStrategy?: string
  ): Season {
    // Use fixture generation strategy from parameter or default
    const strategy = fixtureGenerationStrategy ?? 'double-round-robin';

    // Generate all fixtures for the season using the specified strategy
    const rounds = this.seasonSimulationService.generateFixtures(
      league.getTeams(),
      strategy
    );

    // Initialize standings
    const standings = this.leagueService.initializeStandings(
      league.getTeams()
    );

    return Season.create({
      id: uuidv4(),
      year,
      league,
      rounds,
      standings,
      currentRound: 0,
      fixtureGenerationStrategy: strategy,
    });
  }

  /**
   * Simulate the next round of matches.
   * Returns updated season with simulated matches and updated standings.
   */
  simulateNextRound(season: Season): Season {
    const currentRoundNumber = season.getCurrentRound() + 1;
    const round = season.getRound(currentRoundNumber);

    if (!round) {
      throw new Error('No more rounds to simulate');
    }

    if (round.isComplete()) {
      throw new Error('Round already completed');
    }

    // Simulate all matches in the round
    const simulatedMatches = round.getMatches().map((match) => {
      return this.matchSimulationService.simulate(match);
    });

    // Update the round with simulated matches
    const updatedRound = round.withMatches(simulatedMatches);

    // Update standings based on match results
    let updatedStandings = season.getStandings();
    for (const match of simulatedMatches) {
      updatedStandings = this.leagueService.updateStandingsAfterMatch(
        updatedStandings,
        match
      );
    }

    // Sort standings using the league's sorting strategy
    const sortingStrategy = season.getLeague().getSortingStrategy();
    updatedStandings = this.leagueService.sortStandings(
      updatedStandings,
      sortingStrategy
    );

    // Check for champion
    const remainingRounds = season.getTotalRounds() - currentRoundNumber;
    const championId = this.leagueService.determineChampion(
      updatedStandings,
      remainingRounds,
      sortingStrategy
    );

    // Update season
    let updatedSeason = season
      .withUpdatedRound(updatedRound)
      .withStandings(updatedStandings)
      .withCurrentRound(currentRoundNumber);

    // Set champion if determined
    if (championId && !updatedSeason.hasChampion()) {
      updatedSeason = updatedSeason.withChampion(championId);
    }

    return updatedSeason;
  }

  /**
   * Simulate all remaining rounds at once
   */
  simulateRemaining(season: Season): Season {
    let currentSeason = season;

    while (currentSeason.getCurrentRound() < currentSeason.getTotalRounds()) {
      currentSeason = this.simulateNextRound(currentSeason);
    }

    return currentSeason;
  }

  /**
   * Get the fixture for the next round (unplayed matches)
   */
  getNextFixtures(season: Season) {
    const nextRoundNumber = season.getCurrentRound() + 1;
    const nextRound = season.getRound(nextRoundNumber);
    return nextRound?.getMatches() ?? [];
  }

  /**
   * Check if season can advance (has more rounds)
   */
  canAdvance(season: Season): boolean {
    return season.getCurrentRound() < season.getTotalRounds();
  }
}
