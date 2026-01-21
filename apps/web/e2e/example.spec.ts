import { test, expect } from '@playwright/test';

test('landing page has correct title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Obsidian Nextcloud Media/);

    // Expect hero text
    await expect(page.locator('h1')).toContainText('Your Second Brain');
});
