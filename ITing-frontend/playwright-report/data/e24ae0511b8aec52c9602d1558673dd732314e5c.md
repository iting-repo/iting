# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-job-flow.spec.js >> Admin quản lý tin tuyển dụng >> phê duyệt rồi đình chỉ tin tuyển dụng
- Location: e2e\admin-job-flow.spec.js:10:3

# Error details

```
Error: locator.click: Element is outside of the viewport
Call log:
  - waiting for locator('.fixed.z-\\[300\\] button').filter({ hasText: /nh.*ch/i })
    - locator resolved to <button type="button" class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-orange-600 hover:bg-slate-50 transition-colors">…</button>
  - attempting click action
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e3]:
          - button "Close toast" [ref=e4] [cursor=pointer]:
            - img [ref=e5]
          - img [ref=e9]
          - generic [ref=e12]: Duyệt công việc thành công!
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e18]: IT
            - generic [ref=e19]: Quản trị ITing
          - generic [ref=e20]:
            - textbox "Tìm kiếm user, company, job..." [ref=e21]
            - img [ref=e22]
        - generic [ref=e24]:
          - button [ref=e26] [cursor=pointer]:
            - img [ref=e27]
          - generic [ref=e30]:
            - generic [ref=e31]: P
            - generic [ref=e32]:
              - paragraph [ref=e33]: Playwright Admin
              - paragraph [ref=e34]: admin@iting.vn
            - button "Đăng xuất" [ref=e35] [cursor=pointer]:
              - img [ref=e36]
      - complementary [ref=e39]:
        - button "Thu gọn" [ref=e41] [cursor=pointer]:
          - img [ref=e42]
        - navigation [ref=e44]:
          - generic [ref=e45]:
            - paragraph [ref=e46]: TỔNG QUAN
            - generic [ref=e47]:
              - link "Bảng điều khiển" [ref=e48] [cursor=pointer]:
                - /url: /admin/dashboard
                - img [ref=e49]
                - generic [ref=e54]: Bảng điều khiển
              - link "Thông báo" [ref=e55] [cursor=pointer]:
                - /url: /admin/notifications
                - img [ref=e56]
                - generic [ref=e59]: Thông báo
          - generic [ref=e60]:
            - paragraph [ref=e61]: QUẢN LÝ
            - generic [ref=e62]:
              - link "Quản lý công việc" [ref=e63] [cursor=pointer]:
                - /url: /admin/jobs
                - img [ref=e64]
                - generic [ref=e66]: Quản lý công việc
              - link "Quản lý công ty" [ref=e67] [cursor=pointer]:
                - /url: /admin/companies
                - img [ref=e68]
                - generic [ref=e72]: Quản lý công ty
              - link "Người dùng" [ref=e73] [cursor=pointer]:
                - /url: /admin/users
                - img [ref=e74]
                - generic [ref=e79]: Người dùng
              - link "Báo cáo" [ref=e80] [cursor=pointer]:
                - /url: /admin/reports
                - img [ref=e81]
                - generic [ref=e84]: Báo cáo
          - generic [ref=e85]:
            - paragraph [ref=e86]: CMS
            - generic [ref=e87]:
              - link "Blog" [ref=e88] [cursor=pointer]:
                - /url: /admin/blog
                - img [ref=e89]
                - generic [ref=e91]: Blog
              - link "FAQ" [ref=e92] [cursor=pointer]:
                - /url: /admin/faq
                - img [ref=e93]
                - generic [ref=e96]: FAQ
              - link "Trang tĩnh" [ref=e97] [cursor=pointer]:
                - /url: /admin/pages
                - img [ref=e98]
                - generic [ref=e101]: Trang tĩnh
              - link "Danh mục" [ref=e102] [cursor=pointer]:
                - /url: /admin/categories
                - img [ref=e103]
                - generic [ref=e107]: Danh mục
              - link "Banner" [ref=e108] [cursor=pointer]:
                - /url: /admin/banner
                - img [ref=e109]
                - generic [ref=e113]: Banner
          - generic [ref=e114]:
            - paragraph [ref=e115]: HỆ THỐNG
            - generic [ref=e116]:
              - link "Phân quyền" [ref=e117] [cursor=pointer]:
                - /url: /admin/roles
                - img [ref=e118]
                - generic [ref=e120]: Phân quyền
              - link "Nhật ký kiểm tra" [ref=e121] [cursor=pointer]:
                - /url: /admin/audit
                - img [ref=e122]
                - generic [ref=e125]: Nhật ký kiểm tra
              - link "Thống kê" [ref=e126] [cursor=pointer]:
                - /url: /admin/stats
                - img [ref=e127]
                - generic [ref=e129]: Thống kê
              - link "Cấu hình" [ref=e130] [cursor=pointer]:
                - /url: /admin/config
                - img [ref=e131]
                - generic [ref=e134]: Cấu hình
      - main [ref=e135]:
        - generic [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]:
              - heading "Quản lý Job" [level=1] [ref=e140]
              - paragraph [ref=e141]: 0 job đang chờ duyệt
            - generic [ref=e143]:
              - button "Nhập Job (Excel)" [ref=e144] [cursor=pointer]:
                - img [ref=e145]
                - text: Nhập Job (Excel)
              - button "Xuất Excel" [ref=e149] [cursor=pointer]:
                - img [ref=e150]
                - text: Xuất Excel
          - generic [ref=e153]:
            - generic [ref=e154]:
              - generic [ref=e155]:
                - generic [ref=e156]:
                  - heading "Tổng tin tuyển dụng" [level=3] [ref=e157]
                  - generic [ref=e158]: "2"
                - img [ref=e160]
              - generic [ref=e163]:
                - generic [ref=e164]:
                  - img [ref=e165]
                  - text: 0%
                - generic [ref=e167]: "Cập nhật: 07:34:10 21/04/2026"
            - generic [ref=e168]:
              - generic [ref=e169]:
                - generic [ref=e170]:
                  - heading "Chờ duyệt" [level=3] [ref=e171]
                  - generic [ref=e172]: "0"
                - img [ref=e174]
              - generic [ref=e177]:
                - generic [ref=e178]:
                  - img [ref=e179]
                  - text: 0%
                - generic [ref=e181]: "Cập nhật: 07:34:10 21/04/2026"
            - generic [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]:
                  - heading "Đang hiển thị" [level=3] [ref=e185]
                  - generic [ref=e186]: "2"
                - img [ref=e188]
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - img [ref=e193]
                  - text: 0%
                - generic [ref=e195]: "Cập nhật: 07:34:10 21/04/2026"
            - generic [ref=e196]:
              - generic [ref=e197]:
                - generic [ref=e198]:
                  - heading "Bị từ chối" [level=3] [ref=e199]
                  - generic [ref=e200]: "0"
                - img [ref=e202]
              - generic [ref=e206]:
                - generic [ref=e207]:
                  - img [ref=e208]
                  - text: 0%
                - generic [ref=e210]: "Cập nhật: 07:34:10 21/04/2026"
          - generic [ref=e211]:
            - textbox "Tìm kiếm công việc..." [ref=e212]
            - combobox [ref=e213]:
              - option "Tất cả trạng thái" [selected]
              - option "Chờ duyệt"
              - option "Đang hoạt động"
              - option "Bị từ chối"
          - table [ref=e215]:
            - rowgroup [ref=e216]:
              - row "Mã Job Tiêu đề công việc Tên công ty Địa điểm Trạng thái AI kiểm duyệt Thao tác" [ref=e217]:
                - columnheader [ref=e218]:
                  - checkbox [ref=e219]
                - columnheader "Mã Job" [ref=e220]
                - columnheader "Tiêu đề công việc" [ref=e221]
                - columnheader "Tên công ty" [ref=e222]
                - columnheader "Địa điểm" [ref=e223]
                - columnheader "Trạng thái" [ref=e224]
                - columnheader "AI kiểm duyệt" [ref=e225]
                - columnheader "Thao tác" [ref=e226]
            - rowgroup [ref=e227]:
              - 'row "201 Backend Engineer ITing Software Ho Chi Minh Đang hoạt động AI đạt Điểm rủi ro: 3%" [ref=e228]':
                - cell [ref=e229]:
                  - checkbox [ref=e230]
                - cell "201" [ref=e231]
                - cell "Backend Engineer" [ref=e232]:
                  - button "Backend Engineer" [ref=e233] [cursor=pointer]
                - cell "ITing Software" [ref=e234]:
                  - generic [ref=e235]: ITing Software
                - cell "Ho Chi Minh" [ref=e236]
                - cell "Đang hoạt động" [ref=e237]:
                  - generic [ref=e239]: Đang hoạt động
                - 'cell "AI đạt Điểm rủi ro: 3%" [ref=e240]':
                  - generic [ref=e241]:
                    - generic [ref=e242]: AI đạt
                    - generic [ref=e243]: "Điểm rủi ro: 3%"
                - cell [ref=e244]:
                  - button [active] [ref=e246] [cursor=pointer]:
                    - img [ref=e247]
              - 'row "202 Frontend Engineer ITing Software Da Nang Đang hoạt động AI đã làm sạch Điểm rủi ro: 31%" [ref=e251]':
                - cell [ref=e252]:
                  - checkbox [ref=e253]
                - cell "202" [ref=e254]
                - cell "Frontend Engineer" [ref=e255]:
                  - button "Frontend Engineer" [ref=e256] [cursor=pointer]
                - cell "ITing Software" [ref=e257]:
                  - generic [ref=e258]: ITing Software
                - cell "Da Nang" [ref=e259]
                - cell "Đang hoạt động" [ref=e260]:
                  - generic [ref=e262]: Đang hoạt động
                - 'cell "AI đã làm sạch Điểm rủi ro: 31%" [ref=e263]':
                  - generic [ref=e264]:
                    - generic [ref=e265]: AI đã làm sạch
                    - generic [ref=e266]: "Điểm rủi ro: 31%"
                - cell [ref=e267]:
                  - button [ref=e269] [cursor=pointer]:
                    - img [ref=e270]
          - generic [ref=e274]:
            - generic [ref=e275]:
              - text: Trang
              - text: trên 1
            - generic [ref=e276]:
              - button "Trước" [ref=e277] [cursor=pointer]
              - button "1" [ref=e279] [cursor=pointer]
              - button "Sau" [ref=e280] [cursor=pointer]
  - generic [ref=e282]:
    - button "Xem chi tiết" [ref=e283] [cursor=pointer]:
      - img [ref=e284]
      - text: Xem chi tiết
    - button "Chạy AI kiểm duyệt" [ref=e287] [cursor=pointer]:
      - img [ref=e288]
      - text: Chạy AI kiểm duyệt
    - button "Phê duyệt" [ref=e291] [cursor=pointer]:
      - img [ref=e292]
      - text: Phê duyệt
    - button "Từ chối" [ref=e295] [cursor=pointer]:
      - img [ref=e296]
      - text: Từ chối
    - button "Đình chỉ" [ref=e300] [cursor=pointer]:
      - img [ref=e301]
      - text: Đình chỉ
    - button "Xóa" [ref=e305] [cursor=pointer]:
      - img [ref=e306]
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
> 29 |     await page.locator('.fixed.z-\\[300\\] button').filter({ hasText: /nh.*ch/i }).click({ force: true });
     |                                                                                    ^ Error: locator.click: Element is outside of the viewport
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