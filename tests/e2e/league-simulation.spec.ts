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

    // Should show "Simulate Round 1" button initially
    const simulateButton = page.getByRole('button', { name: /Simulate Round/i });
    await expect(simulateButton).toBeVisible();
    await expect(simulateButton).toHaveText(/Simulate Round 1/i);

    // Click simulate button to complete round 1
    await simulateButton.click();

    // Wait for round 1 to complete (results should appear)
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible({ timeout: 5000 });

    // BUG: After round 1 completes, "Simulate Round 2" button should be visible
    // but it's not showing up
    const simulateRound2Button = page.getByRole('button', { name: /Simulate Round 2/i });
    await expect(simulateRound2Button).toBeVisible();
  });

  test('should allow simulating multiple rounds sequentially', async ({ page }) => {
    // Page already on league page from beforeEach

    // Create new season if needed
    const newSeasonButton = page.getByRole('button', { name: /New Season/i });
    if (await newSeasonButton.isVisible()) {
      await newSeasonButton.click();
      await expect(page.getByText(/Round 1 of 18/)).toBeVisible();
    }

    // Simulate round 1
    await page.getByRole('button', { name: /Simulate Round 1/i }).click();
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible();

    // Simulate round 2
    await page.getByRole('button', { name: /Simulate Round 2/i }).click();
    await expect(page.getByText(/Round 2 Results/i)).toBeVisible();

    // Simulate round 3
    await page.getByRole('button', { name: /Simulate Round 3/i }).click();
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
    await page.getByRole('button', { name: /Simulate Round 1/i }).click();
    await expect(page.getByText(/Round 1 Results/i)).toBeVisible();

    // After simulating round 1, we should be viewing round 1 results
    // The "Previous Round" button should be disabled
    const previousButton = page.getByRole('button', { name: /Previous Round/i });
    await expect(previousButton).toBeDisabled();

    // The "Next Round" button should be enabled (to view round 2 fixtures)
    const nextButton = page.getByRole('button', { name: /Next Round/i });
    await expect(nextButton).toBeEnabled();

    // Navigate to next round to see fixtures
    await nextButton.click();
    await expect(page.getByText(/Round 2 of 18/)).toBeVisible();
    await expect(page.getByText(/Round 2 Fixtures/i)).toBeVisible();

    // Now "Simulate Round 2" should be visible
    await expect(page.getByRole('button', { name: /Simulate Round 2/i })).toBeVisible();
  });
});
