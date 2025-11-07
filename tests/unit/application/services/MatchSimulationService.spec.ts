import { describe, it, expect, beforeEach } from 'vitest';
import { MatchSimulationService } from '@/application/services/MatchSimulationService';
import { Match } from '@/domain/entities/Match';
import { Team } from '@/domain/entities/Team';
import { Strength } from '@/domain/value-objects/Strength';

describe('MatchSimulationService', () => {
  let service: MatchSimulationService;
  let homeTeam: Team;
  let awayTeam: Team;
  let match: Match;

  beforeEach(() => {
    service = new MatchSimulationService();

    homeTeam = Team.create({
      id: 'home-1',
      name: 'Home FC',
      strength: Strength.create(75),
    });

    awayTeam = Team.create({
      id: 'away-1',
      name: 'Away FC',
      strength: Strength.create(75),
    });

    match = Match.create({
      id: 'match-1',
      homeTeam,
      awayTeam,
    });
  });

  describe('simulate', () => {
    it('should return match with result', () => {
      const result = service.simulate(match);

      expect(result.hasResult()).toBe(true);
      expect(result.getResult()?.getHomeGoals()).toBeGreaterThanOrEqual(0);
      expect(result.getResult()?.getAwayGoals()).toBeGreaterThanOrEqual(0);
    });

    it('should not mutate original match (immutability)', () => {
      const result = service.simulate(match);

      expect(match.hasResult()).toBe(false);
      expect(result.hasResult()).toBe(true);
      expect(result).not.toBe(match);
    });

    it('should generate integer goals', () => {
      const result = service.simulate(match);

      expect(Number.isInteger(result.getResult()?.getHomeGoals())).toBe(true);
      expect(Number.isInteger(result.getResult()?.getAwayGoals())).toBe(true);
    });

    it('should produce reasonable scores (0-10 goals per team)', () => {
      // Run 100 simulations and check all scores are reasonable
      for (let i = 0; i < 100; i++) {
        const result = service.simulate(match);
        const homeGoals = result.getResult()?.getHomeGoals() ?? 0;
        const awayGoals = result.getResult()?.getAwayGoals() ?? 0;

        expect(homeGoals).toBeLessThanOrEqual(10);
        expect(awayGoals).toBeLessThanOrEqual(10);
        expect(homeGoals).toBeGreaterThanOrEqual(0);
        expect(awayGoals).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('home advantage', () => {
    it('should give home team statistical advantage over many matches', () => {
      // Equal strength teams, but home should win more often
      const simulations = 1000;
      let homeWins = 0;
      let awayWins = 0;
      let draws = 0;

      for (let i = 0; i < simulations; i++) {
        const result = service.simulate(match);
        const matchResult = result.getResult();

        if (matchResult?.isHomeWin()) {
          homeWins++;
        } else if (matchResult?.isAwayWin()) {
          awayWins++;
        } else {
          draws++;
        }
      }

      // With equal teams + home advantage, home should win more
      // Typical real-world: ~46% home, ~27% away, ~27% draw
      expect(homeWins).toBeGreaterThan(awayWins);

      // Home win % should be between 38-52% (allowing for statistical variance)
      const homeWinPercent = (homeWins / simulations) * 100;
      expect(homeWinPercent).toBeGreaterThan(38);
      expect(homeWinPercent).toBeLessThan(52);
    });

    it('should generate more home goals than away goals on average', () => {
      const simulations = 1000;
      let totalHomeGoals = 0;
      let totalAwayGoals = 0;

      for (let i = 0; i < simulations; i++) {
        const result = service.simulate(match);
        totalHomeGoals += result.getResult()?.getHomeGoals() ?? 0;
        totalAwayGoals += result.getResult()?.getAwayGoals() ?? 0;
      }

      const avgHomeGoals = totalHomeGoals / simulations;
      const avgAwayGoals = totalAwayGoals / simulations;

      // Home should average more goals
      expect(avgHomeGoals).toBeGreaterThan(avgAwayGoals);
    });
  });

  describe('team strength impact', () => {
    it('should give stronger team more goals on average', () => {
      const strongTeam = Team.create({
        id: 'strong',
        name: 'Strong FC',
        strength: Strength.create(90),
      });

      const weakTeam = Team.create({
        id: 'weak',
        name: 'Weak FC',
        strength: Strength.create(60),
      });

      const strongHomeMatch = Match.create({
        id: 'match-1',
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      });

      const simulations = 1000;
      let strongWins = 0;

      for (let i = 0; i < simulations; i++) {
        const result = service.simulate(strongHomeMatch);
        if (result.getResult()?.isHomeWin()) {
          strongWins++;
        }
      }

      // Strong team at home should win majority of matches
      // 55%+ is realistic for 90 vs 60 strength (football has high variance)
      const winRate = (strongWins / simulations) * 100;
      expect(winRate).toBeGreaterThan(50);
    });
  });
});
