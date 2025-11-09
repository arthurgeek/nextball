import { describe, it, expect } from 'vitest';
import { PointsWinsSorter } from '@/application/strategies/standings/PointsWinsSorter';
import { Standing } from '@/domain/entities/Standing';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('PointsWinsSorter - getName()', () => {
  it('should return correct strategy name', () => {
    const sorter = new PointsWinsSorter();
    expect(sorter.getName()).toBe('points-wins');
  });
});

describe('PointsWinsSorter - Sorting Logic', () => {
  const sorter = new PointsWinsSorter();

  it('should sort by points per game descending', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points in 3 games = 2.0 PPG
      Standing.create({ team: team2, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 + 0 + 0 }), // 9 points in 3 games = 3.0 PPG
      Standing.create({ team: team3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 1 + 1 + 1 }), // 4 points in 3 games = 1.33 PPG
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-2'); // 3.0 PPG
    expect(sorted[1].getTeam().getId()).toBe('team-1'); // 2.0 PPG
    expect(sorted[2].getTeam().getId()).toBe('team-3'); // 1.33 PPG
  });

  it('should handle unequal games played correctly', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points in 3 games = 2.0 PPG
      Standing.create({ team: team2, won: 4, drawn: 0, lost: 0, goalsFor: 8, goalsAgainst: 2, played: 4 + 0 + 0 }), // 12 points in 4 games = 3.0 PPG
    ];

    const sorted = sorter.sort(standings);

    // Team 2 has higher PPG despite Team 1 having fewer games
    expect(sorted[0].getTeam().getId()).toBe('team-2');
    expect(sorted[1].getTeam().getId()).toBe('team-1');
  });

  it('should use total wins as tiebreaker when PPG is equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, 2 wins
      Standing.create({ team: team2, won: 1, drawn: 3, lost: 0, goalsFor: 4, goalsAgainst: 2, played: 1 + 3 + 0 }), // 6 points, 1 win
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, played: 2 + 0 + 1 }), // 6 points, 2 wins
    ];

    const sorted = sorter.sort(standings);

    // Same PPG (2.0), sorted by wins
    expect(sorted[0].getWon()).toBe(2); // team1 or team3
    expect(sorted[1].getWon()).toBe(2); // team1 or team3
    expect(sorted[2].getTeam().getId()).toBe('team-2'); // 1 win
  });

  it('should use goal difference when PPG and wins are equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 8, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, 2 wins, +6 GD
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, 2 wins, +2 GD
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 1, played: 2 + 0 + 1 }), // 6 points, 2 wins, +4 GD
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getId()).toBe('team-1'); // +6 GD
    expect(sorted[1].getTeam().getId()).toBe('team-3'); // +4 GD
    expect(sorted[2].getTeam().getId()).toBe('team-2'); // +2 GD
  });

  it('should use goals for when PPG, wins, and GD are equal', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });
    const team3 = Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) });

    const standings = [
      Standing.create({ team: team1, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 6 points, 2 wins, +2 GD, 4 GF
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 4, played: 2 + 0 + 1 }), // 6 points, 2 wins, +2 GD, 6 GF
      Standing.create({ team: team3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, played: 2 + 0 + 1 }), // 6 points, 2 wins, +2 GD, 5 GF
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
      Standing.create({ team: teamC, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }),
      Standing.create({ team: teamA, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }),
      Standing.create({ team: teamB, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }),
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
      Standing.create({ team: team2, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, played: 2 + 0 + 1 }), // 3 games played
    ];

    const sorted = sorter.sort(standings);

    // Team with games played should rank higher
    expect(sorted[0].getTeam().getId()).toBe('team-2');
    expect(sorted[1].getTeam().getId()).toBe('team-1');
  });

  it('should handle multiple teams with zero games played (PPG = 0 for both)', () => {
    const teamA = Team.create({ id: 'team-1', name: 'Arsenal', strength: Strength.create(75) });
    const teamB = Team.create({ id: 'team-2', name: 'Barcelona', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: teamB }), // 0 games played
      Standing.create({ team: teamA }), // 0 games played
    ];

    const sorted = sorter.sort(standings);

    // Both teams have 0 PPG, should sort alphabetically
    expect(sorted[0].getTeam().getName()).toBe('Arsenal');
    expect(sorted[1].getTeam().getName()).toBe('Barcelona');
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

  it('should not mutate original standings array', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: team1, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 3, played: 1 + 1 + 1 }),
      Standing.create({ team: team2, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, played: 3 + 0 + 0 }),
    ];

    const original = [...standings];
    sorter.sort(standings);

    expect(standings[0].getTeam().getId()).toBe(original[0].getTeam().getId());
    expect(standings[1].getTeam().getId()).toBe(original[1].getTeam().getId());
  });

  it('should calculate PPG correctly with draws', () => {
    const team1 = Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) });
    const team2 = Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) });

    const standings = [
      Standing.create({ team: team1, won: 0, drawn: 3, lost: 0, goalsFor: 3, goalsAgainst: 3, played: 0 + 3 + 0 }), // 3 points from 3 draws = 1.0 PPG
      Standing.create({ team: team2, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 6, played: 1 + 0 + 2 }), // 3 points from 1 win = 1.0 PPG
    ];

    const sorted = sorter.sort(standings);

    // Same PPG, but team2 has more wins
    expect(sorted[0].getTeam().getId()).toBe('team-2'); // 1 win
    expect(sorted[1].getTeam().getId()).toBe('team-1'); // 0 wins
  });

  it('should sort complex MLS-style scenario correctly', () => {
    const team1 = Team.create({ id: 'team-1', name: 'LA Galaxy', strength: Strength.create(85) });
    const team2 = Team.create({ id: 'team-2', name: 'Seattle', strength: Strength.create(83) });
    const team3 = Team.create({ id: 'team-3', name: 'Portland', strength: Strength.create(80) });
    const team4 = Team.create({ id: 'team-4', name: 'Dallas', strength: Strength.create(78) });

    const standings = [
      Standing.create({ team: team1, won: 10, drawn: 3, lost: 2, goalsFor: 35, goalsAgainst: 15, played: 10 + 3 + 2 }), // 33 points in 15 games = 2.2 PPG
      Standing.create({ team: team2, won: 9, drawn: 5, lost: 1, goalsFor: 32, goalsAgainst: 12, played: 9 + 5 + 1 }), // 32 points in 15 games = 2.13 PPG
      Standing.create({ team: team3, won: 11, drawn: 1, lost: 3, goalsFor: 38, goalsAgainst: 18, played: 11 + 1 + 3 }), // 34 points in 15 games = 2.27 PPG
      Standing.create({ team: team4, won: 9, drawn: 5, lost: 1, goalsFor: 30, goalsAgainst: 14, played: 9 + 5 + 1 }), // 32 points in 15 games = 2.13 PPG
    ];

    const sorted = sorter.sort(standings);

    expect(sorted[0].getTeam().getName()).toBe('Portland'); // 2.27 PPG
    expect(sorted[1].getTeam().getName()).toBe('LA Galaxy'); // 2.2 PPG
    // Next two have same PPG, sorted by wins then GD
    expect(sorted[2].getTeam().getName()).toBe('Seattle'); // +20 GD
    expect(sorted[3].getTeam().getName()).toBe('Dallas'); // +16 GD
  });
});
