const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockEmployerApis,
  setEmployerSession,
} = require('./helpers/mock-api');

test.describe('Trang nhà tuyển dụng', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);
  });

  test('trang tổng quan mở được quản lý tin và hồ sơ ứng tuyển', async ({ page }) => {
    await page.goto('/employer/dashboard');

    await page.locator('a[href="/employer/manage-jobs"]').first().click();
    await expect(page).toHaveURL('/employer/manage-jobs');

    await page.goto('/employer/dashboard');
    // Text thực tế là "Xem Hồ Sơ Ứng Viên" (i18n vi) — dùng flag /i để match
    // cả dạng vi-en. Tham khảo locales/vi/translation.json.
    await page.getByRole('button', { name: /Xem H/i }).first().click();

    // URL SEO dùng ID đã encodeId() — chấp nhận cả raw và encoded.
    await expect(page).toHaveURL(/\/employer\/job\/.+\/(?:2099682|1SAIfc)\/applications$/);
    await expect(page.getByText(/Hồ sơ mới|Ho so moi/i)).toBeVisible();
  });
});
