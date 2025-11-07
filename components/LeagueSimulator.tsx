'use client';

import { useState, useEffect } from 'react';
import { LeagueTable } from './LeagueTable';
import { FixturesResults } from './FixturesResults';
import { ChampionshipHistoryDialog } from './ChampionshipHistoryDialog';
import {
  createNewSeason,
  simulateNextRound,
  getChampionshipStats,
} from '@/app/actions';
import type { SerializedSeason } from '@/application/services/LeaguePersistenceService';

/**
 * Client Component managing league simulation state and interactions.
 */
export function LeagueSimulator() {
  const [season, setSeason] = useState<SerializedSeason | null>(null);
  const [viewingRound, setViewingRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [championshipStats, setChampionshipStats] = useState<
    Array<{
      teamId: string;
      teamName: string;
      count: number;
      years: number[];
    }>
  >([]);

  // Load saved season from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('current-season');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSeason(parsed);
        setViewingRound(parsed.currentRound || 1);
      } catch (error) {
        console.error('Failed to load saved season:', error);
      }
    }
  }, []);

  // Save season to localStorage whenever it changes
  useEffect(() => {
    if (season) {
      localStorage.setItem('current-season', JSON.stringify(season));
    }
  }, [season]);

  // Load championship stats
  useEffect(() => {
    loadChampionshipStats();
  }, []);

  const loadChampionshipStats = async () => {
    const stats = await getChampionshipStats();
    setChampionshipStats(stats);
  };

  const handleStartNewSeason = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const newSeason = await createNewSeason(currentYear);
      setSeason(newSeason);
      setViewingRound(1);
    } catch (error) {
      console.error('Failed to create season:', error);
      alert('Failed to create new season');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNextRound = async () => {
    if (!season) return;

    setLoading(true);
    try {
      const updated = await simulateNextRound(season);
      setSeason(updated);
      setViewingRound(updated.currentRound);

      // Reload championship stats if season completed
      if (updated.championId) {
        await loadChampionshipStats();
      }
    } catch (error) {
      console.error('Failed to simulate round:', error);
      alert('Failed to simulate round');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousRound = () => {
    if (viewingRound > 1) {
      setViewingRound(viewingRound - 1);
    }
  };

  const handleNextRound = () => {
    if (season && viewingRound < season.currentRound) {
      setViewingRound(viewingRound + 1);
    }
  };

  const handleGoToLatest = () => {
    if (season) {
      setViewingRound(season.currentRound);
    }
  };

  if (!season) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">League Simulator</h1>
          <p className="opacity-70">
            Simulate a full 10-team league season with round-by-round results
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStartNewSeason}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              'Start New Season'
            )}
          </button>
        </div>
      </div>
    );
  }

  const isSeasonComplete = season.currentRound >= season.league.teams.length * 2 - 2;
  const canSimulate = !isSeasonComplete;
  const isViewingLatest = viewingRound === season.currentRound;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{season.league.name}</h1>
          <p className="text-sm opacity-70">Season {season.year}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setShowHistory(true)}
          >
            Championship History
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={() => {
              if (
                confirm('Start a new season? Current progress will be saved to history if complete.')
              ) {
                handleStartNewSeason();
              }
            }}
          >
            New Season
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-base-200 p-4 rounded-lg">
        <button
          className="btn btn-sm"
          onClick={handlePreviousRound}
          disabled={viewingRound <= 1}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          <span className="font-semibold">
            Round {viewingRound} of {season.rounds.length}
          </span>

          {!isViewingLatest && (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleGoToLatest}
            >
              Go to Latest
            </button>
          )}

          {isViewingLatest && canSimulate && (
            <button
              className="btn btn-sm btn-success"
              onClick={handleSimulateNextRound}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Simulate Next Round'
              )}
            </button>
          )}

          {isSeasonComplete && (
            <span className="badge badge-success badge-lg">
              Season Complete!
            </span>
          )}
        </div>

        <button
          className="btn btn-sm"
          onClick={handleNextRound}
          disabled={viewingRound >= season.currentRound}
        >
          Next →
        </button>
      </div>

      {/* Split-screen: League Table + Fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: League Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">League Table</h2>
            <LeagueTable season={season} />
          </div>
        </div>

        {/* Right: Fixtures/Results */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <FixturesResults season={season} viewingRound={viewingRound} />
          </div>
        </div>
      </div>

      {/* Championship History Dialog */}
      <ChampionshipHistoryDialog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        stats={championshipStats}
      />
    </div>
  );
}
