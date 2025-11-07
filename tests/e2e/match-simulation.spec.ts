import { test, expect } from '@playwright/test';

test.describe('Match Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page correctly', async ({ page }) => {
    // Check title
    await expect(page.locator('h1')).toContainText('NextBall');

    // Check subtitle
    await expect(page.locator('text=Football Match Simulator')).toBeVisible();

    // Check form is present
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('text=Set Up Match')).toBeVisible();
  });

  test('should have default team names and strengths', async ({ page }) => {
    // Check home team defaults
    const homeTeamInput = page.locator('input[value="Manchester United"]');
    await expect(homeTeamInput).toBeVisible();

    // Check away team defaults
    const awayTeamInput = page.locator('input[value="Liverpool"]');
    await expect(awayTeamInput).toBeVisible();

    // Check strength sliders exist
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);
  });

  test('should simulate a match and display result', async ({ page }) => {
    // Fill in team names
    await page.fill('input[value="Manchester United"]', 'Arsenal');
    await page.fill('input[value="Liverpool"]', 'Chelsea');

    // Adjust strengths (optional)
    const homeStrengthSlider = page.locator('input[type="range"]').first();
    await homeStrengthSlider.fill('80');

    // Click simulate button
    await page.click('button:has-text("Simulate Match")');

    // Wait for simulation to complete
    await page.waitForSelector('text=Latest Result', { timeout: 5000 });

    // Check result is displayed
    await expect(page.locator('text=Latest Result')).toBeVisible();

    // Check team names appear in result
    await expect(page.locator('text=Arsenal')).toBeVisible();
    await expect(page.locator('text=Chelsea')).toBeVisible();

    // Check score is displayed (should have format like "2-1" or "0-0")
    const scoreElement = page.locator('.text-5xl').first();
    await expect(scoreElement).toBeVisible();
    const scoreText = await scoreElement.textContent();
    expect(scoreText).toMatch(/^\d+-\d+$/);

    // Check result badge (home wins, draw, or away wins)
    await expect(
      page.locator('.badge:has-text("wins!"), .badge:has-text("Draw!")').first()
    ).toBeVisible();
  });

  test('should show match history after multiple simulations', async ({ page }) => {
    // First simulation
    await page.click('button:has-text("Simulate Match")');
    await page.waitForSelector('text=Latest Result');

    // Check no history section yet (only 1 match)
    await expect(page.locator('text=Match History')).not.toBeVisible();

    // Second simulation
    await page.click('button:has-text("Simulate Match")');
    await page.waitForTimeout(500); // Wait for UI update

    // Now history should be visible
    await expect(page.locator('text=Match History')).toBeVisible();

    // Should have 2 match result cards total (1 latest + 1 in history)
    const matchCards = page.locator('.card.bg-base-100').filter({ hasText: 'vs' });
    await expect(matchCards).toHaveCount({ min: 2, max: 2 });
  });

  test('should change team strengths using sliders', async ({ page }) => {
    // Get home strength display
    const homeStrengthLabel = page.locator('text=/Strength: \\d+/').first();
    const initialStrength = await homeStrengthLabel.textContent();

    // Change slider value
    const homeSlider = page.locator('input[type="range"]').first();
    await homeSlider.fill('50');

    // Check label updated
    await expect(homeStrengthLabel).toContainText('Strength: 50');
    await expect(homeStrengthLabel).not.toContainText(initialStrength || '');
  });

  test('should validate team names (minimum 2 characters)', async ({ page }) => {
    // Try to set home team to 1 character
    const homeTeamInput = page.locator('input[value="Manchester United"]');
    await homeTeamInput.fill('A');

    // Try to submit
    await page.click('button:has-text("Simulate Match")');

    // Should not proceed (HTML5 validation should prevent it)
    // Latest Result should not appear
    await expect(page.locator('text=Latest Result')).not.toBeVisible();
  });

  test('should limit match history to 10 matches', async ({ page }) => {
    // Simulate 12 matches
    for (let i = 0; i < 12; i++) {
      await page.click('button:has-text("Simulate Match")');
      await page.waitForTimeout(200); // Small delay between clicks
    }

    // Wait for last simulation to complete
    await page.waitForSelector('text=Latest Result');

    // Check that "Showing last 10 matches" message appears
    await expect(page.locator('text=Showing last 10 matches')).toBeVisible();

    // Count total match result cards (should be exactly 10)
    // 1 in "Latest Result" + 9 in "Match History"
    const matchCards = page.locator('.card.bg-base-100').filter({ hasText: /\d+-\d+/ });
    const count = await matchCards.count();
    expect(count).toBe(10);
  });

  test('should show loading state during simulation', async ({ page }) => {
    // Start simulation
    const submitButton = page.locator('button:has-text("Simulate Match")');
    await submitButton.click();

    // Check loading state appears briefly
    await expect(page.locator('text=Simulating...')).toBeVisible();
    await expect(page.locator('.loading-spinner')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('text=Latest Result');

    // Loading state should be gone
    await expect(page.locator('text=Simulating...')).not.toBeVisible();
  });

  test('should display home and away badges correctly', async ({ page }) => {
    await page.click('button:has-text("Simulate Match")');
    await page.waitForSelector('text=Latest Result');

    // Check home badge exists
    await expect(page.locator('.badge:has-text("Home")').first()).toBeVisible();

    // Check away badge exists
    await expect(page.locator('.badge:has-text("Away")').first()).toBeVisible();
  });

  test('should show how it works section', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check "How it works" section
    await expect(page.locator('text=How it works')).toBeVisible();

    // Check key feature descriptions
    await expect(page.locator('text=/Logistic regression/')).toBeVisible();
    await expect(page.locator('text=/Performance variance/')).toBeVisible();
    await expect(page.locator('text=/Poisson distribution/')).toBeVisible();
  });
});
