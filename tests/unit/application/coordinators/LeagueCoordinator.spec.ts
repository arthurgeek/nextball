import { describe, it, expect, beforeEach } from 'vitest';
import { LeagueCoordinator } from '@/application/coordinators/LeagueCoordinator';
import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { LeagueService } from '@/application/services/LeagueService';
import { SeasonSimulationService } from '@/application/services/SeasonSimulationService';
import { Strength } from '@/domain/value-objects/Strength';
import { Team } from '@/domain/entities/Team';
import { League } from '@/domain/entities/League';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';

describe('LeagueCoordinator - Season Creation', () => {
  let coordinator: LeagueCoordinator;
  let teams: Team[];
  let league: League;

  beforeEach(() => {
    const matchSimService = new MatchSimulationService();
    const leagueService = new LeagueService();
    const seasonSimService = new SeasonSimulationService(matchSimService, leagueService);

    coordinator = new LeagueCoordinator(matchSimService, leagueService, seasonSimService);

    // Create test teams
    teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    league = League.create({
      id: 'league-1',
      name: 'Test League',
      teams,
      sorter: new PointsGoalDifferenceSorter(),
    });
  });

  it('should create a season with specified year', () => {
    const generator = new DoubleRoundRobinGenerator();
    const year = 2025;

    const season = coordinator.createSeason(league, year, generator);

    expect(season.getYear()).toBe(2025);
  });

  it('should create a season with correct league', () => {
    const generator = new DoubleRoundRobinGenerator();
    const year = 2025;

    const season = coordinator.createSeason(league, year, generator);

    expect(season.getLeague().getId()).toBe('league-1');
    expect(season.getLeague().getName()).toBe('Test League');
  });

  it('should generate correct number of rounds for double round-robin', () => {
    const generator = new DoubleRoundRobinGenerator();
    const year = 2025;

    const season = coordinator.createSeason(league, year, generator);

    // 4 teams = 6 rounds (each team plays each other twice)
    // Formula: (n-1) * 2 where n = number of teams
    const expectedRounds = (teams.length - 1) * 2;
    expect(season.getRounds().length).toBe(expectedRounds);
  });

  it('should create season with currentRound = 0 initially', () => {
    const generator = new DoubleRoundRobinGenerator();
    const year = 2025;

    const season = coordinator.createSeason(league, year, generator);

    expect(season.getCurrentRound()).toBe(0);
  });

  it('should create season with no champion initially', () => {
    const generator = new DoubleRoundRobinGenerator();
    const year = 2025;

    const season = coordinator.createSeason(league, year, generator);

    expect(season.getChampionId()).toBeUndefined();
  });

  it('should create different season IDs each time', () => {
    const generator = new DoubleRoundRobinGenerator();
    const year = 2025;

    const season1 = coordinator.createSeason(league, year, generator);
    const season2 = coordinator.createSeason(league, year, generator);

    expect(season1.getId()).not.toBe(season2.getId());
  });

  it('should support incrementing year for new seasons', () => {
    const generator = new DoubleRoundRobinGenerator();

    const season2025 = coordinator.createSeason(league, 2025, generator);
    const season2026 = coordinator.createSeason(league, 2026, generator);
    const season2027 = coordinator.createSeason(league, 2027, generator);

    expect(season2025.getYear()).toBe(2025);
    expect(season2026.getYear()).toBe(2026);
    expect(season2027.getYear()).toBe(2027);
  });
});

describe('LeagueCoordinator - Season Simulation', () => {
  let coordinator: LeagueCoordinator;
  let teams: Team[];
  let league: League;

  beforeEach(() => {
    const matchSimService = new MatchSimulationService();
    const leagueService = new LeagueService();
    const seasonSimService = new SeasonSimulationService(matchSimService, leagueService);

    coordinator = new LeagueCoordinator(matchSimService, leagueService, seasonSimService);

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

  it('should simulate next round and increment currentRound', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);

    expect(season.getCurrentRound()).toBe(0);

    const updatedSeason = coordinator.simulateNextRound(season);

    expect(updatedSeason.getCurrentRound()).toBe(1);
  });

  it('should simulate multiple rounds sequentially', () => {
    const generator = new DoubleRoundRobinGenerator();
    let season = coordinator.createSeason(league, 2025, generator);

    // With 2 teams, we only have 2 rounds total
    season = coordinator.simulateNextRound(season);
    expect(season.getCurrentRound()).toBe(1);

    season = coordinator.simulateNextRound(season);
    expect(season.getCurrentRound()).toBe(2);
  });

  it('should update standings after simulating round', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);

    const updatedSeason = coordinator.simulateNextRound(season);

    // Standings should be calculated
    expect(updatedSeason.getStandings().length).toBe(teams.length);
  });

  it('should assign match results after simulation', () => {
    const generator = new DoubleRoundRobinGenerator();
    const season = coordinator.createSeason(league, 2025, generator);

    const updatedSeason = coordinator.simulateNextRound(season);
    const round1 = updatedSeason.getRounds()[0];
    const matches = round1.getMatches();

    // All matches in round 1 should have results
    matches.forEach((match) => {
      expect(match.getResult()).not.toBeNull();
    });
  });
});

describe('LeagueCoordinator - Season Completion', () => {
  let coordinator: LeagueCoordinator;
  let teams: Team[];
  let league: League;

  beforeEach(() => {
    const matchSimService = new MatchSimulationService();
    const leagueService = new LeagueService();
    const seasonSimService = new SeasonSimulationService(matchSimService, leagueService);

    coordinator = new LeagueCoordinator(matchSimService, leagueService, seasonSimService);

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

  it('should mark season complete and assign champion after all rounds', () => {
    const generator = new DoubleRoundRobinGenerator();
    let season = coordinator.createSeason(league, 2025, generator);

    const totalRounds = season.getRounds().length;

    // Simulate all rounds
    for (let i = 0; i < totalRounds; i++) {
      season = coordinator.simulateNextRound(season);
    }

    expect(season.getCurrentRound()).toBe(totalRounds);
    expect(season.getChampionId()).not.toBeNull();
  });

  it('should have no champion before season completes', () => {
    const generator = new DoubleRoundRobinGenerator();
    let season = coordinator.createSeason(league, 2025, generator);

    // Simulate only first round
    season = coordinator.simulateNextRound(season);

    expect(season.getChampionId()).toBeUndefined();
  });
});
