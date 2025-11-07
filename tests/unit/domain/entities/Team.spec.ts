import { describe, it, expect } from 'vitest';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('Team', () => {
  describe('create', () => {
    it('should create a valid team with name and strength', () => {
      const team = Team.create({
        id: '123',
        name: 'Manchester United',
        strength: Strength.create(85),
      });

      expect(team.getId()).toBe('123');
      expect(team.getName()).toBe('Manchester United');
      expect(team.getStrength().getValue()).toBe(85);
    });

    it('should throw error for empty name', () => {
      expect(() =>
        Team.create({
          id: '123',
          name: '',
          strength: Strength.create(85),
        })
      ).toThrow('Team name must be at least 2 characters');
    });

    it('should throw error for name with only 1 character', () => {
      expect(() =>
        Team.create({
          id: '123',
          name: 'A',
          strength: Strength.create(85),
        })
      ).toThrow('Team name must be at least 2 characters');
    });

    it('should accept 2 character name', () => {
      const team = Team.create({
        id: '123',
        name: 'FC',
        strength: Strength.create(85),
      });

      expect(team.getName()).toBe('FC');
    });
  });

  describe('withStrength', () => {
    it('should return new team with updated strength (immutable)', () => {
      const original = Team.create({
        id: '123',
        name: 'Arsenal',
        strength: Strength.create(80),
      });

      const updated = original.withStrength(Strength.create(85));

      // Original unchanged
      expect(original.getStrength().getValue()).toBe(80);
      // New instance has new strength
      expect(updated.getStrength().getValue()).toBe(85);
      // Same id and name
      expect(updated.getId()).toBe('123');
      expect(updated.getName()).toBe('Arsenal');
    });
  });
});
