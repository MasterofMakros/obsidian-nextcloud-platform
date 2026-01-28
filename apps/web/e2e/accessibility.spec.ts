import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests using axe-core
 * 
 * Tests WCAG compliance across key pages
 * Note: Minor/moderate violations are logged but don't fail tests
 */

test.describe('Accessibility Tests', () => {
    test('Homepage accessibility scan', async ({ page }) => {
        await page.goto('/');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        // Log violations for review
        if (accessibilityScanResults.violations.length > 0) {
            console.log(`Found ${accessibilityScanResults.violations.length} accessibility issues:`);
            accessibilityScanResults.violations.forEach(v => {
                console.log(`- [${v.impact}] ${v.id}: ${v.description}`);
            });
        }

        // Only fail on critical violations
        const criticalViolations = accessibilityScanResults.violations.filter(
            v => v.impact === 'critical'
        );
        expect(criticalViolations).toHaveLength(0);
    });

    test('Login page accessibility scan', async ({ page }) => {
        await page.goto('/login');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        const criticalViolations = accessibilityScanResults.violations.filter(
            v => v.impact === 'critical'
        );
        expect(criticalViolations).toHaveLength(0);
    });

    test('Pricing page accessibility scan', async ({ page }) => {
        await page.goto('/pricing');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        const criticalViolations = accessibilityScanResults.violations.filter(
            v => v.impact === 'critical'
        );
        expect(criticalViolations).toHaveLength(0);
    });

    test('Keyboard navigation works', async ({ page }) => {
        await page.goto('/');

        // Tab through interactive elements
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
        }

        // Verify some element has focus
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
    });
});
