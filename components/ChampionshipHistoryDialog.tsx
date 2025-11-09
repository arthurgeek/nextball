'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@iconify-icon/react';

interface ChampionshipHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Array<{
    teamId: string;
    teamName: string;
    count: number;
    years: number[];
  }>;
}

/**
 * Client Component displaying championship history across all seasons.
 * Shows each team's total wins and the years they won.
 * Uses CSS-based modal control (modal-open class).
 */
export function ChampionshipHistoryDialog({
  isOpen,
  onClose,
  stats,
}: ChampionshipHistoryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sort by championship count (descending)
  const sortedStats = [...stats].sort((a, b) => b.count - a.count);

  // Handle ESC key globally when dialog is open
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${isOpen ? 'modal-open' : ''}`}
    >
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-4">Championship History</h3>

        {sortedStats.length === 0 ? (
          <div className="text-center py-8 opacity-60">
            <p>No championships recorded yet.</p>
            <p className="text-sm mt-2">
              Complete a season to start recording champions!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStats.map((stat) => (
              <div
                key={stat.teamId}
                className="card bg-base-200 shadow-sm"
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏆</span>
                      <div>
                        <h4 className="font-bold text-lg">{stat.teamName}</h4>
                        <p className="text-sm opacity-70">
                          {stat.count} {stat.count === 1 ? 'title' : 'titles'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {stat.years.map((year) => (
                          <span
                            key={year}
                            className="badge badge-primary badge-sm"
                          >
                            {year}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            <Icon icon="lucide:x" width="16" height="16" />
            Close
          </button>
        </div>
      </div>
      {/* Backdrop - clicking outside closes the dialog */}
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
