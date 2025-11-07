import { describe, it, expect } from 'vitest';
import { Strength } from '@/domain/value-objects/Strength';

describe('Strength', () => {
  describe('create', () => {
    it('should create a valid strength value between 0 and 100', () => {
      const strength = Strength.create(75);
      expect(strength.getValue()).toBe(75);
    });

    it('should create strength at minimum boundary (0)', () => {
      const strength = Strength.create(0);
      expect(strength.getValue()).toBe(0);
    });

    it('should create strength at maximum boundary (100)', () => {
      const strength = Strength.create(100);
      expect(strength.getValue()).toBe(100);
    });

    it('should throw error for negative strength', () => {
      expect(() => Strength.create(-1)).toThrow('Strength must be between 0 and 100');
    });

    it('should throw error for strength above 100', () => {
      expect(() => Strength.create(101)).toThrow('Strength must be between 0 and 100');
    });

    it('should throw error for non-integer strength', () => {
      expect(() => Strength.create(75.5)).toThrow('Strength must be an integer');
    });
  });

  describe('equals', () => {
    it('should return true for equal strength values', () => {
      const strength1 = Strength.create(75);
      const strength2 = Strength.create(75);
      expect(strength1.equals(strength2)).toBe(true);
    });

    it('should return false for different strength values', () => {
      const strength1 = Strength.create(75);
      const strength2 = Strength.create(80);
      expect(strength1.equals(strength2)).toBe(false);
    });
  });
});
