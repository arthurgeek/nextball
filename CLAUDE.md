# Football Manager Pro

**Project**: A realistic football management simulator (think Football Manager) built with Next.js 16+ App Router, TypeScript (strict), Tailwind + DaisyUI.
**Goal**: Zero business logic in UI or entities. All domain code is framework-agnostic pure TypeScript that could run in Node, Deno, or Bun without changes.

## Core Principles (non-negotiable)

- **TDD FIRST - NO EXCEPTIONS** – **WRITE THE FAILING TEST BEFORE ANY CODE**. Follow RED-GREEN-REFACTOR religiously:
  1. **RED**: Write a failing test for the new behavior
  2. **GREEN**: Write minimal code to make the test pass
  3. **REFACTOR**: Improve code while keeping tests green
  - **NEVER** write domain entities, value objects, services, or coordinators without tests FIRST
  - **NEVER** skip this step even for "small changes" or refactorings
  - Tests must be in place BEFORE implementation - not after, not during, BEFORE
- **Immutable domain entities** – use private readonly fields + `withXxx()` factory methods that return new instances.
- **No business logic in entities** – entities only hold data + simple value-object validation in `static create()`.
- **All business logic lives in Services** – pure TS classes, no React/Next imports.
- **Service Coordinator Pattern** – complex flows live in `application/coordinators/`. A coordinator receives multiple services in constructor and orchestrates them. Example: `SeasonCoordinator` calls `MatchSimulationService → LeagueService → FinanceService → NewsService`.
- **Server Components only** – UI is 100% server-rendered unless interactivity is required (then 'use client' + minimal Client Component).

## Folder Structure

```
app/                  # Next.js App Router – SERVER COMPONENTS ONLY
├─ layout.tsx
├─ page.tsx           # Home / Dashboard
├─ actions.ts         # Server Actions
└─ globals.css
components/           # DaisyUI + Tailwind components (Server-first)
├─ MatchResult.tsx
└─ SimulateMatchForm.tsx  # uses Server Actions
domain/
├─ entities/
│   ├─ Team.ts
│   └─ Match.ts
├─ value-objects/
│   ├─ Strength.ts
│   └─ MatchResult.ts
└─ utils/
    ├─ poisson.ts
    ├─ xgCalculation.ts     # Multivariate logistic regression
    └─ performanceModifier.ts
application/
├─ services/
│   └─ MatchSimulationService.ts
└─ coordinators/
    └─ (future: SeasonCoordinator, etc.)
di/
└─ container.ts       # Manual DI – export service getters
tests/
├─ unit/              # Domain + Application layer tests
│   ├─ domain/
│   └─ application/
└─ e2e/               # Playwright tests
    └─ match-simulation.spec.ts
```

## Domain Entity Example (immutable)

```ts
// domain/entities/Team.ts
import { z } from 'zod';
import { Strength } from '../value-objects/Strength';

const CreateTeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Team name must be at least 2 characters'),
});

export class Team {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly strength: Strength
  ) {}

  static create(props: { id: string; name: string; strength: Strength }): Team {
    CreateTeamSchema.parse(props);
    return new Team(props.id, props.name, props.strength);
  }

  // Immutable update
  withStrength(newStrength: Strength): Team {
    return new Team(this.id, this.name, newStrength);
  }

  // Getters only
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getStrength(): Strength { return this.strength; }
}
```

## Service Example

```ts
// application/services/MatchSimulationService.ts
import { Match } from '@/domain/entities/Match';
import { calculateBaseXG } from '@/domain/utils/xgCalculation';
import { generatePerformanceModifier } from '@/domain/utils/performanceModifier';
import { poissonRandom } from '@/domain/utils/poisson';

export class MatchSimulationService {
  simulate(match: Match): Match {
    const homeTeam = match.getHomeTeam();
    const awayTeam = match.getAwayTeam();

    // Multivariate logistic regression for xG
    let homeXG = calculateBaseXG(homeTeam.getStrength().getValue(), true);
    let awayXG = calculateBaseXG(awayTeam.getStrength().getValue(), false);

    // Apply performance variance
    homeXG *= generatePerformanceModifier();
    awayXG *= generatePerformanceModifier();

    // Generate goals (Poisson distribution)
    const homeGoals = poissonRandom(homeXG);
    const awayGoals = poissonRandom(awayXG);

    const result = MatchResult.create({ homeGoals, awayGoals });
    return match.withResult(result);
  }
}
```

