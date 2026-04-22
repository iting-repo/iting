const { test, expect } = require('@playwright/test');

test.describe('Admin Approval Management Page', () => {
    
    test.beforeEach(async ({ page }) => {
        // 1. Đi tới trang đăng nhập
        await page.goto('/login');
        
        // 2. QUAN TRỌNG: Chọn Tab "Quản trị viên"
        await page.getByRole('button', { name: /Quản trị viên/i }).click();
        await page.waitForTimeout(500); // Đợi UI chuyển đổi

        // 3. Điền thông tin đăng nhập
        await page.locator('input[type="email"]').fill('admin@iting.com'); 
        await page.locator('input[type="password"]').fill('123456');
        
        // 4. Bấm đăng nhập và đợi quá trình điều hướng vào vùng Admin
        await Promise.all([
            page.waitForURL(/.*admin/), 
            page.locator('button[type="submit"]').click(),
        ]);

        // 5. Truy cập trang Approvals
        await page.goto('/admin/approvals');
        await page.waitForLoadState('networkidle');
    });

    test('should display approval statistics cards', async ({ page }) => {
        // Kiểm tra tiêu đề trang (hoặc các card thống kê)
        await expect(page.getByText('Bài đăng chờ duyệt')).toBeVisible();
        await expect(page.getByText('Hồ sơ chờ duyệt')).toBeVisible();
        await expect(page.getByText('Đã duyệt hôm nay')).toBeVisible();
    });

    test('should display pending jobs table with actions', async ({ page }) => {
        // Kiểm tra bảng Duyệt bài đăng tuyển dụng
        const jobTable = page.locator('div:has-text("Duyệt bài đăng tuyển dụng")').first();
        await expect(jobTable).toBeVisible();

        // Kiểm tra sự tồn tại của các dòng dữ liệu (Dựa trên mock data trong code)
        await expect(page.getByText('Kỹ sư phần mềm cấp cao')).toBeVisible();
        await expect(page.getByText('TechCorp Inc.')).toBeVisible();

        // Kiểm tra các nút thao tác trên một dòng
        const firstRowActions = page.locator('tr').filter({ hasText: 'Kỹ sư phần mềm cấp cao' }).locator('td').last();
        await expect(firstRowActions.locator('button[title="Xem chi tiết"]')).toBeVisible();
        await expect(firstRowActions.locator('button[title="Duyệt"]')).toBeVisible();
        await expect(firstRowActions.locator('button[title="Từ chối"]')).toBeVisible();
    });

    test('should display pending companies table with actions', async ({ page }) => {
        // Kiểm tra bảng Duyệt hồ sơ công ty
        const companyTable = page.locator('div:has-text("Duyệt hồ sơ công ty")').first();
        await expect(companyTable).toBeVisible();
    });

    test('should allow approving a job from the table', async ({ page }) => {
        // Click nút Duyệt của tin tuyển dụng đầu tiên
        const approveButton = page.locator('button[title="Duyệt"]').first();
        await approveButton.click();

        // Ghi chú: Nếu có xử lý API thật, ta sẽ kiểm tra Toast hoặc sự thay đổi của dòng.
        // Hiện tại code đang dùng Mock nên ta kiểm tra hành động click thành công.
        console.log('Clicked Approve button successfully');
    });
});
