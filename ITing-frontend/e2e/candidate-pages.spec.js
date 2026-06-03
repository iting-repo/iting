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
    // waitUntil: 'domcontentloaded' tránh trường hợp page.goto chờ 'load' event
    // quá lâu do API requests pending (mocked request giữ connection mở).
    await page.goto('/candidate/applied-jobs', { waitUntil: 'domcontentloaded' });

    // AppliedJobs.jsx render "Xem Chi Tiết" là <Link> (a tag), không phải <button>.
    // Dùng getByRole('link') thay vì getByRole('button').
    await page.getByRole('link', { name: /Xem Chi Ti|Xem chi ti/i }).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('ITing Software')).toBeVisible();
  });

  test('trang thông báo việc làm mở được chi tiết việc', async ({ page }) => {
    await page.goto('/candidate/job-alerts', { waitUntil: 'domcontentloaded' });

    // JobAlerts.jsx: tiêu đề job là <h3> có onClick navigate; CTA "Ứng Tuyển"
    // cũng navigate. Tìm theo text job title (đã có data fixture) hoặc theo
    // button "Ứng Tuyển" để tránh strict mode của getByRole('link').
    const applyBtn = page.getByRole('button', { name: /Ứng Tuyển|Ứng tuyển|Ung tuyen/i }).first();
    if ((await applyBtn.count()) > 0) {
      await applyBtn.click();
    } else {
      // Fallback: click job title heading
      await page.locator('h3').filter({ hasText: /Kỹ sư|Developer|Engineer/i }).first().click();
    }

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('Java').first()).toBeVisible();
  });
});
