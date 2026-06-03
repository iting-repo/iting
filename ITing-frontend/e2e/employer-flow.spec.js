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
    await page.locator('tr').filter({ hasText: 'C/C++ Java Golang Python' }).getByRole('button').first().click();

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
