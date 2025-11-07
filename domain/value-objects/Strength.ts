import { z } from 'zod';

const StrengthSchema = z.number().int('Strength must be an integer').min(0).max(100);

export class Strength {
  private constructor(private readonly value: number) {}

  static create(value: number): Strength {
    const result = StrengthSchema.safeParse(value);

    if (!result.success) {
      const issues = result.error.issues;
      if (issues.length > 0 && issues[0].message.includes('integer')) {
        throw new Error('Strength must be an integer');
      }
      throw new Error('Strength must be between 0 and 100');
    }

    return new Strength(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Strength): boolean {
    return this.value === other.value;
  }
}
