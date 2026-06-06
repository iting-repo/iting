const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockEmployerApis,
  setEmployerSession,
  fulfillJson,
} = require('./helpers/mock-api');
const { primaryJob } = require('./helpers/job-fixtures');

const baseApplications = [
  {
    id: 501,
    jobId: 2099682,
    applicantId: 101,
    userId: 101,
    applicantName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    jobTitle: primaryJob.title,
    yearsExperience: 5,
    education: 'Bách Khoa TP.HCM',
    timeSent: '2026-04-01T10:00:00.000Z',
    status: 'PENDING',
    cvUrl: 'https://files.example.com/nguyen-van-a-cv.pdf',
  },
];

test.describe('Trang nhà tuyển dụng', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);

    // mockApplicationListingApis: chuẩn bị cho khi dashboard navigate sang
    // /employer/job/{slug}/{jobKey}/applications
    await page.route('**/api/hr/applications/search**', async (route) => {
      await fulfillJson(route, {
        content: baseApplications,
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10,
      });
    });
    await page.route('**/api/hr/applications/*/my-note', async (route) => {
      if (route.request().method() === 'GET') {
        await fulfillJson(route, { note: '' });
        return;
      }
      await fulfillJson(route, { success: true });
    });
    await page.route('**/api/hr/applications/*/view', async (route) => {
      await fulfillJson(route, { success: true });
    });
    await page.route('**/api/hr/candidates/*/profile', async (route) => {
      await fulfillJson(route, {});
    });
    await page.route('**/api/hr/candidates/similar-by-job/**', async (route) => {
      await fulfillJson(route, []);
    });
  });

  test('trang tổng quan mở được quản lý tin và hồ sơ ứng tuyển', async ({ page }) => {
    await page.goto('/employer/dashboard');

    // "Tin đã đăng" card là <Link to="/employer/manage-jobs"> — click vào link
    // (chứ không phải <a> vì React Router dùng Link)
    const manageJobsLink = page.locator('a[href="/employer/manage-jobs"]').first();
    await manageJobsLink.click();
    await expect(page).toHaveURL(/\/employer\/manage-jobs$/);

    await page.goto('/employer/dashboard');
    // Dashboard gọi companyService.getMyCompany() + getMyJobs(0, 5) + applicationService.getEmployerStats()
    // → cần mock đủ 3 endpoint này (đã handle trong mockCommonApis)
    // Text "Xem Hồ Sơ Ứng Viên" từ translation key "employer_dashboard.table.view_applications"
    await page.getByRole('button', { name: /Xem H/i }).first().click();

    // URL SEO dùng ID đã encodeId() — chấp nhận cả raw và encoded.
    await expect(page).toHaveURL(/\/employer\/job\/.+\/(?:2099682|1SAIfc)\/applications$/);
    // Sau khi SEO route load, searchApplications() sẽ chạy và render candidate.
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
  });
});
