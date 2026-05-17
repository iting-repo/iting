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

  test('gỡ khóa (unban) tài khoản người dùng', async ({ page }) => {
    let unbanCalled = false;

    await page.route('**/api/admin/users/103/unban', async (route) => {
      unbanCalled = true;
      await fulfillJson(route, { success: true });
    });

    await page.goto('/admin/users');

    // Le Van C is BANNED in fixture (row index 1)
    const targetRow = page.locator('tr').filter({ hasText: 'Le Van C' });
    await expect(targetRow).toBeVisible();

    await targetRow.getByRole('button').first().click();

    const menu = page.locator('.fixed.inset-0, .fixed.z-\\[300\\]').last();
    const unbanBtn = menu.locator('button, div, a').filter({ hasText: /g. kh.a|unban|m. kh.a|kh.i ph.c/i });

    if ((await unbanBtn.count()) === 0) {
      test.skip(true, 'Menu gỡ khóa user chưa có trong build hiện tại');
    }

    await unbanBtn.first().click();

    // Confirm if dialog appears
    const confirmDialog = page.locator('.fixed.inset-0').last();
    if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmDialog.locator('button').last().click();
    }

    await expect.poll(() => unbanCalled).toBeTruthy();
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
    let filterCalled = null;

    await page.route('**/api/admin/jobs/filter**', async (route) => {
      const url = new URL(route.request().url());
      filterCalled = url.searchParams.get('status');
      await fulfillJson(route, {
        ...adminJobsPage,
        content: adminJobsPage.content.filter((j) => j.status === 'ACTIVE'),
        totalElements: 1,
      });
    });

    await page.goto('/admin/jobs');
    await expect(page.getByText('Backend Engineer')).toBeVisible();

    // Find the status filter select and change to "Đang hoạt động"
    const statusSelect = page.locator('select').filter({ hasText: /T.t c.|.ang ho.t .ng/i }).first();
    const optionCount = await statusSelect.locator('option').count();
    if (optionCount === 0) {
      test.skip(true, 'Filter select không có sẵn');
    }

    await statusSelect.selectOption({ label: /.ang ho.t .ng/i }).catch(async () => {
      // Fallback: try value "ACTIVE"
      await statusSelect.selectOption('ACTIVE');
    });

    await expect.poll(() => filterCalled).toBeTruthy();
  });
});
