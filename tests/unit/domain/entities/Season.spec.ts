import { describe, it, expect } from 'vitest';
import { Season } from '@/domain/entities/Season';
import { League } from '@/domain/entities/League';
import { Team } from '@/domain/entities/Team';
import { Round } from '@/domain/value-objects/Round';
import { Match } from '@/domain/entities/Match';
import { Standing } from '@/domain/entities/Standing';
import { Strength } from '@/domain/value-objects/Strength';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';
import { PointsWinsSorter } from '@/application/strategies/standings/PointsWinsSorter';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';

describe('Season - Creation', () => {
  it('should create season with valid properties', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });

    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();

    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
          }),
        ],
      }),
    ];

    const standings = [
      Standing.create({ team: teams[0] }),
      Standing.create({ team: teams[1] }),
    ];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 0,
    });

    expect(season.getId()).toBe('season-1');
    expect(season.getLeague()).toBe(league);
    expect(season.getYear()).toBe(2025);
    expect(season.getSorter()).toBe(sorter);
    expect(season.getGenerator()).toBe(generator);
    expect(season.getRounds()).toEqual(rounds);
    expect(season.getStandings()).toEqual(standings);
    expect(season.getCurrentRound()).toBe(0);
  });

  it('should default currentRound to 0 if not provided', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    expect(season.getCurrentRound()).toBe(0);
  });

  it('should default championId to undefined if not provided', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    expect(season.getChampionId()).toBeUndefined();
  });
});

describe('Season - Immutability', () => {
  it('should return new instance with withCurrentRound', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 0,
    });

    const newSeason = season.withCurrentRound(5);

    expect(newSeason).not.toBe(season);
    expect(newSeason.getCurrentRound()).toBe(5);
    expect(season.getCurrentRound()).toBe(0); // Original unchanged
  });

  it('should return new instance with withRounds', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    const newRounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
          }),
        ],
      }),
    ];
    const newSeason = season.withRounds(newRounds);

    expect(newSeason).not.toBe(season);
    expect(newSeason.getRounds()).toEqual(newRounds);
    expect(season.getRounds()).toEqual([]); // Original unchanged
  });

  it('should return new instance with withStandings', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    const newStandings = [
      Standing.create({ team: teams[0] }),
      Standing.create({ team: teams[1] }),
    ];
    const newSeason = season.withStandings(newStandings);

    expect(newSeason).not.toBe(season);
    expect(newSeason.getStandings()).toEqual(newStandings);
    expect(season.getStandings()).toEqual(standings); // Original unchanged
  });

  it('should return new instance with withChampion', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    const newSeason = season.withChampion('team-1');

    expect(newSeason).not.toBe(season);
    expect(newSeason.getChampionId()).toBe('team-1');
    expect(season.getChampionId()).toBeUndefined(); // Original unchanged
  });

  it('should return new instance with withSorter', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    const newSorter = new PointsWinsSorter();
    const newSeason = season.withSorter(newSorter);

    expect(newSeason).not.toBe(season);
    expect(newSeason.getSorter()).toBe(newSorter);
    expect(season.getSorter()).toBe(sorter); // Original unchanged
  });

  it('should return new instance with withGenerator', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
    });

    const newGenerator = new DoubleRoundRobinGenerator();
    const newSeason = season.withGenerator(newGenerator);

    expect(newSeason).not.toBe(season);
    expect(newSeason.getGenerator()).toBe(newGenerator);
    expect(season.getGenerator()).toBe(generator); // Original unchanged
  });

  it('should advance to next round with advanceRound', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 3,
    });

    const nextSeason = season.advanceRound();

    expect(nextSeason).not.toBe(season);
    expect(nextSeason.getCurrentRound()).toBe(4);
    expect(season.getCurrentRound()).toBe(3); // Original unchanged
  });
});

describe('Season - Season Completion', () => {
  it('should detect incomplete season', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });

    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
          }),
        ],
      }),
    ];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 0,
    });

    expect(season.isComplete()).toBe(false);
  });

  it('should detect complete season without champion', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });

    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds = [
      Round.create({
        roundNumber: 1,
        matches: [
          Match.create({
            id: 'match-1',
            homeTeam: teams[0],
            awayTeam: teams[1],
          }),
        ],
      }),
    ];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 2, // With 2 teams: (2-1)*2 = 2 rounds total
    });

    expect(season.isComplete()).toBe(true);
    expect(season.getChampionId()).toBeUndefined();
  });

  it('should detect complete season with champion', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-1',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 2, // With 2 teams: (2-1)*2 = 2 rounds total
      championId: 'team-1',
    });

    expect(season.isComplete()).toBe(true);
    expect(season.getChampionId()).toBe('team-1');
  });
});

describe('Season - Getters', () => {
  it('should return all properties correctly', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });
    const sorter = new PointsGoalDifferenceSorter();
    const generator = new DoubleRoundRobinGenerator();
    const rounds: Round[] = [];
    const standings = [Standing.create({ team: teams[0] })];

    const season = Season.create({
      id: 'season-123',
      league,
      year: 2025,
      generator,
      sorter,
      rounds,
      standings,
      currentRound: 5,
      championId: 'team-1',
    });

    expect(season.getId()).toBe('season-123');
    expect(season.getLeague()).toBe(league);
    expect(season.getYear()).toBe(2025);
    expect(season.getSorter()).toBe(sorter);
    expect(season.getGenerator()).toBe(generator);
    expect(season.getRounds()).toEqual(rounds);
    expect(season.getStandings()).toEqual(standings);
    expect(season.getCurrentRound()).toBe(5);
    expect(season.getChampionId()).toBe('team-1');
  });
});
