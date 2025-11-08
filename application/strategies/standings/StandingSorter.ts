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
