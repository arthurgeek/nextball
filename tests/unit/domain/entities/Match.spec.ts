import { describe, it, expect } from 'vitest';
import { Match } from '@/domain/entities/Match';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { MatchResult } from '@/domain/value-objects/MatchResult';

describe('Match', () => {
  const homeTeam = Team.create({
    id: 'home-1',
    name: 'Manchester United',
    strength: Strength.create(85),
  });

  const awayTeam = Team.create({
    id: 'away-1',
    name: 'Liverpool',
    strength: Strength.create(83),
  });

  describe('create', () => {
    it('should create a match with home and away teams', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      expect(match.getId()).toBe('match-1');
      expect(match.getHomeTeam().getId()).toBe('home-1');
      expect(match.getAwayTeam().getId()).toBe('away-1');
      expect(match.getResult()).toBeUndefined();
      expect(match.hasResult()).toBe(false);
    });

    it('should create a match with a result', () => {
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 1 });
      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
        result,
      });

      expect(match.getResult()?.getHomeGoals()).toBe(2);
      expect(match.getResult()?.getAwayGoals()).toBe(1);
      expect(match.hasResult()).toBe(true);
    });
  });

  describe('withResult', () => {
    it('should return new match with result (immutable)', () => {
      const original = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      const result = MatchResult.create({ homeGoals: 3, awayGoals: 2 });
      const updated = original.withResult(result);

      // Original unchanged
      expect(original.hasResult()).toBe(false);
      expect(original.getResult()).toBeUndefined();

      // New instance has result
      expect(updated.hasResult()).toBe(true);
      expect(updated.getResult()?.getHomeGoals()).toBe(3);
      expect(updated.getResult()?.getAwayGoals()).toBe(2);

      // Same id and teams
      expect(updated.getId()).toBe('match-1');
      expect(updated.getHomeTeam()).toBe(homeTeam);
      expect(updated.getAwayTeam()).toBe(awayTeam);
    });
  });

  describe('getScore', () => {
    it('should return formatted score string when match has result', () => {
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 1 });
      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
        result,
      });

      expect(match.getScore()).toBe('2-1');
    });

    it('should return "vs" when match has no result', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam,
        awayTeam,
      });

      expect(match.getScore()).toBe('vs');
    });
  });
});
