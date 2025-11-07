# Football Manager Pro

**Project**: A realistic football management simulator (think Football Manager) built with Next.js 16+ App Router, TypeScript (strict), Tailwind + DaisyUI.
**Goal**: Zero business logic in UI or entities. All domain code is framework-agnostic pure TypeScript that could run in Node, Deno, or Bun without changes.

## Core Principles (non-negotiable)

- **Immutable domain entities** – use private readonly fields + `withXxx()` factory methods that return new instances.
- **No business logic in entities** – entities only hold data + simple value-object validation in `static create()`.
- **All business logic lives in Services** – pure TS classes, no React/Next imports.
- **Service Coordinator Pattern** – complex flows live in `application/coordinators/`. A coordinator receives multiple services in constructor and orchestrates them. Example: `SeasonCoordinator` calls `MatchSimulationService → LeagueService → FinanceService → NewsService`.
- **Server Components only** – UI is 100% server-rendered unless interactivity is required (then 'use client' + minimal Client Component).
- **TDD everywhere** – RED-GREEN-REFACTOR for all domain and application logic.

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

## Testing (TDD mandatory – RED-GREEN-REFACTOR)

* **Framework**: Vitest (fast, Jest-compatible)
* **Coverage**: 100% on domain + application layers
* **E2E**: Playwright for full user flows
* **Current Status**: 59 unit tests, 10 e2e tests

Run:

```sh
npm run test:unit      # vitest
npm run test:coverage  # vitest --coverage
npm run test:e2e       # playwright test
npm run test:e2e:ui    # playwright test --ui
```

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
