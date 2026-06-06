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

    // PostJob.jsx render error inline dạng <p class="text-red-500 text-xs">* Vui lòng...</p>
    // cho từng field. Khi submit rỗng → nhiều field có error. Đếm tổng số inline
    // error; nếu inline không có, fallback sang toast.
    const inlineErrors = page.locator('p.text-red-500.text-xs', { hasText: /Vui lòng|B.t bu.c/i });
    const toastErrors = page.locator('[data-sonner-toast]', { hasText: /bắt buộc|required|error/i });

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

    // Modal "Đăng công việc" là PostJob component, header là <div class="sticky top-0 z-10 bg-white ...">
    // chứa title bên trái và close button (FaTimes) bên phải.
    // Nút X có class "w-10 h-10 rounded-full ..." và chứa FaTimes icon.
    // Cách chính xác: target theo form cha (PostJob modal chứa form) rồi tìm sticky header button.
    const modalHeader = form.locator('xpath=ancestor::div[contains(@class, "fixed")][1]')
      .locator('.sticky.top-0').first();
    await expect(modalHeader).toBeVisible();
    const closeBtn = modalHeader.locator('button').last();
    await closeBtn.click();

    await expect(form).not.toBeVisible();
  });
});
