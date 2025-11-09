'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';

/**
 * Client Component for the home page.
 * Shows "Continue" button if saved game exists in localStorage.
 * Shows "Start New League" button to start a new game (clears localStorage if confirmed).
 */
export function Home() {
  const router = useRouter();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check localStorage for saved game on mount
  useEffect(() => {
    const saved = localStorage.getItem('current-season');
    startTransition(() => {
      setHasSavedGame(!!saved);
      setLoading(false);
    });
  }, []);

  const handleContinue = () => {
    router.push('/league');
  };

  const handleStartNewLeague = () => {
    if (hasSavedGame) {
      // Confirm before clearing saved game
      if (
        confirm(
          'Starting a new league will clear your current progress. Continue?'
        )
      ) {
        // Clear all game data
        localStorage.removeItem('current-season');
        localStorage.removeItem('championship-history');
        setHasSavedGame(false);
        router.push('/league');
      }
    } else {
      // No saved game, just navigate
      router.push('/league');
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-6xl font-bold mb-4">NextBall</h1>
          <p className="text-2xl text-base-content/70 mb-2">
            Football League Simulator
          </p>
          <p className="text-sm text-base-content/50">
            Advanced simulation with logistic regression, performance variance & home advantage
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {hasSavedGame && (
            <button
              className="btn btn-lg btn-primary w-full max-w-md"
              onClick={handleContinue}
            >
              <Icon icon="lucide:play" width="24" height="24" />
              Continue
            </button>
          )}

          <button
            className={`btn btn-lg btn-outline w-full max-w-md ${
              hasSavedGame ? '' : 'btn-primary'
            }`}
            onClick={handleStartNewLeague}
          >
            <Icon icon="lucide:plus-circle" width="24" height="24" />
            Start New League
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 p-6 bg-base-200 rounded-lg">
          <h3 className="font-semibold mb-4 text-lg">Features</h3>
          <ul className="space-y-2 text-sm text-left max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="mt-0.5 text-success flex-shrink-0" width="16" height="16" />
              <span>Simulate a full 10-team season with round-by-round results</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="mt-0.5 text-success flex-shrink-0" width="16" height="16" />
              <span>Real-time standings with points, goal difference, and form</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="mt-0.5 text-success flex-shrink-0" width="16" height="16" />
              <span>Championship history tracking across multiple seasons</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="mt-0.5 text-success flex-shrink-0" width="16" height="16" />
              <span>Customizable fixture formats and standing sorters</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="mt-0.5 text-success flex-shrink-0" width="16" height="16" />
              <span>Pure TypeScript business logic - framework agnostic</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
