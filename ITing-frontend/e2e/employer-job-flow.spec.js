const { test, expect } = require("@playwright/test");
const { mockCommonApis, setEmployerSession, fulfillJson } = require("./helpers/mock-api");
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

async function mockPostJobApis(page) {
  let jobs = [...employerJobsPage.content];

  await page.route("https://provinces.open-api.vn/api/v2/p/", async (route) => {
    await fulfillJson(route, provinceList);
  });

  await page.route("https://provinces.open-api.vn/api/v2/p/79?depth=2", async (route) => {
    await fulfillJson(route, provinceDetail);
  });

  // Endpoint thực tế là /hr/jobs/my-jobs
  await page.route("**/api/hr/jobs/my-jobs**", async (route) => {
    await fulfillJson(route, {
      ...employerJobsPage,
      content: jobs,
      totalElements: jobs.length,
    });
  });

  // PostJob.jsx submit dùng POST /hr/jobs (companyService.createEmployerJob)
  await page.route("**/api/hr/jobs", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
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

    // Mở modal "Đăng công việc" — text chính xác là "Đăng công việc"
    await page.locator("button").filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator("form").filter({
      has: page.locator('input[name="jobTitle"]'),
    });
    await expect(form).toBeVisible();

    const uniqueTitle = `Senior Developer AI - ${Date.now()}`;

    await form.locator('input[name="jobTitle"]').fill(uniqueTitle);

    // MultiSelectTagInput (Vị trí tuyển dụng): click select rồi chọn option
    // 2 MultiSelectTagInput đầu tiên trong form (không có name=...)
    const multiSelects = form.locator('select:not([name])');
    await multiSelects.nth(0).selectOption("Backend Developer");
    await multiSelects.nth(1).selectOption("NodeJS");

    await form.locator('select[name="workType"]').selectOption("FULL_TIME");
    await form.locator('select[name="experienceLevel"]').selectOption("SENIOR");
    // workingDays là <select> (dropdown) trong PostJob.jsx, dùng selectOption thay vì fill
    await form.locator('select[name="workingDays"]').selectOption("MON_TO_FRI");
    await form.locator('input[name="quantity"]').fill("2");
    await form.locator('input[name="deadline"]').fill("2026-12-31");

    // Province & Ward dùng SearchableSelect (custom div, không phải <select> thật).
    // Click vào div hiển thị "Chọn tỉnh/thành phố..." rồi click vào option trong dropdown.
    await selectCustomDropdown(page, "Tỉnh/Thành phố", provinceName);

    // Đợi wards load xong (sau khi chọn province, SearchableSelect ward sẽ enable)
    // SearchableSelect trigger hiển thị "Chọn phường/xã..." khi chưa chọn
    const wardLabel = page.locator('label:text-is("Phường/Xã")').first();
    const wardField = wardLabel.locator('xpath=ancestor::div[1]');
    await expect(wardField.locator('div.cursor-pointer').first()).toBeEnabled({ timeout: 5_000 });
    await selectCustomDropdown(page, "Phường/Xã", wardName);

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

/**
 * Helper: chọn giá trị trong SearchableSelect (custom div-based component).
 * SearchableSelect render <div className="relative"> chứa div clickable + dropdown.
 * Khi click trigger, dropdown <div class="absolute z-50 ..."> mở ra với các option.
 * Option là <div class="cursor-pointer ..."> có text khớp.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} labelText - Text chính xác của <label> bên trên field.
 * @param {string} optionText - Text của option cần chọn.
 */
async function selectCustomDropdown(page, labelText, optionText) {
  // Tìm label, sau đó đi tới SearchableSelect (sibling div)
  const label = page.locator(`label:text-is("${labelText}")`).first();
  await label.waitFor({ state: 'visible', timeout: 5_000 });

  // Lấy container div bao quanh label + SearchableSelect (next sibling của label
  // hoặc parent của label). Đi lên ancestor tìm <div> chứa cả label và SearchableSelect.
  const fieldContainer = label.locator('xpath=ancestor::div[1]');

  // Click trigger: trigger là div.cursor-pointer ĐẦU TIÊN trong container
  // (vì cấu trúc SearchableSelect: trigger trước, dropdown sau khi mở)
  const trigger = fieldContainer.locator('div.cursor-pointer').first();
  await trigger.click();

  // Đợi dropdown render option có text khớp — lọc theo chính xác text để tránh
  // pick nhầm trigger (vì trigger có thể match partial text khi đã chọn trước đó).
  // Dùng locator riêng: option là div.cursor-pointer nằm trong dropdown z-50
  // (dropdown được mount cùng container, nên fieldContainer.locator tìm được)
  const option = fieldContainer.locator(`div.cursor-pointer:text-is("${optionText}")`).first();
  await option.waitFor({ state: 'visible', timeout: 5_000 });
  await option.click();
}
