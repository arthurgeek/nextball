/**
 * Performance levels with their probability weights and value ranges
 */
interface PerformanceLevel {
  weight: number;
  min: number;
  max: number;
}

const PERFORMANCE_LEVELS: PerformanceLevel[] = [
  { weight: 1, min: 0.2, max: 0.6 },   // Disaster (1%)
  { weight: 10, min: 0.6, max: 0.85 },  // Poor (10%)
  { weight: 70, min: 0.85, max: 1.15 }, // Normal (70%)
  { weight: 12, min: 1.15, max: 1.4 },  // Good (12%)
  { weight: 5, min: 1.4, max: 1.8 },    // Great (5%)
  { weight: 2, min: 1.8, max: 2.3 },    // Miracle (2%)
];

/**
 * Generate a random performance modifier for a team
 * Adds realistic variance to match outcomes
 *
 * Most matches have normal performance (0.85-1.15), but occasionally
 * teams have exceptional (miracle) or terrible (disaster) performances
 *
 * Distribution:
 * - Disaster (0.2-0.6): 1% - Complete meltdown
 * - Poor (0.6-0.85): 10% - Bad day at the office
 * - Normal (0.85-1.15): 70% - Expected performance
 * - Good (1.15-1.4): 12% - Above average
 * - Great (1.4-1.8): 5% - Excellent performance
 * - Miracle (1.8-2.3): 2% - Everything clicks
 *
 * @returns Performance modifier between 0.2 and 2.3
 */
export function generatePerformanceModifier(): number {
  // Calculate total weight
  const totalWeight = PERFORMANCE_LEVELS.reduce((sum, level) => sum + level.weight, 0);

  // Pick a random value between 0 and totalWeight
  const random = Math.random() * totalWeight;

  // Find which level this random value falls into
  let cumulativeWeight = 0;
  for (const level of PERFORMANCE_LEVELS) {
    cumulativeWeight += level.weight;
    if (random < cumulativeWeight) {
      // Return a random value within this level's range
      return level.min + Math.random() * (level.max - level.min);
    }
  }

  // Fallback (should never reach here)
  return 1.0;
}
