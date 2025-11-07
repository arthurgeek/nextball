import type { SerializedSeason } from '@/application/services/LeaguePersistenceService';

interface FixturesResultsProps {
  season: SerializedSeason;
  viewingRound: number;
}

/**
 * Server Component displaying fixtures or results for a specific round.
 */
export function FixturesResults({
  season,
  viewingRound,
}: FixturesResultsProps) {
  const round = season.rounds.find((r) => r.roundNumber === viewingRound);
  const teamMap = new Map(
    season.league.teams.map((team) => [team.id, team])
  );

  if (!round) {
    return (
      <div className="text-center py-8 opacity-60">
        <p>No fixtures for this round</p>
      </div>
    );
  }

  const isPlayed = round.matches.every((match) => match.result !== undefined);
  const title = isPlayed ? `Round ${viewingRound} Results` : `Round ${viewingRound} Fixtures`;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {round.matches.map((match) => {
          const homeTeam = teamMap.get(match.homeTeamId)!;
          const awayTeam = teamMap.get(match.awayTeamId)!;

          return (
            <div
              key={match.id}
              className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
            >
              <div className="flex-1 text-right">
                <span className="font-medium">{homeTeam.name}</span>
                <span className="text-xs opacity-60 ml-1">
                  ({homeTeam.strength.toFixed(1)})
                </span>
              </div>

              <div className="mx-4 min-w-[60px] text-center">
                {match.result ? (
                  <span className="font-bold text-lg">
                    {match.result.homeGoals} - {match.result.awayGoals}
                  </span>
                ) : (
                  <span className="text-sm opacity-60">vs</span>
                )}
              </div>

              <div className="flex-1">
                <span className="font-medium">{awayTeam.name}</span>
                <span className="text-xs opacity-60 ml-1">
                  ({awayTeam.strength.toFixed(1)})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
