import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Pricing Page
 * URL: /pricing
 */
export class PricingPage extends BasePage {
    // Locators
    get pageHeading(): Locator {
        return this.page.getByRole('heading', { level: 1 });
    }

    get pricingCards(): Locator {
        return this.page.locator('[class*="card"], [class*="plan"], [class*="pricing"]');
    }

    get freePlan(): Locator {
        return this.page.locator('text=/free/i').first();
    }

    get proPlan(): Locator {
        return this.page.locator('text=/pro/i').first();
    }

    get ctaButtons(): Locator {
        return this.page.getByRole('button');
    }

    // Actions
    async goto(): Promise<void> {
        await this.navigateTo('/pricing');
    }

    async selectFreePlan(): Promise<void> {
        await this.freePlan.click();
    }

    async selectProPlan(): Promise<void> {
        await this.proPlan.click();
    }

    // Assertions
    async expectPageVisible(): Promise<void> {
        await expect(this.pageHeading).toBeVisible();
    }

    async expectOnPricingPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/pricing/);
    }

    async expectPlansVisible(): Promise<void> {
        const content = await this.page.content();
        expect(content.toLowerCase()).toContain('free');
    }
}
