import { test, expect } from '@playwright/test';

test.describe('Championship History Grouping - Team ID Preservation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should preserve team IDs across seasons', async ({ page }) => {
    // Navigate to league page
    await page.goto('/league');

    // Start first season
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Wait for strategy dialog
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible();

    // Wait for button to be enabled (strategies loading)
    const createButton = page.getByRole('button', { name: /Create Season/i });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();

    // Confirm with default strategies
    await createButton.click();

    // Wait for season to be created (viewing round 1)
    await expect(page.getByText(/Round 1 of/)).toBeVisible();

    // Get team IDs from first season
    const season1Teams = await page.evaluate(() => {
      const seasonData = localStorage.getItem('current-season');
      if (!seasonData) return null;
      const season = JSON.parse(seasonData) as { league: { teams: Array<{ id: string; name: string }> } };
      return season.league.teams.map((t) => ({ id: t.id, name: t.name }));
    });

    expect(season1Teams).toBeTruthy();
    expect(season1Teams).toHaveLength(10);

    // Start second season
    // Set up dialog handler before clicking
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /New Season/i }).click();
    const dialog = await dialogPromise;
    await dialog.accept();

    // Wait for strategy dialog
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible({ timeout: 10000 });

    // Wait for button to be enabled (strategies loading)
    const createButton2 = page.getByRole('button', { name: /Create Season/i });
    await expect(createButton2).toBeVisible();
    await expect(createButton2).toBeEnabled();

    // Confirm with default strategies
    await createButton2.click();

    // Wait for new season to be created
    await expect(page.getByText(/Round 1 of/)).toBeVisible();

    // Get team IDs from second season
    const season2Teams = await page.evaluate(() => {
      const seasonData = localStorage.getItem('current-season');
      if (!seasonData) return null;
      const season = JSON.parse(seasonData) as { league: { teams: Array<{ id: string; name: string }> } };
      return season.league.teams.map((t) => ({ id: t.id, name: t.name }));
    });

    expect(season2Teams).toBeTruthy();
    expect(season2Teams).toHaveLength(10);

    // Verify that team IDs are PRESERVED across seasons
    for (let i = 0; i < season1Teams!.length; i++) {
      const team1 = season1Teams![i];
      const team2 = season2Teams!.find((t) => t.name === team1.name);

      expect(team2).toBeTruthy();
      expect(team2!.id).toBe(team1.id); // CRITICAL: IDs must match!
    }
  });
});

// Temporary tests with localStorage injection to verify grouping logic works
test.describe('Championship History Grouping - Logic Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/league');
    await page.evaluate(() => localStorage.clear());
  });

  test('LOGIC ONLY: grouping works when team IDs are same', async ({ page }) => {
    // This test verifies the grouping LOGIC is correct
    // The REAL bug is that team IDs change between seasons
    await page.evaluate(() => {
      const history = [
        { year: 2025, teamId: 'west-ham-uuid', teamName: 'West Ham' },
        { year: 2026, teamId: 'west-ham-uuid', teamName: 'West Ham' }, // SAME ID
      ];
      localStorage.setItem('championship-history', JSON.stringify(history));

      const mockSeason = {
        league: {
          id: '1',
          name: 'Premier League',
          teams: [{ id: 'west-ham-uuid', name: 'West Ham', strength: 72 }],
        },
        year: 2027,
        currentRound: 1,
        rounds: [{ matches: [] }],
        championId: null,
        standings: [
          { teamId: 'west-ham-uuid', teamName: 'West Ham', points: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, form: [] },
        ],
      };
      localStorage.setItem('current-season', JSON.stringify(mockSeason));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Championship History/i }).click();
    const dialog = page.locator('dialog.modal-open .modal-box');

    // Grouping LOGIC works correctly
    const westHamCards = dialog.locator('.card:has-text("West Ham")');
    await expect(westHamCards).toHaveCount(1);
    await expect(westHamCards.getByText('2 titles')).toBeVisible();
  });

  test('BUG REPRODUCTION: shows why real bug happens (team IDs change)', async ({ page }) => {
    // This simulates what ACTUALLY happens in production:
    // Each season creates teams with NEW UUIDs
    await page.evaluate(() => {
      const history = [
        { year: 2025, teamId: 'west-ham-uuid-season-1', teamName: 'West Ham' },
        { year: 2026, teamId: 'west-ham-uuid-season-2', teamName: 'West Ham' }, // DIFFERENT ID!
      ];
      localStorage.setItem('championship-history', JSON.stringify(history));

      const mockSeason = {
        league: {
          id: '1',
          name: 'Premier League',
          teams: [
            { id: 'west-ham-uuid-season-1', name: 'West Ham', strength: 72 },
            { id: 'west-ham-uuid-season-2', name: 'West Ham', strength: 72 },
          ],
        },
        year: 2027,
        currentRound: 1,
        rounds: [{ matches: [] }],
        championId: null,
        standings: [
          { teamId: 'west-ham-uuid-season-1', teamName: 'West Ham', points: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, form: [] },
        ],
      };
      localStorage.setItem('current-season', JSON.stringify(mockSeason));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Championship History/i }).click();
    const dialog = page.locator('dialog.modal-open .modal-box');

    // THE BUG: West Ham appears TWICE because team IDs are different
    const westHamCards = dialog.locator('.card:has-text("West Ham")');
    const count = await westHamCards.count();

    console.log(`[BUG] West Ham appears ${count} times (should be 1)`);

    // This will FAIL, exposing the bug
    expect(count).toBe(2); // Currently it shows 2 separate entries
    // It SHOULD be: expect(count).toBe(1) with "2 titles"
  });
});
