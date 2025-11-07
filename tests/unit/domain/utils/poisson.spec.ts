import { describe, it, expect } from 'vitest';
import { poissonRandom } from '@/domain/utils/poisson';

describe('poissonRandom', () => {
  it('should return a non-negative integer', () => {
    const result = poissonRandom(1.5);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should return 0 for lambda of 0', () => {
    // With lambda=0, Poisson should always return 0
    const result = poissonRandom(0);
    expect(result).toBe(0);
  });

  it('should handle small lambda values', () => {
    const result = poissonRandom(0.1);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should handle large lambda values', () => {
    const result = poissonRandom(5);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should produce values around the expected mean over many samples', () => {
    const lambda = 1.5;
    const samples = 10000;
    let sum = 0;

    for (let i = 0; i < samples; i++) {
      sum += poissonRandom(lambda);
    }

    const mean = sum / samples;

    // Mean should be close to lambda (within 10% for large sample)
    expect(mean).toBeGreaterThan(lambda * 0.9);
    expect(mean).toBeLessThan(lambda * 1.1);
  });

  it('should produce different values (randomness check)', () => {
    const values = new Set();
    for (let i = 0; i < 100; i++) {
      values.add(poissonRandom(2));
    }

    // With lambda=2, we should see multiple different values
    expect(values.size).toBeGreaterThan(1);
  });

  it('should throw error for negative lambda', () => {
    expect(() => poissonRandom(-1)).toThrow('Lambda must be non-negative');
  });
});
