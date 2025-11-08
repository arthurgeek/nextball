import { describe, it, expect } from 'vitest';
import { League } from '@/domain/entities/League';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('League - Creation', () => {
  it('should create league with valid properties', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });

    expect(league.getId()).toBe('league-1');
    expect(league.getName()).toBe('Premier League');
    expect(league.getTeams()).toEqual(teams);
  });

  it('should throw error when name is too short', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];

    expect(() =>
      League.create({
        id: 'league-1',
        name: 'P',
        teams,
      })
    ).toThrow();
  });

  it('should throw error when teams array is empty', () => {
    expect(() =>
      League.create({
        id: 'league-1',
        name: 'Premier League',
        teams: [],
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
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
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
});

describe('League - Getters', () => {
  it('should return correct id', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-123',
      name: 'Premier League',
      teams,
    });

    expect(league.getId()).toBe('league-123');
  });

  it('should return correct name', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'La Liga',
      teams,
    });

    expect(league.getName()).toBe('La Liga');
  });

  it('should return correct teams array', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];
    const league = League.create({
      id: 'league-1',
      name: 'Premier League',
      teams,
    });

    expect(league.getTeams()).toHaveLength(2);
    expect(league.getTeams()[0].getId()).toBe('team-1');
    expect(league.getTeams()[1].getId()).toBe('team-2');
  });
});
