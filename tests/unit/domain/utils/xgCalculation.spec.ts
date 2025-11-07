import { describe, it, expect } from 'vitest';
import { calculateBaseXG } from '@/domain/utils/xgCalculation';

describe('xgCalculation', () => {
  describe('calculateBaseXG', () => {
    it('should return a positive xG value', () => {
      const xg = calculateBaseXG(75, false);
      expect(xg).toBeGreaterThan(0);
    });

    it('should give very low xG to very weak teams', () => {
      const xg = calculateBaseXG(10, false);
      expect(xg).toBeLessThan(0.5);
    });

    it('should give moderate xG to mid-strength teams', () => {
      const xg = calculateBaseXG(50, false);
      expect(xg).toBeGreaterThan(0.8);
      expect(xg).toBeLessThan(1.8);
    });

    it('should give high xG to strong teams', () => {
      const xg = calculateBaseXG(90, false);
      expect(xg).toBeGreaterThan(1.5);
      expect(xg).toBeLessThan(2.5);
    });

    it('should give home teams higher xG than away teams', () => {
      const strength = 75;
      const homeXG = calculateBaseXG(strength, true);
      const awayXG = calculateBaseXG(strength, false);

      expect(homeXG).toBeGreaterThan(awayXG);
      // Home advantage should be meaningful (~7-20%, varies with S-curve)
      const advantage = (homeXG - awayXG) / awayXG;
      expect(advantage).toBeGreaterThan(0.06);
      expect(advantage).toBeLessThan(0.25);

      // Test mid-range teams get more advantage (steeper part of S-curve)
      const midHomeXG = calculateBaseXG(50, true);
      const midAwayXG = calculateBaseXG(50, false);
      const midAdvantage = (midHomeXG - midAwayXG) / midAwayXG;

      // Mid-strength teams should see bigger % boost
      expect(midAdvantage).toBeGreaterThan(advantage);
    });

    it('should create non-linear relationship (stronger teams have meaningful xG differences)', () => {
      const xg70 = calculateBaseXG(70, false);
      const xg80 = calculateBaseXG(80, false);
      const xg90 = calculateBaseXG(90, false);

      // Differences should be meaningful (S-curve means smaller diffs at high end)
      expect(xg80 - xg70).toBeGreaterThan(0.15);
      expect(xg90 - xg80).toBeGreaterThan(0.05);
    });

    it('should show diminishing returns at extremes (90 to 100 smaller diff than 50 to 60)', () => {
      const diff50to60 = calculateBaseXG(60, false) - calculateBaseXG(50, false);
      const diff90to100 = calculateBaseXG(100, false) - calculateBaseXG(90, false);

      // S-curve means smaller differences at extremes
      expect(diff50to60).toBeGreaterThan(diff90to100);
    });

    it('should handle boundary values', () => {
      const xg0 = calculateBaseXG(0, false);
      const xg100 = calculateBaseXG(100, false);

      expect(xg0).toBeGreaterThan(0);
      expect(xg0).toBeLessThan(0.3);
      expect(xg100).toBeGreaterThan(1.8);
      expect(xg100).toBeLessThan(2.8);
    });

    it('should produce monotonically increasing values for both home and away', () => {
      for (let strength = 0; strength < 100; strength += 10) {
        const xgCurrent = calculateBaseXG(strength, false);
        const xgNext = calculateBaseXG(strength + 10, false);
        expect(xgNext).toBeGreaterThan(xgCurrent);

        // Also test home
        const homeXgCurrent = calculateBaseXG(strength, true);
        const homeXgNext = calculateBaseXG(strength + 10, true);
        expect(homeXgNext).toBeGreaterThan(homeXgCurrent);
      }
    });
  });
});
