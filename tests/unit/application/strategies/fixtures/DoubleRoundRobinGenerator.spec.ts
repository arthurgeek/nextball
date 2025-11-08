import { describe, it, expect } from 'vitest';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('DoubleRoundRobinGenerator - getName()', () => {
  it('should return correct strategy name', () => {
    const generator = new DoubleRoundRobinGenerator();
    expect(generator.getName()).toBe('double-round-robin');
  });
});

describe('DoubleRoundRobinGenerator - getTotalRounds()', () => {
  const generator = new DoubleRoundRobinGenerator();

  it('should calculate correct rounds for even team count', () => {
    // 4 teams = 3 * 2 = 6 rounds
    expect(generator.getTotalRounds(4)).toBe(6);

    // 10 teams = 9 * 2 = 18 rounds
    expect(generator.getTotalRounds(10)).toBe(18);

    // 20 teams = 19 * 2 = 38 rounds
    expect(generator.getTotalRounds(20)).toBe(38);
  });

  it('should calculate correct rounds for odd team count', () => {
    // 3 teams = 3 * 2 = 6 rounds (with bye weeks)
    expect(generator.getTotalRounds(3)).toBe(6);

    // 5 teams = 5 * 2 = 10 rounds (with bye weeks)
    expect(generator.getTotalRounds(5)).toBe(10);

    // 11 teams = 11 * 2 = 22 rounds (with bye weeks)
    expect(generator.getTotalRounds(11)).toBe(22);
  });

  it('should handle minimum team count', () => {
    // 2 teams = 1 * 2 = 2 rounds
    expect(generator.getTotalRounds(2)).toBe(2);
  });
});

describe('DoubleRoundRobinGenerator - generateFixtures()', () => {
  const generator = new DoubleRoundRobinGenerator();

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

    // 4 teams = 6 rounds in double round-robin
    expect(rounds.length).toBe(6);
  });

  it('should generate correct number of rounds for odd teams', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // 3 teams = 6 rounds (with bye weeks)
    expect(rounds.length).toBe(6);
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

  it('should ensure each team plays every other team exactly twice', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // Track pairings (including home/away direction)
    const homeAwayPairings = new Map<string, number>();
    let totalMatches = 0;

    rounds.forEach((round) => {
      round.getMatches().forEach((match) => {
        totalMatches++;
        const homeId = match.getHomeTeam().getId();
        const awayId = match.getAwayTeam().getId();

        // Track directional pairing
        const pairId = `${homeId}-${awayId}`;
        homeAwayPairings.set(pairId, (homeAwayPairings.get(pairId) || 0) + 1);
      });
    });

    // Total matches in double round-robin: n * (n-1)
    const expectedMatches = teams.length * (teams.length - 1);
    expect(totalMatches).toBe(expectedMatches);

    // Each directional pairing should appear exactly once
    homeAwayPairings.forEach((count) => {
      expect(count).toBe(1);
    });
  });

  it('should ensure each pairing appears once as home and once as away', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // For each pair of teams, verify one match with each as home team
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i === j) continue;

        const teamA = teams[i];
        const teamB = teams[j];

        // Find match where teamA is home and teamB is away
        let foundMatch = false;
        rounds.forEach((round) => {
          round.getMatches().forEach((match) => {
            if (
              match.getHomeTeam().getId() === teamA.getId() &&
              match.getAwayTeam().getId() === teamB.getId()
            ) {
              foundMatch = true;
            }
          });
        });

        expect(foundMatch).toBe(true);
      }
    }
  });

  it('should ensure second half rounds are reverse of first half', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    const halfWay = rounds.length / 2;

    // For each round in first half, find corresponding reversed round in second half
    for (let i = 0; i < halfWay; i++) {
      const firstHalfRound = rounds[i];
      const secondHalfRound = rounds[i + halfWay];

      const firstHalfMatches = firstHalfRound.getMatches();
      const secondHalfMatches = secondHalfRound.getMatches();

      expect(firstHalfMatches.length).toBe(secondHalfMatches.length);

      // Each match in first half should have a reversed match in second half
      firstHalfMatches.forEach((firstMatch) => {
        const homeId = firstMatch.getHomeTeam().getId();
        const awayId = firstMatch.getAwayTeam().getId();

        const reversedMatch = secondHalfMatches.find(
          (m) =>
            m.getHomeTeam().getId() === awayId &&
            m.getAwayTeam().getId() === homeId
        );

        expect(reversedMatch).toBeDefined();
      });
    }
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

    // In double round-robin, each team plays 2 * (n-1) matches
    const expectedMatchesPerTeam = 2 * (teams.length - 1);
    teams.forEach((team) => {
      expect(teamMatchCount.get(team.getId())).toBe(expectedMatchesPerTeam);
    });
  });

  it('should ensure each team has equal home and away matches', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    const teamHomeCount = new Map<string, number>();
    const teamAwayCount = new Map<string, number>();

    rounds.forEach((round) => {
      round.getMatches().forEach((match) => {
        const homeId = match.getHomeTeam().getId();
        const awayId = match.getAwayTeam().getId();

        teamHomeCount.set(homeId, (teamHomeCount.get(homeId) || 0) + 1);
        teamAwayCount.set(awayId, (teamAwayCount.get(awayId) || 0) + 1);
      });
    });

    // Each team should have equal home and away matches
    teams.forEach((team) => {
      const homeMatches = teamHomeCount.get(team.getId()) || 0;
      const awayMatches = teamAwayCount.get(team.getId()) || 0;
      expect(homeMatches).toBe(awayMatches);
      expect(homeMatches).toBe(teams.length - 1);
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
    // Total matches should be 6 (each team plays 2 others, twice = 3 * 2 = 6)
    let totalMatches = 0;
    rounds.forEach((round) => {
      totalMatches += round.getMatches().length;
      expect(round.getMatches().length).toBeGreaterThanOrEqual(1);
    });

    const expectedMatches = teams.length * (teams.length - 1);
    expect(totalMatches).toBe(expectedMatches);
  });

  it('should generate fixtures for 2 teams (minimum)', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // 2 teams = 2 rounds (home and away)
    expect(rounds.length).toBe(2);

    // Round 1: Team 1 vs Team 2
    const round1Matches = rounds[0].getMatches();
    expect(round1Matches.length).toBe(1);

    // Round 2: Team 2 vs Team 1 (reversed)
    const round2Matches = rounds[1].getMatches();
    expect(round2Matches.length).toBe(1);

    // Verify reversal
    expect(round1Matches[0].getHomeTeam().getId()).toBe(round2Matches[0].getAwayTeam().getId());
    expect(round1Matches[0].getAwayTeam().getId()).toBe(round2Matches[0].getHomeTeam().getId());
  });

  it('should ensure no team plays itself', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    rounds.forEach((round) => {
      round.getMatches().forEach((match) => {
        const homeId = match.getHomeTeam().getId();
        const awayId = match.getAwayTeam().getId();
        expect(homeId).not.toBe(awayId);
      });
    });
  });

  it('should ensure each round has balanced number of matches', () => {
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
      Team.create({ id: 'team-3', name: 'Team 3', strength: Strength.create(70) }),
      Team.create({ id: 'team-4', name: 'Team 4', strength: Strength.create(85) }),
    ];

    const rounds = generator.generateFixtures(teams);

    // With 4 teams, each round should have 2 matches
    const expectedMatchesPerRound = teams.length / 2;
    rounds.forEach((round) => {
      expect(round.getMatches().length).toBe(expectedMatchesPerRound);
    });
  });
});
