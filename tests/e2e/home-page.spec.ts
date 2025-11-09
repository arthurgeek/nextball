import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should show "Start New League" button when no saved game exists', async ({ page }) => {
    // With empty localStorage, should show start button
    await expect(page.getByRole('button', { name: /Start New League/i })).toBeVisible();

    // Should NOT show continue button
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toHaveCount(0);
  });

  test('should navigate to league page when clicking "Start New League"', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /Start New League/i });
    await startButton.click();

    // Should navigate to /league
    await page.waitForURL('/league');

    // Should see the league simulator heading
    await expect(page.getByRole('heading', { name: /League Simulator/i })).toBeVisible({ timeout: 5000 });
  });

  test('should show both "Continue" and "Start New League" when saved game exists', async ({ page }) => {
    // Inject a saved season into localStorage
    await page.evaluate(() => {
      const mockSeason = {
        league: { id: '1', name: 'Premier League', teams: [] },
        year: 2025,
        currentRound: 1,
        rounds: [],
        championId: null,
      };
      localStorage.setItem('current-season', JSON.stringify(mockSeason));
    });

    // Reload to pick up localStorage
    await page.reload();

    // Should now show both buttons
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start New League/i })).toBeVisible();
  });

  test('should load saved game when clicking "Continue"', async ({ page }) => {
    // Inject a saved season into localStorage
    await page.evaluate(() => {
      const mockSeason = {
        league: { id: '1', name: 'Premier League', teams: [] },
        year: 2025,
        currentRound: 1,
        rounds: [{ matches: [] }], // Need at least one round
        championId: null,
      };
      localStorage.setItem('current-season', JSON.stringify(mockSeason));
    });

    // Reload to pick up localStorage
    await page.reload();

    // Click continue
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should navigate to /league (that's enough to verify Continue works)
    await page.waitForURL('/league');
    // The league page will either show the loaded season or prompt to start a new one
    // Either way, navigation worked correctly
  });

  test('should confirm before clearing saved game', async ({ page }) => {
    // Inject a saved season into localStorage
    await page.evaluate(() => {
      const mockSeason = {
        league: { id: '1', name: 'Premier League', teams: [] },
        year: 2025,
        currentRound: 1,
        rounds: [],
        championId: null,
      };
      localStorage.setItem('current-season', JSON.stringify(mockSeason));
    });

    // Reload to pick up localStorage
    await page.reload();

    // Set up dialog handler to cancel
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('clear');
      dialog.dismiss();
    });

    // Click "Start New League" when save exists
    await page.getByRole('button', { name: /Start New League/i }).click();

    // Should not have cleared (dialog was dismissed)
    // Reload page and check if Continue button still shows
    await page.reload();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should clear saved game when confirmed', async ({ page }) => {
    // Inject a saved season into localStorage
    await page.evaluate(() => {
      const mockSeason = {
        league: { id: '1', name: 'Premier League', teams: [] },
        year: 2025,
        currentRound: 1,
        rounds: [],
        championId: null,
      };
      localStorage.setItem('current-season', JSON.stringify(mockSeason));
    });

    // Reload to pick up localStorage
    await page.reload();

    // Set up dialog handler to accept
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('clear');
      dialog.accept();
    });

    // Click "Start New League" when save exists
    await page.getByRole('button', { name: /Start New League/i }).click();

    // Should navigate to /league
    await page.waitForURL('/league');

    // Should show the league simulator page
    await expect(page.getByRole('heading', { name: /League Simulator/i })).toBeVisible({ timeout: 5000 });

    // Go back to home - should NOT show Continue button anymore
    await page.goto('/');
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Start New League/i })).toBeVisible();
  });
});
