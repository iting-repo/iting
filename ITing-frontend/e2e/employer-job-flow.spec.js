const { test, expect } = require("@playwright/test");
const { mockCommonApis, setEmployerSession } = require("./helpers/mock-api");
const { employerJobsPage } = require("./helpers/job-fixtures");

const provinceName = "Ho Chi Minh";
const wardName = "Tang Nhon Phu";

const provinceList = [{ code: 79, name: provinceName }];

const provinceDetail = {
  code: 79,
  name: provinceName,
  wards: [
    { code: 26734, name: wardName },
    { code: 26737, name: "Long Thanh My" },
  ],
};

async function fulfillJson(route, data) {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(data),
  });
}

async function mockPostJobApis(page) {
  let jobs = [...employerJobsPage.content];

  await page.route("https://provinces.open-api.vn/api/v2/p/", async (route) => {
    await fulfillJson(route, provinceList);
  });

  await page.route("https://provinces.open-api.vn/api/v2/p/79?depth=2", async (route) => {
    await fulfillJson(route, provinceDetail);
  });

  await page.route("**/api/employer/jobs/my-jobs**", async (route) => {
    await fulfillJson(route, {
      ...employerJobsPage,
      content: jobs,
      totalElements: jobs.length,
    });
  });

  await page.route("**/api/employer/jobs", async (route) => {
    const payload = JSON.parse(route.request().postData() || "{}");
    const createdJob = {
      id: Date.now(),
      public_id: `${Date.now()}`,
      ...payload,
      status: "PENDING",
      applicationCount: 0,
    };

    jobs = [createdJob, ...jobs];
    await fulfillJson(route, createdJob);
  });
}

test.describe("Nhà tuyển dụng đăng tin tuyển dụng", () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockPostJobApis(page);
  });

  test("đăng tin thành công sau khi nhập đủ trường bắt buộc", async ({ page }) => {
    await page.goto("/employer/manage-jobs");
    await expect(page.locator("table")).toBeVisible();

    await page.locator("button").filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator("form").filter({
      has: page.locator('input[name="jobTitle"]'),
    });
    await expect(form).toBeVisible();

    const uniqueTitle = `Senior Developer AI - ${Date.now()}`;

    await form.locator('input[name="jobTitle"]').fill(uniqueTitle);
    await form.locator("select").nth(0).selectOption("Backend Developer");
    await form.locator("select").nth(1).selectOption("NodeJS");
    await form.locator('select[name="workType"]').selectOption("FULL_TIME");
    await form.locator('select[name="experienceLevel"]').selectOption("SENIOR");
    await form.locator('input[name="workingDays"]').fill("Monday - Friday");
    await form.locator('input[name="quantity"]').fill("2");
    await form.locator('input[name="deadline"]').fill("2026-12-31");

    await form.locator('select[name="province"]').selectOption(provinceName);
    const wardSelect = form.locator('select[name="ward"]');
    await expect(wardSelect.locator("option")).toHaveCount(3);
    await wardSelect.selectOption(wardName);

    await form.locator('input[name="address"]').fill("High Tech Park, District 9");
    await form.locator('select[name="salaryType"]').selectOption("MONTH");
    await form.locator('input[name="minSalary"]').fill("30000000");
    await form.locator('input[name="maxSalary"]').fill("60000000");
    await form
      .locator('textarea[name="description"]')
      .fill("Build and maintain large-scale data analytics systems.");
    await form
      .locator('textarea[name="responsibilities"]')
      .fill("- Manage servers.\n- Write technical documentation.");

    await form.locator('button[type="submit"]').click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible();

    const jobRow = page.locator("tr").filter({ hasText: uniqueTitle });
    await expect(jobRow).toBeVisible();
    await expect(jobRow).toContainText(/Ch.*duy.*t/i);
  });
});
