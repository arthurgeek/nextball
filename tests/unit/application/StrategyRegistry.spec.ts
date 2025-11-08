import { describe, it, expect, beforeEach } from 'vitest';
import { StrategyRegistry } from '@/application/StrategyRegistry';
import type { StandingSorter } from '@/application/strategies/standings/StandingSorter';
import type { FixtureGenerator } from '@/application/strategies/fixtures/FixtureGenerator';
import type { Standing } from '@/domain/entities/Standing';
import type { Round } from '@/domain/value-objects/Round';

// Mock custom sorter for testing
class MockCustomSorter implements StandingSorter {
  getName(): string {
    return 'mock-custom';
  }

  sort(standings: Standing[]): Standing[] {
    // Simple reverse sort for testing
    return [...standings].reverse();
  }
}

// Mock custom generator for testing
class MockCustomGenerator implements FixtureGenerator {
  getName(): string {
    return 'mock-custom-generator';
  }

  getTotalRounds(teamCount: number): number {
    return teamCount; // Custom logic
  }

  generateFixtures(): Round[] {
    return []; // Simplified for testing
  }
}

describe('StrategyRegistry - Built-in Strategies', () => {
  it('should have built-in standing sorters registered', () => {
    // Built-in sorters should be available
    expect(() => StrategyRegistry.createSorter('points-goal-difference')).not.toThrow();
    expect(() => StrategyRegistry.createSorter('points-head-to-head')).not.toThrow();
    expect(() => StrategyRegistry.createSorter('points-wins')).not.toThrow();
  });

  it('should have built-in fixture generators registered', () => {
    // Built-in generators should be available
    expect(() => StrategyRegistry.createGenerator('double-round-robin')).not.toThrow();
    expect(() => StrategyRegistry.createGenerator('single-round-robin')).not.toThrow();
  });

  it('should create new instances each time for sorters', () => {
    const sorter1 = StrategyRegistry.createSorter('points-goal-difference');
    const sorter2 = StrategyRegistry.createSorter('points-goal-difference');

    // Should be different instances
    expect(sorter1).not.toBe(sorter2);
  });

  it('should create new instances each time for generators', () => {
    const gen1 = StrategyRegistry.createGenerator('double-round-robin');
    const gen2 = StrategyRegistry.createGenerator('double-round-robin');

    // Should be different instances
    expect(gen1).not.toBe(gen2);
  });

  it('should return sorter with correct getName()', () => {
    const sorter = StrategyRegistry.createSorter('points-goal-difference');
    expect(sorter.getName()).toBe('points-goal-difference');
  });

  it('should return generator with correct getName()', () => {
    const generator = StrategyRegistry.createGenerator('double-round-robin');
    expect(generator.getName()).toBe('double-round-robin');
  });
});

describe('StrategyRegistry - Custom Strategy Registration', () => {
  beforeEach(() => {
    // Note: We can't easily "unregister" strategies in the singleton,
    // so we'll just register new ones with unique names for each test
  });

  it('should allow registering custom sorter', () => {
    const customName = 'custom-test-sorter-1';

    // Should throw before registration
    expect(() => StrategyRegistry.createSorter(customName)).toThrow(/Unknown sorting strategy/);

    // Register custom sorter
    StrategyRegistry.registerSorter(customName, MockCustomSorter);

    // Should now work
    const sorter = StrategyRegistry.createSorter(customName);
    expect(sorter).toBeInstanceOf(MockCustomSorter);
    expect(sorter.getName()).toBe('mock-custom');
  });

  it('should allow registering custom generator', () => {
    const customName = 'custom-test-generator-1';

    // Should throw before registration
    expect(() => StrategyRegistry.createGenerator(customName)).toThrow(/Unknown fixture generation strategy/);

    // Register custom generator
    StrategyRegistry.registerGenerator(customName, MockCustomGenerator);

    // Should now work
    const generator = StrategyRegistry.createGenerator(customName);
    expect(generator).toBeInstanceOf(MockCustomGenerator);
    expect(generator.getName()).toBe('mock-custom-generator');
  });

  it('should allow overriding built-in sorter with custom implementation', () => {
    // Register custom sorter with same name as built-in
    StrategyRegistry.registerSorter('points-goal-difference', MockCustomSorter);

    const sorter = StrategyRegistry.createSorter('points-goal-difference');

    // Should now return mock implementation
    expect(sorter).toBeInstanceOf(MockCustomSorter);
    expect(sorter.getName()).toBe('mock-custom');
  });

  it('should create separate instances for each createSorter call', () => {
    const customName = 'custom-test-sorter-2';
    StrategyRegistry.registerSorter(customName, MockCustomSorter);

    const sorter1 = StrategyRegistry.createSorter(customName);
    const sorter2 = StrategyRegistry.createSorter(customName);

    expect(sorter1).not.toBe(sorter2);
    expect(sorter1).toBeInstanceOf(MockCustomSorter);
    expect(sorter2).toBeInstanceOf(MockCustomSorter);
  });
});

