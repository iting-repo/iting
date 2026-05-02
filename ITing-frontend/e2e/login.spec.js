const { test, expect } = require('@playwright/test');
const { mockAuthApis, mockCommonApis } = require('./helpers/mock-api');

test.describe('Đăng nhập', () => {
  test('ứng viên đăng nhập thành công về trang chủ', async ({ page }) => {
    await mockCommonApis(page);
    await mockAuthApis(page, 'CANDIDATE');

    await page.goto('/login');

    await page.locator('input[type="email"]').fill('candidate@example.com');
    await page.locator('input[type="password"]').fill('secret123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/');
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('user_role'))).toBe('CANDIDATE');
    await expect(page.getByRole('heading', { name: /C\/C\+\+ Java Golang Python/ })).toBeVisible();
  });

  test('admin đăng nhập về bảng điều khiển', async ({ page }) => {
    await mockAuthApis(page, 'ADMIN');

    await page.goto('/login');
    await page.locator('button[type="button"]').nth(1).click();
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('secret123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/admin/dashboard');
  });
});
