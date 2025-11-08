import { describe, it, expect } from 'vitest';
import { Form } from '@/domain/value-objects/Form';

describe('Form', () => {
  describe('create', () => {
    it('should create empty form with no results', () => {
      const form = Form.create();
      expect(form.getResults()).toEqual([]);
      expect(form.isEmpty()).toBe(true);
    });

    it('should create form with provided results', () => {
      const form = Form.create({ results: ['W', 'D', 'L'] });
      expect(form.getResults()).toEqual(['W', 'D', 'L']);
      expect(form.isEmpty()).toBe(false);
    });

    it('should trim results to last 5 when more than 5 provided', () => {
      const form = Form.create({ results: ['W', 'W', 'D', 'L', 'W', 'D', 'L'] });
      expect(form.getResults()).toEqual(['D', 'L', 'W', 'D', 'L']);
      expect(form.getResults().length).toBe(5);
    });

    it('should validate results are W, D, or L', () => {
      expect(() => {
        Form.create({ results: ['W', 'X' as any, 'L'] });
      }).toThrow();
    });
  });

  describe('addResult', () => {
    it('should add a win to empty form', () => {
      const form = Form.create();
      const updated = form.addResult('W');
      expect(updated.getResults()).toEqual(['W']);
    });

    it('should add a draw to existing form', () => {
      const form = Form.create({ results: ['W', 'L'] });
      const updated = form.addResult('D');
      expect(updated.getResults()).toEqual(['W', 'L', 'D']);
    });

    it('should add a loss to existing form', () => {
      const form = Form.create({ results: ['W'] });
      const updated = form.addResult('L');
      expect(updated.getResults()).toEqual(['W', 'L']);
    });

    it('should maintain max 5 results when adding to full form', () => {
      const form = Form.create({ results: ['W', 'D', 'L', 'W', 'D'] });
      const updated = form.addResult('W');
      expect(updated.getResults()).toEqual(['D', 'L', 'W', 'D', 'W']);
      expect(updated.getResults().length).toBe(5);
    });

    it('should validate result is W, D, or L', () => {
      const form = Form.create();
      expect(() => {
        form.addResult('X' as any);
      }).toThrow();
    });

    it('should return new Form instance (immutability)', () => {
      const original = Form.create({ results: ['W'] });
      const updated = original.addResult('L');
      expect(original.getResults()).toEqual(['W']);
      expect(updated.getResults()).toEqual(['W', 'L']);
    });
  });

  describe('getResults', () => {
    it('should return copy of results array', () => {
      const form = Form.create({ results: ['W', 'D'] });
      const results = form.getResults();
      results.push('L');
      expect(form.getResults()).toEqual(['W', 'D']);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty form', () => {
      const form = Form.create();
      expect(form.toString()).toBe('');
    });

    it('should return concatenated results', () => {
      const form = Form.create({ results: ['W', 'D', 'L', 'W', 'W'] });
      expect(form.toString()).toBe('WDLWW');
    });

    it('should handle single result', () => {
      const form = Form.create({ results: ['W'] });
      expect(form.toString()).toBe('W');
    });
  });

  describe('getWins', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getWins()).toBe(0);
    });

    it('should count wins correctly', () => {
      const form = Form.create({ results: ['W', 'D', 'W', 'L', 'W'] });
      expect(form.getWins()).toBe(3);
    });

    it('should return 0 when no wins', () => {
      const form = Form.create({ results: ['D', 'L', 'D'] });
      expect(form.getWins()).toBe(0);
    });

    it('should count all wins when form is all wins', () => {
      const form = Form.create({ results: ['W', 'W', 'W', 'W', 'W'] });
      expect(form.getWins()).toBe(5);
    });
  });

  describe('getDraws', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getDraws()).toBe(0);
    });

    it('should count draws correctly', () => {
      const form = Form.create({ results: ['W', 'D', 'W', 'D', 'L'] });
      expect(form.getDraws()).toBe(2);
    });

    it('should return 0 when no draws', () => {
      const form = Form.create({ results: ['W', 'L', 'W'] });
      expect(form.getDraws()).toBe(0);
    });

    it('should count all draws when form is all draws', () => {
      const form = Form.create({ results: ['D', 'D', 'D'] });
      expect(form.getDraws()).toBe(3);
    });
  });

  describe('getLosses', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getLosses()).toBe(0);
    });

    it('should count losses correctly', () => {
      const form = Form.create({ results: ['W', 'L', 'D', 'L', 'L'] });
      expect(form.getLosses()).toBe(3);
    });

    it('should return 0 when no losses', () => {
      const form = Form.create({ results: ['W', 'D', 'W'] });
      expect(form.getLosses()).toBe(0);
    });

    it('should count all losses when form is all losses', () => {
      const form = Form.create({ results: ['L', 'L', 'L', 'L'] });
      expect(form.getLosses()).toBe(4);
    });
  });

  describe('getPoints', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getPoints()).toBe(0);
    });

    it('should calculate points correctly (W=3, D=1, L=0)', () => {
      const form = Form.create({ results: ['W', 'D', 'L', 'W', 'D'] });
      // W=3, D=1, L=0, W=3, D=1 = 8
      expect(form.getPoints()).toBe(8);
    });

    it('should return 0 for all losses', () => {
      const form = Form.create({ results: ['L', 'L', 'L'] });
      expect(form.getPoints()).toBe(0);
    });

    it('should return 15 for all wins (5 * 3)', () => {
      const form = Form.create({ results: ['W', 'W', 'W', 'W', 'W'] });
      expect(form.getPoints()).toBe(15);
    });

    it('should return 5 for all draws (5 * 1)', () => {
      const form = Form.create({ results: ['D', 'D', 'D', 'D', 'D'] });
      expect(form.getPoints()).toBe(5);
    });

    it('should handle single win', () => {
      const form = Form.create({ results: ['W'] });
      expect(form.getPoints()).toBe(3);
    });

    it('should handle single draw', () => {
      const form = Form.create({ results: ['D'] });
      expect(form.getPoints()).toBe(1);
    });

    it('should handle single loss', () => {
      const form = Form.create({ results: ['L'] });
      expect(form.getPoints()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for newly created empty form', () => {
      const form = Form.create();
      expect(form.isEmpty()).toBe(true);
    });

    it('should return true for form created with empty array', () => {
      const form = Form.create({ results: [] });
      expect(form.isEmpty()).toBe(true);
    });

    it('should return false for form with results', () => {
      const form = Form.create({ results: ['W'] });
      expect(form.isEmpty()).toBe(false);
    });

    it('should return false for form with multiple results', () => {
      const form = Form.create({ results: ['W', 'D', 'L'] });
      expect(form.isEmpty()).toBe(false);
    });
  });
});