describe('StrategyRegistry - Error Handling', () => {
  it('should throw error for unknown sorter', () => {
    expect(() => StrategyRegistry.createSorter('non-existent-sorter')).toThrow(
      /Unknown sorting strategy: non-existent-sorter/
    );
  });

  it('should throw error for unknown generator', () => {
    expect(() => StrategyRegistry.createGenerator('non-existent-generator')).toThrow(
      /Unknown fixture generation strategy: non-existent-generator/
    );
  });

  it('should include helpful message in error for sorter', () => {
    try {
      StrategyRegistry.createSorter('invalid');
    } catch (error) {
      expect((error as Error).message).toContain('Register it with StrategyRegistry.registerSorter()');
    }
  });

  it('should include helpful message in error for generator', () => {
    try {
      StrategyRegistry.createGenerator('invalid');
    } catch (error) {
      expect((error as Error).message).toContain('Register it with StrategyRegistry.registerGenerator()');
    }
  });
});

describe('StrategyRegistry - Open/Closed Principle', () => {
  it('should allow extension without modifying registry code', () => {
    // This test demonstrates the Open/Closed Principle
    // Users can extend functionality without modifying StrategyRegistry source

    const customSorterName = 'my-league-sorter';

    // User creates custom sorter
    class MyLeagueSorter implements StandingSorter {
      getName(): string {
        return customSorterName;
      }
      sort(standings: Standing[]): Standing[] {
        return standings;
      }
    }

    // User registers it
    StrategyRegistry.registerSorter(customSorterName, MyLeagueSorter);

    // User can now use it anywhere in the application
    const sorter = StrategyRegistry.createSorter(customSorterName);
    expect(sorter).toBeInstanceOf(MyLeagueSorter);

    // No modification to StrategyRegistry source code was needed!
  });
});

describe('StrategyRegistry - Listing Available Strategies', () => {
  it('should list all available standing sorters', () => {
    const sorters = StrategyRegistry.listSorters();

    // Should include built-in sorters
    expect(sorters.length).toBeGreaterThanOrEqual(3);

    const sorterNames = sorters.map((s) => s.name);
    expect(sorterNames).toContain('points-goal-difference');
    expect(sorterNames).toContain('points-head-to-head');
    expect(sorterNames).toContain('points-wins');
  });

  it('should list all available fixture generators', () => {
    const generators = StrategyRegistry.listGenerators();

    // Should include built-in generators
    expect(generators.length).toBeGreaterThanOrEqual(2);

    const generatorNames = generators.map((g) => g.name);
    expect(generatorNames).toContain('double-round-robin');
    expect(generatorNames).toContain('single-round-robin');
  });

  it('should return sorter list items with name and displayName', () => {
    const sorters = StrategyRegistry.listSorters();

    sorters.forEach((sorter) => {
      expect(sorter).toHaveProperty('name');
      expect(sorter).toHaveProperty('displayName');
      expect(typeof sorter.name).toBe('string');
      expect(typeof sorter.displayName).toBe('string');
      expect(sorter.displayName.length).toBeGreaterThan(0);
    });
  });

  it('should return generator list items with name and displayName', () => {
    const generators = StrategyRegistry.listGenerators();

    generators.forEach((generator) => {
      expect(generator).toHaveProperty('name');
      expect(generator).toHaveProperty('displayName');
      expect(typeof generator.name).toBe('string');
      expect(typeof generator.displayName).toBe('string');
      expect(generator.displayName.length).toBeGreaterThan(0);
    });
  });

  it('should include custom sorters in list after registration', () => {
    const customName = 'list-test-custom-sorter';
    StrategyRegistry.registerSorter(customName, MockCustomSorter);

    const sorters = StrategyRegistry.listSorters();
    const customSorter = sorters.find((s) => s.name === customName);

    expect(customSorter).toBeDefined();
    expect(customSorter?.displayName).toBeTruthy();
  });

  it('should include custom generators in list after registration', () => {
    const customName = 'list-test-custom-generator';
    StrategyRegistry.registerGenerator(customName, MockCustomGenerator);

    const generators = StrategyRegistry.listGenerators();
    const customGenerator = generators.find((g) => g.name === customName);

    expect(customGenerator).toBeDefined();
    expect(customGenerator?.displayName).toBeTruthy();
  });

  it('should generate readable display names from strategy names', () => {
    const sorters = StrategyRegistry.listSorters();

    // Points-goal-difference should have a readable display name
    const pgdSorter = sorters.find((s) => s.name === 'points-goal-difference');
    expect(pgdSorter?.displayName).toMatch(/Points.*Goal.*Difference/i);

    // Points-head-to-head should have a readable display name
    const hthSorter = sorters.find((s) => s.name === 'points-head-to-head');
    expect(hthSorter?.displayName).toMatch(/Points.*Head.*Head/i);
  });

  it('should return empty array if no strategies registered (hypothetical)', () => {
    // This tests the contract - if we had a fresh registry, listSorters/listGenerators
    // should return arrays (possibly empty), not null/undefined
    const sorters = StrategyRegistry.listSorters();
    const generators = StrategyRegistry.listGenerators();

    expect(Array.isArray(sorters)).toBe(true);
    expect(Array.isArray(generators)).toBe(true);
  });
});
