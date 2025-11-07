import { z } from 'zod';
import { Strength } from '../value-objects/Strength';

const CreateTeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Team name must be at least 2 characters'),
});

interface CreateTeamProps {
  id: string;
  name: string;
  strength: Strength;
}

export class Team {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly strength: Strength
  ) {}

  static create(props: CreateTeamProps): Team {
    CreateTeamSchema.parse(props);
    return new Team(props.id, props.name, props.strength);
  }

  withStrength(newStrength: Strength): Team {
    return new Team(this.id, this.name, newStrength);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStrength(): Strength {
    return this.strength;
  }
}
