import { describe, it, expect } from 'vitest';
import { MatchResult } from '@/domain/value-objects/MatchResult';

describe('MatchResult', () => {
  describe('create', () => {
    it('should create a valid match result with goals', () => {
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 1 });

      expect(result.getHomeGoals()).toBe(2);
      expect(result.getAwayGoals()).toBe(1);
    });

    it('should allow 0-0 draw', () => {
      const result = MatchResult.create({ homeGoals: 0, awayGoals: 0 });

      expect(result.getHomeGoals()).toBe(0);
      expect(result.getAwayGoals()).toBe(0);
    });

    it('should throw error for negative home goals', () => {
      expect(() => MatchResult.create({ homeGoals: -1, awayGoals: 1 })).toThrow(
        'Goals must be non-negative integers'
      );
    });

    it('should throw error for negative away goals', () => {
      expect(() => MatchResult.create({ homeGoals: 1, awayGoals: -1 })).toThrow(
        'Goals must be non-negative integers'
      );
    });

    it('should throw error for non-integer goals', () => {
      expect(() => MatchResult.create({ homeGoals: 2.5, awayGoals: 1 })).toThrow(
        'Goals must be non-negative integers'
      );
    });
  });

  describe('isHomeWin', () => {
    it('should return true when home team wins', () => {
      const result = MatchResult.create({ homeGoals: 3, awayGoals: 1 });
      expect(result.isHomeWin()).toBe(true);
    });

    it('should return false for draw', () => {
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 2 });
      expect(result.isHomeWin()).toBe(false);
    });

    it('should return false when away team wins', () => {
      const result = MatchResult.create({ homeGoals: 1, awayGoals: 2 });
      expect(result.isHomeWin()).toBe(false);
    });
  });

  describe('isDraw', () => {
    it('should return true for draw', () => {
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 2 });
      expect(result.isDraw()).toBe(true);
    });

    it('should return false when home wins', () => {
      const result = MatchResult.create({ homeGoals: 3, awayGoals: 1 });
      expect(result.isDraw()).toBe(false);
    });
  });

  describe('isAwayWin', () => {
    it('should return true when away team wins', () => {
      const result = MatchResult.create({ homeGoals: 1, awayGoals: 3 });
      expect(result.isAwayWin()).toBe(true);
    });

    it('should return false when home wins', () => {
      const result = MatchResult.create({ homeGoals: 2, awayGoals: 1 });
      expect(result.isAwayWin()).toBe(false);
    });
  });
});
