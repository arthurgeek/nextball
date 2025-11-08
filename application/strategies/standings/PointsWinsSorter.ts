import { Standing } from '@/domain/entities/Standing';
import type { StandingSorter } from './StandingSorter';

/**
 * Points-based sorting with wins as primary tiebreaker.
 * Uses points per game to handle teams with different games played.
 *
 * Tiebreaker order:
 * 1. Points per game (descending) - handles unequal games played
 * 2. Total wins (descending)
 * 3. Goal Difference (descending)
 * 4. Goals For (descending)
 * 5. Team name (alphabetical)
 *
 * Used by: MLS and some cup competitions with unbalanced schedules.
 */
export class PointsWinsSorter implements StandingSorter {
  getName(): string {
    return 'points-wins';
  }

  sort(standings: Standing[]): Standing[] {
    const sorted = [...standings].sort((a, b) => {
      // 1. Points per game
      const aPPG = a.getPlayed() > 0 ? a.getPoints() / a.getPlayed() : 0;
      const bPPG = b.getPlayed() > 0 ? b.getPoints() / b.getPlayed() : 0;
      if (aPPG !== bPPG) {
        return bPPG - aPPG;
      }

      // 2. Total wins
      if (a.getWon() !== b.getWon()) {
        return b.getWon() - a.getWon();
      }

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
