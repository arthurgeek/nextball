import type { StandingSorter } from './strategies/standings/StandingSorter';
import type { FixtureGenerator } from './strategies/fixtures/FixtureGenerator';
import { PointsGoalDifferenceSorter } from './strategies/standings/PointsGoalDifferenceSorter';
import { PointsHeadToHeadSorter } from './strategies/standings/PointsHeadToHeadSorter';
import { PointsWinsSorter } from './strategies/standings/PointsWinsSorter';
import { DoubleRoundRobinGenerator } from './strategies/fixtures/DoubleRoundRobinGenerator';
import { SingleRoundRobinGenerator } from './strategies/fixtures/SingleRoundRobinGenerator';

export interface StrategyListItem {
  name: string;
  displayName: string;
}

/**
 * Global registry for strategy implementations.
 * Allows users to register custom strategies without modifying our code.
 *
 * Example usage:
 * ```typescript
 * import { StrategyRegistry } from '@/application/StrategyRegistry';
 * import { MyCustomSorter } from './MyCustomSorter';
 *
 * StrategyRegistry.registerSorter('my-custom-sorter', MyCustomSorter);
 * ```
 */
class StrategyRegistryClass {
  private sorters = new Map<string, new () => StandingSorter>();
  private generators = new Map<string, new () => FixtureGenerator>();

  constructor() {
    // Register built-in strategies
    this.registerSorter('points-goal-difference', PointsGoalDifferenceSorter);
    this.registerSorter('points-head-to-head', PointsHeadToHeadSorter);
    this.registerSorter('points-wins', PointsWinsSorter);

    this.registerGenerator('double-round-robin', DoubleRoundRobinGenerator);
    this.registerGenerator('single-round-robin', SingleRoundRobinGenerator);
  }

  /**
   * Convert kebab-case to Title Case for display names.
   * Example: "points-goal-difference" → "Points Goal Difference"
   */
  private toDisplayName(kebabCase: string): string {
    return kebabCase
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Register a custom standing sorter.
   * Users can call this to add their own sorters.
   */
  registerSorter(name: string, SorterClass: new () => StandingSorter): void {
    this.sorters.set(name, SorterClass);
  }

  /**
   * Register a custom fixture generator.
   * Users can call this to add their own generators.
   */
  registerGenerator(name: string, GeneratorClass: new () => FixtureGenerator): void {
    this.generators.set(name, GeneratorClass);
  }

  /**
   * Create a sorter instance from its registered name.
   * Used by persistence layer during deserialization.
   */
  createSorter(name: string): StandingSorter {
    const SorterClass = this.sorters.get(name);
    if (!SorterClass) {
      throw new Error(
        `Unknown sorting strategy: ${name}. Register it with StrategyRegistry.registerSorter()`
      );
    }
    return new SorterClass();
  }

  /**
   * Create a generator instance from its registered name.
   * Used by persistence layer during deserialization.
   */
  createGenerator(name: string): FixtureGenerator {
    const GeneratorClass = this.generators.get(name);
    if (!GeneratorClass) {
      throw new Error(
        `Unknown fixture generation strategy: ${name}. Register it with StrategyRegistry.registerGenerator()`
      );
    }
    return new GeneratorClass();
  }

  /**
   * List all available standing sorter strategies.
   * Returns array of {name, displayName} for use in UI dropdowns.
   */
  listSorters(): StrategyListItem[] {
    const items: StrategyListItem[] = [];
    this.sorters.forEach((_, name) => {
      items.push({
        name,
        displayName: this.toDisplayName(name),
      });
    });
    return items;
  }

  /**
   * List all available fixture generator strategies.
   * Returns array of {name, displayName} for use in UI dropdowns.
   */
  listGenerators(): StrategyListItem[] {
    const items: StrategyListItem[] = [];
    this.generators.forEach((_, name) => {
      items.push({
        name,
        displayName: this.toDisplayName(name),
      });
    });
    return items;
  }
}

/**
 * Global singleton registry for strategy implementations.
 * Users can register custom strategies here.
 */
export const StrategyRegistry = new StrategyRegistryClass();
