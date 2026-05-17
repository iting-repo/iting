const { test, expect } = require('@playwright/test');
const {
  mockCommonApis,
  mockEmployerApis,
  setEmployerSession,
  fulfillJson,
} = require('./helpers/mock-api');
const { primaryJob } = require('./helpers/job-fixtures');

const baseApplications = [
  {
    id: 501,
    jobId: 1,
    applicantId: 101,
    userId: 101,
    applicantName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    jobTitle: primaryJob.title,
    yearsExperience: 5,
    education: 'Bách Khoa TP.HCM',
    timeSent: '2026-04-01T10:00:00.000Z',
    status: 'PENDING',
    cvUrl: 'https://files.example.com/nguyen-van-a-cv.pdf',
  },
  {
    id: 502,
    jobId: 1,
    applicantId: 102,
    userId: 102,
    applicantName: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    jobTitle: primaryJob.title,
    yearsExperience: 3,
    education: 'FPT University',
    timeSent: '2026-04-02T10:00:00.000Z',
    status: 'VIEWED',
    cvUrl: 'https://files.example.com/tran-thi-b-cv.pdf',
  },
  {
    id: 503,
    jobId: 1,
    applicantId: 103,
    userId: 103,
    applicantName: 'Lê Văn C',
    email: 'levanc@gmail.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    jobTitle: primaryJob.title,
    yearsExperience: 8,
    education: 'HCMUS',
    timeSent: '2026-03-25T10:00:00.000Z',
    status: 'REJECTED',
  },
];

const jobApplicationsUrl = '/employer/job/test-job/1/applications';

async function mockApplicationListingApis(page, opts = {}) {
  const captured = {
    accept: null,
    reject: null,
    bulkReject: null,
    updateStatus: null,
    lastSearch: null,
  };

  // Job detail
  await page.route('**/api/jobs/1', async (route) => {
    await fulfillJson(route, { ...primaryJob, id: 1 });
  });

  // Per-HR note (returns empty so modal can open without 401)
  await page.route('**/api/employer/applications/*/my-note', async (route) => {
    if (route.request().method() === 'GET') {
      await fulfillJson(route, { note: '' });
      return;
    }
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/employer/applications/*/view', async (route) => {
    await fulfillJson(route, { success: true });
  });

  // Accept
  await page.route('**/api/employer/applications/*/accept**', async (route) => {
    captured.accept = {
      url: route.request().url(),
      method: route.request().method(),
    };
    await fulfillJson(route, { success: true });
  });

  // Reject
  await page.route('**/api/employer/applications/*/reject**', async (route) => {
    captured.reject = {
      url: route.request().url(),
      method: route.request().method(),
    };
    await fulfillJson(route, { success: true });
  });

  // Update status (used by undo)
  await page.route('**/api/employer/applications/*/status', async (route) => {
    captured.updateStatus = {
      url: route.request().url(),
      method: route.request().method(),
      body: route.request().postData(),
    };
    await fulfillJson(route, { success: true });
  });

  // Bulk reject
  await page.route('**/api/employer/applications/bulk-reject**', async (route) => {
    captured.bulkReject = {
      ids: JSON.parse(route.request().postData() || '[]'),
      url: route.request().url(),
    };
    await fulfillJson(route, { success: true });
  });

  // Search — filter applications based on query params
  await page.route('**/api/employer/applications/search**', async (route) => {
    const url = new URL(route.request().url());
    const statusParam = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');
    captured.lastSearch = { status: statusParam, keyword };

    let content = [...baseApplications];
    if (statusParam) content = content.filter((a) => a.status === statusParam);
    if (keyword) {
      const lk = keyword.toLowerCase();
      content = content.filter((a) =>
        (a.applicantName || '').toLowerCase().includes(lk) ||
        (a.email || '').toLowerCase().includes(lk),
      );
    }

    await fulfillJson(route, {
      content,
      totalElements: content.length,
      totalPages: 1,
      number: 0,
      size: 10,
    });
  });

  return captured;
}

