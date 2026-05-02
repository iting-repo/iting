const { test, expect } = require('@playwright/test');
const { mockCommonApis } = require('./helpers/mock-api');

test.describe('Trang công khai', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApis(page);
  });

  test('trang danh sách việc mở được chi tiết việc', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByText(/C\/C\+\+ Java Golang Python/).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('Java').first()).toBeVisible();
  });

  test('about and contact pages render their main content', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/contact');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
  });
});
