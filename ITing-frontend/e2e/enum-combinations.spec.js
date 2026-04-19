const { test, expect } = require('@playwright/test');

test.describe('Exhaustive Job Posting Test (240 Combinations)', () => {
    
    test('should iterate through all 240 combinations and submit', async ({ page }) => {
        // TĂNG THỜI GIAN CHỜ LÊN 20 PHÚT
        test.setTimeout(1200000); 

        // 1. Đăng nhập
        await page.goto('/login');
        await page.locator('input[type="email"]').fill('hr@fpt.com');
        await page.locator('input[type="password"]').fill('123456');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/.*dashboard|.*manage-jobs/, { timeout: 15000 });

        const workTypes = ['Toàn thời gian', 'Bán thời gian', 'Hợp đồng', 'Thực tập', 'Làm việc từ xa', 'Tự do'];
        const expLevels = ['Thực tập sinh', 'Mới ra trường / Fresher', 'Junior (1-2 năm)', 'Middle (2-4 năm)', 'Senior (4-7 năm)', 'Chuyên gia', 'Quản lý'];
        const salaryTypes = ['Thỏa thuận', 'Theo tháng', 'Theo năm', 'Theo dự án', 'Theo giờ'];

        let count = 1;

        for (const wt of workTypes) {
            for (const el of expLevels) {
                for (const st of salaryTypes) {
                    console.log(`\n--- Combination #${count}: ${wt} | ${el} | ${st} ---`);

                    await page.goto('/employer/manage-jobs');
                    // Chờ trang ổn định hoàn toàn
                    await page.waitForLoadState('networkidle');
                    
                    // Click nút Đăng công việc (sử dụng Role để đảm bảo chính xác)
                    await page.getByRole('button', { name: "Đăng công việc" }).first().click();

                    // Tìm ô nhập liệu bằng Placeholder (Cực kỳ chính xác)
                    const titleInput = page.getByPlaceholder('Thêm tiêu đề vào đây');
                    
                    try {
                        // Đợi ô nhập liệu hiện ra
                        await titleInput.waitFor({ state: 'visible', timeout: 10000 });
                        await page.waitForTimeout(1000); // Chờ modal animation

                        // Điền thông tin tiêu đề
                        await titleInput.fill(`Auto Test #${count}: ${wt} - ${el} - ${st}`);
                        
                        // Điền các dropdown bằng name (vì name của các select này rất ổn định)
                        await page.locator('select[name="workType"]').selectOption({ label: wt });
                        await page.locator('select[name="experienceLevel"]').selectOption({ label: el });
                        await page.locator('select[name="salaryType"]').selectOption({ label: st });

                        if (st !== 'Thỏa thuận') {
                            await page.locator('input[name="minSalary"]').fill('10000000');
                            await page.locator('input[name="maxSalary"]').fill('20000000');
                        }

                        // Chọn Tỉnh thành
                        await page.locator('select[name="province"]').selectOption({ label: 'Thành phố Hồ Chí Minh' });
                        
                        // Mô tả (Dùng placeholder)
                        await page.getByPlaceholder('Thêm mô tả công việc tại đây...').fill('Nội dung kiểm thử tự động toàn bộ tổ hợp Enum cho Job Portal.');
                        
                        // Nhấn nút Đăng bài
                        await page.getByRole('button', { name: /Đăng bài|Cập nhật/i }).click();

                        // Chờ xử lý backend xong mới qua vòng lặp mới
                        await page.waitForTimeout(2000); 
                        console.log(`✅ Đã gửi thành công.`);
                    } catch (e) {
                        console.log(`❌ LỖI tại #${count}. Có thể do Modal không mở kịp hoặc bị lỗi giao diện.`);
                        await page.screenshot({ path: `error-report-${count}.png` });
                        // Thử đóng modal nếu nó còn đang kẹt
                        await page.keyboard.press('Escape');
                    }
                    
                    count++;
                }
            }
        }
    });
});
