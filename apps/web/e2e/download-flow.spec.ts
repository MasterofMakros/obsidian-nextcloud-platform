import { test, expect } from '@playwright/test';

test('Download flow: Navigate from Home to Install Docs', async ({ page }) => {
  // 1. Navigate to Homepage
  await page.goto('/');

  // 2. Find "Download Plugin" Button/Link
  // Using accessible role 'link' with name matching case-insensitively
  const downloadLink = page.getByRole('link', { name: /download plugin/i });

  // Ensure it's visible before clicking
  await expect(downloadLink).toBeVisible();

  // 3. Click and verify navigation to /docs/install
  await downloadLink.click();

  // Verify URL matches /docs/install
  await expect(page).toHaveURL(/.*\/docs\/install/);

  // 4. Verify page content
  // Confirm the page has loaded by checking for a main heading
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
