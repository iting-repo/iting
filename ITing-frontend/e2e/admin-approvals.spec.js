const { test, expect } = require('@playwright/test');
const { mockAdminApis, setAdminSession } = require('./helpers/mock-api');

test.describe('Trang admin duyệt dữ liệu', () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);
  });

  test('hiển thị thống kê và danh sách tin chờ duyệt', async ({ page }) => {
    await page.goto('/admin/jobs');

    await expect(page.getByText('Backend Engineer')).toBeVisible();
    await expect(page.getByText(/Chờ duyệt|Ch.*duy/i).first()).toBeVisible();
    await expect(page.getByText(/AI đạt|AI dat/i).first()).toBeVisible();
  });

  test('hiển thị thống kê và danh sách công ty chờ duyệt', async ({ page }) => {
    await page.goto('/admin/companies');

    await expect(page.getByText('ITing Software')).toBeVisible();
    await expect(page.getByText(/CHỜ DUYỆT|CHO DUYET/i).first()).toBeVisible();
    // Fixture adminCompaniesPage có 3 công ty: ITing Software, VNG Corporation, Another Tech
    // (CMP-001, id 12, CMP-002) — xem helpers/job-fixtures.js.
    await expect(page.locator('table tbody tr')).toHaveCount(3);
  });

  test('cho phép mở hành động duyệt tin tuyển dụng', async ({ page }) => {
    await page.goto('/admin/jobs');

    await page.locator('table tbody tr').first().locator('button').last().click();
    await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /Ph.*duy/i }).click();

    const dialog = page.locator('.fixed.inset-0').last();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Duyệt|Duyet/i);
  });
});