test.describe('Nhà tuyển dụng quản lý ứng viên cho một công việc', () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);
  });

  test('hiển thị danh sách ứng viên và thống kê đúng', async ({ page }) => {
    await mockApplicationListingApis(page);
    await page.goto(jobApplicationsUrl);

    await expect(page.getByRole('heading', { name: /Danh s.ch .ng vi.n/i })).toBeVisible();
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
    await expect(page.getByText('Trần Thị B')).toBeVisible();
    await expect(page.getByText('Lê Văn C')).toBeVisible();

    // Stats: Tổng đơn = 3
    await expect(page.locator('p.text-\\[22px\\]').first()).toHaveText('3');
  });

  test('lọc ứng viên theo trạng thái PENDING', async ({ page }) => {
    const captured = await mockApplicationListingApis(page);
    await page.goto(jobApplicationsUrl);

    await expect(page.getByText('Trần Thị B')).toBeVisible();

    // Status select: only one with no `name` attr matching options "Chờ xử lý/Đã xem/..."
    await page.locator('select').filter({ hasText: /Ch. x. l./i }).first().selectOption('PENDING');

    await expect.poll(() => captured.lastSearch?.status).toBe('PENDING');
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
    await expect(page.getByText('Trần Thị B')).not.toBeVisible();
  });

  test('tìm kiếm ứng viên theo tên', async ({ page }) => {
    const captured = await mockApplicationListingApis(page);
    await page.goto(jobApplicationsUrl);

    await page.locator('input[placeholder*="t.n, email"]').fill('Trần');

    await expect.poll(() => captured.lastSearch?.keyword).toBe('Trần');
    await expect(page.getByText('Trần Thị B')).toBeVisible();
    await expect(page.getByText('Nguyễn Văn A')).not.toBeVisible();
  });

  test('chấp nhận một ứng viên gọi đúng API accept', async ({ page }) => {
    const captured = await mockApplicationListingApis(page);
    await page.goto(jobApplicationsUrl);

    // Click candidate name to open detail modal
    await page.getByRole('button', { name: 'Nguyễn Văn A' }).click();
    await expect(page.getByRole('button', { name: /Ch.p nh.n|.ang x. l/i })).toBeVisible();

    await page.getByRole('button', { name: /Ch.p nh.n/i }).click();

    await expect.poll(() => captured.accept?.url).toContain('/employer/applications/501/accept');
  });

  test('từ chối ứng viên với lý do gọi đúng API reject', async ({ page }) => {
    const captured = await mockApplicationListingApis(page);
    await page.goto(jobApplicationsUrl);

    await page.getByRole('button', { name: 'Nguyễn Văn A' }).click();

    // Open reject modal
    await page.getByRole('button', { name: /^T. ch.i$/i }).click();

    // Reject modal opens (z-[60])
    const rejectModal = page.locator('.z-\\[60\\]').filter({ has: page.getByRole('heading', { name: /T. ch.i .ng vi.n/i }) });
    await expect(rejectModal).toBeVisible();

    await rejectModal.locator('textarea').fill('Hồ sơ chưa khớp với yêu cầu vị trí.');
    await rejectModal.getByRole('button', { name: /X.c nh.n t. ch.i/i }).click();

    await expect.poll(() => captured.reject?.url).toContain('/employer/applications/501/reject');
  });

  test('chọn nhiều ứng viên và từ chối hàng loạt', async ({ page }) => {
    const captured = await mockApplicationListingApis(page);
    await page.goto(jobApplicationsUrl);

    // Wait for table rows (excludes the loading state)
    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();

    // Select first two rows (Nguyễn Văn A=501 PENDING, Trần Thị B=502 VIEWED)
    const rows = page.locator('tbody tr');
    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();

    // Bulk toolbar appears
    await expect(page.getByText(/.. ch.n/i).first()).toBeVisible();

    await page.getByRole('button', { name: /T. ch.i \(2\)/i }).click();

    const bulkModal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/T. ch.i h.ng lo.t/i) });
    await expect(bulkModal).toBeVisible();
    await bulkModal.locator('textarea').fill('Vị trí đã đủ ứng viên phù hợp.');
    await bulkModal.getByRole('button', { name: /X.c nh.n|T. ch.i/i }).last().click();

    await expect.poll(() => captured.bulkReject?.ids?.length).toBe(2);
    expect(captured.bulkReject.ids).toEqual(expect.arrayContaining([501, 502]));
  });
});
