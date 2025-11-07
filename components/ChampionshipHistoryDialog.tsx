'use client';

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
 */
export function ChampionshipHistoryDialog({
  isOpen,
  onClose,
  stats,
}: ChampionshipHistoryDialogProps) {
  if (!isOpen) return null;

  // Sort by championship count (descending)
  const sortedStats = [...stats].sort((a, b) => b.count - a.count);

  return (
    <dialog className="modal modal-open">
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
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}