## UI – Server Component + Server Action

```ts
// app/page.tsx
import { SimulateMatchForm } from '@/components/SimulateMatchForm';

export default function Home() {
  return (
    <main>
      <h1>NextBall - Football Match Simulator</h1>
      <SimulateMatchForm />
    </main>
  );
}

// app/actions.ts
'use server';
import { getMatchSimulationService } from '@/di/container';

export async function simulateMatch(input: SimulateMatchInput) {
  const service = getMatchSimulationService();
  // Pure business logic, framework-agnostic
  const result = service.simulate(match);
  return result;
}
```

## TDD Workflow (MANDATORY - NO CODE WITHOUT TESTS FIRST)

**CRITICAL**: Every feature MUST follow this exact sequence. NO EXCEPTIONS.

### Step-by-Step TDD Process

**Example: Adding a new Standing Sorter Strategy**

1. **RED** - Write the failing test FIRST:
```ts
// tests/unit/application/strategies/LaLigaSorter.spec.ts
describe('LaLigaSorter', () => {
  it('should sort by points first', () => {
    const sorter = new LaLigaSorter();
    const standings = [/* test data */];
    const sorted = sorter.sort(standings);
    expect(sorted[0].getPoints()).toBe(90); // FAILS - LaLigaSorter doesn't exist yet
  });
});
```
Run `pnpm test:unit` - **TEST MUST FAIL**

2. **GREEN** - Write minimal code to pass:
```ts
// application/strategies/StandingSorter.ts
export class LaLigaSorter implements StandingSorter {
  sort(standings: Standing[]): Standing[] {
    // Minimal implementation to make test pass
    return standings.sort((a, b) => b.getPoints() - a.getPoints());
  }
}
```
Run `pnpm test:unit` - **TEST MUST PASS**

3. **REFACTOR** - Improve while keeping tests green:
```ts
// Add more test cases, refactor sorting logic, etc.
// Tests MUST stay green throughout
```

**If you write ANY production code before the test exists and fails, you have violated TDD.**

### Testing Requirements

* **Framework**: Vitest (fast, Jest-compatible)
* **Coverage**: 100% on domain + application layers
* **E2E**: Playwright for full user flows
* **Test Files**: Must exist in `tests/unit/` before production code
* **Current Status**: 59 unit tests, 10 e2e tests

Run:

```sh
pnpm test:unit      # vitest
pnpm test:coverage  # vitest --coverage
pnpm test:e2e       # playwright test
pnpm test:e2e:ui    # playwright test --ui
```

### What MUST Have Tests Before Implementation

- ✅ Domain Entities (all methods including `withXxx()`)
- ✅ Value Objects (all validation and methods)
- ✅ Services (all business logic)
- ✅ Coordinators (all orchestration logic)
- ✅ Strategies (all algorithm implementations)
- ✅ Utility functions (all pure functions)
- ❌ UI Components (test via E2E instead)
- ❌ Server Actions (test via integration/E2E)

**REMEMBER: Test file FIRST, then implementation. RED → GREEN → REFACTOR.**

## Current Implementation Status

### ✅ Implemented
- **Match Simulation Engine** (see [docs/MATCH_SIMULATION.md](docs/MATCH_SIMULATION.md))
  - Multivariate logistic regression for xG calculation
  - Performance variance (0.2-2.3x modifiers)
  - Home advantage as separate factor
  - Poisson distribution for goal generation
- **Domain Entities**: Team, Match, MatchResult, Strength
- **Value Objects**: Strength validation, MatchResult
- **Services**: MatchSimulationService
- **UI**: Interactive match simulator with history
- **Testing**: 59 unit tests, 10 e2e tests

### 🚧 To Be Implemented
- Player entities and squad management
- League and season simulation
- Tactics and formations
- Training and morale systems
- Transfer market
- Financial management
- Coordinators for complex workflows

## Recommended Libraries

```json
{
  "dependencies": {
    "next": "16.0.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.1.17",
    "daisyui": "^5.4.7",
    "zod": "^4.1.12",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "vitest": "^4.0.8",
    "@vitejs/plugin-react": "^5.1.0",
    "@playwright/test": "^1.56.1"
  }
}
```
