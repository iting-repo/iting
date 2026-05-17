const { test, expect } = require('@playwright/test');
const { setAdminSession, mockAdminApis } = require('./helpers/mock-api');

test('debug admin page state', async ({ page }) => {
  await setAdminSession(page);
  await mockAdminApis(page);

  const messages = [];
  page.on('console', (msg) => messages.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto('/admin/users');
  await page.waitForTimeout(3000);

  console.log('URL:', page.url());
  console.log('Console messages:', messages.slice(0, 10).join('\n'));

  const tableCount = await page.locator('table').count();
  const loginInputs = await page.locator('input[type="email"]').count();
  console.log('Tables:', tableCount, '  Login inputs:', loginInputs);

  const bodySnippet = await page.locator('body').innerText().catch(() => '');
  console.log('Body (200 chars):', bodySnippet.substring(0, 200));

  expect(tableCount).toBeGreaterThan(0);
});
