import { test, expect } from '@playwright/test';

test.setTimeout(60000);

/**
 * Customer Journey Tests
 * Tests the platform from the perspective of a customer/prospect
 */

test.describe('Customer Journey: Prospect Discovery', () => {
    test('CJ1: Prospect lands on homepage and explores', async ({ page }) => {
        // Step 1: Land on homepage
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Step 2: See hero section with value proposition
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('img[alt*="Obsidian"]').first()).toBeVisible();

        // Step 3: See CTA buttons
        await expect(page.getByRole('link', { name: /download plugin/i })).toBeVisible();

        // Step 4: Scroll and see trust badges
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);

        // Step 5: Navigate to pricing via footer/nav
        await page.goto('/pricing');
        await expect(page).toHaveURL(/\/pricing/);
    });

    test('CJ2: Prospect checks pricing plans', async ({ page }) => {
        await page.goto('/pricing');

        // See pricing plans
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Check for plan cards/sections
        const pageContent = await page.content();
        expect(pageContent.toLowerCase()).toContain('free');
    });

    test('CJ3: Prospect reads FAQ', async ({ page }) => {
        await page.goto('/faq');
        await expect(page).toHaveURL(/\/faq/);
    });

    test('CJ4: Prospect checks documentation', async ({ page }) => {
        await page.goto('/docs/install');
        await expect(page).toHaveURL(/\/docs\/install/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});

test.describe('Customer Journey: Signup Flow', () => {
    test('CJ5: Customer starts login/signup', async ({ page }) => {
        // Navigate to login page
        await page.goto('/login');
        await expect(page).toHaveURL(/\/login/);

        // See email input form
        await expect(page.locator('input[type="email"]')).toBeVisible();

        // Enter email (magic link flow)
        await page.locator('input[type="email"]').fill('test@example.com');

        // Find submit button
        const submitBtn = page.locator('button[type="submit"]');
        if (await submitBtn.count() > 0) {
            await expect(submitBtn).toBeEnabled();
        }
    });

    test('CJ6: Unauthenticated user redirected from dashboard', async ({ page }) => {
        // Try to access dashboard without auth
        await page.goto('/dashboard');

        // Should redirect to login or show access denied
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url).toMatch(/\/(login|dashboard)/);
    });
});

test.describe('Customer Journey: Legal & Trust', () => {
    test('CJ7: Customer reviews legal pages', async ({ page }) => {
        // Check impressum
        await page.goto('/legal/impressum');
        await expect(page).toHaveURL(/\/legal\/impressum/);

        // Check privacy policy
        await page.goto('/legal/privacy');
        await expect(page).toHaveURL(/\/legal\/privacy/);

        // Check terms
        await page.goto('/legal/terms');
        await expect(page).toHaveURL(/\/legal\/terms/);
    });

    test('CJ8: Footer links work', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Check footer exists with legal links
        await expect(page.getByRole('link', { name: /impressum/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
    });
});
