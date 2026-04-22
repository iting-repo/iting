const { test, expect } = require("@playwright/test");
const { mockAdminApis, setAdminSession } = require("./helpers/mock-api");

test.describe("Admin quản lý tin tuyển dụng", () => {
  test.beforeEach(async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);
  });

  test("phê duyệt rồi đình chỉ tin tuyển dụng", async ({ page }) => {
    await page.goto("/admin/jobs");

    const targetRow = page.locator("tr").filter({ hasText: "Backend Engineer" });
    await expect(targetRow).toBeVisible();
    await expect(targetRow).toContainText(/Chờ duyệt|Ch.*duy/i);

    await targetRow.locator("button").last().click();
    await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /Ph.*duy/i }).click();

    const approveDialog = page.locator(".fixed.inset-0").last();
    await expect(approveDialog).toBeVisible();
    await approveDialog.locator("textarea").fill("Tin hợp lệ, đã phê duyệt bởi Admin.");
    await approveDialog.locator("button").last().click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(targetRow).toContainText(/Đang hoạt động|Dang hoat dong/i);

    await targetRow.locator("button").last().click();
    await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /nh.*ch/i }).click();

    const suspendDialog = page.locator(".fixed.inset-0").last();
    await expect(suspendDialog).toBeVisible();
    await suspendDialog.locator("textarea").fill("Phát hiện nội dung không phù hợp.");
    await suspendDialog.locator("button").last().click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(targetRow).toContainText(/Bị đình chỉ|Bi dinh chi/i);
  });
});
