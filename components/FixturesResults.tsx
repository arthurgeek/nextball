import { Icon } from '@iconify-icon/react';
import type { SerializedSeason } from '@/application/services/LeaguePersistenceService';

interface FixturesResultsProps {
  season: SerializedSeason;
  viewingRound: number;
}

/**
 * Server Component displaying fixtures or results for a specific round.
 * Shows home advantage icons and neutral venue icons.
 * When viewing completed round, also shows next round fixtures if available.
 */
export function FixturesResults({
  season,
  viewingRound,
}: FixturesResultsProps) {
  const round = season.rounds.find((r) => r.roundNumber === viewingRound);
  const nextRound = season.rounds.find((r) => r.roundNumber === viewingRound + 1);

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
  const showNextFixtures = isPlayed && nextRound && nextRound.matches.every(m => !m.result);

  const renderMatches = (matches: typeof round.matches) => (
    <div className="space-y-2">
      {matches.map((match) => {
        const homeTeam = teamMap.get(match.homeTeamId)!;
        const awayTeam = teamMap.get(match.awayTeamId)!;

        return (
          <div
            key={match.id}
            className="flex items-center justify-between gap-3 p-3 bg-base-200 rounded-lg"
          >
            {/* Home Team - right aligned */}
            <div className="flex-1 flex items-center justify-end gap-2">
              {!match.isNeutralVenue && (
                <Icon
                  icon="lucide:home"
                  width="14"
                  height="14"
                  className="text-success flex-shrink-0"
                  title="Home advantage"
                />
              )}
              <span className="font-medium">{homeTeam.name}</span>
              <span className="text-xs opacity-60 flex-shrink-0">
                ({homeTeam.strength.toFixed(1)})
              </span>
            </div>

            {/* Score/VS */}
            <div className="min-w-[80px] text-center flex items-center justify-center gap-2 flex-shrink-0">
              {match.result ? (
                <span className="font-bold text-lg">
                  {match.result.homeGoals} - {match.result.awayGoals}
                </span>
              ) : (
                <>
                  <span className="text-sm opacity-60">vs</span>
                  {match.isNeutralVenue && (
                    <Icon
                      icon="lucide:map-pin"
                      width="14"
                      height="14"
                      className="opacity-60 flex-shrink-0"
                      title="Neutral venue"
                    />
                  )}
                </>
              )}
            </div>

            {/* Away Team - left aligned */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs opacity-60 flex-shrink-0">
                ({awayTeam.strength.toFixed(1)})
              </span>
              <span className="font-medium">{awayTeam.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Current Round */}
      <div>
        <h3 className="text-lg font-bold mb-3">
          {isPlayed ? `Round ${viewingRound} Results` : `Round ${viewingRound} Fixtures`}
        </h3>
        {renderMatches(round.matches)}
      </div>

      {/* Next Round Fixtures */}
      {showNextFixtures && (
        <div>
          <h3 className="text-lg font-bold mb-3 opacity-70">
            Round {viewingRound + 1} Fixtures
          </h3>
          {renderMatches(nextRound.matches)}
        </div>
      )}
    </div>
  );
}
