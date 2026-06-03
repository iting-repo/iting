const { test, expect } = require('@playwright/test');
const { mockCommonApis, mockEmployerApis, setEmployerSession, fulfillJson } = require('./helpers/mock-api');

const baseApplications = [
  {
    id: 501,
    jobId: 2099682,
    applicantId: 101,
    userId: 101,
    applicantName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    jobTitle: 'Kỹ sư phát triển phần mềm C/C++ Java Golang Python',
    yearsExperience: 5,
    education: 'Bách Khoa TP.HCM',
    timeSent: '2026-04-01T10:00:00.000Z',
    status: 'PENDING',
    cvUrl: 'https://files.example.com/nguyen-van-a-cv.pdf',
  },
];

async function mockJobApplicationsDetailApis(page) {
  // Application listing for /hr/applications/search (called when SEO route is loaded)
  await page.route('**/api/hr/applications/search**', async (route) => {
    await fulfillJson(route, {
      content: baseApplications,
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
    });
  });

  // Per-HR note & view endpoints (modal opening)
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
  // HR candidate profile / match
  await page.route('**/api/hr/candidates/*/profile', async (route) => {
    await fulfillJson(route, {});
  });
  await page.route('**/api/hr/candidates/similar-by-job/**', async (route) => {
    await fulfillJson(route, []);
  });
}

test.describe('Employer job management flow', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);
    await mockJobApplicationsDetailApis(page);
  });

  test('manage jobs opens SEO applications route', async ({ page }) => {
    await page.goto('/employer/manage-jobs');

    await expect(page.getByText('Kỹ sư phát triển phần mềm C/C++ Java Golang Python')).toBeVisible();
    await page.locator('tr').filter({ hasText: 'C/C++ Java Golang Python' }).getByRole('button').first().click();

    // LegacyEmployerJobApplicationsRedirect resolves /employer/job/1/applications →
    // fetch job → SEO URL /employer/job/{slug}/{encoded}/applications
    // URL chứa ID đã qua encodeId() obfuscation — chấp nhận cả raw (2099682) và encoded (1SAIfc).
    await expect(page).toHaveURL(
      /\/employer\/job\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/(?:2099682|1SAIfc)\/applications$/,
    );
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
  });

  test('legacy employer applications route redirects to SEO route', async ({ page }) => {
    await page.goto('/employer/job/1/applications');

    await expect(page).toHaveURL(
      /\/employer\/job\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/(?:2099682|1SAIfc)\/applications$/,
    );
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
  });
});
