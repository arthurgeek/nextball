import { LeagueSimulator } from '@/components/LeagueSimulator';

export const metadata = {
  title: 'League Simulator - NextBall',
  description: 'Simulate a full football league season with realistic match results',
};

/**
 * League page - Server Component wrapper for the LeagueSimulator
 */
export default function LeaguePage() {
  return (
    <main className="min-h-screen bg-base-300">
      <LeagueSimulator />
    </main>
  );
}
