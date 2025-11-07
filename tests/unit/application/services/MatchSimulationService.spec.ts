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

    it('should produce reasonable scores with realistic averages', () => {
      const simulations = 1000;
      let totalHomeGoals = 0;
      let totalAwayGoals = 0;

      for (let i = 0; i < simulations; i++) {
        const result = service.simulate(match);
        const homeGoals = result.getResult()?.getHomeGoals() ?? 0;
        const awayGoals = result.getResult()?.getAwayGoals() ?? 0;

        // Check bounds (allowing for rare high-scoring games with performance variance)
        expect(homeGoals).toBeLessThanOrEqual(15);
        expect(awayGoals).toBeLessThanOrEqual(15);
        expect(homeGoals).toBeGreaterThanOrEqual(0);
        expect(awayGoals).toBeGreaterThanOrEqual(0);

        totalHomeGoals += homeGoals;
        totalAwayGoals += awayGoals;
      }

      // Check average goals per match is realistic (typically 1-2 goals per team)
      const avgHomeGoals = totalHomeGoals / simulations;
      const avgAwayGoals = totalAwayGoals / simulations;

      expect(avgHomeGoals).toBeGreaterThan(0.5);
      expect(avgHomeGoals).toBeLessThan(2.5);
      expect(avgAwayGoals).toBeGreaterThan(0.5);
      expect(avgAwayGoals).toBeLessThan(2.5);
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

      // Draw percentage should be realistic (~20-35%)
      const drawPercent = (draws / simulations) * 100;
      expect(drawPercent).toBeGreaterThan(15);
      expect(drawPercent).toBeLessThan(40);

      // Away win percentage should be realistic (~20-35%)
      const awayWinPercent = (awayWins / simulations) * 100;
      expect(awayWinPercent).toBeGreaterThan(15);
      expect(awayWinPercent).toBeLessThan(40);
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
    it('should give stronger team more wins (balanced home/away)', () => {
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

      const simulations = 500; // Half home, half away
      let strongWins = 0;
      let weakWins = 0;
      let draws = 0;

      // Run equal number of home and away matches to remove home advantage bias
      for (let i = 0; i < simulations; i++) {
        // Strong team at home
        const strongHomeMatch = Match.create({
          id: `match-home-${i}`,
          homeTeam: strongTeam,
          awayTeam: weakTeam,
        });
        const homeResult = service.simulate(strongHomeMatch);

        if (homeResult.getResult()?.isHomeWin()) strongWins++;
        else if (homeResult.getResult()?.isAwayWin()) weakWins++;
        else draws++;

        // Strong team away
        const strongAwayMatch = Match.create({
          id: `match-away-${i}`,
          homeTeam: weakTeam,
          awayTeam: strongTeam,
        });
        const awayResult = service.simulate(strongAwayMatch);

        if (awayResult.getResult()?.isAwayWin()) strongWins++;
        else if (awayResult.getResult()?.isHomeWin()) weakWins++;
        else draws++;
      }

      const totalMatches = simulations * 2;
      const strongWinRate = (strongWins / totalMatches) * 100;

      // Strong team (90) should beat weak team (60) around 55-65% of the time
      // (balanced for home/away to isolate strength impact)
      expect(strongWinRate).toBeGreaterThan(50);
      expect(strongWinRate).toBeLessThan(70);

      // Strong team should win more than weak team
      expect(strongWins).toBeGreaterThan(weakWins);
    });

    it('should allow weak teams to upset strong teams occasionally (balanced home/away)', () => {
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

      const simulations = 500;
      let weakWins = 0;
      let draws = 0;
      let strongWins = 0;

      // Balance home/away to test pure strength + variance impact
      for (let i = 0; i < simulations; i++) {
        // Weak team at home
        const weakHomeMatch = Match.create({
          id: `match-weak-home-${i}`,
          homeTeam: weakTeam,
          awayTeam: strongTeam,
        });
        const homeResult = service.simulate(weakHomeMatch);

        if (homeResult.getResult()?.isHomeWin()) weakWins++;
        else if (homeResult.getResult()?.isDraw()) draws++;
        else strongWins++;

        // Weak team away
        const weakAwayMatch = Match.create({
          id: `match-weak-away-${i}`,
          homeTeam: strongTeam,
          awayTeam: weakTeam,
        });
        const awayResult = service.simulate(weakAwayMatch);

        if (awayResult.getResult()?.isAwayWin()) weakWins++;
        else if (awayResult.getResult()?.isDraw()) draws++;
        else strongWins++;
      }

      const totalMatches = simulations * 2;
      const weakWinRate = (weakWins / totalMatches) * 100;

      // Weak team (60) should beat strong team (90) occasionally due to variance
      // Even balanced for home/away, performance variance allows ~20-35% upset rate
      expect(weakWinRate).toBeGreaterThan(15);
      expect(weakWinRate).toBeLessThan(40);

      // But strong team should still win more overall
      expect(strongWins).toBeGreaterThan(weakWins);

      // There should be some draws
      expect(draws).toBeGreaterThan(0);
    });
  });
});
