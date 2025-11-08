import { describe, it, expect } from 'vitest';
import { PointsHeadToHeadSorter } from '@/application/strategies/standings/PointsHeadToHeadSorter';
import { Standing } from '@/domain/entities/Standing';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('PointsHeadToHeadSorter - getName()', () => {
  it('should return correct strategy name', () => {
    const sorter = new PointsHeadToHeadSorter();
    expect(sorter.getName()).toBe('points-head-to-head');
  });
});

describe('PointsHeadToHeadSorter - Sorting Logic', () => {
  const sorter = new PointsHeadToHeadSorter();

  it('should sort by points descending', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 + 0 + 0 }), // 9 points
      Standing.create({ team: team2, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 1 + 1 + 1 }), // 4 points
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-1'); // 9 points
    expect(sorted[1].getTeam().getId()).toBe('team-3'); // 6 points
    expect(sorted[2].getTeam().getId()).toBe('team-2'); // 4 points
  });

  it('should use goal difference as tiebreaker when points are equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 8, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, +6 GD
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, +2 GD
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 1, played: 2 + 0 + 1 }), // 6 points, +4 GD
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-1'); // +6 GD
    expect(sorted[1].getTeam().getId()).toBe('team-3'); // +4 GD
    expect(sorted[2].getTeam().getId()).toBe('team-2'); // +2 GD
  });

  it('should use goals for as tiebreaker when points and GD are equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, +2 GD, 4 GF
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 4, played: 2 + 0 + 1 }), // 6 points, +2 GD, 6 GF
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, played: 2 + 0 + 1 }), // 6 points, +2 GD, 5 GF
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-2'); // 6 GF
    expect(sorted[1].getTeam().getId()).toBe('team-3'); // 5 GF
    expect(sorted[2].getTeam().getId()).toBe('team-1'); // 4 GF
  });

  it('should use team name alphabetically as final tiebreaker', () => {
    const teamA = Team.create({ id: 'team-1', name: 'Arsenal', strength: Strength.create(75) });
    const teamB = Team.create({ id: 'team-2', name: 'Barcelona', strength: Strength.create(80) });
    const teamC = Team.create({ id: 'team-3', name: 'Chelsea', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: teamC, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, +2 GD, 4 GF
      Standing.create({ team: teamA, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, +2 GD, 4 GF
      Standing.create({ team: teamB, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, +2 GD, 4 GF
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getName()).toBe('Arsenal');
    expect(sorted[1].getTeam().getName()).toBe('Barcelona');
    expect(sorted[2].getTeam().getName()).toBe('Chelsea');
  });

  it('should update positions correctly after sorting', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 + 0 + 0 }),
      Standing.create({ team: team2, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 1 + 1 + 1 }),
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }),
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getPosition()).toBe(1);
    expect(sorted[1].getPosition()).toBe(2);
    expect(sorted[2].getPosition()).toBe(3);
  });

  it('should handle empty standings array', () => {
    const sorted = sorter.sort([]);
    expect(sorted).toEqual([]);
  });

  it('should handle single standing', () => {
    const team = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const standings = [Standing.create({ team, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 })];

    const sorted = sorter.sort(standings);

    expect(sorted.length).toBe(1);
    expect(sorted[0].getPosition()).toBe(1);
  });

  it('should not mutate original standings array', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: team1, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 1 + 1 + 1 }),
      Standing.create({ team: team2, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 + 0 + 0 }),
    ];

    const original = [...standings];
    sorter.sort(standings);

    // Original order should be unchanged
    expect(standings[0].getTeam().getId()).toBe(original[0].getTeam().getId());
    expect(standings[1].getTeam().getId()).toBe(original[1].getTeam().getId());
  });

  it('should handle negative goal differences correctly', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 5, played: 1 + 0 + 2 }), // 3 points, -3 GD
      Standing.create({ team: team2, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 4, played: 1 + 0 + 2 }), // 3 points, -1 GD
      Standing.create({ team: team3, won: 1, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 6, played: 1 + 0 + 2 }), // 3 points, -5 GD
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-2'); // -1 GD (best)
    expect(sorted[1].getTeam().getId()).toBe('team-1'); // -3 GD
    expect(sorted[2].getTeam().getId()).toBe('team-3'); // -5 GD (worst)
  });

  it('should sort correctly with mixed scenarios', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Man City', strength: Strength.create(90) });
    const team2 = Team.create({ id: 'team-2', name: 'Liverpool', strength: Strength.create(88) });
    const team3 = Team.create({ id: 'team-3', name: 'Arsenal', strength: Strength.create(85) });
    const team4 = Team.create({ id: 'team-4', name: 'Chelsea', strength: Strength.create(82) });

    const standings = [
      Standing.create({ team: team1, won: 10, drawn: 2, lost: 0, goalsFor: 35, goalsAgainst: 8, played: 10 + 2 + 0 }),  // 32 points
      Standing.create({ team: team2, won: 10, drawn: 2, lost: 0, goalsFor: 33, goalsAgainst: 10, played: 10 + 2 + 0 }), // 32 points
      Standing.create({ team: team3, won: 9, drawn: 3, lost: 0, goalsFor: 28, goalsAgainst: 12, played: 9 + 3 + 0 }),  // 30 points
      Standing.create({ team: team4, won: 9, drawn: 3, lost: 0, goalsFor: 28, goalsAgainst: 12, played: 9 + 3 + 0 }),  // 30 points (same as Arsenal)
    ];

    const sorted = sorter.sort(standings);

    // First two have same points, sorted by GD
    expect(sorted[0].getTeam().getName()).toBe('Man City'); // +27 GD
    expect(sorted[1].getTeam().getName()).toBe('Liverpool'); // +23 GD

    // Last two have same points, same GD, sorted by name
    expect(sorted[2].getTeam().getName()).toBe('Arsenal');
    expect(sorted[3].getTeam().getName()).toBe('Chelsea');
  });
});
