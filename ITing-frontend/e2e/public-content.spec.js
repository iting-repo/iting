const { test, expect } = require('@playwright/test');
const { mockCommonApis, fulfillJson } = require('./helpers/mock-api');

const blogs = {
  content: [
    {
      id: 1,
      slug: 'cv-tot-2026',
      title: '5 bí quyết viết CV ấn tượng cho dân IT năm 2026',
      thumbnailUrl: 'https://example.com/cv-tips.png',
      summary: 'Hướng dẫn từng bước để tạo CV chuyên nghiệp.',
      createdAt: '2026-03-01T08:00:00.000Z',
      authorName: 'ITing Editor',
    },
    {
      id: 2,
      slug: 'phong-van-backend',
      title: 'Phỏng vấn Backend Engineer - những câu hỏi thường gặp',
      thumbnailUrl: 'https://example.com/interview.png',
      summary: 'Bộ câu hỏi và gợi ý trả lời.',
      createdAt: '2026-02-15T08:00:00.000Z',
      authorName: 'ITing Editor',
    },
  ],
  totalElements: 2,
  totalPages: 1,
};

const companiesPage = {
  content: [
    {
      id: 11,
      name: 'FPT Software',
      logoUrl: 'https://fpt-software.com/logo.png',
      industry: 'IT Outsourcing',
      companySize: '30,000+',
      address: 'Hà Nội',
      activeJobs: 12,
    },
    {
      id: 12,
      name: 'VNG Corporation',
      logoUrl: 'https://vng.com.vn/logo.png',
      industry: 'Internet Services',
      companySize: '5,000+',
      address: 'TP. Hồ Chí Minh',
      activeJobs: 5,
    },
  ],
  totalElements: 2,
  totalPages: 1,
};

test.describe('Nội dung công khai', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommonApis(page);

    await page.route('**/api/public/v2/blogs**', async (route) => {
      if (route.request().url().match(/\/blogs\/[^/?]+/)) {
        await fulfillJson(route, {
          ...blogs.content[0],
          content: '<p>Nội dung chi tiết bài viết.</p>',
        });
        return;
      }
      await fulfillJson(route, blogs);
    });

    await page.route('**/api/public/companies**', async (route) => {
      await fulfillJson(route, companiesPage);
    });

    await page.route('**/api/public/stats**', async (route) => {
      await fulfillJson(route, {
        totalJobs: 1234,
        totalCompanies: 56,
        newJobsThisWeek: 78,
        totalActiveJobs: 1234,
      });
    });

    await page.route('**/api/jobs/salary-report**', async (route) => {
      await fulfillJson(route, {
        position: 'Backend Developer',
        averageSalary: 25000000,
        minSalary: 12000000,
        maxSalary: 50000000,
        sampleSize: 120,
      });
    });
  });

  test('trang blogs liệt kê bài viết', async ({ page }) => {
    await page.goto('/blogs');
    await expect(page.getByText(/5 b. quy.t vi.t CV/)).toBeVisible();
    await expect(page.getByText(/Ph.ng v.n Backend Engineer/)).toBeVisible();
  });

  test('trang companies liệt kê công ty', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.getByText('FPT Software').first()).toBeVisible();
    await expect(page.getByText('VNG Corporation').first()).toBeVisible();
  });

  test('trang tra cứu lương render được', async ({ page }) => {
    await page.goto('/salary-lookup');
    // Page should render its main heading without crashing
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('trang về chúng tôi và liên hệ render được', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/contact');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('trang chủ render được khi chưa đăng nhập', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Vi.c L.m T.t Nh.t/ })).toBeVisible();
  });
});
