const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockEmployerApis,
  setEmployerSession,
} = require('./helpers/mock-api');

test.describe('Employer pages smoke', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);
  });

  test('dashboard links to manage jobs and applications', async ({ page }) => {
    await page.goto('/employer/dashboard');

    await page.locator('a[href="/employer/manage-jobs"]').first().click();
    await expect(page).toHaveURL('/employer/manage-jobs');

    await page.goto('/employer/dashboard');
    await page.getByRole('button', { name: /Xem H/ }).first().click();

    await expect(page).toHaveURL(/\/employer\/job\/.+\/applications$/);
    await expect(page.getByText('PENDING')).toBeVisible();
  });
});
