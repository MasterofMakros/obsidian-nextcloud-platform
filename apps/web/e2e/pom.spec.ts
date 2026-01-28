import { test } from '@playwright/test';
import { HomePage, LoginPage, PricingPage } from './pages';

/**
 * Page Object Model Tests
 * 
 * These tests use the Page Object Model pattern for:
 * - Better maintainability
 * - Reusable locators and actions
 * - Cleaner test code
 */

test.describe('Homepage (POM)', () => {
    test('displays hero section correctly', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.goto();
        await homePage.expectHeroVisible();
        await homePage.expectDownloadButtonVisible();
    });

    test('footer links are accessible', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.goto();
        await homePage.expectFooterLinksVisible();
    });

    test('download plugin navigates to docs', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.goto();
        await homePage.clickDownloadPlugin();
        // Should navigate to /docs/install
    });
});

test.describe('Login Page (POM)', () => {
    test('displays login form', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.expectPageVisible();
        await loginPage.expectOnLoginPage();
    });

    test('accepts email input', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.fillEmail('test@example.com');
        await loginPage.expectSubmitEnabled();
    });
});

test.describe('Pricing Page (POM)', () => {
    test('displays pricing plans', async ({ page }) => {
        const pricingPage = new PricingPage(page);

        await pricingPage.goto();
        await pricingPage.expectPageVisible();
        await pricingPage.expectOnPricingPage();
        await pricingPage.expectPlansVisible();
    });
});

test.describe('Customer Journey (POM)', () => {
    test('prospect explores platform', async ({ page }) => {
        const homePage = new HomePage(page);
        const pricingPage = new PricingPage(page);
        const loginPage = new LoginPage(page);

        // Step 1: Land on homepage
        await homePage.goto();
        await homePage.expectHeroVisible();

        // Step 2: Check pricing
        await pricingPage.goto();
        await pricingPage.expectPlansVisible();

        // Step 3: Decide to sign up
        await loginPage.goto();
        await loginPage.expectPageVisible();
        await loginPage.fillEmail('prospect@example.com');
    });
});
