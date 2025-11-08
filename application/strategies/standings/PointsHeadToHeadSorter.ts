import { Standing } from '@/domain/entities/Standing';
import type { StandingSorter } from './StandingSorter';

/**
 * Points-based sorting with head-to-head as primary tiebreaker.
 * Tiebreaker order:
 * 1. Points (descending)
 * 2. Head-to-head points (NOT IMPLEMENTED - requires match history)
 * 3. Goal Difference (descending)
 * 4. Goals For (descending)
 * 5. Team name (alphabetical)
 *
 * Used by: La Liga, Serie A (in some cases), and some other leagues.
 *
 * NOTE: Head-to-head tiebreaker requires access to match results between tied teams.
 * Currently simplified to use standard goal difference tiebreaker.
 * TODO: Implement head-to-head calculation when match history is available.
 */
export class PointsHeadToHeadSorter implements StandingSorter {
  getName(): string {
    return 'points-head-to-head';
  }

  sort(standings: Standing[]): Standing[] {
    // For now, same as PointsGoalDifferenceSorter
    // Full implementation requires match history to calculate head-to-head records
    const sorted = [...standings].sort((a, b) => {
      // 1. Points
      if (a.getPoints() !== b.getPoints()) {
        return b.getPoints() - a.getPoints();
      }

      // 2. Head-to-head (TODO: requires match history)
      // Would need to:
      // - Identify tied teams
      // - Extract matches between those teams
      // - Calculate mini-table of just those teams
      // - Use mini-table points to break tie

      // 3. Goal Difference
      if (a.getGoalDifference() !== b.getGoalDifference()) {
        return b.getGoalDifference() - a.getGoalDifference();
      }

      // 4. Goals For
      if (a.getGoalsFor() !== b.getGoalsFor()) {
        return b.getGoalsFor() - a.getGoalsFor();
      }

      // 5. Team name (alphabetical)
      return a.getTeam().getName().localeCompare(b.getTeam().getName());
    });

    // Update positions
    return sorted.map((standing, index) =>
      standing.withPosition(index + 1, standing.getPosition() || index + 1)
    );
  }
}
