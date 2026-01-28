import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object with common functionality
 */
export abstract class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Common locators
    get header(): Locator {
        return this.page.locator('header').first();
    }

    get footer(): Locator {
        return this.page.locator('footer').first();
    }

    // Common actions
    async navigateTo(path: string): Promise<void> {
        await this.page.goto(path);
    }

    async scrollToBottom(): Promise<void> {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }
}
