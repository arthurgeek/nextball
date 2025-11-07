import { z } from 'zod';
import { Team } from './Team';
import { Form } from '../value-objects/Form';

const CreateStandingSchema = z.object({
  team: z.any(), // Team instance
  played: z.number().int().min(0),
  won: z.number().int().min(0),
  drawn: z.number().int().min(0),
  lost: z.number().int().min(0),
  goalsFor: z.number().int().min(0),
  goalsAgainst: z.number().int().min(0),
});

interface CreateStandingProps {
  team: Team;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  form?: Form;
  position?: number;
  previousPosition?: number;
}

/**
 * Standing entity representing a team's statistics in a league season.
 * Immutable - use withXxx() methods to create updated instances.
 */
export class Standing {
  private constructor(
    private readonly team: Team,
    private readonly played: number,
    private readonly won: number,
    private readonly drawn: number,
    private readonly lost: number,
    private readonly goalsFor: number,
    private readonly goalsAgainst: number,
    private readonly form: Form,
    private readonly position: number,
    private readonly previousPosition: number
  ) {}

  static create(props: CreateStandingProps): Standing {
    CreateStandingSchema.parse({
      team: props.team,
      played: props.played ?? 0,
      won: props.won ?? 0,
      drawn: props.drawn ?? 0,
      lost: props.lost ?? 0,
      goalsFor: props.goalsFor ?? 0,
      goalsAgainst: props.goalsAgainst ?? 0,
    });

    return new Standing(
      props.team,
      props.played ?? 0,
      props.won ?? 0,
      props.drawn ?? 0,
      props.lost ?? 0,
      props.goalsFor ?? 0,
      props.goalsAgainst ?? 0,
      props.form ?? Form.create(),
      props.position ?? 0,
      props.previousPosition ?? 0
    );
  }

  // Immutable updates
  withPosition(position: number, previousPosition?: number): Standing {
    return new Standing(
      this.team,
      this.played,
      this.won,
      this.drawn,
      this.lost,
      this.goalsFor,
      this.goalsAgainst,
      this.form,
      position,
      previousPosition ?? this.position
    );
  }

  withForm(form: Form): Standing {
    return new Standing(
      this.team,
      this.played,
      this.won,
      this.drawn,
      this.lost,
      this.goalsFor,
      this.goalsAgainst,
      form,
      this.position,
      this.previousPosition
    );
  }

  /**
   * Record a match result for this team.
   * Returns a new Standing with updated statistics.
   */
  recordResult(
    goalsFor: number,
    goalsAgainst: number,
    formResult: 'W' | 'D' | 'L'
  ): Standing {
    const won = formResult === 'W' ? this.won + 1 : this.won;
    const drawn = formResult === 'D' ? this.drawn + 1 : this.drawn;
    const lost = formResult === 'L' ? this.lost + 1 : this.lost;

    return new Standing(
      this.team,
      this.played + 1,
      won,
      drawn,
      lost,
      this.goalsFor + goalsFor,
      this.goalsAgainst + goalsAgainst,
      this.form.addResult(formResult),
      this.position,
      this.previousPosition
    );
  }

  // Getters
  getTeam(): Team {
    return this.team;
  }

  getPlayed(): number {
    return this.played;
  }

  getWon(): number {
    return this.won;
  }

  getDrawn(): number {
    return this.drawn;
  }

  getLost(): number {
    return this.lost;
  }

  getGoalsFor(): number {
    return this.goalsFor;
  }

  getGoalsAgainst(): number {
    return this.goalsAgainst;
  }

  getGoalDifference(): number {
    return this.goalsFor - this.goalsAgainst;
  }

  getPoints(): number {
    return this.won * 3 + this.drawn;
  }

  getForm(): Form {
    return this.form;
  }

  getPosition(): number {
    return this.position;
  }

  getPreviousPosition(): number {
    return this.previousPosition;
  }

  getPositionChange(): number {
    if (this.previousPosition === 0) return 0;
    return this.previousPosition - this.position;
  }
}
