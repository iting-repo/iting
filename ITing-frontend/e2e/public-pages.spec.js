const { test, expect } = require('@playwright/test');
const { mockCommonApis } = require('./helpers/mock-api');

test.describe('Public pages smoke', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApis(page);
  });

  test('job listing page opens a job detail route', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByText('Forward Security Director').first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByRole('listitem').filter({ hasText: 'Java' }).first()).toBeVisible();
  });

  test('about and contact pages render their main content', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/contact');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
  });
});
