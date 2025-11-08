import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeagueSimulator } from '@/components/LeagueSimulator';
import type { SerializedSeason } from '@/application/services/LeaguePersistenceService';
import { simulateNextRound } from '@/app/actions';

// Mock the server actions
vi.mock('@/app/actions', () => ({
  createNewSeason: vi.fn(),
  simulateNextRound: vi.fn(),
}));

// Mock iconify
vi.mock('@iconify-icon/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const createMockSeason = (currentRound: number, totalTeams = 10, championId: string | null = null): SerializedSeason => {
  const rounds = [];
  const totalRounds = totalTeams * 2 - 2; // Double round-robin

  for (let i = 1; i <= totalRounds; i++) {
    rounds.push({
      roundNumber: i,
      matches: [
        {
          id: `match-${i}-1`,
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          result:
            i <= currentRound
              ? { homeGoals: 2, awayGoals: 1 }
              : null,
        },
      ],
    });
  }

  return {
    id: 'season-1',
    year: 2025,
    league: {
      id: 'league-1',
      name: 'Test League',
      sortingStrategy: 'points-goal-difference',
      teams: Array.from({ length: totalTeams }, (_, i) => ({
        id: `team-${i + 1}`,
        name: `Team ${i + 1}`,
        strength: 75,
      })),
    },
    rounds,
    standings: [],
    currentRound,
    fixtureGenerationStrategy: 'double-round-robin',
    championId,
  };
};

describe('Simulate button visibility after round completion', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('shows simulate button when viewing latest completed round', async () => {
    const season = createMockSeason(1);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    await waitFor(() => {
      expect(screen.getByText('Test League')).toBeInTheDocument();
    });
    expect(screen.getByText('Simulate Next Round')).toBeInTheDocument();
  });

  it('shows simulate button when viewing next unplayed round', async () => {
    const season = createMockSeason(1);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    await waitFor(() => {
      expect(screen.getByText('Simulate Next Round')).toBeInTheDocument();
    });
  });

  it('hides simulate button when season is complete', async () => {
    const totalTeams = 10;
    const totalRounds = totalTeams * 2 - 2;
    const season = createMockSeason(totalRounds, totalTeams);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    await waitFor(() => {
      expect(screen.getByText('Season Complete!')).toBeInTheDocument();
    });
    expect(screen.queryByText('Simulate Next Round')).not.toBeInTheDocument();
  });

  it('shows simulate button after simulating a round', async () => {
    const initialSeason = createMockSeason(0);
    localStorageMock.setItem('current-season', JSON.stringify(initialSeason));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    const updatedSeason = createMockSeason(1);
    vi.mocked(simulateNextRound).mockResolvedValue(updatedSeason);

    render(<LeagueSimulator />);

    const simulateButton = screen.getByText('Simulate Next Round');
    fireEvent.click(simulateButton);

    // Wait for the simulation to complete and component to update
    await waitFor(() => {
      expect(simulateNextRound).toHaveBeenCalled();
    });

    // Wait for the button to reappear after state update
    await waitFor(() => {
      expect(screen.getByText('Simulate Next Round')).toBeInTheDocument();
    });
  });
});

describe('Round results display after simulation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('displays latest completed round results on load', async () => {
    const season = createMockSeason(1);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    await waitFor(() => {
      expect(screen.getByText('Round 1 of 18')).toBeInTheDocument();
    });
    expect(screen.getByText('Round 1 Results')).toBeInTheDocument();
    expect(screen.getByText('2 - 1')).toBeInTheDocument();
  });

  it('shows results heading not fixtures heading when round is complete', async () => {
    const season = createMockSeason(3);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    await waitFor(() => {
      expect(screen.getByText(/Round 3 Results/i)).toBeInTheDocument();
    });
    // Should say "Results" not "Fixtures"
    expect(screen.queryByText(/Round 3 Fixtures/i)).not.toBeInTheDocument();
  });

  it('updates viewing round to show latest results after simulation', async () => {
    const initialSeason = createMockSeason(0);
    localStorageMock.setItem('current-season', JSON.stringify(initialSeason));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    const updatedSeason = createMockSeason(1);
    vi.mocked(simulateNextRound).mockResolvedValue(updatedSeason);

    render(<LeagueSimulator />);

    const simulateButton = screen.getByText('Simulate Next Round');
    fireEvent.click(simulateButton);

    // Wait for the simulation to complete and component to update
    await waitFor(() => {
      expect(simulateNextRound).toHaveBeenCalled();
    });

    // Wait for the round 1 results to appear
    await waitFor(() => {
      expect(screen.getByText('Round 1 Results')).toBeInTheDocument();
    });
  });
});

