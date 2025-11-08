import { describe, it, expect } from 'vitest';
import { League } from '@/domain/entities/League';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';

describe('League - Creation', () => {
  it('should create league with valid properties', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();

    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
      sorter,
    });

    expect(league.getId()).toBe('league-1');
    expect(league.getName()).toBe('Premier League');
    expect(league.getTeams()).toEqual(teams);
    expect(league.getSorter()).toBe(sorter);
  });

  it('should throw error when name is too short', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();

    expect(() =>
      League.create({
        id: 'league-1',
        name: 'P',
        teams,
        sorter,
      })
    ).toThrow();
  });

  it('should throw error when teams array is empty', () => {
    const sorter = new PointsGoalDifferenceSorter();

    expect(() =>
      League.create({
        id: 'league-1',
        name: 'Premier League',
        teams: [],
        sorter,
      })
    ).toThrow();
  });
});

describe('League - Immutability', () => {
  it('should return new instance with withTeams', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
      sorter,
    });

    const newTeams = [
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(85) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(70) }),
    ];
    const newLeague = league.withTeams(newTeams);

    expect(newLeague).not.toBe(league);
    expect(newLeague.getTeams()).toEqual(newTeams);
    expect(league.getTeams()).toEqual(teams); // Original unchanged
  });

  it('should return new instance with withSorter', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter1 = new PointsGoalDifferenceSorter();
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
      sorter: sorter1,
    });

    const sorter2 = new PointsGoalDifferenceSorter();
    const newLeague = league.withSorter(sorter2);

    expect(newLeague).not.toBe(league);
    expect(newLeague.getSorter()).toBe(sorter2);
    expect(league.getSorter()).toBe(sorter1); // Original unchanged
  });
});

describe('League - Getters', () => {
  it('should return correct id', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();
    const league = League.create({
      id: 'league-123',
      name: 'Premier League',
      teams,
      sorter,
    });

    expect(league.getId()).toBe('league-123');
  });

  it('should return correct name', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();
    const league = League.create({
      id: 'league-1',
      name: 'La Liga',
      teams,
      sorter,
    });

    expect(league.getName()).toBe('La Liga');
  });

  it('should return correct teams array', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
      sorter,
    });

    expect(league.getTeams()).toHaveLength(2);
    expect(league.getTeams()[0].getId()).toBe('team-1');
    expect(league.getTeams()[1].getId()).toBe('team-2');
  });

  it('should return correct sorter', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const sorter = new PointsGoalDifferenceSorter();
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
      sorter,
    });

    expect(league.getSorter()).toBe(sorter);
    expect(league.getSorter().getName()).toBe('points-goal-difference');
  });
});
