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

    // AppliedJobs.jsx render "Xem Chi Tiết" là <Link> (a tag), không phải <button>.
    // Dùng getByRole('link') thay vì getByRole('button').
    await page.getByRole('link', { name: /Xem Chi Ti|Xem chi ti/i }).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('ITing Software')).toBeVisible();
  });

  test('trang thông báo việc làm mở được chi tiết việc', async ({ page }) => {
    await page.goto('/candidate/job-alerts');

    // Tương tự — CTA đến job detail có thể là <Link>. Dùng getByRole('link') hoặc
    // click trực tiếp vào job title để tránh strict mode.
    const firstJobLink = page.getByRole('link', { name: /Tuy|Ứng|Ung/i }).first();
    if ((await firstJobLink.count()) > 0) {
      await firstJobLink.click();
    } else {
      // Fallback: click job title text
      await page.locator('a').filter({ hasText: /Kỹ sư|Developer|Engineer/i }).first().click();
    }

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('Java').first()).toBeVisible();
  });
});
