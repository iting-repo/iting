const { test, expect } = require('@playwright/test');
const { mockCommonApis, mockEmployerApis, setEmployerSession } = require('./helpers/mock-api');

test.describe('Employer job management flow', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);
  });

  test('manage jobs opens SEO applications route', async ({ page }) => {
    await page.goto('/employer/manage-jobs');

    await expect(page.getByText('Kỹ sư phát triển phần mềm C/C++ Java Golang Python')).toBeVisible();
    await page.getByRole('button', { name: /View Applications/i }).click();

    await expect(page).toHaveURL(
      /\/employer\/job\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/2099682\/applications$/,
    );
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
  });

  test('legacy employer applications route redirects to SEO route', async ({ page }) => {
    await page.goto('/employer/job/1/applications');

    await expect(page).toHaveURL(
      /\/employer\/job\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/2099682\/applications$/,
    );
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
  });
});
