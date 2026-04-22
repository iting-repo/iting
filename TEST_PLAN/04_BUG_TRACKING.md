# 04. QUY TRÌNH QUẢN LÝ LỖI (BUG TRACKING)

> **Dự án:** ITing - Hệ thống gợi ý việc làm IT  
> **Tài liệu:** Bug Tracking Process  
> **Phiên bản:** 1.0  
> **Ngày:** 22/04/2026  
> **Người soạn:** QA Lead  
> **Trạng thái:** Draft

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Bug Lifecycle](#2-bug-lifecycle)
3. [Phân loại Bug](#3-phân-loại-bug)
4. [Template Bug Report](#4-template-bug-report)
5. [Quy trình chi tiết](#5-quy-trình-chi-tiết)
6. [SLA & Escalation](#6-sla--escalation)
7. [Báo cáo & Metrics](#7-báo-cáo--metrics)
8. [Quy tắc & Best Practices](#8-quy-tắc--best-practices)

---

## 1. TỔNG QUAN

### 1.1 Mục đích
Tài liệu này định nghĩa quy trình quản lý lỗi từ khi phát hiện đến khi đóng bug, đảm bảo:
- Không bug nào bị bỏ sót hoặc quên fix.
- Giao tiếp rõ ràng giữa Tester và Developer.
- Theo dõi được tiến độ fix bug theo thời gian.
- Có dữ liệu để cải thiện chất lượng code.

### 1.2 Công cụ
- **GitHub Issues:** Quản lý bug report, tracking.
- **Labels:** Phân loại severity, priority, module.
- **Milestones:** Gắn bug với sprint/release.
- **Assignees:** Gán người chịu trách nhiệm fix.

### 1.3 Vai trò
| Vai trò | Trách nhiệm |
|---------|-------------|
| **Tester** | Phát hiện bug, viết report, test lại sau fix |
| **Developer** | Nhận bug, fix, update status, giải thích nếu reject |
| **Tech Lead** | Review, confirm fix, quyết định priority, escalate |
| **QA Lead** | Giám sát quy trình, báo cáo metrics, sign-off |

---

## 2. BUG LIFECYCLE

### 2.1 Workflow Diagram

```
                    ┌─────────────────────────────────────────────────────┐
                    │                                                     │
                    ▼                                                     │
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  NEW     │────▶│  OPEN    │────▶│ IN PROG  │────▶│  FIXED   │────▶│  CLOSED  │
│ (Mới tìm │     │ (Đã xác  │     │ (Dev đang│     │ (Dev đã  │     │ (Tester  │
│  thấy)   │     │  nhận)   │     │  fix)    │     │  fix)    │     │  xác nhận│
└──────────┘     └──────────┘     └──────────┘     └──────────┘     │  Pass)   │
     ▲                                                              └──────────┘
     │                                                                   │
     │                    ┌──────────┐                          ┌──────────┐
     │                    │ REOPENED │◀─────────────────────────│ REJECTED │
     │                    │ (Fix chưa│    (Tester test lại      │ (Không   │
     │                    │  đạt)    │     vẫn fail)            │  phải bug)│
     │                    └──────────┘                          └──────────┘
     └─────────────────────────────────────────────────────────────┘
```

### 2.2 Chi tiết từng trạng thái

| Status | Mô tả | Người chuyển | Điều kiện |
|--------|-------|--------------|-----------|
| **NEW** | Bug mới được tạo, chưa ai review | Tester | Tạo issue với đầy đủ thông tin |
| **OPEN** | Đã xác nhận là bug thật, sẵn sàng fix | Tech Lead/Dev Lead | Review xong, gán cho dev |
| **IN PROGRESS** | Dev đang fix bug | Developer | Đã bắt tay vào code |
| **FIXED** | Dev đã fix, push code, chờ test lại | Developer | PR merged, comment "Ready for retest" |
| **CLOSED** | Tester xác nhận fix thành công | Tester | Retest pass, comment "Verified ✅" |
| **REOPENED** | Fix chưa đạt, bug vẫn còn | Tester | Retest fail, comment lý do + screenshot |
| **REJECTED** | Không phải bug, hoặc không fix | Developer/Tech Lead | Giải thích lý do rõ ràng |

---

## 3. PHÂN LOẠI BUG

### 3.1 Severity (Mức độ nghiêm trọng)

| Level | Định nghĩa | Tiêu chí | Ví dụ |
|-------|------------|----------|-------|
| **S1 - Critical** | System crash, data loss, blocker hoàn toàn | Không thể tiếp tục sử dụng hệ thống, mất dữ liệu | Server 500 liên tục, Database corrupt, Không login được, Payment sai số tiền |
| **S2 - High** | Major feature broken, không có workaround | Tính năng chính không hoạt động, ảnh hưởng nhiều user | Không apply job được, Search không trả kết quả, AI không gợi ý |
| **S3 - Medium** | Feature hoạt động sai, có workaround dễ | Tính năng chạy nhưng kết quả không đúng, user vẫn dùng được | Filter sai 1 trường, Sort không đúng, UI lệch nhẹ |
| **S4 - Low** | Cosmetic, typo, minor issue | Không ảnh hưởng chức năng, chỉ thẩm mỹ hoặc trải nghiệm nhỏ | Lỗi chính tả, Màu không đúng design, Tooltip thiếu, Alignment lệch 1-2px |

### 3.2 Priority (Mức ưu tiên fix)

| Level | Định nghĩa | Thời gian fix | Ví dụ |
|-------|------------|---------------|-------|
| **P1 - Urgent** | Fix ngay lập tức, blocker release | Trong ngày | Critical bug trên production |
| **P2 - High** | Fix trong sprint hiện tại | 1-2 ngày | High severity bug, ảnh hưởng user flow chính |
| **P3 - Medium** | Fix trong sprint sau | 3-5 ngày | Medium severity, có workaround |
| **P4 - Low** | Fix khi có thời gian, backlog | Không deadline | Cosmetic, enhancement nhỏ |

### 3.3 Type (Loại lỗi)

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| **Functional** | Sai logic nghiệp vụ, tính năng không hoạt động | Apply không lưu, Filter sai |
| **UI/UX** | Giao diện, layout, trải nghiệm người dùng | Vỡ layout mobile, Button khó tap |
| **Performance** | Chậm, timeout, tốn tài nguyên | Load > 5s, API response > 3s |
| **Security** | Lỗ hổng bảo mật, rò rỉ dữ liệu | Password plaintext, SQL injection |
| **Compatibility** | Không hoạt động trên browser/device nhất định | Lỗi trên Safari, Mobile Android |
| **Data** | Sai dữ liệu, mất dữ liệu, duplicate | Data không đồng bộ, Record trùng |

---

## 4. TEMPLATE BUG REPORT

### 4.1 GitHub Issue Template

```markdown
---
name: Bug Report
about: Báo cáo lỗi phát hiện trong quá trình test
labels: bug
---

## 🐛 Bug Report

| Thông tin | Giá trị |
|-----------|---------|
| **Bug ID** | #(GitHub auto) |
| **Người báo** | @username |
| **Ngày báo** | DD/MM/YYYY |
| **Module** | [Tên module] |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | Urgent / High / Medium / Low |
| **Type** | Functional / UI / Performance / Security / Compatibility / Data |
| **Environment** | Dev / Staging / Production |

---

### 📝 Mô tả
*(Mô tả ngắn gọn bug là gì, 1-2 dòng)*

### 🔁 Steps to Reproduce
1. Bước 1
2. Bước 2
3. Bước 3
4. ...

### ✅ Expected Result
*(Điều đáng lẽ phải xảy ra)*

### ❌ Actual Result
*(Điều thực tế xảy ra)*

### 📸 Attachments
- Screenshot: [Link hoặc attach]
- Video: [Link]
- Log/Console: [Nếu có]

### 🌍 Môi trường
- **OS:** Windows 11 / macOS 14 / Ubuntu 22.04
- **Browser:** Chrome 120 / Firefox 119 / Safari 17
- **Device:** Desktop / Tablet / Mobile
- **App Version:** v1.0.0 (commit hash)

### 📎 Test Case liên quan
- **TC_ID:** TC_UI_AUTH_001

### 💡 Ghi chú thêm
*(Workaround, frequency, pattern nếu có)*
```

### 4.2 Ví dụ Bug Report đã điền

```markdown
## 🐛 Bug Report

| Thông tin | Giá trị |
|-----------|---------|
| **Bug ID** | #142 |
| **Người báo** | @tester01 |
| **Ngày báo** | 22/04/2026 |
| **Module** | Authentication |
| **Severity** | High |
| **Priority** | High |
| **Type** | Functional |
| **Environment** | Staging |

### 📝 Mô tả
Đăng nhập với tài khoản đã verify nhưng hệ thống báo "Tài khoản chưa xác thực"

### 🔁 Steps to Reproduce
1. Mở https://staging.iting.com/login
2. Nhập email: verified_user@example.com
3. Nhập password: CorrectPass123!
4. Click "Đăng nhập"

### ✅ Expected Result
Đăng nhập thành công, redirect đến /dashboard

### ❌ Actual Result
Hiển thị lỗi "Tài khoản chưa xác thực", không redirect

### 📸 Attachments
- Screenshot: [attached]
- Console log: `POST /api/auth/login 403 - {"error": "Email not verified"}`

### 🌍 Môi trường
- **OS:** Windows 11
- **Browser:** Chrome 120
- **Device:** Desktop
- **App Version:** v1.0.0 (abc1234)

### 📎 Test Case liên quan
- **TC_ID:** TC_UI_AUTH_006

### 💡 Ghi chú thêm
- Bug xảy ra 100% lần thử (5/5)
- Tài khoản đã click verify link trong email
- Kiểm tra DB: trường `email_verified` = true
```

---

## 5. QUY TRÌNH CHI TIẾT

### 5.1 Bước 1: Phát hiện & Báo cáo (Tester)

**Khi nào:** Phát hiện hành vi không đúng expected result trong quá trình test.

**Hành động:**
1. Chụp ảnh/video màn hình lỗi.
2. Ghi lại console log, network log nếu liên quan.
3. Tạo GitHub Issue với template đầy đủ.
4. Gán labels: `bug`, `severity:X`, `priority:Y`, `module:Z`.
5. Gán cho Tech Lead để review.
6. Link issue vào Test Case (cột Bug_ID).

**Lưu ý:**
- Không báo bug trùng lặp (search trước khi tạo).
- Không gộp nhiều bug vào 1 issue.
- Mô tả rõ ràng, dev đọc là hiểu ngay.

### 5.2 Bước 2: Xác nhận & Gán (Tech Lead)

**Khi nào:** Có issue mới được tạo.

**Hành động:**
1. Review bug report, xác nhận có phải bug thật không.
2. Kiểm tra severity/priority có đúng không, điều chỉnh nếu cần.
3. Gán cho developer phụ trách module.
4. Chuyển status: **NEW → OPEN**.
5. Thêm vào Milestone sprint hiện tại.

**Quyết định:**
- **Là bug thật:** → OPEN, gán dev.
- **Không phải bug:** → REJECTED, giải thích lý do (design intent, user error, duplicate).
- **Trùng issue khác:** → Đóng, link đến issue gốc, label `duplicate`.

### 5.3 Bước 3: Fix (Developer)

**Khi nào:** Nhận bug được gán.

**Hành động:**
1. Đọc bug report, reproduce bug trên local.
2. Phân tích nguyên nhân gốc rễ (root cause).
3. Fix bug, viết test case nếu cần.
4. Commit với message: `fix(module): mô tả ngắn (fixes #ID)`.
5. Tạo PR, request review.
6. Sau khi PR merged:
   - Comment vào issue: "Đã fix trên branch develop, mời test lại."
   - Chuyển status: **IN PROGRESS → FIXED**.

**Lưu ý:**
- Không fix quá scope của bug report.
- Nếu phát hiện bug liên quan, tạo issue mới, không gộp.
- Nếu không reproduce được, comment hỏi thêm thông tin.

### 5.4 Bước 4: Test lại (Tester)

**Khi nào:** Issue chuyển sang FIXED.

**Hành động:**
1. Deploy code mới lên test environment.
2. Thực hiện lại các bước trong bug report.
3. Test thêm các scenario liên quan (regression).

**Kết quả:**
- **Pass:** Comment "Verified ✅", chuyển status → **CLOSED**.
- **Fail:** Comment "Still failing ❌", mô tả lý do, attach screenshot, chuyển status → **REOPENED**.

### 5.5 Bước 5: Xử lý Reopened

**Khi nào:** Bug bị reopen.

**Hành động:**
1. Developer nhận lại bug, ưu tiên cao hơn lần đầu.
2. Phân tích tại sao fix trước đó không hiệu quả.
3. Fix lại, repeat quy trình Bước 3-4.
4. Nếu reopen >= 2 lần, Tech Lead phải vào review code.

### 5.6 Bước 6: Đóng & Tổng kết

**Khi nào:** Bug closed, cuối sprint.

**Hành động:**
1. QA Lead tổng hợp số bug closed/reopened.
2. Tech Lead review root cause patterns.
3. Cập nhật lessons learned cho sprint sau.

---

## 6. SLA & ESCALATION

### 6.1 Service Level Agreement

| Severity | Thời gian phản hồi | Thời gian fix | Escalation |
|----------|-------------------|---------------|------------|
| **S1 - Critical** | 1 giờ | 4 giờ | Nếu quá 4h → Báo cáo ngay cho nhóm |
| **S2 - High** | 2 giờ | 24 giờ | Nếu quá 24h → Tech Lead can thiệp |
| **S3 - Medium** | 4 giờ | 3 ngày | Nếu quá 3 ngày → Đưa vào daily standup |
| **S4 - Low** | 8 giờ | 1 sprint | Backlog, ưu tiên thấp |

### 6.2 Escalation Path

```
Tester → Tech Lead → Toàn nhóm → Giảng viên (nếu cần)
```

**Khi nào escalate:**
- Bug Critical không fix trong SLA.
- Developer không phản hồi quá 24h.
- Bug ảnh hưởng đến timeline demo.
- Có tranh cãi về việc "có phải bug hay không".

---

## 7. BÁO CÁO & METRICS

### 7.1 Báo cáo hàng tuần

| Metric | Công thức | Ý nghĩa |
|--------|-----------|---------|
| **Total Bugs** | Tổng bug phát hiện trong tuần | Xu hướng chất lượng |
| **Fixed Bugs** | Bug đã closed | Tốc độ fix |
| **Open Bugs** | Bug chưa fix | Tồn đọng |
| **Reopen Rate** | Reopened / Total Fixed * 100% | Chất lượng fix |
| **Avg Fix Time** | Tổng thời gian fix / Số bug | Hiệu quả team |
| **Bug Density** | Bugs / Module | Module nào nhiều bug nhất |

### 7.2 Template báo cáo

```markdown
## Bug Report Weekly - Tuần [X]

### Tổng quan
| Metric | Giá trị |
|--------|---------|
| Total New Bugs | 15 |
| Fixed | 12 |
| Open | 8 |
| Reopened | 2 |
| Reopen Rate | 14% |
| Avg Fix Time | 1.5 ngày |

### Phân loại theo Severity
| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 4 |
| Medium | 7 |
| Low | 3 |

### Top 3 Module nhiều bug nhất
1. Authentication (5 bugs)
2. Job Search (4 bugs)
3. AI Recommendation (3 bugs)

### Bugs cần chú ý
- #142: Login fail với verified account (Critical, đang fix)
- #156: AI gợi ý job không liên quan (High, cần review model)

###行动计划
- Ưu tiên fix Critical/High trước thứ 5
- Review lại module Auth để giảm bug
```

### 7.3 Dashboard trực quan (nếu có)

Sử dụng GitHub Insights hoặc tạo Google Sheets dashboard:
- Biểu đồ cột: Bugs theo tuần (New vs Fixed).
- Biểu đồ tròn: Phân loại theo Severity.
- Biểu đồ đường: Trend Open Bugs theo thời gian.

---

## 8. QUY TẮC & BEST PRACTICES

### 8.1 Quy tắc bắt buộc
- **1 Bug = 1 Issue:** Không gộp nhiều bug.
- **Không xóa issue:** Kể cả duplicate, đánh label và đóng.
- **Comment lịch sự:** Mô tả khách quan, không đổ lỗi.
- **Update thường xuyên:** Ít nhất 1 comment/ngày cho bug đang active.
- **Link đầy đủ:** Link bug ↔ test case ↔ PR ↔ commit.

### 8.2 Best Practices
- **Reproduce trước khi báo:** Đảm bảo bug lặp lại được.
- **Isolate yếu tố:** Test trên environment sạch, clear cache.
- **Ghi log đầy đủ:** Console, network, server log nếu có.
- **Screenshot có context:** Chụp cả màn hình, không crop quá sát.
- **Test regression:** Sau khi fix, test các feature liên quan.
- **Root cause analysis:** Với Critical bug, ghi rõ nguyên nhân.

### 8.3 Anti-patterns (Không làm)
- ❌ "Nó không hoạt động" → Mô tả cụ thể.
- ❌ "Fix gấp!" → Dùng priority label, không spam.
- ❌ Đóng bug mà không test lại.
- ❌ Reopen không có lý do/screenshot.
- ❌ Fix bug khác scope mà không hỏi.
- ❌ Ignore bug vì "không quan trọng".

---

> **Quy trình này áp dụng cho toàn bộ vòng đời dự án. Mọi thành viên phải tuân thủ.**
