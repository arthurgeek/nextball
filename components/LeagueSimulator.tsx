'use client';

import { useState, useEffect } from 'react';
import { LeagueTable } from './LeagueTable';
import { FixturesResults } from './FixturesResults';
import { ChampionshipHistoryDialog } from './ChampionshipHistoryDialog';
import { StrategySelectionDialog } from './StrategySelectionDialog';
import {
  createNewSeason,
  simulateNextRound,
} from '@/app/actions';
import type { SerializedSeason } from '@/application/services/LeaguePersistenceService';
import { Icon } from '@iconify-icon/react';

/**
 * Client Component managing league simulation state and interactions.
 */
export function LeagueSimulator() {
  const [season, setSeason] = useState<SerializedSeason | null>(null);
  const [viewingRound, setViewingRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStrategyDialog, setShowStrategyDialog] = useState(false);
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

  // Load championship stats from localStorage (client-side only)
  useEffect(() => {
    loadChampionshipStats();
  }, []);

  const loadChampionshipStats = () => {
    try {
      const historyJson = localStorage.getItem('championship-history');
      if (!historyJson) {
        setChampionshipStats([]);
        return;
      }

      const history: Array<{
        year: number;
        teamId: string;
        teamName: string;
      }> = JSON.parse(historyJson);

      // Group by team
      const statsMap = new Map<
        string,
        { count: number; years: number[]; teamName: string }
      >();

      for (const record of history) {
        const existing = statsMap.get(record.teamId);
        if (existing) {
          existing.count++;
          existing.years.push(record.year);
          existing.years.sort((a, b) => b - a);
        } else {
          statsMap.set(record.teamId, {
            count: 1,
            years: [record.year],
            teamName: record.teamName,
          });
        }
      }

      const stats = Array.from(statsMap.entries()).map(([teamId, data]) => ({
        teamId,
        teamName: data.teamName,
        count: data.count,
        years: data.years,
      }));

      setChampionshipStats(stats);
    } catch (error) {
      console.error('Failed to load championship stats:', error);
      setChampionshipStats([]);
    }
  };

  const handleStartNewSeason = () => {
    setShowStrategyDialog(true);
  };

  const handleConfirmStrategies = async (generatorName: string, sorterName: string) => {
    setShowStrategyDialog(false);
    setLoading(true);
    try {
      // Increment year if there's an existing season, otherwise use current year
      const year = season ? season.year + 1 : new Date().getFullYear();
      const newSeason = await createNewSeason(year, generatorName, sorterName);
      setSeason(newSeason);
      // Set viewing round to 1 (first fixtures) since currentRound is 0
      setViewingRound(1);
      // Reload championship history in case previous season was completed
      await loadChampionshipStats();
    } catch (error) {
      console.error('Failed to create season:', error);
      alert('Failed to create new season');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelStrategies = () => {
    setShowStrategyDialog(false);
  };

  const handleSimulateNextRound = async () => {
    if (!season) return;

    setLoading(true);
    try {
      const updated = await simulateNextRound(season);
      setSeason(updated);
      // Show the results of the round that was just simulated
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
      // Go to the next unplayed round (currentRound + 1)
      setViewingRound(season.currentRound + 1);
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
              <>
                <Icon icon="lucide:play" width="20" height="20" />
                Start New Season
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const isSeasonComplete = season.currentRound >= season.league.teams.length * 2 - 2;
  const canSimulate = !isSeasonComplete;
  // We're viewing the "next" round if viewingRound is currentRound + 1
  const isViewingNext = viewingRound === season.currentRound + 1;
  // We're viewing latest completed results if viewingRound === currentRound and currentRound > 0
  const isViewingLatest = viewingRound === season.currentRound && season.currentRound > 0;

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold">{season.league.name}</h1>
          <p className="text-sm opacity-70">Season {season.year}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setShowHistory(true)}
          >
            <Icon icon="lucide:trophy" width="16" height="16" />
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
            <Icon icon="lucide:refresh-cw" width="16" height="16" />
            New Season
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-base-200 p-3 rounded-lg">
        <button
          className="btn btn-sm"
          onClick={handlePreviousRound}
          disabled={viewingRound <= 1}
        >
          <Icon icon="lucide:chevron-left" width="16" height="16" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          <span className="font-semibold">
            Round {viewingRound} of {season.rounds.length}
          </span>

          {!isViewingNext && !isViewingLatest && (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleGoToLatest}
            >
              <Icon icon="lucide:fast-forward" width="16" height="16" />
              Go to Latest
            </button>
          )}

          {(isViewingNext || isViewingLatest) && canSimulate && (
            <button
              className="btn btn-sm btn-success"
              onClick={handleSimulateNextRound}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <Icon icon="lucide:play" width="16" height="16" />
                  Simulate Next Round
                </>
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
          Next
          <Icon icon="lucide:chevron-right" width="16" height="16" />
        </button>
      </div>

      {/* Split-screen: League Table (bigger) + Fixtures (smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: League Table - takes 2 columns */}
        <div className="lg:col-span-2 card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h2 className="card-title text-base">League Table</h2>
            <LeagueTable season={season} />
          </div>
        </div>

        {/* Right: Fixtures/Results - takes 1 column */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
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

      {/* Strategy Selection Dialog */}
      <StrategySelectionDialog
        isOpen={showStrategyDialog}
        onConfirm={handleConfirmStrategies}
        onCancel={handleCancelStrategies}
      />
    </div>
  );
}
