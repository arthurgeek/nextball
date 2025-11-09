import { test, expect } from '@playwright/test';

test.describe('League Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/league');
  });

  test('should show simulate button after round 1 completes', async ({ page }) => {
    // Page already on league page from beforeEach

    // Check if we need to create a new season first
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to appear and confirm
      await page.waitForSelector('.loading-spinner', { state: 'hidden' });
      await page.getByRole('button', { name: /Create Season/i }).click();
      // Wait for season to be created
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible({ timeout: 5000 });
    }

    // Should show "Simulate Next Round" button initially
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });
    await expect(simulateButton).toBeVisible();

    // Click simulate button to complete round 1
    await simulateButton.click();

    // Wait for round 1 to complete (results should appear)
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible({ timeout: 5000 });

    // After round 1 completes, "Simulate Next Round" button should still be visible for round 2
    await expect(page.getByRole('button', { name: /Simulate Next Round/i })).toBeVisible();
  });

  test('should allow simulating multiple rounds sequentially', async ({ page }) => {
    // Page already on league page from beforeEach

    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });

    // Simulate round 1
    await simulateButton.click();
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible();
    await expect(page.getByText(/Round 1 of 18/)).toBeVisible();

    // Simulate round 2
    await simulateButton.click();
    await expect(page.getByText(/Round 2 Results/i)).toBeVisible();
    await expect(page.getByText(/Round 2 of 18/)).toBeVisible();

    // Simulate round 3
    await simulateButton.click();
    await expect(page.getByText(/Round 3 Results/i)).toBeVisible();

    // Verify we're viewing round 3
    await expect(page.getByText(/Round 3 of 18/)).toBeVisible();
  });

  test('should show correct navigation state after completing a round', async ({ page }) => {
    // Page already on league page from beforeEach

    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Simulate round 1
    await page.getByRole('button', { name: /Simulate Next Round/i }).click();
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible();

    // After simulating round 1, we should be viewing round 1 results
    // The "Previous" button should be disabled (round 1 is first)
    const previousButton = page.getByRole('button', { name: 'Previous', exact: true });
    await expect(previousButton).toBeDisabled();

    // The "Next" button should be disabled when viewing latest round
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextButton).toBeDisabled();

    // The "Simulate Next Round" button should be visible for round 2
    await expect(page.getByRole('button', { name: /Simulate Next Round/i })).toBeVisible();
  });

  test('should display championship history dialog', async ({ page }) => {
    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Click Championship History button
    const historyButton = page.getByRole('button', { name: /Championship History/i });
    await historyButton.click();

    // Dialog should open with empty state (no championships yet)
    await expect(page.getByText('No championships recorded yet.')).toBeVisible();
    await expect(page.getByText(/Complete a season to start recording champions/i)).toBeVisible();

    // Close dialog
    const closeButton = page.getByRole('button', { name: 'Close', exact: true });
    await closeButton.click();

    // Dialog should close
    await expect(page.getByText('No championships recorded yet.')).not.toBeVisible();
  });

  test('should close championship history dialog with ESC key', async ({ page }) => {
    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Click Championship History button
    const historyButton = page.getByRole('button', { name: /Championship History/i });
    await historyButton.click();

    // Dialog should open
    await expect(page.getByText('No championships recorded yet.')).toBeVisible();

    // Press ESC key
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.getByText('No championships recorded yet.')).not.toBeVisible();
  });

  test('should close championship history dialog by clicking backdrop', async ({ page }) => {
    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Click Championship History button
    const historyButton = page.getByRole('button', { name: /Championship History/i });
    await historyButton.click();

    // Dialog should open
    await expect(page.getByText('No championships recorded yet.')).toBeVisible();

    // Click at viewport position to close (click top-left corner of viewport, which is the backdrop)
    await page.mouse.click(50, 50);

    // Dialog should close
    await expect(page.getByText('No championships recorded yet.')).not.toBeVisible();
  });

  test('should NOT close strategy selection dialog by clicking backdrop', async ({ page }) => {
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());

    // Click "Start New Season" button
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Dialog should open
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible();

    // Try to click on backdrop
    // Strategy dialog doesn't have a backdrop button, so clicking outside shouldn't work
    // We'll click at the edge of the viewport to simulate clicking "outside"
    await page.mouse.click(10, 10);

    // Dialog should still be open
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible();
  });

  test('should show last round results after simulating', async ({ page }) => {
    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Simulate round 1
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });
    await simulateButton.click();

    // Should show "Round 1 Results" heading
    const round1Heading = page.getByRole('heading', { name: /Round 1 Results/i });
    await expect(round1Heading).toBeVisible();

    // Scope to the results section and verify match scores appear
    // Find the parent container of the results section
    const resultsSection = page.locator('text=Round 1 Results').locator('..');

    // Match scores follow pattern "N - N" where N is digits
    // With 10 teams, we should have 5 matches per round
    const scorePattern = /^\d+\s*-\s*\d+$/;
    const matchScores = resultsSection.getByText(scorePattern);
    await expect(matchScores).toHaveCount(5);

    // Should be viewing round 1
    await expect(page.getByText('Round 1 of 18')).toBeVisible();

    // Simulate round 2
    await simulateButton.click();

    // Should now show "Round 2 Results" heading
    const round2Heading = page.getByRole('heading', { name: /Round 2 Results/i });
    await expect(round2Heading).toBeVisible();

    // Verify round 2 also has 5 match scores
    const resultsSection2 = page.locator('text=Round 2 Results').locator('..');
    const matchScores2 = resultsSection2.getByText(scorePattern);
    await expect(matchScores2).toHaveCount(5);

    // Should be viewing round 2
    await expect(page.getByText('Round 2 of 18')).toBeVisible();
  });

  test('should show both results and next round fixtures after simulating', async ({ page }) => {
    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      // Wait for dialog to load strategies, then confirm
      await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();
      await page.getByRole('button', { name: /Create Season/i }).click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Simulate round 1
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });
    await simulateButton.click();

    // Should show "Round 1 Results" heading
    await expect(page.getByRole('heading', { name: /Round 1 Results/i })).toBeVisible();

    // Should also show "Round 2 Fixtures" heading (next round fixtures)
    await expect(page.getByRole('heading', { name: /Round 2 Fixtures/i })).toBeVisible();

    // Verify Round 1 Results section shows scores (completed matches)
    const round1ResultsSection = page.locator('text=Round 1 Results').locator('..');
    const scorePattern = /^\d+\s*-\s*\d+$/;
    const round1Scores = round1ResultsSection.getByText(scorePattern);
    await expect(round1Scores).toHaveCount(5);

    // Verify Round 2 Fixtures section shows "vs" (unplayed matches)
    const round2FixturesSection = page.locator('text=Round 2 Fixtures').locator('..');
    const vsElements = round2FixturesSection.getByText('vs', { exact: true });
    await expect(vsElements).toHaveCount(5);

    // Simulate round 2
    await simulateButton.click();

    // Now should show Round 2 Results and Round 3 Fixtures
    await expect(page.getByRole('heading', { name: /Round 2 Results/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Round 3 Fixtures/i })).toBeVisible();
  });
});

