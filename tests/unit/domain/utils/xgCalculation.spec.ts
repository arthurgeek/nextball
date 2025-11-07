import { describe, it, expect } from 'vitest';
import { calculateBaseXG } from '@/domain/utils/xgCalculation';

describe('xgCalculation', () => {
  describe('calculateBaseXG', () => {
    it('should return a positive xG value', () => {
      const xg = calculateBaseXG(75);
      expect(xg).toBeGreaterThan(0);
    });

    it('should give very low xG to very weak teams', () => {
      const xg = calculateBaseXG(10);
      expect(xg).toBeLessThan(0.5);
    });

    it('should give moderate xG to mid-strength teams', () => {
      const xg = calculateBaseXG(50);
      expect(xg).toBeGreaterThan(0.8);
      expect(xg).toBeLessThan(1.8);
    });

    it('should give high xG to strong teams', () => {
      const xg = calculateBaseXG(90);
      expect(xg).toBeGreaterThan(1.5);
      expect(xg).toBeLessThan(2.5);
    });

    it('should create non-linear relationship (stronger teams have meaningful xG differences)', () => {
      const xg70 = calculateBaseXG(70);
      const xg80 = calculateBaseXG(80);
      const xg90 = calculateBaseXG(90);

      // Differences should be meaningful (S-curve means smaller diffs at high end)
      expect(xg80 - xg70).toBeGreaterThan(0.15);
      expect(xg90 - xg80).toBeGreaterThan(0.05);
    });

    it('should show diminishing returns at extremes (90 to 100 smaller diff than 50 to 60)', () => {
      const diff50to60 = calculateBaseXG(60) - calculateBaseXG(50);
      const diff90to100 = calculateBaseXG(100) - calculateBaseXG(90);

      // S-curve means smaller differences at extremes
      expect(diff50to60).toBeGreaterThan(diff90to100);
    });

    it('should handle boundary values', () => {
      const xg0 = calculateBaseXG(0);
      const xg100 = calculateBaseXG(100);

      expect(xg0).toBeGreaterThan(0);
      expect(xg0).toBeLessThan(0.3);
      expect(xg100).toBeGreaterThan(1.8);
      expect(xg100).toBeLessThan(2.8);
    });

    it('should produce monotonically increasing values', () => {
      for (let strength = 0; strength < 100; strength += 10) {
        const xgCurrent = calculateBaseXG(strength);
        const xgNext = calculateBaseXG(strength + 10);
        expect(xgNext).toBeGreaterThan(xgCurrent);
      }
    });
  });
});
