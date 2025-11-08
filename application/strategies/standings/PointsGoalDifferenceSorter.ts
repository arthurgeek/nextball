import { Standing } from '@/domain/entities/Standing';
import type { StandingSorter } from './StandingSorter';

/**
 * Standard points-based sorting with goal difference tiebreaker.
 * Tiebreaker order:
 * 1. Points (descending)
 * 2. Goal Difference (descending)
 * 3. Goals For (descending)
 * 4. Team name (alphabetical)
 *
 * Used by: Premier League, Bundesliga, Serie A, Ligue 1, and most leagues worldwide.
 */
export class PointsGoalDifferenceSorter implements StandingSorter {
  getName(): string {
    return 'points-goal-difference';
  }

  sort(standings: Standing[]): Standing[] {
    const sorted = [...standings].sort((a, b) => {
      // 1. Points
      if (a.getPoints() !== b.getPoints()) {
        return b.getPoints() - a.getPoints();
      }

      // 2. Goal Difference
      if (a.getGoalDifference() !== b.getGoalDifference()) {
        return b.getGoalDifference() - a.getGoalDifference();
      }

      // 3. Goals For
      if (a.getGoalsFor() !== b.getGoalsFor()) {
        return b.getGoalsFor() - a.getGoalsFor();
      }

      // 4. Team name (alphabetical)
      return a.getTeam().getName().localeCompare(b.getTeam().getName());
    });

    // Update positions
    return sorted.map((standing, index) =>
      standing.withPosition(index + 1, standing.getPosition() || index + 1)
    );
  }
}
