import { Standing } from '@/domain/entities/Standing';

/**
 * Strategy interface for sorting league standings.
 * Allows different leagues to use different tiebreaker rules.
 */
export interface StandingSorter {
  /**
   * Sort standings according to this strategy's rules.
   * Updates positions based on sort order.
   */
  sort(standings: Standing[]): Standing[];

  /**
   * Get the name of this sorting strategy
   */
  getName(): string;
}

/**
 * Premier League sorting rules:
 * 1. Points (descending)
 * 2. Goal Difference (descending)
 * 3. Goals For (descending)
 * 4. Team name (alphabetical)
 */
export class PremierLeagueSorter implements StandingSorter {
  getName(): string {
    return 'premier-league';
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

/**
 * La Liga sorting rules:
 * 1. Points (descending)
 * 2. Head-to-head points (not implemented yet)
 * 3. Goal Difference (descending)
 * 4. Goals For (descending)
 * 5. Team name (alphabetical)
 *
 * Note: Head-to-head requires match history, simplified for now.
 */
export class LaLigaSorter implements StandingSorter {
  getName(): string {
    return 'la-liga';
  }

  sort(standings: Standing[]): Standing[] {
    // For now, same as Premier League (head-to-head requires more data)
    const sorted = [...standings].sort((a, b) => {
      // 1. Points
      if (a.getPoints() !== b.getPoints()) {
        return b.getPoints() - a.getPoints();
      }

      // 2. Head-to-head (TODO: requires match history)

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

    return sorted.map((standing, index) =>
      standing.withPosition(index + 1, standing.getPosition() || index + 1)
    );
  }
}

/**
 * MLS sorting rules:
 * 1. Points per game (to handle teams with different games played)
 * 2. Total wins
 * 3. Goal Difference
 * 4. Goals For
 * 5. Team name (alphabetical)
 */
export class MLSSorter implements StandingSorter {
  getName(): string {
    return 'mls';
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

    return sorted.map((standing, index) =>
      standing.withPosition(index + 1, standing.getPosition() || index + 1)
    );
  }
}
