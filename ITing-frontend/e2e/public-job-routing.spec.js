const { test, expect } = require('@playwright/test');
const { mockCommonApis } = require('./helpers/mock-api');

test.describe('Public SEO job routing', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApis(page);
  });

  test('homepage opens job detail with SEO-friendly slug URL', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /C\/C\+\+ Java Golang Python/ })).toBeVisible();
    await page.getByRole('button', { name: /Chi Ti/ }).first().click();

    await expect(page).toHaveURL(
      /\/viec-lam\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/2099682\.html$/,
    );
    await expect(page.getByRole('heading', { name: /C\/C\+\+ Java Golang Python/ })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'C/C++' }).first()).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Java' }).first()).toBeVisible();
  });

  test('legacy detail route redirects to canonical SEO route', async ({ page }) => {
    await page.goto('/jobs/1');

    await expect(page).toHaveURL(
      /\/viec-lam\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/2099682\.html$/,
    );
  });

  test('wrong slug is normalized back to canonical slug', async ({ page }) => {
    await page.goto('/viec-lam/slug-sai/2099682.html');

    await expect(page).toHaveURL(
      /\/viec-lam\/ky-su-phat-trien-phan-mem-c-c-java-golang-python\/2099682\.html$/,
    );
  });
});
