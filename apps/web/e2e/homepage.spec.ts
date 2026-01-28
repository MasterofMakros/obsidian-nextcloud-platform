import { test, expect } from '@playwright/test';

// Increased timeout for slower CI environments
test.setTimeout(30000);

test.describe('T1: Homepage Tests', () => {
    test('T1.1: Homepage loads with hero content', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Check logos are present
        await expect(page.locator('img[alt*="Obsidian"]').first()).toBeVisible();

        // Check heading exists
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Check Download Plugin link exists
        await expect(page.getByRole('link', { name: /download plugin/i })).toBeVisible();
    });

    test('T1.2: Navigation to docs works', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /download plugin/i }).click();
        await page.waitForURL(/\/docs\/install/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/docs\/install/);
    });

    test('T1.3: Footer links are present', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(page.getByRole('link', { name: /impressum/i })).toBeVisible();
    });
});

test.describe('T2: Login Page', () => {
    test('T2.1: Login page loads', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('input[type="email"]')).toBeVisible();
    });
});

test.describe('T7: Pricing Page', () => {
    test('T7.1: Pricing page loads', async ({ page }) => {
        await page.goto('/pricing');
        await expect(page).toHaveURL(/\/pricing/);
    });
});

test.describe('T9: FAQ Page', () => {
    test('T9.1: FAQ page loads', async ({ page }) => {
        await page.goto('/faq');
        await expect(page).toHaveURL(/\/faq/);
    });
});
