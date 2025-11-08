import { describe, it, expect } from 'vitest';
import { Round } from '@/domain/value-objects/Round';
import { Match } from '@/domain/entities/Match';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { MatchResult } from '@/domain/value-objects/MatchResult';

describe('Round', () => {
  const createTestTeam = (id: string, name: string) => {
    return Team.create({ id, name, strength: Strength.create(75) });
  };

  describe('getMatchCount', () => {
    it('should return correct match count', () => {
      const team1 = createTestTeam('team-1', 'Team 1');
      const team2 = createTestTeam('team-2', 'Team 2');
      const team3 = createTestTeam('team-3', 'Team 3');
      const team4 = createTestTeam('team-4', 'Team 4');

      const matches = [
        Match.create({ id: 'match-1', homeTeam: team1, awayTeam: team2 }),
        Match.create({ id: 'match-2', homeTeam: team3, awayTeam: team4 }),
      ];

      const round = Round.create({ roundNumber: 1, matches });

      expect(round.getMatchCount()).toBe(2);
    });

    it('should return zero for round with no matches', () => {
      const round = Round.create({ roundNumber: 1, matches: [] });

      expect(round.getMatchCount()).toBe(0);
    });
  });

  describe('getCompletedMatchCount', () => {
    it('should return correct completed match count', () => {
      const team1 = createTestTeam('team-1', 'Team 1');
      const team2 = createTestTeam('team-2', 'Team 2');
      const team3 = createTestTeam('team-3', 'Team 3');
      const team4 = createTestTeam('team-4', 'Team 4');

      const match1 = Match.create({ id: 'match-1', homeTeam: team1, awayTeam: team2 });
      const match2 = Match.create({ id: 'match-2', homeTeam: team3, awayTeam: team4 });

      // Complete first match
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 1 });
      const completedMatch1 = match1.withResult(result);

      const matches = [completedMatch1, match2]; // 1 complete, 1 incomplete

      const round = Round.create({ roundNumber: 1, matches });

      expect(round.getCompletedMatchCount()).toBe(1);
    });

    it('should return zero when no matches are completed', () => {
      const team1 = createTestTeam('team-1', 'Team 1');
      const team2 = createTestTeam('team-2', 'Team 2');

      const match = Match.create({ id: 'match-1', homeTeam: team1, awayTeam: team2 });

      const round = Round.create({ roundNumber: 1, matches: [match] });

      expect(round.getCompletedMatchCount()).toBe(0);
    });

    it('should return total count when all matches are completed', () => {
      const team1 = createTestTeam('team-1', 'Team 1');
      const team2 = createTestTeam('team-2', 'Team 2');
      const team3 = createTestTeam('team-3', 'Team 3');
      const team4 = createTestTeam('team-4', 'Team 4');

      const match1 = Match.create({ id: 'match-1', homeTeam: team1, awayTeam: team2 });
      const match2 = Match.create({ id: 'match-2', homeTeam: team3, awayTeam: team4 });

      // Complete both matches
      const result1 = MatchResult.create({ homeGoals: 2, awayGoals: 1 });
      const result2 = MatchResult.create({ homeGoals: 0, awayGoals: 0 });
      const completedMatch1 = match1.withResult(result1);
      const completedMatch2 = match2.withResult(result2);

      const matches = [completedMatch1, completedMatch2];

      const round = Round.create({ roundNumber: 1, matches });

      expect(round.getCompletedMatchCount()).toBe(2);
    });
  });
});
