import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Homepage
 * URL: /
 */
export class HomePage extends BasePage {
    // Locators
    get heroSection(): Locator {
        return this.page.locator('section').first();
    }

    get obsidianLogo(): Locator {
        return this.page.locator('img[alt*="Obsidian"]').first();
    }

    get nextcloudLogo(): Locator {
        return this.page.locator('img[alt*="Nextcloud"]').first();
    }

    get mainHeading(): Locator {
        return this.page.getByRole('heading', { level: 1 });
    }

    get downloadPluginButton(): Locator {
        return this.page.getByRole('link', { name: /download plugin/i });
    }

    get githubLink(): Locator {
        return this.page.locator('a[href*="github.com"]').first();
    }

    get trustBadges(): Locator {
        return this.page.locator('[class*="badge"], [class*="trust"]');
    }

    get footerLinks() {
        return {
            impressum: this.page.getByRole('link', { name: /impressum/i }),
            privacy: this.page.getByRole('link', { name: /privacy/i }),
            terms: this.page.getByRole('link', { name: /terms/i }),
        };
    }

    // Actions
    async goto(): Promise<void> {
        await this.navigateTo('/');
    }

    async clickDownloadPlugin(): Promise<void> {
        await this.downloadPluginButton.click();
    }

    async clickGitHub(): Promise<void> {
        await this.githubLink.click();
    }

    // Assertions
    async expectHeroVisible(): Promise<void> {
        await expect(this.mainHeading).toBeVisible();
        await expect(this.obsidianLogo).toBeVisible();
    }

    async expectDownloadButtonVisible(): Promise<void> {
        await expect(this.downloadPluginButton).toBeVisible();
    }

    async expectFooterLinksVisible(): Promise<void> {
        await this.scrollToBottom();
        await expect(this.footerLinks.impressum).toBeVisible();
        await expect(this.footerLinks.privacy).toBeVisible();
    }
}
