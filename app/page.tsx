import Link from 'next/link';
import { SimulateMatchForm } from '@/components/SimulateMatchForm';

export default function Home() {
  return (
    <main className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2">NextBall</h1>
        <p className="text-xl text-base-content/70">
          Football Management Simulator
        </p>
        <p className="text-sm text-base-content/50 mt-2">
          Advanced simulation with logistic regression, performance variance & home advantage
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-6xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        <Link href="/league" className="card bg-primary text-primary-content shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title text-2xl">League Simulator</h2>
            <p>Simulate a full 10-team season with round-by-round results, standings, and championship tracking</p>
            <div className="card-actions justify-end">
              <button className="btn btn-secondary">Start League →</button>
            </div>
          </div>
        </Link>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">Single Match Simulator</h2>
            <p>Test the match engine by simulating individual matches between custom teams</p>
            <div className="card-actions justify-end">
              <span className="badge badge-ghost">Below ↓</span>
            </div>
          </div>
        </div>
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
