const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockCandidateApis,
  setCandidateSession,
} = require('./helpers/mock-api');

test.describe('Luồng ứng viên', () => {
  test.beforeEach(async ({ page }) => {
    await setCandidateSession(page);
    await mockCommonApis(page);
    await mockCandidateApis(page);
  });

  test('trang tổng quan hiển thị ứng tuyển gần đây', async ({ page }) => {
    await page.goto('/candidate/dashboard');

    await expect(page.getByText(/Hello,/)).toBeVisible();
    await expect(page.getByText('ITing Software')).toBeVisible();
    await expect(page.getByText(/C\/C\+\+ Java Golang Python/)).toBeVisible();
  });

  test('việc đã lưu mở được trang chi tiết SEO', async ({ page }) => {
    await page.goto('/candidate/favorite-jobs');

    await page.getByText(/C\/C\+\+ Java Golang Python/).first().click();

    // Chấp nhận cả public_id thô (2099682) lẫn ID đã obfuscate (1SAIfc) — xem
    // src/utils/jobUrl.js#buildJobDetailPath. Frontend chuyển sang Base62 XOR-Knuth
    // để ẩn ID trong URL.
    await expect(page).toHaveURL(
      /\/viec-lam\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/(?:2099682|1SAIfc)\.html$/,
    );
    await expect(page.getByRole('heading', { name: /C\/C\+\+ Java Golang Python/ })).toBeVisible();
  });
});
