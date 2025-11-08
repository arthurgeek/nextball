import { describe, it, expect, beforeEach } from 'vitest';
import { SeasonSimulationService } from '@/application/services/SeasonSimulationService';
import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { LeagueService } from '@/application/services/LeagueService';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';
import { Match } from '@/domain/entities/Match';
import { Round } from '@/domain/value-objects/Round';
import { MatchResult } from '@/domain/value-objects/MatchResult';

describe('SeasonSimulationService - Fixture Generation', () => {
  let service: SeasonSimulationService;
  let teams: Team[];

  beforeEach(() => {
    const matchSimService = new MatchSimulationService();
    const leagueService = new LeagueService();
    service = new SeasonSimulationService(matchSimService, leagueService);

    teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];
  });

  it('should generate fixtures using provided strategy', () => {
    const generator = new DoubleRoundRobinGenerator();
    const rounds = service.generateFixtures(teams, generator);

    expect(rounds.length).toBe(6); // (4-1) * 2 = 6 rounds
  });

  it('should delegate to generator strategy', () => {
    const generator = new DoubleRoundRobinGenerator();
    const rounds = service.generateFixtures(teams, generator);

    // Verify rounds are valid
    rounds.forEach((round) => {
      expect(round.getRoundNumber()).toBeGreaterThan(0);
      expect(round.getMatches().length).toBeGreaterThan(0);
    });
  });
});

describe('SeasonSimulationService - Round Management', () => {
  let service: SeasonSimulationService;
  let teams: Team[];

  beforeEach(() => {
    const matchSimService = new MatchSimulationService();
    const leagueService = new LeagueService();
    service = new SeasonSimulationService(matchSimService, leagueService);

    teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
  });

  it('should find next unplayed round', () => {
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
            result: MatchResult.create({ homeGoals: 2, awayGoals: 1 }),
          }),
        ],
      }),
      Round.create({
        roundNumber: 2,
        matches: [
          Match.create({
            id: 'match-2',
            homeTeam: teams[1],
            awayTeam: teams[0],
          }),
        ],
      }),
    ];

    const nextRound = service.getNextRound(rounds);

    expect(nextRound).toBeDefined();
    expect(nextRound!.getRoundNumber()).toBe(2);
  });

  it('should return undefined if no unplayed rounds', () => {
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
            result: MatchResult.create({ homeGoals: 2, awayGoals: 1 }),
          }),
        ],
      }),
    ];

    const nextRound = service.getNextRound(rounds);

    expect(nextRound).toBeUndefined();
  });

  it('should count remaining unplayed rounds', () => {
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
            result: MatchResult.create({ homeGoals: 2, awayGoals: 1 }),
          }),
        ],
      }),
      Round.create({
        roundNumber: 2,
        matches: [
          Match.create({
            id: 'match-2',
            homeTeam: teams[1],
            awayTeam: teams[0],
          }),
        ],
      }),
      Round.create({
        roundNumber: 3,
        matches: [
          Match.create({
            id: 'match-3',
            homeTeam: teams[0],
            awayTeam: teams[1],
          }),
        ],
      }),
    ];

    const remaining = service.countRemainingRounds(rounds);

    expect(remaining).toBe(2);
  });

  it('should return zero when no rounds remain', () => {
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
            result: MatchResult.create({ homeGoals: 2, awayGoals: 1 }),
          }),
        ],
      }),
    ];

    const remaining = service.countRemainingRounds(rounds);

    expect(remaining).toBe(0);
  });

  it('should detect when season is complete', () => {
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
            result: MatchResult.create({ homeGoals: 2, awayGoals: 1 }),
          }),
        ],
      }),
    ];

    const isComplete = service.isSeasonComplete(rounds);

    expect(isComplete).toBe(true);
  });

  it('should detect when season is not complete', () => {
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
            result: MatchResult.create({ homeGoals: 2, awayGoals: 1 }),
          }),
        ],
      }),
      Round.create({
        roundNumber: 2,
        matches: [
          Match.create({
            id: 'match-2',
            homeTeam: teams[1],
            awayTeam: teams[0],
          }),
        ],
      }),
    ];

    const isComplete = service.isSeasonComplete(rounds);

    expect(isComplete).toBe(false);
  });
});
