import { z } from 'zod';
import { Team } from './Team';
import { MatchResult } from '../value-objects/MatchResult';

const CreateMatchSchema = z.object({
  id: z.string().min(1),
});

interface CreateMatchProps {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  result?: MatchResult;
}

export class Match {
  private constructor(
    private readonly id: string,
    private readonly homeTeam: Team,
    private readonly awayTeam: Team,
    private readonly result?: MatchResult
  ) {}

  static create(props: CreateMatchProps): Match {
    CreateMatchSchema.parse(props);
    return new Match(props.id, props.homeTeam, props.awayTeam, props.result);
  }

  withResult(result: MatchResult): Match {
    return new Match(this.id, this.homeTeam, this.awayTeam, result);
  }

  getId(): string {
    return this.id;
  }

  getHomeTeam(): Team {
    return this.homeTeam;
  }

  getAwayTeam(): Team {
    return this.awayTeam;
  }

  getResult(): MatchResult | undefined {
    return this.result;
  }

  hasResult(): boolean {
    return this.result !== undefined;
  }

  getScore(): string {
    if (!this.result) {
      return 'vs';
    }
    return `${this.result.getHomeGoals()}-${this.result.getAwayGoals()}`;
  }
}
