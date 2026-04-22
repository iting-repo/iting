const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockCandidateApis,
  setCandidateSession,
} = require('./helpers/mock-api');

test.describe('Trang ứng viên', () => {
  test.beforeEach(async ({ page }) => {
    await setCandidateSession(page);
    await mockCommonApis(page);
    await mockCandidateApis(page);
  });

  test('trang việc đã ứng tuyển mở được chi tiết việc', async ({ page }) => {
    await page.goto('/candidate/applied-jobs');

    await page.getByRole('button', { name: /Xem Chi Ti|Xem chi ti/i }).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('ITing Software')).toBeVisible();
  });

  test('trang thông báo việc làm mở được chi tiết việc', async ({ page }) => {
    await page.goto('/candidate/job-alerts');

    await page.getByRole('button', { name: /Tuy|Ứng|Ung/i }).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('Java').first()).toBeVisible();
  });
});
