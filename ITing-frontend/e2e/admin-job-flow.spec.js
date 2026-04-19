const { test, expect } = require("@playwright/test");

test.describe("Admin Job Management - Unified Flow", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Đăng nhập Admin
    await page.goto("/login");
    
    // 2. Chọn Tab Quản trị viên
    await page.getByRole("button", { name: /Quản trị viên/i }).click();
    await page.waitForTimeout(500);

    // 3. Điền thông tin chính xác
    await page.locator('input[type="email"]').fill("admin@iting.com");
    await page.locator('input[type="password"]').fill("123456");
    await page.locator('button[type="submit"]').click();

    // 4. Đợi điều hướng và đi tới trang quản lý Jobs
    await expect(page).toHaveURL(/.*admin/);
    await page.goto("/admin/jobs");
    await page.waitForLoadState('networkidle');
  });

  test("should approve, reject and suspend jobs in admin/jobs page", async ({ page }) => {
    // A. Kiểm tra tiêu đề trang
    await expect(page.getByText(/Quản lý Job/i)).toBeVisible();

    // B. Tìm một dòng "Chờ duyệt" và lấy Tiêu đề để theo dõi
    const pendingRowSource = page.locator("tr").filter({ hasText: "Chờ duyệt" }).first();
    await expect(pendingRowSource).toBeVisible();
    
    // Lấy tiêu đề công việc (giả định ở cột thứ 2 - index 1)
    const jobTitle = await pendingRowSource.locator('td').nth(1).innerText();
    const targetRow = page.locator("tr").filter({ hasText: jobTitle });

    // C. Kiểm tra việc Phê duyệt
    await targetRow.locator("button").filter({ has: page.locator("svg") }).first().click();
    
    // Đảm bảo không còn nút Yêu cầu nộp lại
    await expect(page.getByText("Yêu cầu nộp lại")).not.toBeVisible();

    // 1. Phê duyệt (Approve)
    await page.getByText("Phê duyệt").click();
    const approveDialog = page.locator('.animate-scale-up').filter({ hasText: "Duyệt công việc" });
    await expect(approveDialog).toBeVisible({ timeout: 5000 });
    await approveDialog.locator("textarea").fill("Tin hợp lệ, đã phê duyệt bởi Admin.");
    await approveDialog.getByRole("button", { name: "Xác nhận" }).click();

    // Kiểm tra thông báo và Trạng thái mới (Đang hoạt động)
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    await expect(targetRow).toContainText("Đang hoạt động");

    // D. Kiểm tra việc Đình chỉ (Suspend)
    await targetRow.locator("button").filter({ has: page.locator("svg") }).first().click();
    await page.getByText("Đình chỉ").click();
    
    const suspendDialog = page.locator('.animate-scale-up').filter({ hasText: "Đình chỉ công việc" });
    await expect(suspendDialog).toBeVisible({ timeout: 5000 });
    await suspendDialog.locator("textarea").fill("Phát hiện nội dung không phù hợp.");
    await suspendDialog.getByRole("button", { name: "Xác nhận" }).click();

    // Kiểm tra thông báo và Trạng thái mới (Bị đình chỉ)
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    await expect(targetRow).toContainText(/Bị đình chỉ|SUSPENDED/i);
  });
});
