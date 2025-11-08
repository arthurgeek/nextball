import { describe, it, expect } from 'vitest';
import { calculateFormScore } from '@/domain/utils/formScore';
import { Form, FormResult } from '@/domain/value-objects/Form';

describe('calculateFormScore', () => {
  it('should return 0 when form is undefined', () => {
    const score = calculateFormScore(undefined);
    expect(score).toBe(0);
  });

  it('should return 0 when form has no results', () => {
    const form = Form.create({ results: [] });
    const score = calculateFormScore(form);
    expect(score).toBe(0);
  });

  it('should return 1.0 for perfect form (5 wins)', () => {
    const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.WIN] });
    const score = calculateFormScore(form);
    expect(score).toBe(1.0);
  });

  it('should return -1.0 for terrible form (5 losses)', () => {
    const form = Form.create({ results: [FormResult.LOSS, FormResult.LOSS, FormResult.LOSS, FormResult.LOSS, FormResult.LOSS] });
    const score = calculateFormScore(form);
    expect(score).toBe(-1.0);
  });

  it('should return 0 for neutral form (all draws)', () => {
    const form = Form.create({ results: [FormResult.DRAW, FormResult.DRAW, FormResult.DRAW, FormResult.DRAW, FormResult.DRAW] });
    const score = calculateFormScore(form);
    expect(score).toBe(0);
  });

  it('should return 0.6 for mostly winning form (3W, 2D)', () => {
    const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.DRAW, FormResult.DRAW] });
    const score = calculateFormScore(form);
    expect(score).toBe(0.6); // (3 - 0) / 5 = 0.6
  });

  it('should return -0.4 for poor form (1W, 3L, 1D)', () => {
    const form = Form.create({ results: [FormResult.WIN, FormResult.LOSS, FormResult.LOSS, FormResult.LOSS, FormResult.DRAW] });
    const score = calculateFormScore(form);
    expect(score).toBe(-0.4); // (1 - 3) / 5 = -0.4
  });

  it('should return 0.2 for good form (3W, 2L)', () => {
    const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.WIN, FormResult.LOSS, FormResult.LOSS] });
    const score = calculateFormScore(form);
    expect(score).toBe(0.2); // (3 - 2) / 5 = 0.2
  });

  it('should handle partial form (less than 5 games)', () => {
    const form = Form.create({ results: [FormResult.WIN, FormResult.WIN, FormResult.LOSS] });
    const score = calculateFormScore(form);
    expect(score).toBeCloseTo(0.333, 2); // (2 - 1) / 3 ≈ 0.333
  });

  it('should handle single result', () => {
    const form = Form.create({ results: [FormResult.WIN] });
    const score = calculateFormScore(form);
    expect(score).toBe(1.0); // 1 / 1 = 1.0
  });
});
