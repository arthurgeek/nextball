import { describe, it, expect } from 'vitest';
import { generatePerformanceModifier } from '@/domain/utils/performanceModifier';

describe('performanceModifier', () => {
  describe('generatePerformanceModifier', () => {
    it('should return a number greater than 0', () => {
      const modifier = generatePerformanceModifier();
      expect(modifier).toBeGreaterThan(0);
    });

    it('should return different values (randomness check)', () => {
      const values = new Set();
      for (let i = 0; i < 100; i++) {
        values.add(generatePerformanceModifier());
      }
      expect(values.size).toBeGreaterThan(10);
    });

    it('should produce values in expected ranges over many samples', () => {
      const samples = 10000;
      let disaster = 0; // 0.2-0.6
      let poor = 0; // 0.6-0.85
      let normal = 0; // 0.85-1.15
      let good = 0; // 1.15-1.4
      let great = 0; // 1.4-1.8
      let miracle = 0; // 1.8-2.3

      for (let i = 0; i < samples; i++) {
        const mod = generatePerformanceModifier();

        if (mod >= 0.2 && mod < 0.6) disaster++;
        else if (mod >= 0.6 && mod < 0.85) poor++;
        else if (mod >= 0.85 && mod < 1.15) normal++;
        else if (mod >= 1.15 && mod < 1.4) good++;
        else if (mod >= 1.4 && mod < 1.8) great++;
        else if (mod >= 1.8 && mod <= 2.3) miracle++;
      }

      // Normal should be most common (~70%)
      expect(normal / samples).toBeGreaterThan(0.65);
      expect(normal / samples).toBeLessThan(0.75);

      // Good performance (~12%)
      expect(good / samples).toBeGreaterThan(0.08);
      expect(good / samples).toBeLessThan(0.16);

      // Poor performance (~10%)
      expect(poor / samples).toBeGreaterThan(0.06);
      expect(poor / samples).toBeLessThan(0.14);

      // Great performance (~5%)
      expect(great / samples).toBeGreaterThan(0.03);
      expect(great / samples).toBeLessThan(0.08);

      // Miracle (~2%)
      expect(miracle / samples).toBeGreaterThan(0.005);
      expect(miracle / samples).toBeLessThan(0.035);

      // Disaster (~1%)
      expect(disaster / samples).toBeGreaterThan(0.003);
      expect(disaster / samples).toBeLessThan(0.03);
    });

    it('should never return a value less than 0.2', () => {
      for (let i = 0; i < 1000; i++) {
        const modifier = generatePerformanceModifier();
        expect(modifier).toBeGreaterThanOrEqual(0.2);
      }
    });

    it('should never return a value greater than 2.3', () => {
      for (let i = 0; i < 1000; i++) {
        const modifier = generatePerformanceModifier();
        expect(modifier).toBeLessThanOrEqual(2.3);
      }
    });
  });
});
