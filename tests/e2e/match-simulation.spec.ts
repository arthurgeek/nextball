import { test, expect } from '@playwright/test';

test.describe('Match Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page correctly', async ({ page }) => {
    // Check title
    await expect(page.getByRole('heading', { name: 'NextBall', level: 1 })).toBeVisible();

    // Check subtitle
    await expect(page.getByText('Football Match Simulator')).toBeVisible();

    // Check form is present
    await expect(page.getByRole('heading', { name: 'Set Up Match' })).toBeVisible();
  });

  test('should have default team names and strengths', async ({ page }) => {
    // Check home team defaults - using getByLabel
    const homeTeamInput = page.getByLabel('Home Team');
    await expect(homeTeamInput).toHaveValue('Manchester United');

    // Check away team defaults
    const awayTeamInput = page.getByLabel('Away Team');
    await expect(awayTeamInput).toHaveValue('Liverpool');

    // Check strength sliders exist
    await expect(page.getByText(/Strength: 85/)).toBeVisible();
    await expect(page.getByText(/Strength: 83/)).toBeVisible();
  });

  test('should simulate a match and display result', async ({ page }) => {
    // Fill in team names using getByLabel
    await page.getByLabel('Home Team').fill('Arsenal');
    await page.getByLabel('Away Team').fill('Chelsea');

    // Click simulate button
    await page.getByRole('button', { name: 'Simulate Match' }).click();

    // Wait for simulation to complete
    await expect(page.getByRole('heading', { name: 'Latest Result' })).toBeVisible({ timeout: 5000 });

    // Check team names appear in result
    await expect(page.getByText('Arsenal')).toBeVisible();
    await expect(page.getByText('Chelsea')).toBeVisible();

    // Check that we have a scoreline displayed (the score is in a large text)
    // Result badge should show who won
    const winBadge = page.getByText(/wins!|Draw!/);
    await expect(winBadge).toBeVisible();
  });

  test('should show match history after multiple simulations', async ({ page }) => {
    // First simulation
    await page.getByRole('button', { name: 'Simulate Match' }).click();
    await expect(page.getByRole('heading', { name: 'Latest Result' })).toBeVisible();

    // Check no history section yet (only 1 match)
    await expect(page.getByRole('heading', { name: 'Match History' })).not.toBeVisible();

    // Second simulation
    await page.getByRole('button', { name: 'Simulate Match' }).click();
    await page.waitForTimeout(500); // Wait for UI update

    // Now history should be visible
    await expect(page.getByRole('heading', { name: 'Match History' })).toBeVisible();
  });

  test('should change team strengths using sliders', async ({ page }) => {
    // Get home strength display
    const homeStrengthLabel = page.getByText(/Strength: 85/);
    await expect(homeStrengthLabel).toBeVisible();

    // Change slider value - sliders are input type="range"
    const sliders = page.getByRole('slider');
    const homeSlider = sliders.first();
    await homeSlider.fill('50');

    // Check label updated
    await expect(page.getByText(/Strength: 50/)).toBeVisible();
  });

  test('should validate team names (minimum 2 characters)', async ({ page }) => {
    // Try to set home team to 1 character
    const homeTeamInput = page.getByLabel('Home Team');
    await homeTeamInput.fill('A');

    // Try to submit
    await page.getByRole('button', { name: 'Simulate Match' }).click();

    // Should not proceed (HTML5 validation should prevent it)
    // Latest Result should not appear
    await expect(page.getByRole('heading', { name: 'Latest Result' })).not.toBeVisible();
  });

  test('should limit match history to 10 matches', async ({ page }) => {
    // Simulate 12 matches
    for (let i = 0; i < 12; i++) {
      await page.getByRole('button', { name: 'Simulate Match' }).click();
      await page.waitForTimeout(200); // Small delay between clicks
    }

    // Wait for last simulation to complete
    await expect(page.getByRole('heading', { name: 'Latest Result' })).toBeVisible();

    // Check that "Showing last 10 matches" message appears
    await expect(page.getByText('Showing last 10 matches')).toBeVisible();
  });

  test('should show loading state during simulation', async ({ page }) => {
    // Start simulation
    const submitButton = page.getByRole('button', { name: 'Simulate Match' });
    await submitButton.click();

    // Check loading state appears briefly
    await expect(page.getByText('Simulating...')).toBeVisible();

    // Wait for completion
    await expect(page.getByRole('heading', { name: 'Latest Result' })).toBeVisible();

    // Loading state should be gone
    await expect(page.getByText('Simulating...')).not.toBeVisible();
  });

  test('should display home and away badges correctly', async ({ page }) => {
    await page.getByRole('button', { name: 'Simulate Match' }).click();
    await expect(page.getByRole('heading', { name: 'Latest Result' })).toBeVisible();

    // Check home and away badges exist - they're just text elements with badge class
    // We'll use getByText with partial match
    await expect(page.getByText('Home').first()).toBeVisible();
    await expect(page.getByText('Away').first()).toBeVisible();
  });

  test('should show how it works section', async ({ page }) => {
    // Check "How it works" section
    await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();

    // Check key feature descriptions
    await expect(page.getByText(/Logistic regression/)).toBeVisible();
    await expect(page.getByText(/Performance variance/)).toBeVisible();
    await expect(page.getByText(/Poisson distribution/)).toBeVisible();
  });
});
