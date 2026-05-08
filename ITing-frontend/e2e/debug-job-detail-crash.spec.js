const { test, expect } = require('@playwright/test');
const { mockCommonApis } = require('./helpers/mock-api');

test.describe('Debug: job detail should not crash', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApis(page);
  });

  test('navigating to SEO job detail does not throw pageerror', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(String(err && err.stack ? err.stack : err));
    });

    await page.goto('/viec-lam/slug-sai/2099682.html');

    // If the page crashes during render, this heading will never appear.
    try {
      await expect(page.getByRole('heading', { name: /C\/C\+\+ Java Golang Python/ })).toBeVisible({
        timeout: 10_000,
      });
    } catch (err) {
      throw new Error(
        [
          'Job detail did not render expected heading.',
          `url=${page.url()}`,
          `pageerror(s):\n${pageErrors.join('\n\n') || '(none captured)'}`,
          `assertionError=${String(err && err.message ? err.message : err)}`,
        ].join('\n\n'),
      );
    }

    expect(pageErrors, `pageerror(s):\n${pageErrors.join('\n\n')}`).toEqual([]);
  });
});

