const { test, expect } = require('@playwright/test');
const {
  mockAdminApis,
  setAdminSession,
} = require('./helpers/mock-api');

test.describe('Admin company management', () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);
  });

  test('opens company detail and approves a pending company', async ({ page }) => {
    let approvePayload = null;

    await page.route('**/api/admin/companies/CMP-001/approve', async (route) => {
      approvePayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/admin/companies');

    await page.locator('table tbody tr').first().getByRole('button').click();
    await page.getByText(/Xem chi ti/).click();
    await expect(page.getByText('ITing Software').last()).toBeVisible();
    await page.getByRole('button', { name: 'Approve' }).click();
    await page.locator('.fixed.inset-0').last().locator('button').last().click();

    await expect.poll(() => approvePayload).not.toBeNull();
    expect(approvePayload).toMatchObject({
      verificationLevel: 'ADVANCED',
    });
  });
});
