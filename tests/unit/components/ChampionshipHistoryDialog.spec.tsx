import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChampionshipHistoryDialog } from '@/components/ChampionshipHistoryDialog';

describe('ChampionshipHistoryDialog', () => {
  it('should group multiple championships by the same team', () => {
    const stats = [
      {
        teamId: 'team-1',
        teamName: 'Aston Villa',
        count: 2,
        years: [2027, 2026],
      },
      {
        teamId: 'team-2',
        teamName: 'Tottenham',
        count: 1,
        years: [2025],
      },
    ];

    render(
      <ChampionshipHistoryDialog
        isOpen={true}
        onClose={() => {}}
        stats={stats}
      />
    );

    // Should show "2 titles" for Aston Villa, not "1 title" twice
    expect(screen.getByText('2 titles')).toBeInTheDocument();
    expect(screen.getByText('1 title')).toBeInTheDocument();

    // Should show both years for Aston Villa
    expect(screen.getByText('2027')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();

    // Should show team names
    expect(screen.getByText('Aston Villa')).toBeInTheDocument();
    expect(screen.getByText('Tottenham')).toBeInTheDocument();
  });

  it('should sort teams by championship count descending', () => {
    const stats = [
      {
        teamId: 'team-1',
        teamName: 'Arsenal',
        count: 1,
        years: [2025],
      },
      {
        teamId: 'team-2',
        teamName: 'Liverpool',
        count: 3,
        years: [2027, 2026, 2024],
      },
      {
        teamId: 'team-3',
        teamName: 'Chelsea',
        count: 2,
        years: [2028, 2023],
      },
    ];

    const { container } = render(
      <ChampionshipHistoryDialog
        isOpen={true}
        onClose={() => {}}
        stats={stats}
      />
    );

    const teamCards = container.querySelectorAll('.card');
    // Liverpool (3) should be first, Chelsea (2) second, Arsenal (1) third
    expect(teamCards[0]).toHaveTextContent('Liverpool');
    expect(teamCards[0]).toHaveTextContent('3 titles');
    expect(teamCards[1]).toHaveTextContent('Chelsea');
    expect(teamCards[1]).toHaveTextContent('2 titles');
    expect(teamCards[2]).toHaveTextContent('Arsenal');
    expect(teamCards[2]).toHaveTextContent('1 title');
  });

  it('should show empty state when no championships', () => {
    render(
      <ChampionshipHistoryDialog
        isOpen={true}
        onClose={() => {}}
        stats={[]}
      />
    );

    expect(screen.getByText('No championships recorded yet.')).toBeInTheDocument();
    expect(screen.getByText('Complete a season to start recording champions!')).toBeInTheDocument();
  });

  it('should group same team with same ID winning in different years', () => {
    // This test ensures that if Newcastle (with same teamId) wins in 2025 and 2031,
    // it shows as "Newcastle - 2 titles" with years [2025, 2031]
    // NOT as two separate entries
    const stats = [
      {
        teamId: 'team-newcastle-uuid',
        teamName: 'Newcastle',
        count: 2,
        years: [2031, 2025], // Sorted descending
      },
    ];

    render(
      <ChampionshipHistoryDialog
        isOpen={true}
        onClose={() => {}}
        stats={stats}
      />
    );

    // Should show "2 titles" for Newcastle
    expect(screen.getByText('2 titles')).toBeInTheDocument();
    expect(screen.getByText('Newcastle')).toBeInTheDocument();

    // Should show both years
    expect(screen.getByText('2031')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();

    // Should NOT show "1 title" anywhere (which would indicate duplicate entries)
    expect(screen.queryByText('1 title')).not.toBeInTheDocument();
  });
});
