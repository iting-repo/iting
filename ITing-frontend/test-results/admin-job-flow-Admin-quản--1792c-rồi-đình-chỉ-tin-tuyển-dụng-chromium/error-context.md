# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-job-flow.spec.js >> Admin quản lý tin tuyển dụng >> phê duyệt rồi đình chỉ tin tuyển dụng
- Location: e2e\admin-job-flow.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.fixed.z-\\[300\\] button').filter({ hasText: /nh.*ch/i })
    - locator resolved to <button type="button" class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-orange-600 hover:bg-slate-50 transition-colors">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - element is outside of the viewport
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications alt+T"
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - generic [ref=e8]: IT
            - generic [ref=e9]: Quản trị ITing
          - generic [ref=e10]:
            - textbox "Tìm kiếm user, company, job..." [ref=e11]
            - img [ref=e12]
        - generic [ref=e14]:
          - button [ref=e16] [cursor=pointer]:
            - img [ref=e17]
          - generic [ref=e20]:
            - generic [ref=e21]: P
            - generic [ref=e22]:
              - paragraph [ref=e23]: Playwright Admin
              - paragraph [ref=e24]: admin@iting.vn
            - button "Đăng xuất" [ref=e25] [cursor=pointer]:
              - img [ref=e26]
      - complementary [ref=e29]:
        - button "Thu gọn" [ref=e31] [cursor=pointer]:
          - img [ref=e32]
        - navigation [ref=e34]:
          - generic [ref=e35]:
            - paragraph [ref=e36]: TỔNG QUAN
            - generic [ref=e37]:
              - link "Bảng điều khiển" [ref=e38] [cursor=pointer]:
                - /url: /admin/dashboard
                - img [ref=e39]
                - generic [ref=e44]: Bảng điều khiển
              - link "Thông báo" [ref=e45] [cursor=pointer]:
                - /url: /admin/notifications
                - img [ref=e46]
                - generic [ref=e49]: Thông báo
          - generic [ref=e50]:
            - paragraph [ref=e51]: QUẢN LÝ
            - generic [ref=e52]:
              - link "Quản lý công việc" [ref=e53] [cursor=pointer]:
                - /url: /admin/jobs
                - img [ref=e54]
                - generic [ref=e56]: Quản lý công việc
              - link "Quản lý công ty" [ref=e57] [cursor=pointer]:
                - /url: /admin/companies
                - img [ref=e58]
                - generic [ref=e62]: Quản lý công ty
              - link "Người dùng" [ref=e63] [cursor=pointer]:
                - /url: /admin/users
                - img [ref=e64]
                - generic [ref=e69]: Người dùng
              - link "Báo cáo" [ref=e70] [cursor=pointer]:
                - /url: /admin/reports
                - img [ref=e71]
                - generic [ref=e74]: Báo cáo
          - generic [ref=e75]:
            - paragraph [ref=e76]: CMS
            - generic [ref=e77]:
              - link "Blog" [ref=e78] [cursor=pointer]:
                - /url: /admin/blog
                - img [ref=e79]
                - generic [ref=e81]: Blog
              - link "FAQ" [ref=e82] [cursor=pointer]:
                - /url: /admin/faq
                - img [ref=e83]
                - generic [ref=e86]: FAQ
              - link "Trang tĩnh" [ref=e87] [cursor=pointer]:
                - /url: /admin/pages
                - img [ref=e88]
                - generic [ref=e91]: Trang tĩnh
              - link "Danh mục" [ref=e92] [cursor=pointer]:
                - /url: /admin/categories
                - img [ref=e93]
                - generic [ref=e97]: Danh mục
              - link "Banner" [ref=e98] [cursor=pointer]:
                - /url: /admin/banner
                - img [ref=e99]
                - generic [ref=e103]: Banner
          - generic [ref=e104]:
            - paragraph [ref=e105]: HỆ THỐNG
            - generic [ref=e106]:
              - link "Phân quyền" [ref=e107] [cursor=pointer]:
                - /url: /admin/roles
                - img [ref=e108]
                - generic [ref=e110]: Phân quyền
              - link "Nhật ký kiểm tra" [ref=e111] [cursor=pointer]:
                - /url: /admin/audit
                - img [ref=e112]
                - generic [ref=e115]: Nhật ký kiểm tra
              - link "Thống kê" [ref=e116] [cursor=pointer]:
                - /url: /admin/stats
                - img [ref=e117]
                - generic [ref=e119]: Thống kê
              - link "Cấu hình" [ref=e120] [cursor=pointer]:
                - /url: /admin/config
                - img [ref=e121]
                - generic [ref=e124]: Cấu hình
      - main [ref=e125]:
        - generic [ref=e127]:
          - generic [ref=e128]:
            - generic [ref=e129]:
              - heading "Quản lý Job" [level=1] [ref=e130]
              - paragraph [ref=e131]: 0 job đang chờ duyệt
            - generic [ref=e133]:
              - button "Nhập Job (Excel)" [ref=e134] [cursor=pointer]:
                - img [ref=e135]
                - text: Nhập Job (Excel)
              - button "Xuất Excel" [ref=e139] [cursor=pointer]:
                - img [ref=e140]
                - text: Xuất Excel
          - generic [ref=e143]:
            - generic [ref=e144]:
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - heading "Tổng tin tuyển dụng" [level=3] [ref=e147]
                  - generic [ref=e148]: "2"
                - img [ref=e150]
              - generic [ref=e153]:
                - generic [ref=e154]:
                  - img [ref=e155]
                  - text: 0%
                - generic [ref=e157]: "Cập nhật: 01:12:59 20/04/2026"
            - generic [ref=e158]:
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - heading "Chờ duyệt" [level=3] [ref=e161]
                  - generic [ref=e162]: "0"
                - img [ref=e164]
              - generic [ref=e167]:
                - generic [ref=e168]:
                  - img [ref=e169]
                  - text: 0%
                - generic [ref=e171]: "Cập nhật: 01:12:59 20/04/2026"
            - generic [ref=e172]:
              - generic [ref=e173]:
                - generic [ref=e174]:
                  - heading "Đang hiển thị" [level=3] [ref=e175]
                  - generic [ref=e176]: "2"
                - img [ref=e178]
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - img [ref=e183]
                  - text: 0%
                - generic [ref=e185]: "Cập nhật: 01:12:59 20/04/2026"
            - generic [ref=e186]:
              - generic [ref=e187]:
                - generic [ref=e188]:
                  - heading "Bị từ chối" [level=3] [ref=e189]
                  - generic [ref=e190]: "0"
                - img [ref=e192]
              - generic [ref=e196]:
                - generic [ref=e197]:
                  - img [ref=e198]
                  - text: 0%
                - generic [ref=e200]: "Cập nhật: 01:12:59 20/04/2026"
          - generic [ref=e201]:
            - textbox "Tìm kiếm công việc..." [ref=e202]
            - combobox [ref=e203]:
              - option "Tất cả trạng thái" [selected]
              - option "Chờ duyệt"
              - option "Đang hoạt động"
              - option "Bị từ chối"
          - table [ref=e205]:
            - rowgroup [ref=e206]:
              - row "Mã Job Tiêu đề công việc Tên công ty Địa điểm Trạng thái AI kiểm duyệt Thao tác" [ref=e207]:
                - columnheader [ref=e208]:
                  - checkbox [ref=e209]
                - columnheader "Mã Job" [ref=e210]
                - columnheader "Tiêu đề công việc" [ref=e211]
                - columnheader "Tên công ty" [ref=e212]
                - columnheader "Địa điểm" [ref=e213]
                - columnheader "Trạng thái" [ref=e214]
                - columnheader "AI kiểm duyệt" [ref=e215]
                - columnheader "Thao tác" [ref=e216]
            - rowgroup [ref=e217]:
              - 'row "201 Backend Engineer ITing Software Ho Chi Minh Đang hoạt động AI đạt Điểm rủi ro: 3%" [ref=e218]':
                - cell [ref=e219]:
                  - checkbox [ref=e220]
                - cell "201" [ref=e221]
                - cell "Backend Engineer" [ref=e222]:
                  - button "Backend Engineer" [ref=e223] [cursor=pointer]
                - cell "ITing Software" [ref=e224]:
                  - generic [ref=e225]: ITing Software
                - cell "Ho Chi Minh" [ref=e226]
                - cell "Đang hoạt động" [ref=e227]:
                  - generic [ref=e229]: Đang hoạt động
                - 'cell "AI đạt Điểm rủi ro: 3%" [ref=e230]':
                  - generic [ref=e231]:
                    - generic [ref=e232]: AI đạt
                    - generic [ref=e233]: "Điểm rủi ro: 3%"
                - cell [ref=e234]:
                  - button [active] [ref=e236] [cursor=pointer]:
                    - img [ref=e237]
              - 'row "202 Frontend Engineer ITing Software Da Nang Đang hoạt động AI đã làm sạch Điểm rủi ro: 31%" [ref=e241]':
                - cell [ref=e242]:
                  - checkbox [ref=e243]
                - cell "202" [ref=e244]
                - cell "Frontend Engineer" [ref=e245]:
                  - button "Frontend Engineer" [ref=e246] [cursor=pointer]
                - cell "ITing Software" [ref=e247]:
                  - generic [ref=e248]: ITing Software
                - cell "Da Nang" [ref=e249]
                - cell "Đang hoạt động" [ref=e250]:
                  - generic [ref=e252]: Đang hoạt động
                - 'cell "AI đã làm sạch Điểm rủi ro: 31%" [ref=e253]':
                  - generic [ref=e254]:
                    - generic [ref=e255]: AI đã làm sạch
                    - generic [ref=e256]: "Điểm rủi ro: 31%"
                - cell [ref=e257]:
                  - button [ref=e259] [cursor=pointer]:
                    - img [ref=e260]
          - generic [ref=e264]:
            - generic [ref=e265]:
              - text: Trang
              - text: trên 1
            - generic [ref=e266]:
              - button "Trước" [ref=e267] [cursor=pointer]
              - button "1" [ref=e269] [cursor=pointer]
              - button "Sau" [ref=e270] [cursor=pointer]
  - generic [ref=e272]:
    - button "Xem chi tiết" [ref=e273] [cursor=pointer]:
      - img [ref=e274]
      - text: Xem chi tiết
    - button "Chạy AI kiểm duyệt" [ref=e277] [cursor=pointer]:
      - img [ref=e278]
      - text: Chạy AI kiểm duyệt
    - button "Phê duyệt" [ref=e281] [cursor=pointer]:
      - img [ref=e282]
      - text: Phê duyệt
    - button "Từ chối" [ref=e285] [cursor=pointer]:
      - img [ref=e286]
      - text: Từ chối
    - button "Đình chỉ" [ref=e290] [cursor=pointer]:
      - img [ref=e291]
      - text: Đình chỉ
    - button "Xóa" [ref=e295] [cursor=pointer]:
      - img [ref=e296]
      - text: Xóa
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | const { mockAdminApis, setAdminSession } = require("./helpers/mock-api");
  3  | 
  4  | test.describe("Admin quản lý tin tuyển dụng", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await setAdminSession(page);
  7  |     await mockAdminApis(page);
  8  |   });
  9  | 
  10 |   test("phê duyệt rồi đình chỉ tin tuyển dụng", async ({ page }) => {
  11 |     await page.goto("/admin/jobs");
  12 | 
  13 |     const targetRow = page.locator("tr").filter({ hasText: "Backend Engineer" });
  14 |     await expect(targetRow).toBeVisible();
  15 |     await expect(targetRow).toContainText(/Chờ duyệt|Ch.*duy/i);
  16 | 
  17 |     await targetRow.locator("button").last().click();
  18 |     await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /Ph.*duy/i }).click();
  19 | 
  20 |     const approveDialog = page.locator(".fixed.inset-0").last();
  21 |     await expect(approveDialog).toBeVisible();
  22 |     await approveDialog.locator("textarea").fill("Tin hợp lệ, đã phê duyệt bởi Admin.");
  23 |     await approveDialog.locator("button").last().click();
  24 | 
  25 |     await expect(page.locator("[data-sonner-toast]")).toBeVisible();
  26 |     await expect(targetRow).toContainText(/Đang hoạt động|Dang hoat dong/i);
  27 | 
  28 |     await targetRow.locator("button").last().click();
> 29 |     await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /nh.*ch/i }).click();
     |                                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  30 | 
  31 |     const suspendDialog = page.locator(".fixed.inset-0").last();
  32 |     await expect(suspendDialog).toBeVisible();
  33 |     await suspendDialog.locator("textarea").fill("Phát hiện nội dung không phù hợp.");
  34 |     await suspendDialog.locator("button").last().click();
  35 | 
  36 |     await expect(page.locator("[data-sonner-toast]")).toBeVisible();
  37 |     await expect(targetRow).toContainText(/Bị đình chỉ|Bi dinh chi/i);
  38 |   });
  39 | });
  40 | 
```