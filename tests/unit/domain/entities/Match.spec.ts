import { describe, it, expect } from 'vitest';
import { Match } from '@/domain/entities/Match';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { MatchResult } from '@/domain/value-objects/MatchResult';

describe('Match', () => {
  const createTestTeam = (id: string, name: string) => {
    return Team.create({ id, name, strength: Strength.create(75) });
  };

  describe('create', () => {
    it('should create a match with home and away teams', () => {
      const homeTeam = createTestTeam('team-1', 'Home Team');
      const awayTeam = createTestTeam('team-2', 'Away Team');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      expect(match.getId()).toBe('match-1');
      expect(match.getHomeTeam()).toBe(homeTeam);
      expect(match.getAwayTeam()).toBe(awayTeam);
    });

    it('should default isNeutralVenue to false when not specified', () => {
      const homeTeam = createTestTeam('team-1', 'Home Team');
      const awayTeam = createTestTeam('team-2', 'Away Team');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      expect(match.isNeutralVenue()).toBe(false);
    });

    it('should create a neutral venue match when specified', () => {
      const homeTeam = createTestTeam('team-1', 'Team A');
      const awayTeam = createTestTeam('team-2', 'Team B');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
        isNeutralVenue: true,
      });

      expect(match.isNeutralVenue()).toBe(true);
    });

    it('should preserve isNeutralVenue flag when adding result', () => {
      const homeTeam = createTestTeam('team-1', 'Team A');
      const awayTeam = createTestTeam('team-2', 'Team B');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
        isNeutralVenue: true,
      });

      const result = MatchResult.create({ homeGoals: 1, awayGoals: 1 });
      const updatedMatch = match.withResult(result);

      expect(updatedMatch.isNeutralVenue()).toBe(true);
      expect(updatedMatch.getResult()).toBe(result);
    });
  });

  describe('getScore', () => {
    it('should return "vs" when match has no result', () => {
      const homeTeam = createTestTeam('team-1', 'Home Team');
      const awayTeam = createTestTeam('team-2', 'Away Team');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      expect(match.getScore()).toBe('vs');
    });

    it('should return formatted score when match has result', () => {
      const homeTeam = createTestTeam('team-1', 'Home Team');
      const awayTeam = createTestTeam('team-2', 'Away Team');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      const result = MatchResult.create({ homeGoals: 3, awayGoals: 1 });
      const matchWithResult = match.withResult(result);

      expect(matchWithResult.getScore()).toBe('3-1');
    });

    it('should return formatted score for draw', () => {
      const homeTeam = createTestTeam('team-1', 'Home Team');
      const awayTeam = createTestTeam('team-2', 'Away Team');

      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      const result = MatchResult.create({ homeGoals: 2, awayGoals: 2 });
      const matchWithResult = match.withResult(result);

      expect(matchWithResult.getScore()).toBe('2-2');
    });
  });
});
