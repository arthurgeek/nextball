import { z } from 'zod';

const MatchResultSchema = z.object({
  homeGoals: z.number().int().min(0, 'Goals must be non-negative integers'),
  awayGoals: z.number().int().min(0, 'Goals must be non-negative integers'),
});

interface CreateMatchResultProps {
  homeGoals: number;
  awayGoals: number;
}

export class MatchResult {
  private constructor(
    private readonly homeGoals: number,
    private readonly awayGoals: number
  ) {}

  static create(props: CreateMatchResultProps): MatchResult {
    const result = MatchResultSchema.safeParse(props);

    if (!result.success) {
      throw new Error('Goals must be non-negative integers');
    }

    return new MatchResult(props.homeGoals, props.awayGoals);
  }

  getHomeGoals(): number {
    return this.homeGoals;
  }

  getAwayGoals(): number {
    return this.awayGoals;
  }

  isHomeWin(): boolean {
    return this.homeGoals > this.awayGoals;
  }

  isDraw(): boolean {
    return this.homeGoals === this.awayGoals;
  }

  isAwayWin(): boolean {
    return this.awayGoals > this.homeGoals;
  }
}
