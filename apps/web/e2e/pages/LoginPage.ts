import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Login Page
 * URL: /login
 */
export class LoginPage extends BasePage {
    // Locators
    get emailInput(): Locator {
        return this.page.locator('input[type="email"]');
    }

    get submitButton(): Locator {
        return this.page.locator('button[type="submit"]');
    }

    get pageHeading(): Locator {
        return this.page.getByRole('heading').first();
    }

    get errorMessage(): Locator {
        return this.page.locator('[class*="error"], [role="alert"]');
    }

    get successMessage(): Locator {
        return this.page.locator('[class*="success"]');
    }

    // Actions
    async goto(): Promise<void> {
        await this.navigateTo('/login');
    }

    async fillEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }

    async submit(): Promise<void> {
        await this.submitButton.click();
    }

    async login(email: string): Promise<void> {
        await this.fillEmail(email);
        await this.submit();
    }

    // Assertions
    async expectPageVisible(): Promise<void> {
        await expect(this.emailInput).toBeVisible();
    }

    async expectSubmitEnabled(): Promise<void> {
        await expect(this.submitButton).toBeEnabled();
    }

    async expectOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/login/);
    }
}
