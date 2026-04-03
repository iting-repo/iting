const { test, expect } = require('@playwright/test');
const {
  mockAdminApis,
  setAdminSession,
} = require('./helpers/mock-api');

test.describe('Admin user management', () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);
  });

  test('opens user detail and submits ban action', async ({ page }) => {
    let banPayload = null;

    await page.route('**/api/admin/users/101/ban', async (route) => {
      banPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/admin/users');

    await page.locator('table tbody tr').first().getByRole('button').click();
    await page.getByText(/Xem chi ti/).click();
    await expect(page.getByText('candidate@example.com').first()).toBeVisible();
    await page.locator('.fixed.inset-0').last().locator('button').first().click();

    await page.locator('table tbody tr').first().getByRole('button').click();
    await page.getByText(/Kh/).click();
    await page.locator('textarea').fill('Violation');
    await page.locator('.fixed.inset-0').last().locator('button').last().click();

    await expect.poll(() => banPayload).not.toBeNull();
    expect(banPayload).toMatchObject({
      reason: 'Violation',
      banDays: 7,
    });
  });
});