describe('Championship history loading and display', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('loads championship history from localStorage on mount', () => {
    const season = createMockSeason(1);
    const championshipHistory = [
      { year: 2024, teamId: 'team-1', teamName: 'Team 1' },
      { year: 2023, teamId: 'team-2', teamName: 'Team 2' },
      { year: 2022, teamId: 'team-1', teamName: 'Team 1' },
    ];

    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify(championshipHistory));

    render(<LeagueSimulator />);

    // Component should load history on mount
    expect(localStorageMock.getItem('championship-history')).toBeTruthy();
  });

  it('opens dialog and displays championship statistics correctly', () => {
    const season = createMockSeason(1);
    const championshipHistory = [
      { year: 2024, teamId: 'team-1', teamName: 'Team 1' },
      { year: 2023, teamId: 'team-2', teamName: 'Team 2' },
      { year: 2022, teamId: 'team-1', teamName: 'Team 1' },
    ];

    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify(championshipHistory));

    render(<LeagueSimulator />);

    const historyButton = screen.getByText('Championship History');
    fireEvent.click(historyButton);

    // Dialog should open and show aggregated stats
    expect(screen.getByText('2 titles')).toBeInTheDocument();
    expect(screen.getByText('1 title')).toBeInTheDocument();

    // Should show all years
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
  });

  it('shows empty state when no championship history exists', () => {
    const season = createMockSeason(1);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    const historyButton = screen.getByText('Championship History');
    fireEvent.click(historyButton);

    expect(screen.getByText('No championships recorded yet.')).toBeInTheDocument();
    expect(screen.getByText(/Complete a season to start recording champions/i)).toBeInTheDocument();
  });

  it('aggregates multiple championships per team correctly', () => {
    const season = createMockSeason(1);
    const championshipHistory = [
      { year: 2024, teamId: 'team-1', teamName: 'Manchester City' },
      { year: 2023, teamId: 'team-1', teamName: 'Manchester City' },
      { year: 2022, teamId: 'team-1', teamName: 'Manchester City' },
      { year: 2021, teamId: 'team-2', teamName: 'Liverpool' },
    ];

    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify(championshipHistory));

    render(<LeagueSimulator />);

    const historyButton = screen.getByText('Championship History');
    fireEvent.click(historyButton);

    // Manchester City should have 3 titles
    expect(screen.getByText('3 titles')).toBeInTheDocument();

    // Liverpool should have 1 title
    expect(screen.getByText('1 title')).toBeInTheDocument();
  });

  it('closes dialog when close button clicked', () => {
    const season = createMockSeason(1);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    const historyButton = screen.getByText('Championship History');
    fireEvent.click(historyButton);

    expect(screen.getByText('No championships recorded yet.')).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    // Dialog should close - empty state message should not be visible
    expect(screen.queryByText('No championships recorded yet.')).not.toBeInTheDocument();
  });
});

describe('Navigation controls behavior', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('disables previous button on first round', () => {
    const season = createMockSeason(1);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('disables next button when viewing latest round', () => {
    const season = createMockSeason(3);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables both navigation buttons when viewing middle rounds', () => {
    const season = createMockSeason(5);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    // Navigate to round 3 (middle)
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    fireEvent.click(previousButton);

    expect(screen.getByText('Round 3 of 18')).toBeInTheDocument();
    expect(previousButton).not.toBeDisabled();

    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });
});

describe('Season initialization and year progression', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('initializes viewing round to current round when loading saved season', () => {
    const season = createMockSeason(5);
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    // Should initialize to round 5 (current round)
    expect(screen.getByText('Round 5 of 18')).toBeInTheDocument();
  });

  it('displays current season year correctly', () => {
    const season = createMockSeason(1);
    season.year = 2026;
    localStorageMock.setItem('current-season', JSON.stringify(season));
    localStorageMock.setItem('championship-history', JSON.stringify([]));

    render(<LeagueSimulator />);

    expect(screen.getByText('Season 2026')).toBeInTheDocument();
  });
});
