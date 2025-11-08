import { describe, it, expect, beforeEach } from 'vitest';
import { LeagueService } from '@/application/services/LeagueService';
import { Team } from '@/domain/entities/Team';
import { Match } from '@/domain/entities/Match';
import { Standing } from '@/domain/entities/Standing';
import { Strength } from '@/domain/value-objects/Strength';
import { MatchResult } from '@/domain/value-objects/MatchResult';
import { PointsGoalDifferenceSorter } from '@/application/strategies/standings/PointsGoalDifferenceSorter';

describe('LeagueService', () => {
  let service: LeagueService;
  let teamA: Team;
  let teamB: Team;
  let teamC: Team;

  beforeEach(() => {
    service = new LeagueService();
    teamA = Team.create({
      id: 'team-a',
      name: 'Team A',
      strength: Strength.create(75),
    });
    teamB = Team.create({
      id: 'team-b',
      name: 'Team B',
      strength: Strength.create(80),
    });
    teamC = Team.create({
      id: 'team-c',
      name: 'Team C',
      strength: Strength.create(70),
    });
  });

  describe('initializeStandings', () => {
    it('should initialize standings for all teams', () => {
      const teams = [teamA, teamB, teamC];
      const standings = service.initializeStandings(teams);

      expect(standings).toHaveLength(3);
      expect(standings[0].getTeam()).toBe(teamA);
      expect(standings[1].getTeam()).toBe(teamB);
      expect(standings[2].getTeam()).toBe(teamC);

      // All stats should be zero initially
      standings.forEach((standing) => {
        expect(standing.getPlayed()).toBe(0);
        expect(standing.getWon()).toBe(0);
        expect(standing.getDrawn()).toBe(0);
        expect(standing.getLost()).toBe(0);
        expect(standing.getGoalsFor()).toBe(0);
        expect(standing.getGoalsAgainst()).toBe(0);
      });
    });

    it('should handle empty teams array', () => {
      const standings = service.initializeStandings([]);
      expect(standings).toHaveLength(0);
    });

    it('should handle single team', () => {
      const standings = service.initializeStandings([teamA]);
      expect(standings).toHaveLength(1);
      expect(standings[0].getTeam()).toBe(teamA);
    });
  });

  describe('updateStandingsAfterMatch', () => {
    it('should throw error when match has no result', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam: teamA,
        awayTeam: teamB,
      });
      const standings = service.initializeStandings([teamA, teamB]);

      expect(() => {
        service.updateStandingsAfterMatch(standings, match);
      }).toThrow('Cannot update standings for match without result');
    });

    it('should update standings for home win', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam: teamA,
        awayTeam: teamB,
      }).withResult(MatchResult.create({ homeGoals: 3, awayGoals: 1 }));

      const standings = service.initializeStandings([teamA, teamB]);
      const updated = service.updateStandingsAfterMatch(standings, match);

      const homeStanding = updated.find((s) => s.getTeam().getId() === 'team-a')!;
      const awayStanding = updated.find((s) => s.getTeam().getId() === 'team-b')!;

      // Home team (winner)
      expect(homeStanding.getPlayed()).toBe(1);
      expect(homeStanding.getWon()).toBe(1);
      expect(homeStanding.getDrawn()).toBe(0);
      expect(homeStanding.getLost()).toBe(0);
      expect(homeStanding.getGoalsFor()).toBe(3);
      expect(homeStanding.getGoalsAgainst()).toBe(1);

      // Away team (loser)
      expect(awayStanding.getPlayed()).toBe(1);
      expect(awayStanding.getWon()).toBe(0);
      expect(awayStanding.getDrawn()).toBe(0);
      expect(awayStanding.getLost()).toBe(1);
      expect(awayStanding.getGoalsFor()).toBe(1);
      expect(awayStanding.getGoalsAgainst()).toBe(3);
    });

    it('should update standings for away win', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam: teamA,
        awayTeam: teamB,
      }).withResult(MatchResult.create({ homeGoals: 1, awayGoals: 2 }));

      const standings = service.initializeStandings([teamA, teamB]);
      const updated = service.updateStandingsAfterMatch(standings, match);

      const homeStanding = updated.find((s) => s.getTeam().getId() === 'team-a')!;
      const awayStanding = updated.find((s) => s.getTeam().getId() === 'team-b')!;

      // Home team (loser)
      expect(homeStanding.getLost()).toBe(1);
      expect(homeStanding.getWon()).toBe(0);

      // Away team (winner)
      expect(awayStanding.getWon()).toBe(1);
      expect(awayStanding.getLost()).toBe(0);
    });

    it('should update standings for draw', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam: teamA,
        awayTeam: teamB,
      }).withResult(MatchResult.create({ homeGoals: 2, awayGoals: 2 }));

      const standings = service.initializeStandings([teamA, teamB]);
      const updated = service.updateStandingsAfterMatch(standings, match);

      const homeStanding = updated.find((s) => s.getTeam().getId() === 'team-a')!;
      const awayStanding = updated.find((s) => s.getTeam().getId() === 'team-b')!;

      // Both teams
      expect(homeStanding.getDrawn()).toBe(1);
      expect(homeStanding.getWon()).toBe(0);
      expect(homeStanding.getLost()).toBe(0);

      expect(awayStanding.getDrawn()).toBe(1);
      expect(awayStanding.getWon()).toBe(0);
      expect(awayStanding.getLost()).toBe(0);
    });

    it('should not mutate original standings', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam: teamA,
        awayTeam: teamB,
      }).withResult(MatchResult.create({ homeGoals: 3, awayGoals: 1 }));

      const standings = service.initializeStandings([teamA, teamB]);
      const updated = service.updateStandingsAfterMatch(standings, match);

      expect(updated).not.toBe(standings);
      expect(standings[0].getPlayed()).toBe(0); // Original unchanged
      expect(updated[0].getPlayed()).toBe(1); // Updated has changes
    });

    it('should update form for both teams', () => {
      const match = Match.create({
        id: 'match-1',
        homeTeam: teamA,
        awayTeam: teamB,
      }).withResult(MatchResult.create({ homeGoals: 3, awayGoals: 1 }));

      const standings = service.initializeStandings([teamA, teamB]);
      const updated = service.updateStandingsAfterMatch(standings, match);

      const homeStanding = updated.find((s) => s.getTeam().getId() === 'team-a')!;
      const awayStanding = updated.find((s) => s.getTeam().getId() === 'team-b')!;

      // Check form has been updated
      expect(homeStanding.getForm().getResults()).toHaveLength(1);
      expect(awayStanding.getForm().getResults()).toHaveLength(1);
    });
  });

  describe('sortStandings', () => {
    it('should sort standings using provided sorter', () => {
      const teamHigh = Team.create({
        id: 'high',
        name: 'High Points',
        strength: Strength.create(90),
      });
      const teamLow = Team.create({
        id: 'low',
        name: 'Low Points',
        strength: Strength.create(60),
      });

      const standings = [
        Standing.create({
          team: teamLow,
          played: 10,
          won: 2,
          drawn: 2,
          lost: 6,
          goalsFor: 10,
          goalsAgainst: 20,
        }),
        Standing.create({
          team: teamHigh,
          played: 10,
          won: 8,
          drawn: 1,
          lost: 1,
          goalsFor: 25,
          goalsAgainst: 8,
        }),
      ];

      const sorter = new PointsGoalDifferenceSorter();
      const sorted = service.sortStandings(standings, sorter);

      expect(sorted[0].getTeam().getId()).toBe('high'); // Higher points first
      expect(sorted[1].getTeam().getId()).toBe('low');
    });

    it('should not mutate original standings', () => {
      const standings = [
        Standing.create({ team: teamA }),
        Standing.create({ team: teamB }),
      ];
      const sorter = new PointsGoalDifferenceSorter();

      const sorted = service.sortStandings(standings, sorter);

      expect(sorted).not.toBe(standings);
    });
  });

  describe('determineChampion', () => {
    it('should return undefined when no rounds remain but no clear leader', () => {
      const standings = [
        Standing.create({
          team: teamA,
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 12,
        }),
        Standing.create({
          team: teamB,
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 12,
        }),
      ];

      const sorter = new PointsGoalDifferenceSorter();
      const sorted = service.sortStandings(standings, sorter);

      const champion = service.determineChampion(sorted, 0, sorter);
      expect(champion).toBe('team-a'); // First in sorted list
    });

    it('should return champion when mathematically certain', () => {
      const standings = [
        Standing.create({
          team: teamA,
          played: 8,
          won: 8,
          drawn: 0,
          lost: 0,
          goalsFor: 25,
          goalsAgainst: 5,
        }),
        Standing.create({
          team: teamB,
          played: 8,
          won: 2,
          drawn: 2,
          lost: 4,
          goalsFor: 10,
          goalsAgainst: 15,
        }),
      ];

      const sorter = new PointsGoalDifferenceSorter();
      const sorted = service.sortStandings(standings, sorter);

      // Leader has 24 points, second has 8 points, 2 rounds remain (6 points max)
      const champion = service.determineChampion(sorted, 2, sorter);
      expect(champion).toBe('team-a');
    });

    it('should return undefined when title race is still open', () => {
      const standings = [
        Standing.create({
          team: teamA,
          played: 8,
          won: 6,
          drawn: 0,
          lost: 2,
          goalsFor: 18,
          goalsAgainst: 8,
        }),
        Standing.create({
          team: teamB,
          played: 8,
          won: 5,
          drawn: 0,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 10,
        }),
      ];

      const sorter = new PointsGoalDifferenceSorter();
      const sorted = service.sortStandings(standings, sorter);

      // Leader has 18 points, second has 15 points, 2 rounds remain
      // Second place can still catch up
      const champion = service.determineChampion(sorted, 2, sorter);
      expect(champion).toBeUndefined();
    });

    it('should return undefined when standings are empty', () => {
      const sorter = new PointsGoalDifferenceSorter();
      const champion = service.determineChampion([], 5, sorter);
      expect(champion).toBeUndefined();
    });
  });

  describe('getLeader', () => {
    it('should return first standing after sorting', () => {
      const standings = [
        Standing.create({ team: teamA }),
        Standing.create({ team: teamB }),
      ];

      const sorter = new PointsGoalDifferenceSorter();
      const leader = service.getLeader(standings, sorter);

      expect(leader).toBeDefined();
      expect(leader!.getTeam().getId()).toBe('team-a');
    });

    it('should return undefined for empty standings', () => {
      const sorter = new PointsGoalDifferenceSorter();
      const leader = service.getLeader([], sorter);

      expect(leader).toBeUndefined();
    });
  });

  describe('findStandingByTeamId', () => {
    it('should find standing by team ID', () => {
      const standings = [
        Standing.create({ team: teamA }),
        Standing.create({ team: teamB }),
        Standing.create({ team: teamC }),
      ];

      const found = service.findStandingByTeamId(standings, 'team-b');

      expect(found).toBeDefined();
      expect(found!.getTeam().getId()).toBe('team-b');
    });

    it('should return undefined when team not found', () => {
      const standings = [
        Standing.create({ team: teamA }),
        Standing.create({ team: teamB }),
      ];

      const found = service.findStandingByTeamId(standings, 'team-xyz');

      expect(found).toBeUndefined();
    });

    it('should return undefined for empty standings', () => {
      const found = service.findStandingByTeamId([], 'team-a');

      expect(found).toBeUndefined();
    });
  });
});
