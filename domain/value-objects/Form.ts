import { z } from 'zod';

/**
 * Enum representing a single match result for form tracking
 */
export enum FormResult {
  WIN = 'W',
  DRAW = 'D',
  LOSS = 'L',
}

const FormResultSchema = z.nativeEnum(FormResult);

interface CreateFormProps {
  results: FormResult[];
}

/**
 * Form value object representing a team's last N results (typically 5).
 * Used for displaying recent performance in the league table.
 */
export class Form {
  private constructor(private readonly results: FormResult[]) {}

  static create(props: CreateFormProps = { results: [] }): Form {
    // Keep only last 5 results
    const trimmedResults = props.results.slice(-5);
    trimmedResults.forEach((result) => FormResultSchema.parse(result));
    return new Form(trimmedResults);
  }

  /**
   * Add a new result to the form. Returns a new Form instance with the result appended.
   * Automatically keeps only the last 5 results.
   */
  addResult(result: FormResult): Form {
    FormResultSchema.parse(result);
    const newResults = [...this.results, result].slice(-5);
    return new Form(newResults);
  }

  getResults(): FormResult[] {
    return [...this.results];
  }

  /**
   * Get results as a string (e.g., "WDLWW")
   */
  toString(): string {
    return this.results.join('');
  }

  /**
   * Get the number of wins in current form
   */
  getWins(): number {
    return this.results.filter((r) => r === FormResult.WIN).length;
  }

  /**
   * Get the number of draws in current form
   */
  getDraws(): number {
    return this.results.filter((r) => r === FormResult.DRAW).length;
  }

  /**
   * Get the number of losses in current form
   */
  getLosses(): number {
    return this.results.filter((r) => r === FormResult.LOSS).length;
  }

  /**
   * Get points from current form (W=3, D=1, L=0)
   */
  getPoints(): number {
    return this.results.reduce((total, result) => {
      if (result === FormResult.WIN) return total + 3;
      if (result === FormResult.DRAW) return total + 1;
      return total;
    }, 0);
  }

  isEmpty(): boolean {
    return this.results.length === 0;
  }
}
