const { test, expect } = require('@playwright/test');
const { fulfillJson, mockCommonApis, setEmployerSession } = require('./helpers/mock-api');
const { companyProfile } = require('./helpers/job-fixtures');

test.describe('Employer company profile', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
  });

  test('updates basic company info with the expected payload schema', async ({ page }) => {
    let updatePayload = null;

    await page.route('**/api/companies/me/basic-info', async (route) => {
      updatePayload = JSON.parse(route.request().postData() || '{}');
      await fulfillJson(route, {
        ...companyProfile,
        ...updatePayload,
      });
    });

    await page.goto('/employer/company-profile');

    await expect(page.locator('input').first()).toHaveValue('ITing Software');

    await page.getByPlaceholder('Nhập tên công ty').fill('ITing Software JSC');
    await page.getByPlaceholder('https://example.com').fill('https://jobs.iting.vn');
    await page.getByPlaceholder('Nhập email công ty').fill('talent@iting.vn');
    await page.getByRole('button', { name: 'Lưu' }).click();

    await expect.poll(() => updatePayload).not.toBeNull();
    expect(updatePayload).toMatchObject({
      name: 'ITing Software JSC',
      logoUrl: companyProfile.logoUrl,
      taxCode: companyProfile.taxCode,
      website: 'https://jobs.iting.vn',
      companySize: companyProfile.companySize,
      companyEmail: 'talent@iting.vn',
      industry: companyProfile.industry,
      address: companyProfile.address,
      phone: companyProfile.phone,
      description: companyProfile.description,
    });
  });
});
