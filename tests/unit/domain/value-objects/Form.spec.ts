import { describe, it, expect } from 'vitest';
import { Form, FormResult } from '@/domain/value-objects/Form';

describe('Form', () => {
  describe('create', () => {
    it('should create empty form with no results', () => {
      const form = Form.create();
      expect(form.getResults()).toEqual([]);
      expect(form.isEmpty()).toBe(true);
    });

    it('should create form with provided results', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.LOSS] });
      expect(form.getResults()).toEqual([FormResult.WIN, FormResult.DRAW, FormResult.LOSS]);
      expect(form.isEmpty()).toBe(false);
    });

    it('should trim results to last 5 when more than 5 provided', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.DRAW, FormResult.LOSS, FormResult.WIN, FormResult.DRAW, FormResult.LOSS] });
      expect(form.getResults()).toEqual([FormResult.DRAW, FormResult.LOSS, FormResult.WIN, FormResult.DRAW, FormResult.LOSS]);
      expect(form.getResults().length).toBe(5);
    });

    it('should validate results are W, D, or L', () => {
      expect(() => {
        Form.create({ results: [FormResult.WIN, 'X' as FormResult, FormResult.LOSS] });
      }).toThrow();
    });
  });

  describe('addResult', () => {
    it('should add a win to empty form', () => {
      const form = Form.create();
      const updated = form.addResult(FormResult.WIN);
      expect(updated.getResults()).toEqual([FormResult.WIN]);
    });

    it('should add a draw to existing form', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.LOSS] });
      const updated = form.addResult(FormResult.DRAW);
      expect(updated.getResults()).toEqual([FormResult.WIN, FormResult.LOSS, FormResult.DRAW]);
    });

    it('should add a loss to existing form', () => {
      const form = Form.create({ results: [FormResult.WIN] });
      const updated = form.addResult(FormResult.LOSS);
      expect(updated.getResults()).toEqual([FormResult.WIN, FormResult.LOSS]);
    });

    it('should maintain max 5 results when adding to full form', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.LOSS, FormResult.WIN, FormResult.DRAW] });
      const updated = form.addResult(FormResult.WIN);
      expect(updated.getResults()).toEqual([FormResult.DRAW, FormResult.LOSS, FormResult.WIN, FormResult.DRAW, FormResult.WIN]);
      expect(updated.getResults().length).toBe(5);
    });

    it('should validate result is W, D, or L', () => {
      const form = Form.create();
      expect(() => {
        form.addResult('X' as FormResult);
      }).toThrow();
    });

    it('should return new Form instance (immutability)', () => {
      const original = Form.create({ results: [FormResult.WIN] });
      const updated = original.addResult(FormResult.LOSS);
      expect(original.getResults()).toEqual([FormResult.WIN]);
      expect(updated.getResults()).toEqual([FormResult.WIN, FormResult.LOSS]);
    });
  });

  describe('getResults', () => {
    it('should return copy of results array', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW] });
      const results = form.getResults();
      results.push(FormResult.LOSS);
      expect(form.getResults()).toEqual([FormResult.WIN, FormResult.DRAW]);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty form', () => {
      const form = Form.create();
      expect(form.toString()).toBe('');
    });

    it('should return concatenated results', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.LOSS, FormResult.WIN, FormResult.WIN] });
      expect(form.toString()).toBe('WDLWW');
    });

    it('should handle single result', () => {
      const form = Form.create({ results: [FormResult.WIN] });
      expect(form.toString()).toBe('W');
    });
  });

  describe('getWins', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getWins()).toBe(0);
    });

    it('should count wins correctly', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.WIN, FormResult.LOSS, FormResult.WIN] });
      expect(form.getWins()).toBe(3);
    });

    it('should return 0 when no wins', () => {
      const form = Form.create({ results: [FormResult.DRAW, FormResult.LOSS, FormResult.DRAW] });
      expect(form.getWins()).toBe(0);
    });

    it('should count all wins when form is all wins', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.WIN] });
      expect(form.getWins()).toBe(5);
    });
  });

  describe('getDraws', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getDraws()).toBe(0);
    });

    it('should count draws correctly', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.WIN, FormResult.DRAW, FormResult.LOSS] });
      expect(form.getDraws()).toBe(2);
    });

    it('should return 0 when no draws', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.LOSS, FormResult.WIN] });
      expect(form.getDraws()).toBe(0);
    });

    it('should count all draws when form is all draws', () => {
      const form = Form.create({ results: [FormResult.DRAW, FormResult.DRAW, FormResult.DRAW] });
      expect(form.getDraws()).toBe(3);
    });
  });

  describe('getLosses', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getLosses()).toBe(0);
    });

    it('should count losses correctly', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.LOSS, FormResult.DRAW, FormResult.LOSS, FormResult.LOSS] });
      expect(form.getLosses()).toBe(3);
    });

    it('should return 0 when no losses', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.WIN] });
      expect(form.getLosses()).toBe(0);
    });

    it('should count all losses when form is all losses', () => {
      const form = Form.create({ results: [FormResult.LOSS, FormResult.LOSS, FormResult.LOSS, FormResult.LOSS] });
      expect(form.getLosses()).toBe(4);
    });
  });

  describe('getPoints', () => {
    it('should return 0 for empty form', () => {
      const form = Form.create();
      expect(form.getPoints()).toBe(0);
    });

    it('should calculate points correctly (W=3, D=1, L=0)', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.LOSS, FormResult.WIN, FormResult.DRAW] });
      // W=3, D=1, L=0, W=3, D=1 = 8
      expect(form.getPoints()).toBe(8);
    });

    it('should return 0 for all losses', () => {
      const form = Form.create({ results: [FormResult.LOSS, FormResult.LOSS, FormResult.LOSS] });
      expect(form.getPoints()).toBe(0);
    });

    it('should return 15 for all wins (5 * 3)', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.WIN] });
      expect(form.getPoints()).toBe(15);
    });

    it('should return 5 for all draws (5 * 1)', () => {
      const form = Form.create({ results: [FormResult.DRAW, FormResult.DRAW, FormResult.DRAW, FormResult.DRAW, FormResult.DRAW] });
      expect(form.getPoints()).toBe(5);
    });

    it('should handle single win', () => {
      const form = Form.create({ results: [FormResult.WIN] });
      expect(form.getPoints()).toBe(3);
    });

    it('should handle single draw', () => {
      const form = Form.create({ results: [FormResult.DRAW] });
      expect(form.getPoints()).toBe(1);
    });

    it('should handle single loss', () => {
      const form = Form.create({ results: [FormResult.LOSS] });
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
      const form = Form.create({ results: [FormResult.WIN] });
      expect(form.isEmpty()).toBe(false);
    });

    it('should return false for form with multiple results', () => {
      const form = Form.create({ results: [FormResult.WIN, FormResult.DRAW, FormResult.LOSS] });
      expect(form.isEmpty()).toBe(false);
    });
  });
});
