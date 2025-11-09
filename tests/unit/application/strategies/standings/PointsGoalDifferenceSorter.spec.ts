import { describe, it, expect } from 'vitest';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';
import { Standing } from '@/domain/entities/Standing';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('PointsGoalDifferenceSorter - getName()', () => {
  it('should return correct strategy name', () => {
    const sorter = new PointsGoalDifferenceSorter();
    expect(sorter.getName()).toBe('points-goal-difference');
  });
});

describe('PointsGoalDifferenceSorter - Sorting Logic', () => {
  const sorter = new PointsGoalDifferenceSorter();

  it('should sort by points descending', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }), // 6 points
      Standing.create({ team: team2, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 }), // 9 points
      Standing.create({ team: team3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 3 }), // 4 points
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-2'); // 9 points
    expect(sorted[1].getTeam().getId()).toBe('team-1'); // 6 points
    expect(sorted[2].getTeam().getId()).toBe('team-3'); // 4 points
  });

  it('should use goal difference as tiebreaker when points are equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 8, goalsAgainst: 2, played: 3 }), // 6 points, +6 GD
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }), // 6 points, +2 GD
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 1, played: 3 }), // 6 points, +4 GD
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-1'); // +6 GD
    expect(sorted[1].getTeam().getId()).toBe('team-3'); // +4 GD
    expect(sorted[2].getTeam().getId()).toBe('team-2'); // +2 GD
  });

  it('should use goals for when points and goal difference are equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }), // 6 points, +2 GD, 4 GF
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 4, played: 3 }), // 6 points, +2 GD, 6 GF
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, played: 3 }), // 6 points, +2 GD, 5 GF
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
      Standing.create({ team: teamC, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }),
      Standing.create({ team: teamA, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }),
      Standing.create({ team: teamB, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }),
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getName()).toBe('Arsenal');
    expect(sorted[1].getTeam().getName()).toBe('Barcelona');
    expect(sorted[2].getTeam().getName()).toBe('Chelsea');
  });

  it('should handle teams with zero games played', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: team1 }), // 0 games played
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }), // 3 games played
    ];

    const sorted = sorter.sort(standings);

    // Team with games played should rank higher
    expect(sorted[0].getTeam().getId()).toBe('team-2');
    expect(sorted[1].getTeam().getId()).toBe('team-1');
  });

  it('should update positions correctly after sorting', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 }),
      Standing.create({ team: team2, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 3 }),
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 3 }),
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

  it('should not mutate original standings array', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: team1, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 3 }),
      Standing.create({ team: team2, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 }),
    ];

    const original = [...standings];
    sorter.sort(standings);

    expect(standings[0].getTeam().getId()).toBe(original[0].getTeam().getId());
    expect(standings[1].getTeam().getId()).toBe(original[1].getTeam().getId());
  });

  it('should handle negative goal difference correctly', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 5, played: 3 }), // 3 points, -3 GD
      Standing.create({ team: team2, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 7, played: 3 }), // 3 points, -4 GD
      Standing.create({ team: team3, won: 1, drawn: 0, lost: 2, goalsFor: 4, goalsAgainst: 6, played: 3 }), // 3 points, -2 GD
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-3'); // -2 GD (best)
    expect(sorted[1].getTeam().getId()).toBe('team-1'); // -3 GD
    expect(sorted[2].getTeam().getId()).toBe('team-2'); // -4 GD (worst)
  });

  it('should sort Premier League style scenario correctly', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Manchester City', strength: Strength.create(90) });
    const team2 = Team.create({ id: 'team-2', name: 'Arsenal', strength: Strength.create(88) });
    const team3 = Team.create({ id: 'team-3', name: 'Liverpool', strength: Strength.create(87) });
    const team4 = Team.create({ id: 'team-4', name: 'Chelsea', strength: Strength.create(85) });

    const standings = [
      Standing.create({ team: team1, won: 20, drawn: 5, lost: 3, goalsFor: 65, goalsAgainst: 25, played: 28 }), // 65 points, +40 GD
      Standing.create({ team: team2, won: 20, drawn: 5, lost: 3, goalsFor: 62, goalsAgainst: 22, played: 28 }), // 65 points, +40 GD
      Standing.create({ team: team3, won: 19, drawn: 7, lost: 2, goalsFor: 58, goalsAgainst: 20, played: 28 }), // 64 points, +38 GD
      Standing.create({ team: team4, won: 18, drawn: 8, lost: 2, goalsFor: 55, goalsAgainst: 18, played: 28 }), // 62 points, +37 GD
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getName()).toBe('Manchester City'); // 65 points, +40 GD, 65 GF
    expect(sorted[1].getTeam().getName()).toBe('Arsenal'); // 65 points, +40 GD, 62 GF
    expect(sorted[2].getTeam().getName()).toBe('Liverpool'); // 64 points
    expect(sorted[3].getTeam().getName()).toBe('Chelsea'); // 62 points
  });
});
