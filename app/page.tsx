import { SimulateMatchForm } from '@/components/SimulateMatchForm';

export default function Home() {
  return (
    <main className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2">NextBall</h1>
        <p className="text-xl text-base-content/70">
          Football Match Simulator
        </p>
        <p className="text-sm text-base-content/50 mt-2">
          Advanced simulation with logistic regression, performance variance & home advantage
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <SimulateMatchForm />
      </div>

      <div className="mt-12 text-center text-sm text-base-content/50">
        <div className="divider"></div>
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="space-y-1">
          <li>Logistic regression converts team strength to xG (S-curve for realism)</li>
          <li>Home team gets +15% boost to xG (realistic home advantage)</li>
          <li>Performance variance adds random multipliers (most: 0.85-1.15x, rare miracles: 1.8-2.3x)</li>
          <li>Actual goals generated using Poisson distribution</li>
          <li>Weak teams can upset strong teams (~20% of the time)</li>
          <li>100% pure TypeScript business logic - framework agnostic</li>
        </ul>
      </div>
    </main>
  );
}
