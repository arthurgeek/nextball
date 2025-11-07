/**
 * Generate a random number from a Poisson distribution
 * Uses Knuth's algorithm for efficiency
 *
 * @param lambda - Expected value (must be >= 0)
 * @returns Random integer from Poisson(lambda)
 */
export function poissonRandom(lambda: number): number {
  if (lambda < 0) {
    throw new Error('Lambda must be non-negative');
  }

  // Special case: lambda = 0 always returns 0
  if (lambda === 0) {
    return 0;
  }

  // Knuth's algorithm
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}
