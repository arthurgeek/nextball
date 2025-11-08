'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import { getAvailableSorters, getAvailableGenerators } from '@/app/actions';

interface StrategySelectionDialogProps {
  isOpen: boolean;
  onConfirm: (generatorName: string, sorterName: string) => void;
  onCancel: () => void;
}

/**
 * Dialog for selecting fixture generation and standing sorting strategies
 * when creating a new season.
 */
export function StrategySelectionDialog({
  isOpen,
  onConfirm,
  onCancel,
}: StrategySelectionDialogProps) {
  const [generators, setGenerators] = useState<Array<{ name: string; displayName: string }>>([]);
  const [sorters, setSorters] = useState<Array<{ name: string; displayName: string }>>([]);
  const [selectedGenerator, setSelectedGenerator] = useState('double-round-robin');
  const [selectedSorter, setSelectedSorter] = useState('points-goal-difference');
  const [loading, setLoading] = useState(false);

  // Load available strategies when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([getAvailableGenerators(), getAvailableSorters()])
        .then(([gens, sorts]) => {
          setGenerators(gens);
          setSorters(sorts);
        })
        .catch((error) => {
          console.error('Failed to load strategies:', error);
          alert('Failed to load available strategies');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(selectedGenerator, selectedSorter);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Season</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Fixture Format Selection */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Select Fixture Format</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedGenerator}
                onChange={(e) => setSelectedGenerator(e.target.value)}
                aria-label="Fixture Format"
              >
                {generators.map((gen) => (
                  <option key={gen.name} value={gen.name}>
                    {gen.displayName}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt opacity-70">
                  Determines how matches are scheduled throughout the season
                </span>
              </label>
            </div>

            {/* Table Sorting Selection */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Select Table Sorting</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedSorter}
                onChange={(e) => setSelectedSorter(e.target.value)}
                aria-label="Table Sorting"
              >
                {sorters.map((sorter) => (
                  <option key={sorter.name} value={sorter.name}>
                    {sorter.displayName}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt opacity-70">
                  How teams are ranked in the league table
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            <Icon icon="lucide:check" width="20" height="20" />
            Create Season
          </button>
        </div>
      </div>
    </div>
  );
}
