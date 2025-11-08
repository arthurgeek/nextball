import { z } from 'zod';
import { League } from './League';
import { Standing } from './Standing';
import { Round } from '../value-objects/Round';
import type { FixtureGenerator } from '@/application/strategies/fixtures/FixtureGenerator';
import type { StandingSorter } from '@/application/strategies/standings/StandingSorter';

const CreateSeasonSchema = z.object({
  id: z.string().min(1),
  year: z.number().int().min(2000),
  league: z.any(), // League instance
});

interface CreateSeasonProps {
  id: string;
  year: number;
  league: League;
  generator: FixtureGenerator;
  sorter: StandingSorter;
  rounds?: Round[];
  standings?: Standing[];
  currentRound?: number;
  championId?: string;
}

/**
 * Season entity representing a league season with rounds and standings.
 * Immutable - use withXxx() methods to create updated instances.
 * Holds a FixtureGenerator instance directly (not a string).
 */
export class Season {
  private constructor(
    private readonly id: string,
    private readonly year: number,
    private readonly league: League,
    private readonly generator: FixtureGenerator,
    private readonly sorter: StandingSorter,
    private readonly rounds: Round[],
    private readonly standings: Standing[],
    private readonly currentRound: number,
    private readonly championId?: string
  ) {}

  static create(props: CreateSeasonProps): Season {
    CreateSeasonSchema.parse({
      id: props.id,
      year: props.year,
      league: props.league,
    });

    return new Season(
      props.id,
      props.year,
      props.league,
      props.generator,
      props.sorter,
      props.rounds ?? [],
      props.standings ?? [],
      props.currentRound ?? 0,
      props.championId
    );
  }

  getId(): string {
    return this.id;
  }

  getYear(): number {
    return this.year;
  }

  getLeague(): League {
    return this.league;
  }

  getRounds(): Round[] {
    return [...this.rounds];
  }

  getRound(roundNumber: number): Round | undefined {
    return this.rounds.find((r) => r.getRoundNumber() === roundNumber);
  }

  getStandings(): Standing[] {
    return [...this.standings];
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getChampionId(): string | undefined {
    return this.championId;
  }

  getGenerator(): FixtureGenerator {
    return this.generator;
  }

  getSorter(): StandingSorter {
    return this.sorter;
  }

  getTotalRounds(): number {
    return this.league.getTotalRounds();
  }

  isComplete(): boolean {
    return this.currentRound >= this.getTotalRounds();
  }

  hasChampion(): boolean {
    return this.championId !== undefined;
  }

  // Immutable updates
  withRounds(rounds: Round[]): Season {
    return new Season(
      this.id,
      this.year,
      this.league,
      this.generator,
      this.sorter,
      rounds,
      this.standings,
      this.currentRound,
      this.championId
    );
  }

  withStandings(standings: Standing[]): Season {
    return new Season(
      this.id,
      this.year,
      this.league,
      this.generator,
      this.sorter,
      this.rounds,
      standings,
      this.currentRound,
      this.championId
    );
  }

  withCurrentRound(currentRound: number): Season {
    return new Season(
      this.id,
      this.year,
      this.league,
      this.generator,
      this.sorter,
      this.rounds,
      this.standings,
      currentRound,
      this.championId
    );
  }

  withChampion(championId: string): Season {
    return new Season(
      this.id,
      this.year,
      this.league,
      this.generator,
      this.sorter,
      this.rounds,
      this.standings,
      this.currentRound,
      championId
    );
  }

  /**
   * Update a specific round
   */
  withUpdatedRound(round: Round): Season {
    const updatedRounds = this.rounds.map((r) =>
      r.getRoundNumber() === round.getRoundNumber() ? round : r
    );
    return new Season(
      this.id,
      this.year,
      this.league,
      this.generator,
      this.sorter,
      updatedRounds,
      this.standings,
      this.currentRound,
      this.championId
    );
  }

  /**
   * Change the fixture generator
   */
  withGenerator(generator: FixtureGenerator): Season {
    return new Season(
      this.id,
      this.year,
      this.league,
      generator,
      this.sorter,
      this.rounds,
      this.standings,
      this.currentRound,
      this.championId
    );
  }

  /**
   * Change the sorting strategy
   */
  withSorter(sorter: StandingSorter): Season {
    return new Season(
      this.id,
      this.year,
      this.league,
      this.generator,
      sorter,
      this.rounds,
      this.standings,
      this.currentRound,
      this.championId
    );
  }

  /**
   * Advance to the next round
   */
  advanceRound(): Season {
    return this.withCurrentRound(this.currentRound + 1);
  }
}
