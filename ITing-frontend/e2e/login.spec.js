const { test, expect } = require('@playwright/test');
const { mockAuthApis, mockCommonApis } = require('./helpers/mock-api');

test.describe('Login flow', () => {
  test('candidate login redirects successfully to home page', async ({ page }) => {
    await mockCommonApis(page);
    await mockAuthApis(page, 'CANDIDATE');

    await page.goto('/login');

    await page.locator('input[type="email"]').fill('candidate@example.com');
    await page.locator('input[type="password"]').fill('secret123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/jobs');
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('user_role'))).toBe('CANDIDATE');
    await expect(page.getByText('Forward Security Director')).toBeVisible();
  });

  test('admin login redirects to admin dashboard', async ({ page }) => {
    await mockAuthApis(page, 'ADMIN');

    await page.goto('/login');
    await page.getByRole('button', { name: /Admin/i }).click();
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('secret123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/admin/dashboard');
  });
});
