import { describe, it, expect } from 'vitest';
import { SingleRoundRobinGenerator } from '@/application/strategies/fixtures/SingleRoundRobinGenerator';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('SingleRoundRobinGenerator - getName()', () => {
  it('should return correct strategy name', () => {
    const generator = new SingleRoundRobinGenerator();
    expect(generator.getName()).toBe('single-round-robin');
  });
});

describe('SingleRoundRobinGenerator - getTotalRounds()', () => {
  const generator = new SingleRoundRobinGenerator();

  it('should calculate correct rounds for even team count', () => {
    // 4 teams = 3 rounds
    expect(generator.getTotalRounds(4)).toBe(3);

    // 10 teams = 9 rounds
    expect(generator.getTotalRounds(10)).toBe(9);

    // 20 teams = 19 rounds
    expect(generator.getTotalRounds(20)).toBe(19);
  });

  it('should calculate correct rounds for odd team count', () => {
    // 3 teams = 3 rounds (with bye weeks)
    expect(generator.getTotalRounds(3)).toBe(3);

    // 5 teams = 5 rounds (with bye weeks)
    expect(generator.getTotalRounds(5)).toBe(5);

    // 11 teams = 11 rounds (with bye weeks)
    expect(generator.getTotalRounds(11)).toBe(11);
  });

  it('should handle minimum team count', () => {
    expect(generator.getTotalRounds(2)).toBe(1);
  });
});

describe('SingleRoundRobinGenerator - generateFixtures()', () => {
  const generator = new SingleRoundRobinGenerator();

  it('should throw error for less than 2 teams', () => {
    const teams = [Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) })];

    expect(() => generator.generateFixtures(teams)).toThrow('Need at least 2 teams to generate fixtures');
  });

  it('should throw error for empty teams array', () => {
    expect(() => generator.generateFixtures([])).toThrow('Need at least 2 teams to generate fixtures');
  });

  it('should generate correct number of rounds for even teams', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // 4 teams = 3 rounds in single round-robin
    expect(rounds.length).toBe(3);
  });

  it('should generate correct number of rounds for odd teams', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // 3 teams = 3 rounds (with bye weeks)
    expect(rounds.length).toBe(3);
  });

  it('should create correct round numbers', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    rounds.forEach((round, index) => {
      expect(round.getRoundNumber()).toBe(index + 1);
    });
  });

  it('should ensure each team plays every other team exactly once', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // Track pairings
    const pairings = new Set<string>();
    let totalMatches = 0;

    rounds.forEach((round) => {
      round.getMatches().forEach((match) => {
        totalMatches++;
        const homeId = match.getHomeTeam().getId();
        const awayId = match.getAwayTeam().getId();

        // Create sorted pairing ID to check uniqueness regardless of home/away
        const pairId = [homeId, awayId].sort().join('-');
        expect(pairings.has(pairId)).toBe(false); // Should not have this pairing yet
        pairings.add(pairId);
      });
    });

    // Total matches in single round-robin: n * (n-1) / 2
    const expectedMatches = (teams.length * (teams.length - 1)) / 2;
    expect(totalMatches).toBe(expectedMatches);
    expect(pairings.size).toBe(expectedMatches);
  });

  it('should ensure each round has correct number of matches', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // With 4 teams, each round should have 2 matches
    rounds.forEach((round) => {
      expect(round.getMatches().length).toBe(2);
    });
  });

  it('should handle odd team count with bye weeks correctly', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // With 3 teams, some rounds will have only 1 match (one team has bye)
    // Total matches should be 3 (each team plays 2 others)
    let totalMatches = 0;
    rounds.forEach((round) => {
      totalMatches += round.getMatches().length;
      expect(round.getMatches().length).toBeGreaterThanOrEqual(1);
    });

    const expectedMatches = (teams.length * (teams.length - 1)) / 2;
    expect(totalMatches).toBe(expectedMatches);
  });

  it('should create matches with unique IDs', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    const matchIds = new Set<string>();
    rounds.forEach((round) => {
      round.getMatches().forEach((match) => {
        const id = match.getId();
        expect(matchIds.has(id)).toBe(false);
        matchIds.add(id);
      });
    });
  });

  it('should ensure each team plays same number of matches', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    const teamMatchCount = new Map<string, number>();

    rounds.forEach((round) => {
      round.getMatches().forEach((match) => {
        const homeId = match.getHomeTeam().getId();
        const awayId = match.getAwayTeam().getId();

        teamMatchCount.set(homeId, (teamMatchCount.get(homeId) || 0) + 1);
        teamMatchCount.set(awayId, (teamMatchCount.get(awayId) || 0) + 1);
      });
    });

    // In single round-robin, each team plays (n-1) matches
    const expectedMatchesPerTeam = teams.length - 1;
    teams.forEach((team) => {
      expect(teamMatchCount.get(team.getId())).toBe(expectedMatchesPerTeam);
    });
  });
});
