const { test, expect } = require('@playwright/test');
const { mockCommonApis, fulfillJson } = require('./helpers/mock-api');

test.describe('Đăng nhập - các trường hợp khác', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApis(page);
  });

  test('hiển thị lỗi khi sai mật khẩu', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email hoặc mật khẩu không đúng' }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('wrong@gmail.com');
    await page.locator('input[type="password"]').fill('wrong-password');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/Email ho.c m.t kh.u kh.ng .*/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('nút hiện/ẩn mật khẩu chuyển input type', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('mypassword');

    // Toggle to show — input becomes type="text"
    await page.locator('input[type="password"]').locator('..').locator('button[type="button"]').click();
    await expect(page.locator('input[type="text"][value="mypassword"]')).toBeVisible();

    // Toggle back — type="password" again
    await page.locator('input[type="text"]').locator('..').locator('button[type="button"]').click();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('chuyển sang trang quên mật khẩu', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /Qu.n m.t kh.u/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('chuyển sang trang đăng ký', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /T.o m.i ngay/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('form yêu cầu email và mật khẩu', async ({ page }) => {
    await page.goto('/login');
    // Native HTML5 validation: clicking submit on empty required fields keeps URL
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login/);
    // The email input should still have focus / be invalid (no error toast, just blocked)
    const emailValidity = await page.locator('input[type="email"]').evaluate((el) => el.validity.valueMissing);
    expect(emailValidity).toBeTruthy();
  });
});
