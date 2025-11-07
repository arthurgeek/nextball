import { z } from 'zod';
import { Match } from '../entities/Match';

const CreateRoundSchema = z.object({
  roundNumber: z.number().int().min(1),
  matches: z.array(z.any()), // Array of Match instances
});

interface CreateRoundProps {
  roundNumber: number;
  matches: Match[];
}

/**
 * Round value object representing a collection of matches played in a single round.
 * In a round-robin tournament, each round consists of fixtures played simultaneously.
 */
export class Round {
  private constructor(
    private readonly roundNumber: number,
    private readonly matches: Match[]
  ) {}

  static create(props: CreateRoundProps): Round {
    CreateRoundSchema.parse(props);
    return new Round(props.roundNumber, props.matches);
  }

  getRoundNumber(): number {
    return this.roundNumber;
  }

  getMatches(): Match[] {
    return [...this.matches];
  }

  /**
   * Check if all matches in this round have been played
   */
  isComplete(): boolean {
    return this.matches.every((match) => match.hasResult());
  }

  /**
   * Get the number of matches in this round
   */
  getMatchCount(): number {
    return this.matches.length;
  }

  /**
   * Get the number of completed matches in this round
   */
  getCompletedMatchCount(): number {
    return this.matches.filter((match) => match.hasResult()).length;
  }

  /**
   * Replace matches with new instances (e.g., after simulation)
   */
  withMatches(matches: Match[]): Round {
    return new Round(this.roundNumber, matches);
  }
}
