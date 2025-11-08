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
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Click Championship History button
    const historyButton = page.getByRole('button', { name: /Championship History/i });
    await historyButton.click();

    // Dialog should open with empty state (no championships yet)
    await expect(page.getByText('No championships recorded yet.')).toBeVisible();
    await expect(page.getByText(/Complete a season to start recording champions/i)).toBeVisible();

    // Close dialog
    const closeButton = page.getByRole('button', { name: 'Close' });
    await closeButton.click();

    // Dialog should close
    await expect(page.getByText('No championships recorded yet.')).not.toBeVisible();
  });

  test('should show last round results after simulating', async ({ page }) => {
    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Simulate round 1
    const simulateButton = page.getByRole('button', { name: /Simulate Next Round/i });
    await simulateButton.click();

    // Should show "Round 1 Results" heading
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible();

    // Should show match scores (look for score pattern like "2 - 1")
    await expect(page.getByText(/\d+\s*-\s*\d+/)).toBeVisible();

    // Should be viewing round 1
    await expect(page.getByText('Round 1 of 18')).toBeVisible();

    // Simulate round 2
    await simulateButton.click();

    // Should now show "Round 2 Results" heading
    await expect(page.getByText(/Round 2 Results/i)).toBeVisible();

    // Should be viewing round 2
    await expect(page.getByText('Round 2 of 18')).toBeVisible();
  });
});