test.describe('Strategy Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/league');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
  });

  test('should show strategy selection dialog when starting new season', async ({ page }) => {
    // Click "Start New Season" button
    const startButton = page.getByRole('button', { name: /Start New Season/i });
    await startButton.click();

    // Strategy selection dialog should appear
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible();
    await expect(page.getByText(/Select Fixture Format/i)).toBeVisible();
    await expect(page.getByText(/Select Table Sorting/i)).toBeVisible();
  });

  test('should list available fixture generators in dropdown', async ({ page }) => {
    // Click "Start New Season" button
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Wait for strategies to load by waiting for the Create Season button to be enabled
    await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();

    // Verify the label is visible
    await expect(page.getByText('Select Fixture Format')).toBeVisible();

    // Find fixture generator select and verify it's visible
    const fixtureSelect = page.getByLabel(/Fixture Format/i);
    await expect(fixtureSelect).toBeVisible();

    // Verify we can see and select the options by actually selecting them
    // This proves they're functionally visible to users
    await fixtureSelect.selectOption('Single Round Robin');
    await expect(fixtureSelect).toHaveValue('single-round-robin');

    await fixtureSelect.selectOption('Double Round Robin');
    await expect(fixtureSelect).toHaveValue('double-round-robin');
  });

  test('should list available standing sorters in dropdown', async ({ page }) => {
    // Click "Start New Season" button
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Wait for strategies to load by waiting for the Create Season button to be enabled
    await expect(page.getByRole('button', { name: /Create Season/i })).toBeEnabled();

    // Verify the label is visible
    await expect(page.getByText('Select Table Sorting')).toBeVisible();

    // Find standing sorter select and verify it's visible
    const sorterSelect = page.getByLabel(/Table Sorting/i);
    await expect(sorterSelect).toBeVisible();

    // Verify we can see and select the options by actually selecting them
    // This proves they're functionally visible to users
    await sorterSelect.selectOption('Points Wins');
    await expect(sorterSelect).toHaveValue('points-wins');

    await sorterSelect.selectOption('Points Goal Difference');
    await expect(sorterSelect).toHaveValue('points-goal-difference');
  });

  test('should create season with selected strategies', async ({ page }) => {
    // Click "Start New Season" button
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Select Single Round Robin generator
    await page.getByLabel(/Fixture Format/i).selectOption('Single Round Robin');

    // Select Points Wins sorter
    await page.getByLabel(/Table Sorting/i).selectOption('Points Wins');

    // Confirm creation
    await page.getByRole('button', { name: /Create Season/i }).click();

    // Season should be created
    // With Single Round Robin and 10 teams, we expect 9 rounds (not 18)
    await expect(page.getByText(/Round 1 of 9/)).toBeVisible({ timeout: 5000 });

    // League table should be visible
    await expect(page.getByRole('heading', { name: /League Table/i })).toBeVisible();
  });

  test('should allow canceling strategy selection', async ({ page }) => {
    // Click "Start New Season" button
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Dialog should be visible
    await expect(page.getByRole('heading', { name: /Create New Season/i })).toBeVisible();

    // Click cancel button
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Dialog should close and we should still be on the welcome screen
    await expect(page.getByRole('heading', { name: /Create New Season/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Start New Season/i })).toBeVisible();
  });

  test('should use default strategies if none selected', async ({ page }) => {
    // Click "Start New Season" button
    await page.getByRole('button', { name: /Start New Season/i }).click();

    // Don't change any selections, just create
    await page.getByRole('button', { name: /Create Season/i }).click();

    // Season should be created with defaults (Double Round Robin = 18 rounds)
    await expect(page.getByText(/Round 1 of 18/)).toBeVisible({ timeout: 5000 });
  });
});
