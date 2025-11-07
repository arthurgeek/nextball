import { z } from 'zod';
import { Team } from './Team';

const CreateLeagueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  teams: z.array(z.any()).min(2, 'League must have at least 2 teams'),
});

interface CreateLeagueProps {
  id: string;
  name: string;
  teams: Team[];
  sortingStrategy?: string;
}

/**
 * League entity representing a football league with teams.
 * Immutable - use withXxx() methods to create updated instances.
 */
export class League {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly teams: Team[],
    private readonly sortingStrategy: string
  ) {}

  static create(props: CreateLeagueProps): League {
    CreateLeagueSchema.parse(props);
    return new League(
      props.id,
      props.name,
      props.teams,
      props.sortingStrategy ?? 'premier-league'
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getTeams(): Team[] {
    return [...this.teams];
  }

  getTeamCount(): number {
    return this.teams.length;
  }

  getTeamById(id: string): Team | undefined {
    return this.teams.find((team) => team.getId() === id);
  }

  getSortingStrategy(): string {
    return this.sortingStrategy;
  }

  /**
   * Calculate total rounds needed for a round-robin tournament.
   * Each team plays every other team twice (home and away).
   */
  getTotalRounds(): number {
    return (this.teams.length - 1) * 2;
  }

  /**
   * Add a team to the league
   */
  withTeam(team: Team): League {
    return new League(this.id, this.name, [...this.teams, team], this.sortingStrategy);
  }

  /**
   * Replace all teams
   */
  withTeams(teams: Team[]): League {
    return new League(this.id, this.name, teams, this.sortingStrategy);
  }

  /**
   * Change the sorting strategy
   */
  withSortingStrategy(strategy: string): League {
    return new League(this.id, this.name, this.teams, strategy);
  }
}
