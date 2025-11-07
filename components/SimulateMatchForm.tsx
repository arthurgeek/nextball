'use client';

import { useState } from 'react';
import { simulateMatch, type SimulateMatchOutput } from '@/app/actions';
import { MatchResult } from './MatchResult';

export function SimulateMatchForm() {
  const [homeTeamName, setHomeTeamName] = useState('Manchester United');
  const [homeStrength, setHomeStrength] = useState(85);
  const [awayTeamName, setAwayTeamName] = useState('Liverpool');
  const [awayStrength, setAwayStrength] = useState(83);
  const [matchHistory, setMatchHistory] = useState<SimulateMatchOutput[]>([]);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const output = await simulateMatch({
        homeTeamName,
        homeTeamStrength: homeStrength,
        awayTeamName,
        awayTeamStrength: awayStrength,
      });

      // Add new result to the beginning of history, keep last 10 matches
      setMatchHistory(prev => [output, ...prev].slice(0, 10));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Set Up Match</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Home Team */}
            <div className="space-y-4">
              <div className="form-control">
                <label htmlFor="home-team" className="label">
                  <span className="label-text font-semibold">Home Team</span>
                </label>
                <input
                  id="home-team"
                  type="text"
                  value={homeTeamName}
                  onChange={(e) => setHomeTeamName(e.target.value)}
                  className="input input-bordered"
                  required
                  minLength={2}
                />
              </div>

              <div className="form-control">
                <label htmlFor="home-strength" className="label">
                  <span className="label-text">Strength: {homeStrength}</span>
                </label>
                <input
                  id="home-strength"
                  type="range"
                  min="0"
                  max="100"
                  value={homeStrength}
                  onChange={(e) => setHomeStrength(Number(e.target.value))}
                  className="range range-primary"
                />
                <div className="flex justify-between text-xs px-2 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="space-y-4">
              <div className="form-control">
                <label htmlFor="away-team" className="label">
                  <span className="label-text font-semibold">Away Team</span>
                </label>
                <input
                  id="away-team"
                  type="text"
                  value={awayTeamName}
                  onChange={(e) => setAwayTeamName(e.target.value)}
                  className="input input-bordered"
                  required
                  minLength={2}
                />
              </div>

              <div className="form-control">
                <label htmlFor="away-strength" className="label">
                  <span className="label-text">Strength: {awayStrength}</span>
                </label>
                <input
                  id="away-strength"
                  type="range"
                  min="0"
                  max="100"
                  value={awayStrength}
                  onChange={(e) => setAwayStrength(Number(e.target.value))}
                  className="range range-secondary"
                />
                <div className="flex justify-between text-xs px-2 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Simulating...
                </>
              ) : (
                'Simulate Match'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Latest Match Result */}
      {matchHistory.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-3">Latest Result</h3>
          <MatchResult result={matchHistory[0]} />
        </div>
      )}

      {/* Match History */}
      {matchHistory.length > 1 && (
        <div>
          <h3 className="text-xl font-bold mb-3">Match History</h3>
          <div className="space-y-3">
            {matchHistory.slice(1).map((match, index) => (
              <div key={index} className="opacity-75 hover:opacity-100 transition-opacity">
                <MatchResult result={match} />
              </div>
            ))}
          </div>

          {matchHistory.length >= 10 && (
            <div className="text-center text-sm text-base-content/50 mt-4">
              Showing last 10 matches
            </div>
          )}
        </div>
      )}
    </div>
  );
}
