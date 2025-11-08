import type { SerializedSeason } from '@/application/services/LeaguePersistenceService';

interface LeagueTableProps {
  season: SerializedSeason;
}

/**
 * Server Component displaying the league standings table.
 * Shows position, team name, stats (P W D L GF GA GD Pts), and form.
 */
export function LeagueTable({ season }: LeagueTableProps) {
  const standings = season.standings;
  const teamMap = new Map(
    season.league.teams.map((team) => [team.id, team])
  );

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr>
            <th className="w-12">Pos</th>
            <th>Team</th>
            <th className="text-center">P</th>
            <th className="text-center">W</th>
            <th className="text-center">D</th>
            <th className="text-center">L</th>
            <th className="text-center">GF</th>
            <th className="text-center">GA</th>
            <th className="text-center">GD</th>
            <th className="text-center">Pts</th>
            <th className="text-center">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => {
            const team = teamMap.get(standing.teamId)!;
            const points = standing.won * 3 + standing.drawn;
            const goalDiff = standing.goalsFor - standing.goalsAgainst;
            // Position change: previousPosition - position (positive = moved up)
            const posChange = standing.previousPosition === 0
              ? 0
              : standing.previousPosition - standing.position;
            const isChampion =
              season.championId === standing.teamId && season.championId;

            return (
              <tr key={standing.teamId} className="hover">
                <td className="font-semibold">
                  <div className="flex items-center gap-1">
                    <span>{standing.position}</span>
                    {posChange > 0 && (
                      <span className="text-xs text-success">
                        +{posChange}
                      </span>
                    )}
                    {posChange < 0 && (
                      <span className="text-xs text-error">{posChange}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {isChampion && <span title="Champion">🏆</span>}
                    <span className="font-medium">{team.name}</span>
                    <span className="text-xs opacity-60">
                      ({team.strength.toFixed(1)})
                    </span>
                  </div>
                </td>
                <td className="text-center">{standing.played}</td>
                <td className="text-center">{standing.won}</td>
                <td className="text-center">{standing.drawn}</td>
                <td className="text-center">{standing.lost}</td>
                <td className="text-center">{standing.goalsFor}</td>
                <td className="text-center">{standing.goalsAgainst}</td>
                <td
                  className={`text-center font-semibold ${
                    goalDiff > 0
                      ? 'text-success'
                      : goalDiff < 0
                        ? 'text-error'
                        : ''
                  }`}
                >
                  {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                </td>
                <td className="text-center font-bold">{points}</td>
                <td className="text-center">
                  <FormDisplay form={standing.form} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Display form as colored dots with tooltips
 */
function FormDisplay({ form }: { form: ('W' | 'D' | 'L')[] }) {
  if (form.length === 0) {
    return <span className="text-xs opacity-50">-</span>;
  }

  return (
    <div className="flex gap-0.5 justify-center">
      {form.map((result, index) => {
        const colorClass =
          result === 'W'
            ? 'bg-success'
            : result === 'D'
              ? 'bg-warning'
              : 'bg-error';

        return (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${colorClass}`}
            title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
          />
        );
      })}
    </div>
  );
}
