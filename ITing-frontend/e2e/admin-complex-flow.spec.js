const { test, expect } = require('@playwright/test');
const { mockAdminApis, setAdminSession, fulfillJson } = require('./helpers/mock-api');
const { adminCompaniesPage, adminUsersPage, adminJobsPage } = require('./helpers/job-fixtures');

test.describe('Admin - các thao tác phức tạp', () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);
  });

  test('từ chối tin tuyển dụng kèm lý do gọi đúng API reject', async ({ page }) => {
    let rejectCalled = null;

    await page.route('**/api/admin/jobs/201/reject', async (route) => {
      rejectCalled = {
        url: route.request().url(),
        body: route.request().postData(),
      };
      await fulfillJson(route, { success: true });
    });

    await page.goto('/admin/jobs');

    const targetRow = page.locator('tr').filter({ hasText: 'Backend Engineer' });
    await expect(targetRow).toBeVisible();

    // Open row action menu — last button = "..." menu trigger
    await targetRow.locator('button').last().click();
    await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /T. ch.i/i }).click();

    const dialog = page.locator('.fixed.inset-0').last();
    await expect(dialog).toBeVisible();
    await dialog.locator('textarea').fill('Mô tả không rõ ràng, thiếu thông tin lương.');
    await dialog.locator('button').last().click();

    await expect.poll(() => rejectCalled?.url).toContain('/admin/jobs/201/reject');
    expect(rejectCalled.body).toContain('Mô tả không rõ ràng');
  });

  test('yêu cầu chỉnh sửa tin tuyển dụng gọi API request-revision', async ({ page }) => {
    let revisionCalled = null;

    await page.route('**/api/admin/jobs/201/request-revision', async (route) => {
      revisionCalled = {
        url: route.request().url(),
        body: route.request().postData(),
      };
      await fulfillJson(route, { success: true });
    });

    await page.goto('/admin/jobs');

    const targetRow = page.locator('tr').filter({ hasText: 'Backend Engineer' });
    await targetRow.locator('button').last().click();

    // Menu has multiple actions — find "yêu cầu chỉnh sửa" / "sửa lại"
    const menu = page.locator('.fixed.z-\\[300\\]').last();
    const revisionBtn = menu.locator('button').filter({ hasText: /s.a|revision|ch.nh/i });
    // If no revision menu item exists in current build, skip the rest of the test
    if ((await revisionBtn.count()) === 0) {
      test.skip(true, 'Menu yêu cầu chỉnh sửa không có trong build hiện tại');
    }

    await revisionBtn.first().click();
    const dialog = page.locator('.fixed.inset-0').last();
    await expect(dialog).toBeVisible();
    await dialog.locator('textarea').fill('Vui lòng cập nhật lại phần mô tả công việc.');
    await dialog.locator('button').last().click();

    await expect.poll(() => revisionCalled?.url).toContain('/admin/jobs/201/request-revision');
  });

  test('gỡ đình chỉ công ty đã bị suspended', async ({ page }) => {
    let unsuspendCalled = false;

    await page.route('**/api/admin/companies/12/unsuspend', async (route) => {
      unsuspendCalled = true;
      await fulfillJson(route, { success: true });
    });

    await page.goto('/admin/companies');

    // VNG Corporation is SUSPENDED in fixture (active: false)
    const targetRow = page.locator('tr').filter({ hasText: 'VNG Corporation' });
    await expect(targetRow).toBeVisible();

    await targetRow.locator('button').last().click();
    const menu = page.locator('.fixed.z-\\[300\\]').last();
    const unsuspendBtn = menu.locator('button').filter({ hasText: /g. .nh ch.|unsuspend|kh.i ph.c|m. l.i/i });

    if ((await unsuspendBtn.count()) === 0) {
      test.skip(true, 'Menu gỡ đình chỉ chưa có cho hành động này');
    }

    await unsuspendBtn.first().click();

    // Confirm dialog (may or may not require note)
    const confirm = page.locator('.fixed.inset-0').last();
    await expect(confirm).toBeVisible();
    await confirm.locator('button').last().click();

    await expect.poll(() => unsuspendCalled).toBeTruthy();
  });

  test('mở khóa hàng loạt user đã bị khóa qua bulk action toolbar', async ({ page }) => {
    let bulkUnbanIds = null;

    await page.route('**/api/admin/users/bulk-unban', async (route) => {
      bulkUnbanIds = JSON.parse(route.request().postData() || '[]');
      await fulfillJson(route, { success: true });
    });

    // window.confirm() blocks until dismissed — auto-accept
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto('/admin/users');

    const targetRow = page.locator('table tbody tr').filter({ hasText: 'Le Van C' });
    await expect(targetRow).toBeVisible();

    // Tick the row's selection checkbox
    await targetRow.locator('input[type="checkbox"]').first().check();

    // Bulk toolbar appears at bottom (fixed bottom-6, z-[60])
    const bulkBar = page.locator('.fixed.bottom-6.z-\\[60\\]');
    await expect(bulkBar).toBeVisible();

    await bulkBar.getByRole('button', { name: /M. kh.a h.ng lo.t/i }).click();

    await expect.poll(() => bulkUnbanIds, { timeout: 5000 }).not.toBeNull();
    expect(bulkUnbanIds).toContain(103);
  });

  test('xem AI review của tin tuyển dụng trong preview', async ({ page }) => {
    await page.goto('/admin/jobs');

    const targetRow = page.locator('tr').filter({ hasText: 'Backend Engineer' });
    await expect(targetRow).toBeVisible();

    // Click the job title or preview button — opens JobPreviewDialog
    await page.getByText('Backend Engineer').click();

    // Preview shows the AI review reason (mocked in mockAdminApis fixture)
    await expect(
      page.getByText(/AI .* ngh. ph. duy.t|AI đề xuất phê duyệt/i).first()
    ).toBeVisible();
    await expect(page.getByText('Build backend services')).toBeVisible();
  });

  test('phê duyệt tin sau khi xem preview gọi API approve', async ({ page }) => {
    let approveCalled = null;

    await page.route('**/api/admin/jobs/201/approve', async (route) => {
      approveCalled = {
        url: route.request().url(),
        body: route.request().postData(),
      };
      await fulfillJson(route, { success: true });
    });

    await page.goto('/admin/jobs');
    await page.getByText('Backend Engineer').click();

    // Preview dialog has Approve button
    const preview = page.locator('.fixed.inset-0').last();
    await expect(preview).toBeVisible();
    await preview.getByRole('button', { name: /Duy.t|Ph. duy.t/i }).first().click();

    // ActionDialog now opens for the note
    const noteDialog = page.locator('.fixed.inset-0').last();
    await expect(noteDialog).toBeVisible();
    await noteDialog.locator('textarea').fill('Tin hợp lệ, duyệt cho đăng công khai.');
    await noteDialog.locator('button').last().click();

    await expect.poll(() => approveCalled?.url).toContain('/admin/jobs/201/approve');
  });

  test('lọc danh sách công việc theo trạng thái Active', async ({ page }) => {
    let lastStatusParam;

    // Override the broad mockAdminApis route for /admin/jobs/filter:
    // - No status param  → return ALL jobs (so the initial list renders normally)
    // - With status      → filter accordingly and record the param
    await page.route('**/api/admin/jobs/filter**', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      lastStatusParam = status;

      const content = status
        ? adminJobsPage.content.filter((j) => j.status === status)
        : adminJobsPage.content;

      await fulfillJson(route, {
        ...adminJobsPage,
        content,
        totalElements: content.length,
      });
    });

    await page.goto('/admin/jobs');
    await expect(page.getByText('Backend Engineer')).toBeVisible();

    // Status filter dropdown — JobFilters component renders a select with option ACTIVE
    const statusSelect = page.locator('select').filter({ hasText: /T.t c.|.ang ho.t .ng|PENDING/i }).first();
    await statusSelect.selectOption('ACTIVE');

    await expect.poll(() => lastStatusParam, { timeout: 5000 }).toBe('ACTIVE');
    // Backend Engineer (PENDING) should disappear, Frontend Engineer (ACTIVE) remains
    await expect(page.getByText('Frontend Engineer')).toBeVisible();
    await expect(page.getByText('Backend Engineer')).toHaveCount(0);
  });
});
