import type { SimulateMatchOutput } from '@/app/actions';

interface MatchResultProps {
  result: SimulateMatchOutput;
}

export function MatchResult({ result }: MatchResultProps) {
  const getResultBadgeColor = () => {
    switch (result.result) {
      case 'home':
        return 'badge-success';
      case 'away':
        return 'badge-error';
      case 'draw':
        return 'badge-warning';
    }
  };

  const getResultText = () => {
    switch (result.result) {
      case 'home':
        return `${result.homeTeamName} wins!`;
      case 'away':
        return `${result.awayTeamName} wins!`;
      case 'draw':
        return 'Draw!';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title justify-center text-2xl mb-4">Match Result</h2>

        <div className="flex justify-between items-center gap-8 mb-4">
          <div className="flex-1 text-right">
            <h3 className="text-xl font-bold">{result.homeTeamName}</h3>
            <div className="badge badge-sm badge-neutral mt-1">Home</div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums">
              {result.score}
            </div>
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-xl font-bold">{result.awayTeamName}</h3>
            <div className="badge badge-sm badge-ghost mt-1">Away</div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <div className={`badge badge-lg ${getResultBadgeColor()}`}>
            {getResultText()}
          </div>
        </div>
      </div>
    </div>
  );
}
