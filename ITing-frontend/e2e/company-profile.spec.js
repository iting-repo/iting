const { test, expect } = require('@playwright/test');
const { fulfillJson, mockCommonApis, setEmployerSession } = require('./helpers/mock-api');
const { companyProfile } = require('./helpers/job-fixtures');

test.describe('Hồ sơ công ty nhà tuyển dụng', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
  });

  test('tạo yêu cầu cập nhật thông tin công ty đúng payload', async ({ page }) => {
    let updatePayload = null;

    await page.route('**/api/companies/me', async (route) => {
      if (route.request().method() === 'GET') {
        await fulfillJson(route, {
          ...companyProfile,
          profileSetup: true,
          companyInfoUpdateStatus: 'DRAFT',
        });
        return;
      }
      await route.fallback();
    });

    await page.route('**/api/companies/me/basic-info', async (route) => {
      updatePayload = JSON.parse(route.request().postData() || '{}');
      await fulfillJson(route, {
        ...companyProfile,
        ...updatePayload,
      });
    });

    await page.goto('/employer/company-profile');

    await expect(page.getByText('ITing Software').first()).toBeVisible();
    await page.getByRole('button', { name: /Ch.*nh s.*a|Chinh sua/i }).click();

    const modal = page.locator('.fixed.inset-0').last();
    await expect(modal).toBeVisible();

    const inputs = modal.locator('input[type="text"]');
    await inputs.nth(0).fill('ITing Software JSC');
    await inputs.nth(3).fill('talent@iting.vn');
    await inputs.nth(4).fill('https://jobs.iting.vn');

    await modal.getByRole('button', { name: /G.*i admin duy.*t|Gui admin duyet/i }).click();

    await expect.poll(() => updatePayload).not.toBeNull();
    expect(updatePayload).toMatchObject({
      name: 'ITing Software JSC',
      website: 'https://jobs.iting.vn',
      companyEmail: 'talent@iting.vn',
    });
  });
});
