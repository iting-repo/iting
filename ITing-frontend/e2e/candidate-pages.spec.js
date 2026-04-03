const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockCandidateApis,
  setCandidateSession,
} = require('./helpers/mock-api');

test.describe('Candidate pages smoke', () => {
  test.beforeEach(async ({ page }) => {
    await setCandidateSession(page);
    await mockCommonApis(page);
    await mockCandidateApis(page);
  });

  test('applied jobs page opens a job detail route', async ({ page }) => {
    await page.goto('/candidate/applied-jobs');

    await page.getByRole('button', { name: /Xem Chi Ti/ }).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByText('ITing Software')).toBeVisible();
  });

  test('job alerts page navigates to a job detail route', async ({ page }) => {
    await page.goto('/candidate/job-alerts');

    await page.getByRole('button', { name: /Tuy/ }).first().click();

    await expect(page).toHaveURL(/\/viec-lam\/.+\/.+\.html$/);
    await expect(page.getByRole('listitem').filter({ hasText: 'Java' }).first()).toBeVisible();
  });
});
