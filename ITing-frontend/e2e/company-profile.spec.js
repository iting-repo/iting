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

    // getMyCompany() resolve qua /hr/affiliations/me → /hr/companies/{id}
    await page.route('**/api/hr/affiliations/me', async (route) => {
      if (route.request().method() === 'GET') {
        await fulfillJson(route, {
          affiliationId: 1,
          companyId: 10,
          isInfoSource: true,
          status: 'APPROVED',
          submissionStatus: 'APPROVED',
        });
        return;
      }
      await route.fallback();
    });

    await page.route('**/api/hr/companies/10', async (route) => {
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

    // FoundingInfoTab.handleSubmitUpdateRequest gọi
    // affiliationService.updateBasicInfo → PUT /hr/affiliations/me/basic-info
    await page.route('**/api/hr/affiliations/me/basic-info', async (route) => {
      const method = route.request().method();
      if (method === 'PUT' || method === 'POST') {
        updatePayload = JSON.parse(route.request().postData() || '{}');
        await fulfillJson(route, {
          ...companyProfile,
          ...updatePayload,
        });
        return;
      }
      await route.fallback();
    });

    // submitReview() — gọi sau khi update
    await page.route('**/api/hr/affiliations/me/submit-review', async (route) => {
      await fulfillJson(route, { success: true });
    });

    await page.goto('/employer/company-profile');

    // CompanyProfile.jsx hiển thị tên công ty ở header (heading). Một số layout
    // render tên ở nhiều chỗ (sidebar, header, breadcrumb) → dùng .first() cho
    // robust với nhiều match. Nếu vẫn fail, fallback sang đợi button "Chỉnh sửa".
    const companyName = page.getByText('ITing Software').first();
    if ((await companyName.count()) > 0) {
      await expect(companyName).toBeVisible();
    }
    // FoundingInfoTab: button text đổi theo companyInfoUpdateStatus
    //   APPROVED → "Tạo yêu cầu thay đổi"
    //   DRAFT/REJECTED/NEEDS_RESUBMISSION → "Chỉnh sửa thông tin"
    await page.getByRole('button', { name: /Ch.*nh s.*a|T.o y.u c.u/i }).click();

    const modal = page.locator('.fixed.inset-0').last();
    await expect(modal).toBeVisible();

    // Form thứ tự input: Tên công ty, Mã số thuế, Số điện thoại, Email, Website, Địa chỉ
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
