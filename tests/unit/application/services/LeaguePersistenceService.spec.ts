import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaguePersistenceService } from '@/application/services/LeaguePersistenceService';
import { Season } from '@/domain/entities/Season';
import { League } from '@/domain/entities/League';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';
import { Standing } from '@/domain/entities/Standing';
import { Round } from '@/domain/value-objects/Round';
import { Match } from '@/domain/entities/Match';
import { MatchResult } from '@/domain/value-objects/MatchResult';
import { Form, FormResult } from '@/domain/value-objects/Form';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';
import { DoubleRoundRobinGenerator } from '@/application/strategies/fixtures/DoubleRoundRobinGenerator';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('LeaguePersistenceService', () => {
  let service: LeaguePersistenceService;
  let season: Season;

  beforeEach(() => {
    // Setup localStorage mock
    global.localStorage = localStorageMock as any;
    localStorageMock.clear();

    service = new LeaguePersistenceService();

    // Create test season
    const teams = [
      Team.create({ id: 'team-1', name: 'Team 1', strength: Strength.create(75) }),
      Team.create({ id: 'team-2', name: 'Team 2', strength: Strength.create(80) }),
    ];

    const league = League.create({
      id: 'league-1',
      name: 'Test League',
      teams,
    });

    const match = Match.create({
      id: 'match-1',
      homeTeam: teams[0],
      awayTeam: teams[1],
    });

    const result = MatchResult.create({ homeGoals: 2, awayGoals: 1 });
    const completedMatch = match.withResult(result);

    const rounds = [
      Round.create({ roundNumber: 1, matches: [completedMatch] }),
    ];

    const form = Form.create({ results: [FormResult.WIN] });
    const standings = [
      Standing.create({
        team: teams[0],
        played: 1,
        won: 1,
        form,
        position: 1,
        previousPosition: 0,
      }),
      Standing.create({
        team: teams[1],
        played: 1,
        lost: 1,
        position: 2,
        previousPosition: 0,
      }),
    ];

    season = Season.create({
      id: 'season-1',
      year: 2025,
      league,
      generator: new DoubleRoundRobinGenerator(),
      sorter: new PointsGoalDifferenceSorter(),
      rounds,
      standings,
      currentRound: 1,
      championId: 'team-1',
    });
  });

  describe('serializeSeason / deserializeSeason', () => {
    it('should serialize and deserialize season correctly', () => {
      const serialized = service.serializeSeason(season);
      const deserialized = service.deserializeSeason(serialized);

      expect(deserialized.getId()).toBe(season.getId());
      expect(deserialized.getYear()).toBe(season.getYear());
      expect(deserialized.getCurrentRound()).toBe(season.getCurrentRound());
      expect(deserialized.getChampionId()).toBe(season.getChampionId());
      expect(deserialized.getLeague().getName()).toBe(season.getLeague().getName());
      expect(deserialized.getStandings()).toHaveLength(season.getStandings().length);
      expect(deserialized.getRounds()).toHaveLength(season.getRounds().length);
    });
  });

  describe('getChampionshipStats', () => {
    it('should calculate championship statistics correctly', () => {
      service.saveChampionship({ year: 2023, teamId: 'team-1', teamName: 'Team 1' });
      service.saveChampionship({ year: 2024, teamId: 'team-1', teamName: 'Team 1' });
      service.saveChampionship({ year: 2025, teamId: 'team-2', teamName: 'Team 2' });

      const stats = service.getChampionshipStats();

      const team1Stats = stats.get('team-1');
      expect(team1Stats).toBeDefined();
      expect(team1Stats!.count).toBe(2);
      expect(team1Stats!.years).toEqual([2024, 2023]); // Sorted descending
      expect(team1Stats!.teamName).toBe('Team 1');

      const team2Stats = stats.get('team-2');
      expect(team2Stats).toBeDefined();
      expect(team2Stats!.count).toBe(1);
      expect(team2Stats!.years).toEqual([2025]);
    });

    it('should return empty map when no championship history', () => {
      const stats = service.getChampionshipStats();

      expect(stats.size).toBe(0);
    });
  });

  describe('saveSeason / loadSeason / clearSeason', () => {
    it('should save and load season', () => {
      service.saveSeason(season);
      const loaded = service.loadSeason();

      expect(loaded).not.toBeNull();
      expect(loaded!.getId()).toBe(season.getId());
      expect(loaded!.getYear()).toBe(season.getYear());
    });

    it('should return null when no season saved', () => {
      const loaded = service.loadSeason();

      expect(loaded).toBeNull();
    });

    it('should clear season', () => {
      service.saveSeason(season);
      service.clearSeason();
      const loaded = service.loadSeason();

      expect(loaded).toBeNull();
    });

    it('should return null when localStorage contains invalid JSON', () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('current-season', 'invalid-json-{{{');

      const loaded = service.loadSeason();

      expect(loaded).toBeNull();
    });
  });

  describe('SSR handling', () => {
    it('should return empty array from getChampionshipHistory in SSR', () => {
      // Mock SSR environment by removing window
      vi.stubGlobal('window', undefined);

      const history = service.getChampionshipHistory();

      expect(history).toEqual([]);

      // Restore
      vi.unstubAllGlobals();
    });

    it('should return null from loadSeason in SSR', () => {
      // Mock SSR environment by removing window
      vi.stubGlobal('window', undefined);

      const loaded = service.loadSeason();

      expect(loaded).toBeNull();

      // Restore
      vi.unstubAllGlobals();
    });

    it('should not throw from saveSeason in SSR', () => {
      // Mock SSR environment by removing window
      vi.stubGlobal('window', undefined);

      expect(() => service.saveSeason(season)).not.toThrow();

      // Restore
      vi.unstubAllGlobals();
    });

    it('should not throw from saveChampionship in SSR', () => {
      // Mock SSR environment by removing window
      vi.stubGlobal('window', undefined);

      expect(() =>
        service.saveChampionship({ year: 2025, teamId: 'team-1', teamName: 'Team 1' })
      ).not.toThrow();

      // Restore
      vi.unstubAllGlobals();
    });

    it('should not throw from clearSeason in SSR', () => {
      // Mock SSR environment by removing window
      vi.stubGlobal('window', undefined);

      expect(() => service.clearSeason()).not.toThrow();

      // Restore
      vi.unstubAllGlobals();
    });
  });
});
