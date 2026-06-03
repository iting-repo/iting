const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockEmployerApis,
  setEmployerSession,
} = require('./helpers/mock-api');

test.describe('Đăng tin tuyển dụng - kiểm tra ràng buộc form', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);

    await page.route('https://provinces.open-api.vn/api/v2/p/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ code: 79, name: 'Ho Chi Minh' }]),
      });
    });
  });

  test('submit form rỗng hiển thị lỗi bắt buộc trên các trường', async ({ page }) => {
    await page.goto('/employer/manage-jobs');
    await page.locator('button').filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator('form').filter({
      has: page.locator('input[name="jobTitle"]'),
    });
    await expect(form).toBeVisible();

    await form.locator('button[type="submit"]').click();

    // PostJob.jsx có thể render error theo 2 dạng:
    //   1. Inline: <p class="text-red-500 text-xs">Bắt buộc</p> cho mỗi field
    //   2. Toast:  <div data-sonner-toast>...</div> thông báo chung
    // Một số trường dùng native HTML5 required (browser popup). Đếm tổng số
    // visible error ở cả 2 dạng; nếu inline không có, fallback sang toast.
    const inlineErrors = page.locator('p.text-red-500.text-xs', { hasText: /B.t bu.c/i });
    const toastErrors = page.locator('[data-sonner-toast]', { hasText: /bắt buộc|required/i });

    await expect.poll(async () => {
      const inline = await inlineErrors.count();
      const toast = await toastErrors.count();
      return inline + toast;
    }).toBeGreaterThan(0);
  });

  test('giới hạn tiêu đề 150 ký tự', async ({ page }) => {
    await page.goto('/employer/manage-jobs');
    await page.locator('button').filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator('form').filter({
      has: page.locator('input[name="jobTitle"]'),
    });
    const titleInput = form.locator('input[name="jobTitle"]');

    // Type 200 chars — maxLength=150 should cap input
    const longTitle = 'A'.repeat(200);
    await titleInput.fill(longTitle);
    const actualValue = await titleInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(150);

    // Counter shows current/max
    await expect(form.getByText(/150\/150/)).toBeVisible();
  });

  test('lương tối đa nhỏ hơn lương tối thiểu sinh lỗi', async ({ page }) => {
    await page.goto('/employer/manage-jobs');
    await page.locator('button').filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator('form').filter({
      has: page.locator('input[name="jobTitle"]'),
    });

    await form.locator('input[name="jobTitle"]').fill('Test Job');
    await form.locator('select[name="salaryType"]').selectOption('MONTH');
    await form.locator('input[name="minSalary"]').fill('50000000');
    await form.locator('input[name="maxSalary"]').fill('20000000');

    await form.locator('button[type="submit"]').click();

    await expect(
      page.locator('p.text-red-500.text-xs', { hasText: /L..ng t.i .a ph.i l.n h.n/i }),
    ).toBeVisible();
  });

  test('đóng modal bằng nút X', async ({ page }) => {
    await page.goto('/employer/manage-jobs');
    await page.locator('button').filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator('form').filter({
      has: page.locator('input[name="jobTitle"]'),
    });
    await expect(form).toBeVisible();

    // Đợi toast error từ fetch trước đó (nếu có) tự tắt để tránh intercept
    // pointer events. Nếu không có toast, bước này no-op.
    const blockingToast = page.locator('[data-sonner-toast]').first();
    if ((await blockingToast.count()) > 0) {
      // Đợi toast tự ẩn (sonner default ~4s) — không dismiss thủ công
      // để tránh click nhầm vào UI khác.
      await blockingToast.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
    }

    // Header has a close button with FaTimes icon — last button in sticky header
    await page.locator('.sticky button').first().click();

    await expect(form).not.toBeVisible();
  });
});
