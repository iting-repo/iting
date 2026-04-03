const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockCandidateApis,
  setCandidateSession,
} = require('./helpers/mock-api');

test.describe('Candidate flow', () => {
  test.beforeEach(async ({ page }) => {
    await setCandidateSession(page);
    await mockCommonApis(page);
    await mockCandidateApis(page);
  });

  test('candidate dashboard loads recent applications', async ({ page }) => {
    await page.goto('/candidate/dashboard');

    await expect(page.getByText('Hello, Ely!')).toBeVisible();
    await expect(page.getByText('ITing Software')).toBeVisible();
    await expect(page.getByText('Kỹ sư phát triển phần mềm C/C++ Java Golang Python')).toBeVisible();
  });

  test('candidate favorite jobs opens SEO job detail route', async ({ page }) => {
    await page.goto('/candidate/favorite-jobs');

    await page.getByText('Senior UX Designer').first().click();

    await expect(page).toHaveURL(
      /\/viec-lam\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/2099682\.html$/,
    );
    await expect(page.getByRole('heading', { name: 'Kỹ sư phát triển phần mềm C/C++ Java Golang Python' })).toBeVisible();
  });
});
