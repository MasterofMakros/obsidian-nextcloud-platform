import { test, expect } from '@playwright/test';

test('debug console logs', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));

    const response = await page.goto('/');
    console.log(`Status: ${response?.status()}`);

    // Check page loaded successfully
    await expect(page).toHaveURL('/');
    await page.screenshot({ path: 'apps/web/e2e/debug-screenshot.png', fullPage: true });
});
