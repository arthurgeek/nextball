import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeasonOrchestrator } from '@/application/services/SeasonOrchestrator';
import { LeagueCoordinator } from '@/application/coordinators/LeagueCoordinator';
import { LeaguePersistenceService } from '@/application/services/LeaguePersistenceService';
import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { LeagueService } from '@/application/services/LeagueService';
import { SeasonSimulationService } from '@/application/services/SeasonSimulationService';
import { Team } from '@/domain/entities/Team';
import { League } from '@/domain/entities/League';
import { Strength } from '@/domain/value-objects/Strength';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';

describe('SeasonOrchestrator - Serialization Boundary', () => {
  let orchestrator: SeasonOrchestrator;
  let coordinator: LeagueCoordinator;
  let persistence: LeaguePersistenceService;
  let teams: Team[];
  let league: League;

  beforeEach(() => {
    // Mock localStorage for browser environment simulation
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };
    global.localStorage = localStorageMock as Storage;

    const matchSimService = new MatchSimulationService();
    const leagueService = new LeagueService();
    const seasonSimService = new SeasonSimulationService(matchSimService, leagueService);

    coordinator = new LeagueCoordinator(matchSimService, leagueService, seasonSimService);
    persistence = new LeaguePersistenceService();
    orchestrator = new SeasonOrchestrator(coordinator, persistence);

    teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];

    league = League.create({
      id: 'league-1',
      name: 'Test League',
      teams,
      sorter: new PointsGoalDifferenceSorter(),
    });
  });

  it('should simulate next round and return serialized season', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);
    const serialized = persistence.serializeSeason(season);

    const result = orchestrator.simulateNextRound(serialized);

    expect(result.currentRound).toBe(1);
    expect(result.year).toBe(2025);
  });

  it('should handle serialization/deserialization correctly', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);
    const serialized = persistence.serializeSeason(season);

    const result = orchestrator.simulateNextRound(serialized);

    // Verify it's still valid serialized data
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('league');
    expect(result).toHaveProperty('rounds');
    expect(result).toHaveProperty('currentRound');
  });

  it('should save championship when season is complete', () => {
    // Create spy BEFORE creating orchestrator
    const saveSpy = vi.spyOn(persistence, 'saveChampionship');

    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);
    let serialized = persistence.serializeSeason(season);

    const totalRounds = season.getRounds().length;

    // Simulate all rounds
    for (let i = 0; i < totalRounds; i++) {
      serialized = orchestrator.simulateNextRound(serialized);
    }

    // Championship should be saved after completing all rounds
    expect(saveSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2025,
        teamId: expect.any(String),
        teamName: expect.any(String),
      })
    );
  });

  it('should not save championship for incomplete season', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);
    const serialized = persistence.serializeSeason(season);

    const saveSpy = vi.spyOn(persistence, 'saveChampionship');

    // Simulate only one round
    orchestrator.simulateNextRound(serialized);

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should increment current round after simulation', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);
    let serialized = persistence.serializeSeason(season);

    expect(serialized.currentRound).toBe(0);

    serialized = orchestrator.simulateNextRound(serialized);
    expect(serialized.currentRound).toBe(1);

    serialized = orchestrator.simulateNextRound(serialized);
    expect(serialized.currentRound).toBe(2);
  });

  it('should update standings after simulating round', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);
    const serialized = persistence.serializeSeason(season);

    const result = orchestrator.simulateNextRound(serialized);

    expect(result.standings).toBeDefined();
    expect(result.standings.length).toBe(teams.length);
  });
});
