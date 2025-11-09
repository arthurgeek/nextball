import { test, expect } from '@playwright/test';

/**
 * E2E tests specific to Single Round Robin format:
 * - 9 rounds for 10 teams (n-1 rounds)
 * - Neutral venues (no home advantage)
 * - Each team plays every other team once
 */
test.describe('League Simulation - Single Round Robin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/league');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete single round robin season with 9 rounds', async ({ page }) => {
    // Create new season with Single Round Robin
    await page.getByRole('button', { name: /Start New Season/i }).click();
    await page.getByLabel(/Fixture Format/i).selectOption('Single Round Robin');
    await page.getByRole('button', { name: /Create Season/i }).click();
    await expect(page.getByText(/Round 1 of 9/)).toBeVisible({ timeout: 5000 });

    // Simulate all 9 rounds
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });

    for (let round = 1; round <= 9; round++) {
      // Verify button is visible before clicking
      await expect(simulateButton).toBeVisible();

      // Simulate the round
      await simulateButton.click();

      // Wait for results to appear
      await expect(page.getByText(new RegExp(`Round ${round} Results`, 'i'))).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(new RegExp(`Round ${round} of 9`))).toBeVisible();
    }

    // After all rounds are complete, the "Simulate Next Round" button should NOT be visible
    await expect(simulateButton).not.toBeVisible();

    // "Season Complete!" badge should be visible
    await expect(page.getByText(/Season Complete!/i)).toBeVisible();

    // The navigation should still work to view previous rounds
    const previousButton = page.getByRole('button', { name: 'Previous', exact: true });
    await expect(previousButton).toBeEnabled();
  });

  test('should save champion to history and increment year for new season', async ({ page }) => {
    // Create new season with Single Round Robin
    await page.getByRole('button', { name: /Start New Season/i }).click();
    await page.getByLabel(/Fixture Format/i).selectOption('Single Round Robin');
    await page.getByRole('button', { name: /Create Season/i }).click();
    await expect(page.getByText(/Round 1 of 9/)).toBeVisible({ timeout: 5000 });

    // Get the current year from the page
    const seasonYearText = await page.getByText(/Season \d{4}/).textContent();
    const firstSeasonYear = parseInt(seasonYearText!.match(/\d{4}/)![0]);

    // Simulate all 9 rounds to complete the season
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });
    for (let round = 1; round <= 9; round++) {
      await simulateButton.click();
      await expect(page.getByText(new RegExp(`Round ${round} Results`, 'i'))).toBeVisible({ timeout: 5000 });
    }

    // Verify season is complete
    await expect(page.getByText(/Season Complete!/i)).toBeVisible();

    // Get the champion name from the league table (should be position 1)
    const tableRows = page.locator('.table tbody tr');
    const firstRow = tableRows.first();
    const championName = await firstRow.locator('td').nth(1).locator('.font-medium').textContent();

    // Open championship history dialog
    await page.getByRole('button', { name: /Championship History/i }).click();

    // Locate the dialog element to scope our searches
    const historyDialog = page.locator('.modal');

    // Verify the champion appears in history with the correct year
    await expect(historyDialog.getByText(championName!.trim())).toBeVisible();
    await expect(historyDialog.getByText(firstSeasonYear.toString())).toBeVisible();
    await expect(historyDialog.getByText('1 title')).toBeVisible();

    // Close the dialog
    await page.getByRole('button', { name: 'Close', exact: true }).click();

    // Start a new season - handle the confirmation dialog
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /New Season/i }).click();

    // Wait for the strategy selection dialog to appear and strategies to load
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();

    await page.getByLabel(/Fixture Format/i).selectOption('Single Round Robin');
    await page.getByRole('button', { name: /Create Season/i }).click();
    await expect(page.getByText(/Round 1 of 9/)).toBeVisible({ timeout: 5000 });

    // Verify the year has incremented
    const secondSeasonYearText = await page.getByText(/Season \d{4}/).textContent();
    const secondSeasonYear = parseInt(secondSeasonYearText!.match(/\d{4}/)![0]);
    expect(secondSeasonYear).toBe(firstSeasonYear + 1);
  });

  test('should use neutral venues for all matches in single round robin', async ({ page }) => {
    // Create new season with Single Round Robin
    await page.getByRole('button', { name: /Start New Season/i }).click();
    await page.getByLabel(/Fixture Format/i).selectOption('Single Round Robin');
    await page.getByRole('button', { name: /Create Season/i }).click();
    await expect(page.getByText(/Round 1 of 9/)).toBeVisible({ timeout: 5000 });

    // Before simulating, check fixtures - should show "vs" and neutral venue icon
    const fixturesSection = page.locator('text=Round 1 Fixtures').locator('..');

    // Should show "vs" instead of score
    await expect(fixturesSection.getByText('vs')).toHaveCount(5); // 5 matches per round

    // Should NOT show home advantage icons
    const homeIcons = page.locator('[title="Home advantage"]');
    await expect(homeIcons).toHaveCount(0);

    // Should show neutral venue icons
    const neutralIcons = page.locator('[title="Neutral venue"]');
    await expect(neutralIcons).toHaveCount(5); // 5 matches per round
  });

  test('should correctly sort teams with tied points (opportunistic)', async ({ page }) => {
    // Create new season with Points Goal Difference sorter
    await page.getByRole('button', { name: /Start New Season/i }).click();
    await page.getByLabel(/Fixture Format/i).selectOption('Single Round Robin');
    await page.getByLabel(/Table Sorting/i).selectOption('Points Goal Difference');
    await page.getByRole('button', { name: /Create Season/i }).click();
    await expect(page.getByText(/Round 1 of 9/)).toBeVisible({ timeout: 5000 });

    // Simulate a few rounds to get some results
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });
    for (let round = 1; round <= 5; round++) {
      await simulateButton.click();
      await expect(page.getByText(new RegExp(`Round ${round} Results`, 'i'))).toBeVisible({ timeout: 5000 });
    }

    // Wait for table to be fully visible
    await expect(page.getByRole('heading', { name: /League Table/i })).toBeVisible();
    const tableRows = page.locator('.table tbody tr');
    await expect(tableRows.first()).toBeVisible();

    const rowCount = await tableRows.count();

    // Extract points and goal differences for all teams
    // Table columns: Pos(0), Team(1), P(2), W(3), D(4), L(5), GF(6), GA(7), GD(8), Pts(9), Form(10)
    const standings: Array<{ points: number; goalDiff: number; position: number }> = [];
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      await expect(row).toBeVisible();

      const pointsText = await row.locator('td').nth(9).textContent(); // Pts column
      const gdText = await row.locator('td').nth(8).textContent(); // GD column

      const points = parseInt(pointsText!.trim());
      const goalDiff = parseInt(gdText!.trim());

      standings.push({ points, goalDiff, position: i + 1 });
    }

    // Check if any consecutive teams have same points (a tie exists)
    let foundTie = false;
    for (let i = 0; i < standings.length - 1; i++) {
      if (standings[i].points === standings[i + 1].points) {
        foundTie = true;
        // When points are tied, goal difference should be descending
        expect(standings[i].goalDiff).toBeGreaterThanOrEqual(standings[i + 1].goalDiff);
      }
    }

    // If no ties found, test passes (opportunistic - only fails if tie exists and sorting is wrong)
    if (!foundTie) {
      console.log('No tied points found in this simulation - test passed opportunistically');
    }
  });
});
