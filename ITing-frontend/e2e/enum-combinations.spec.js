const { test, expect } = require("@playwright/test");
const {
  mockCommonApis,
  mockEmployerApis,
  setEmployerSession,
} = require("./helpers/mock-api");

test.describe("Enum đăng tin tuyển dụng", () => {
  test.beforeEach(async ({ page }) => {
    await setEmployerSession(page);
    await mockCommonApis(page);
    await mockEmployerApis(page);

    await page.route("https://provinces.open-api.vn/api/v2/p/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ code: 79, name: "Ho Chi Minh" }]),
      });
    });
  });

  test("hiển thị đủ enum hình thức, kinh nghiệm và loại lương", async ({ page }) => {
    await page.goto("/employer/manage-jobs");
    await page.locator("button").filter({ hasText: /c.ng vi.c/i }).first().click();

    const form = page.locator("form").filter({
      has: page.locator('input[name="jobTitle"]'),
    });
    await expect(form).toBeVisible();

    await expect(form.locator('select[name="workType"] option')).toHaveCount(7);
    await expect(form.locator('select[name="experienceLevel"] option')).toHaveCount(10);
    await expect(form.locator('select[name="salaryType"] option')).toHaveCount(5);

    await form.locator('select[name="workType"]').selectOption("FULL_TIME");
    await form.locator('select[name="experienceLevel"]').selectOption("SENIOR");
    await form.locator('select[name="salaryType"]').selectOption("MONTH");

    await expect(form.locator('select[name="workType"]')).toHaveValue("FULL_TIME");
    await expect(form.locator('select[name="experienceLevel"]')).toHaveValue("SENIOR");
    await expect(form.locator('select[name="salaryType"]')).toHaveValue("MONTH");
  });
});
