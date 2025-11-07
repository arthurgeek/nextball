# Football Manager Pro

**Project**: A realistic football management simulator (think Football Manager) built with Next.js 16+ App Router, TypeScript (strict), Tailwind + DaisyUI.  
**Goal**: Zero business logic in UI or entities. All domain code is framework-agnostic pure TypeScript that could run in Node, Deno, or Bun without changes.

## Core Principles (non-negotiable)

- **Immutable domain entities** – use private readonly fields + `withXxx()` factory methods that return new instances.
- **No business logic in entities** – entities only hold data + simple value-object validation in `static create()`.
- **All business logic lives in Services** – pure TS classes, no React/Next imports.
- **Service Coordinator Pattern** – complex flows live in `src/application/coordinators/`. A coordinator receives multiple services in constructor and orchestrates them. Example: `SeasonCoordinator` calls `MatchSimulationService → LeagueService → FinanceService → NewsService`.
- **Server Components only** – UI is 100% server-rendered unless interactivity is required (then 'use client' + minimal Client Component).
- **TDD everywhere** – use Superpowers plugin skills: `/superpowers:write-plan` → `/superpowers:execute-plan` → RED-GREEN-REFACTOR.

## Folder Structure

```
src/
├─ app/                  # Next.js App Router – SERVER COMPONENTS ONLY
│   ├─ layout.tsx
│   ├─ page.tsx          # Home / Dashboard
│   ├─ squad/page.tsx
│   ├─ tactics/page.tsx
│   ├─ transfers/page.tsx
│   ├─ fixtures/page.tsx
│   └─ api/              # only for external APIs, never business logic
├─ components/           # DaisyUI + Tailwind components (Server-first)
│   ├─ PlayerCard.tsx
│   ├─ TacticsBoard.tsx
│   └─ TransferOfferForm.tsx  # uses Server Actions
├─ domain/
│   ├─ entities/
│   │   ├─ Player.ts
│   │   ├─ Team.ts
│   │   ├─ Match.ts
│   │   ├─ League.ts
│   │   └─ Contract.ts
│   ├─ value-objects/
│   │   ├─ Money.ts
│   │   ├─ Rating.ts
│   │   ├─ Position.ts
│   │   └─ Morale.ts
│   └─ exceptions/
│       └─ DomainError.ts
├─ application/
│   ├─ services/
│   │   ├─ PlayerService.ts
│   │   ├─ TransferService.ts
│   │   ├─ MatchSimulationService.ts
│   │   ├─ FinanceService.ts
│   │   └─ TrainingService.ts
│   └─ coordinators/
│       ├─ GameCoordinator.ts         # entry point for UI
│       ├─ SeasonCoordinator.ts
│       └─ TransferWindowCoordinator.ts
├─ infrastructure/
│   ├─ repositories/
│   │   ├─ InMemoryPlayerRepository.ts  # implements PlayerRepository interface
│   │   └─ InMemoryTeamRepository.ts
│   └─ persistence/
│       └─ gameStore.ts                 # simple JSON file or SQLite later
└─ di/
└─ container.ts                     # manual DI – export { getGameCoordinator(): GameCoordinator }
tests/
├─ unit/
├─ integration/
└─ e2e/                               # Playwright
```

## Domain Entity Example (immutable)

```ts
// src/domain/entities/Player.ts
import { z } from 'zod';
import { Position } from '../value-objects/Position';
import { Rating } from '../value-objects/Rating';

const CreatePlayerSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(16).max(45),
});

export class Player {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly age: number,
    private readonly position: Position,
    private readonly rating: Rating,
    // ... more
  ) {}

  static create(props: z.infer<typeof CreatePlayerSchema> & { id: string; position: Position; rating: Rating }) {
    CreatePlayerSchema.parse(props);
    return new Player(props.id, props.name, props.age, props.position, props.rating);
  }

  // immutable update
  withImprovedRating(newRating: Rating): Player {
    return new Player(this.id, this.name, this.age, this.position, newRating);
  }

  // getters only
  getId() { return this.id; }
  getCurrentAbility() { return this.rating.overall; }
}
```

## Service Example

```ts
// src/application/services/MatchSimulationService.ts
import { Match } from '../../domain/entities/Match';
import { Team } from '../../domain/entities/Team';

export class MatchSimulationService {
  simulate(match: Match, homeTeam: Team, awayTeam: Team): Match {
    // 100% pure logic – ratings, tactics, randomness, injuries, red cards
    // return match.withResult({ homeGoals: 2, awayGoals: 1, events: [...] })
    // NEVER touch React or Next
  }
}
```

## Coordinator Example (Service Coordinator Pattern)

```ts
// src/application/coordinators/SeasonCoordinator.ts
export class SeasonCoordinator {
  constructor(
    private matchSim: MatchSimulationService,
    private leagueService: LeagueService,
    private financeService: FinanceService,
    private newsService: NewsService,
  ) {}

  advanceMatchday() {
    const fixtures = this.leagueService.getCurrentMatchdayFixtures();
    for (const f of fixtures) {
      const result = this.matchSim.simulate(f);
      this.leagueService.applyResult(result);
      this.financeService.applyGateReceipts(result);
      this.newsService.generateMatchReport(result);
    }
  }
}
```

## UI – Server Component + Server Action only

```ts
// app/squad/page.tsx
import { getGameCoordinator } from '@/di/container';
import { PlayerList } from '@/components/PlayerList';

export default async function SquadPage() {
  const coordinator = getGameCoordinator();
  const squad = await coordinator.getCurrentSquad();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Squad</h1>
      <PlayerList players={squad.players} />
    </div>
  );
}
```

## Testing (TDD mandatory – use Superpowers RED-GREEN-REFACTOR)

* Framework: Vitest (fast, Jest-compatible, built-in to Next.js)
* UI: @testing-library/react + @testing-library/user-event
* Mocking: msw (for any future APIs)
* Coverage: 100% on domain + application layers
* E2E: Playwright (configured in playwright.config.ts)

Run:

```sh
npm run test:unit      # vitest
npm run test:coverage  # vitest --coverage
npm run test:e2e       # playwright test
```

## Recommended Libraries (add to package.json)

```json
{
  "dependencies": {
    "next": "16.0.1",
    "react": "19",
    "tailwindcss": "^4.1.17",
    "daisyui": "^5.4.7",
    "zod": "^4.1.12",
    "uuid": "^13",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "vitest": "^4",
    "@vitejs/plugin-react": "^5.1.0",
    "@testing-library/react": "^16",
    "@testing-library/user-event": "^14",
    "playwright": "^1.56"
  }
}
```

