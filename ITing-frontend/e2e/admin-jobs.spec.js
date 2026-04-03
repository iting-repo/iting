const { test, expect } = require('@playwright/test');
const {
  mockAdminApis,
  setAdminSession,
} = require('./helpers/mock-api');

test.describe('Admin job approvals', () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);
  });

  test('opens preview and approves a pending job', async ({ page }) => {
    let approveCalled = false;

    await page.route('**/api/admin/jobs/201/approve', async (route) => {
      approveCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/admin/approvals');

    await page.getByText('Backend Engineer').click();
    await expect(page.getByText('Build backend services')).toBeVisible();
    await page.getByRole('button', { name: 'Approve' }).click();
    await page.locator('.fixed.inset-0').last().locator('button').last().click();

    await expect.poll(() => approveCalled).toBeTruthy();
    await expect(page.locator('table tbody tr').first().getByText('ACTIVE')).toBeVisible();
  });
});
