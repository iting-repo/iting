# TEST PLAN - DỰ ÁN ITing

> **Phiên bản:** 1.0  
> **Ngày tạo:** 22/04/2026  
> **Người soạn:** [Tên người soạn]  
> **Người review:** [Tên member 1], [Tên member 2]  
> **Trạng thái:** Draft

---

## MỤC LỤC

1. [Giới thiệu](#1-giới-thiệu)
2. [Chiến lược kiểm thử (Test Strategy)](#2-chiến-lược-kiểm-thử-test-strategy)
3. [Template Test Case](#3-template-test-case)
4. [Acceptance Criteria Checklist](#4-acceptance-criteria-checklist)
5. [Quy trình quản lý lỗi (Bug Tracking)](#5-quy-trình-quản-lý-lỗi-bug-tracking)
6. [Phân công & Timeline](#6-phân-công--timeline)
7. [Rủi ro & Phương án dự phòng](#7-rủi-ro--phương-án-dự-phòng)
8. [Xác nhận của nhóm](#8-xác-nhận-của-nhóm)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích

Tài liệu này định nghĩa quy trình kiểm thử cho dự án **ITing** - hệ thống gợi ý việc làm IT. Mục tiêu đảm bảo:
- Chất lượng sản phẩm đạt chuẩn trước khi demo cho giảng viên
- Quy trình kiểm soát chất lượng chặt chẽ, có thể trace được
- Tất cả thành viên nhóm nắm rõ tiêu chuẩn và cách thức thực hiện test

### 1.2 Phạm vi

| Hạng mục | Bao gồm | Không bao gồm |
|----------|---------|---------------|
| Frontend (UI/UX) | ✅ Manual Testing | - |
| Backend (API) | ✅ Automation Testing | - |
| AI Gợi ý việc làm | ✅ Accuracy Testing | Fine-tuning model |
| Performance | ✅ Cơ bản | Load test quy mô lớn |
| Security | ✅ Cơ bản | Penetration test chuyên sâu |

### 1.3 Công cụ sử dụng

| Hạng mục | Công cụ |
|----------|---------|
| Quản lý Test Case | Google Sheets / Excel |
| Bug Tracking | GitHub Issues |
| API Testing | Postman / Newman |
| AI Testing | Custom evaluation script |
| Báo cáo | File MD này + Google Sheets |

---

## 2. CHIẾN LƯỢC KIỂM THỬ (TEST STRATEGY)

### 2.1 Tổng quan

Dự án áp dụng **3 phương pháp kiểm thử** chính:

```
┌─────────────────────────────────────────────────────┐
│                  TEST STRATEGY                       │
├─────────────────┬─────────────────┬─────────────────┤
│   MANUAL TEST   │  AUTOMATED TEST │    AI TESTING   │
│     (UI/UX)     │     (API)       │  (Recommendation)│
├─────────────────┼─────────────────┼─────────────────┤
│ - Kiểm tra giao │ - Test tự động  │ - Đo độ chính   │
│   diện người    │   mọi endpoint  │   xác gợi ý     │
│   dùng          │ - CI/CD pipeline│ - Precision &   │
│ - Flow người    │ - Regression    │   Recall        │
│   dùng end-to-  │   test          │ - Relevance     │
│   end           │                 │   score         │
└─────────────────┴─────────────────┴─────────────────┘
```

---

### 2.2 Manual Testing - UI/UX

**Mục tiêu:** Đảm bảo giao diện trực quan, đúng thiết kế, trải nghiệm người dùng mượt mà.

#### 2.2.1 Phạm vi

| Module | Nội dung test |
|--------|---------------|
| Đăng ký / Đăng nhập | Form validation, OAuth, forgot password |
| Trang chủ | Banner, search bar, job recommendations |
| Hồ sơ ứng viên | CRUD profile, upload CV, kỹ năng |
| Tìm kiếm việc làm | Filter, sort, pagination |
| Chi tiết job | Thông tin job, nút apply |
| Dashboard ứng viên | Danh sách apply, trạng thái |
| Dashboard nhà tuyển dụng | Đăng job, quản lý ứng viên |
| Responsive | Mobile, tablet, desktop |

#### 2.2.2 Phương pháp

- **Exploratory Testing:** Tester tự do khám phá, tìm edge cases
- **Scenario-based Testing:** Test theo user story thực tế
- **Cross-browser Testing:** Chrome, Firefox, Edge
- **Responsive Testing:** Breakpoint 320px, 768px, 1024px, 1440px

#### 2.2.3 Tiêu chí hoàn thành

- [ ] 100% test case UI được thực thi
- [ ] Không còn bug Critical/High nào open
- [ ] Tất cả màn hình hoạt động đúng trên 3 trình duyệt chính

---

### 2.3 Automation Testing - API

**Mục tiêu:** Đảm bảo API hoạt động đúng, ổn định, trả về response chính xác.

#### 2.3.1 Phạm vi

| Nhóm API | Endpoints |
|----------|-----------|
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` |
| User | `/api/users/profile`, `/api/users/update` |
| Jobs | `/api/jobs`, `/api/jobs/:id`, `/api/jobs/search` |
| Applications | `/api/applications`, `/api/applications/:id/status` |
| AI Recommend | `/api/recommendations`, `/api/recommendations/:userId` |

#### 2.3.2 Phương pháp

- **Postman Collection:** Tạo collection cho từng nhóm API
- **Test Types:**
  - Status code validation (200, 201, 400, 401, 404, 500)
  - Response schema validation
  - Business logic validation
  - Edge case testing (empty body, invalid data, SQL injection cơ bản)
- **Chạy tự động:** Newman trong CI/CD pipeline

#### 2.3.3 Cấu trúc test case mẫu (Postman)

```javascript
// Ví dụ: Test API Login
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("accessToken");
});

pm.test("Response time < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

#### 2.3.4 Tiêu chí hoàn thành

- [ ] 100% API endpoints có test case
- [ ] Pass rate >= 95%
- [ ] Response time trung bình < 500ms
- [ ] Không có bug Critical/High nào open

---

### 2.4 AI Testing - Kiểm tra độ chính xác gợi ý việc làm

**Mục tiêu:** Đảm bảo hệ thống gợi ý việc làm phù hợp với kỹ năng và sở thích của ứng viên.

#### 2.4.1 Metrics đánh giá

| Metric | Công thức | Target |
|--------|-----------|--------|
| **Precision** | Số job gợi ý phù hợp / Tổng số job gợi ý | >= 70% |
| **Recall** | Số job phù hợp được gợi ý / Tổng số job phù hợp trong DB | >= 60% |
| **Relevance Score** | Điểm trung bình đánh giá bởi con người (1-5) | >= 3.5 |
| **Diversity Score** | Tỷ lệ job từ các công ty khác nhau trong top 10 | >= 50% |

#### 2.4.2 Phương pháp đánh giá

**Cách 1: Manual Evaluation (Human-in-the-loop)**

1. Chọn 10-20 profile ứng viên mẫu (đa dạng kỹ năng, kinh nghiệm)
2. Chạy hệ thống gợi ý cho từng profile
3. Người đánh giá (ít nhất 2 người) chấm điểm từng job được gợi ý:
   - **5 điểm:** Rất phù hợp, đúng kỹ năng, đúng level
   - **4 điểm:** Phù hợp, có thể apply
   - **3 điểm:** Tạm được, thiếu 1-2 kỹ năng
   - **2 điểm:** Ít phù hợp, sai level hoặc sai lĩnh vực
   - **1 điểm:** Hoàn toàn không liên quan

**Cách 2: Automated Rule-based Evaluation**

```python
# Ví dụ: Script đánh giá tự động cơ bản
def evaluate_recommendation(user_profile, recommended_jobs):
    scores = []
    for job in recommended_jobs:
        score = 0
        # Check skill match
        skill_overlap = len(set(user_profile.skills) & set(job.required_skills))
        score += skill_overlap / len(job.required_skills) * 50
        
        # Check experience level
        if user_profile.experience_years >= job.min_experience:
            score += 30
        
        # Check location preference
        if job.location in user_profile.preferred_locations:
            score += 20
            
        scores.append(score)
    
    return {
        "avg_score": sum(scores) / len(scores),
        "precision": len([s for s in scores if s >= 60]) / len(scores)
    }
```

#### 2.4.3 Test Data

| STT | Profile | Kỹ năng chính | Kinh nghiệm | Mong đợi |
|-----|---------|---------------|-------------|----------|
| 1 | Junior Dev | JavaScript, React | 0-1 năm | Frontend Junior |
| 2 | Senior Dev | Python, Django, AWS | 5+ năm | Backend Senior |
| 3 | Fresher | Java, Spring Boot | Thực tập | Java Fresher |
| 4 | Fullstack | React, Node.js, MongoDB | 2-3 năm | Fullstack Mid-level |
| 5 | QA | Selenium, API Testing | 1-2 năm | QA Tester |

#### 2.4.4 Tiêu chí hoàn thành

- [ ] Precision >= 70% trên tập test data
- [ ] Relevance Score trung bình >= 3.5/5
- [ ] Không gợi ý job đã hết hạn hoặc không tồn tại
- [ ] Gợi ý đa dạng (không lặp lại cùng 1 công ty > 2 lần trong top 10)

---

## 3. TEMPLATE TEST CASE

### 3.1 File Google Sheets / Excel

> **Link file:** [Dán link Google Sheets vào đây]

### 3.2 Cấu trúc cột

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| **TC_ID** | Mã test case (duy nhất) | TC_UI_001 |
| **Module** | Tính năng đang test | Đăng nhập |
| **Test Case Name** | Tên test case | Đăng nhập thành công với email hợp lệ |
| **Priority** | Mức ưu tiên | High / Medium / Low |
| **Preconditions** | Điều kiện trước khi test | User đã đăng ký tài khoản |
| **Test Steps** | Các bước thực hiện | 1. Mở trang login<br>2. Nhập email<br>3. Nhập password<br>4. Click Login |
| **Test Data** | Dữ liệu dùng để test | Email: test@email.com<br>Pass: Test123! |
| **Expected Result** | Kết quả mong đợi | Chuyển đến dashboard, hiển thị welcome message |
| **Actual Result** | Kết quả thực tế (điền khi chạy test) | Như expected |
| **Status** | Trạng thái | ✅ Pass / ❌ Fail / ⏭️ Skipped |
| **Severity** | Mức độ nghiêm trọng (nếu Fail) | Critical / High / Medium / Low |
| **Bug ID** | Link đến bug report (nếu Fail) | #123 |
| **Tester** | Người thực hiện | Nguyễn Văn A |
| **Date** | Ngày test | 22/04/2026 |
| **Notes** | Ghi chú thêm | - |

### 3.3 Quy ước đặt tên TC_ID

```
TC_[LOẠI]_[STT]

LOẠI:
  UI   → Manual UI Testing
  API  → API Automation Testing
  AI   → AI Recommendation Testing
  PERF → Performance Testing
  SEC  → Security Testing

Ví dụ:
  TC_UI_001    → Test case UI số 1
  TC_API_015   → Test case API số 15
  TC_AI_003    → Test case AI số 3
```

### 3.4 Quy ước Priority & Severity

**Priority (Mức ưu tiên thực hiện):**

| Level | Mô tả | Ví dụ |
|-------|-------|-------|
| **High** | Must test, core functionality | Login, Register, Apply job |
| **Medium** | Should test, important features | Filter, Sort, Profile update |
| **Low** | Nice to test, cosmetic | Màu sắc button, font size |

**Severity (Mức độ nghiêm trọng của bug):**

| Level | Mô tả | Ví dụ |
|-------|-------|-------|
| **Critical** | System crash, blocker | Không login được, server 500 |
| **High** | Major feature broken | Không apply job được |
| **Medium** | Feature hoạt động nhưng sai | Filter trả kết quả sai |
| **Low** | Cosmetic, minor issue | Lỗi chính tả, alignment |

### 3.5 Ví dụ Test Case đã điền

| TC_ID | Module | Test Case Name | Priority | Steps | Expected | Status |
|-------|--------|----------------|----------|-------|----------|--------|
| TC_UI_001 | Đăng nhập | Đăng nhập thành công | High | 1. Mở /login<br>2. Nhập email<br>3. Nhập password<br>4. Click Login | Redirect to /dashboard | ⬜ |
| TC_UI_002 | Đăng nhập | Login sai password | High | 1. Mở /login<br>2. Nhập email đúng<br>3. Nhập password sai<br>4. Click Login | Hiển thị "Sai mật khẩu" | ⬜ |
| TC_API_001 | Auth API | POST /api/auth/login | High | Send POST với valid credentials | 200 + accessToken | ⬜ |
| TC_AI_001 | AI Recommend | Gợi ý cho Junior React Dev | High | 1. Tạo profile Junior React<br>2. Gọi API recommend<br>3. Kiểm tra kết quả | Top 5 có >= 3 job React Junior | ⬜ |

---

## 4. ACCEPTANCE CRITERIA CHECKLIST

### 4.1 Định nghĩa "Done" cho một tính năng

Một tính năng được coi là **HOÀN THÀNH** khi thỏa mãn TẤT CẢ điều kiện sau:

```
┌──────────────────────────────────────────────────────┐
│                   DEFINITION OF DONE                  │
├──────────────────────────────────────────────────────┤
│  ✅ Code đã được review và merge vào main/dev branch  │
│  ✅ Test case đã được viết và thực thi (Pass 100%)    │
│  ✅ Không còn bug Critical/High nào open              │
│  ✅ UI đúng design (pixel-perfect hoặc >= 90%)        │
│  ✅ API response đúng schema và status code           │
│  ✅ Hoạt động trên Chrome, Firefox, Edge              │
│  ✅ Responsive trên mobile & desktop                  │
│  ✅ Đã test edge cases cơ bản                         │
│  ✅ Demo cho PO/Scrum Master xác nhận                 │
└──────────────────────────────────────────────────────┘
```

### 4.2 Checklist theo Module

#### Module: Đăng ký / Đăng nhập

- [ ] Đăng ký với email hợp lệ → Thành công, nhận email xác thực
- [ ] Đăng ký với email đã tồn tại → Báo lỗi "Email đã được sử dụng"
- [ ] Đăng ký với password yếu → Báo lỗi "Password cần >= 8 ký tự, có chữ hoa, số"
- [ ] Đăng nhập đúng thông tin → Redirect dashboard
- [ ] Đăng nhập sai password → Báo lỗi, không redirect
- [ ] Đăng nhập với tài khoản chưa verify → Báo lỗi + resend email
- [ ] Forgot password → Nhận email reset, đặt lại password thành công
- [ ] Session timeout → Tự động logout sau 30 phút không hoạt động
- [ ] Responsive mobile → Form hiển thị đúng, button dễ tap

#### Module: Hồ sơ ứng viên

- [ ] Tạo mới profile → Lưu thành công
- [ ] Cập nhật profile → Thay đổi được lưu
- [ ] Upload CV (PDF, DOCX) → File được lưu, hiển thị preview
- [ ] Upload file sai định dạng → Báo lỗi
- [ ] Thêm kỹ năng → Hiển thị đúng, search gợi ý kỹ năng
- [ ] Xóa kỹ năng → Xóa thành công
- [ ] Profile trống → Hiển thị placeholder, gợi ý hoàn thiện

#### Module: Tìm kiếm & Gợi ý việc làm

- [ ] Search bằng keyword → Trả kết quả liên quan
- [ ] Filter theo location → Chỉ hiển thị job đúng location
- [ ] Filter theo salary range → Chỉ hiển thị job trong khoảng lương
- [ ] Filter theo experience level → Đúng level
- [ ] Sort by newest → Job mới nhất lên đầu
- [ ] Sort by salary → Sắp xếp đúng thứ tự lương
- [ ] Pagination → Chuyển trang đúng, giữ filter
- [ ] Không có kết quả → Hiển thị "Không tìm thấy việc làm phù hợp"
- [ ] AI Recommendation → Gợi ý phù hợp với profile (Precision >= 70%)

#### Module: Apply việc làm

- [ ] Apply với CV trong profile → Thành công, hiển thị trạng thái "Đã apply"
- [ ] Apply với CV mới upload → Thành công
- [ ] Apply job đã apply → Báo "Bạn đã apply job này"
- [ ] Apply job hết hạn → Báo lỗi "Job đã hết hạn"
- [ ] Xem danh sách apply → Hiển thị đúng, có trạng thái
- [ ] Rút đơn apply → Thành công, job không còn trong danh sách

#### Module: Dashboard Nhà tuyển dụng

- [ ] Đăng job mới → Job hiển thị trên hệ thống
- [ ] Chỉnh sửa job → Thay đổi được cập nhật
- [ ] Đóng job → Job không hiển thị với ứng viên
- [ ] Xem danh sách ứng viên → Hiển thị đúng
- [ ] Xem chi tiết CV ứng viên → Tải/xem được CV
- [ ] Cập nhật trạng thái apply → Ứng viên nhận thông báo

### 4.3 Checklist trước khi Demo

- [ ] Tất cả module core hoạt động ổn định
- [ ] Không có bug Critical/High open
- [ ] Đã test end-to-end flow hoàn chỉnh
- [ ] Database có data mẫu để demo
- [ ] Đã rehearsal demo ít nhất 2 lần
- [ ] Đã chuẩn bị backup plan (video demo nếu server sự cố)
- [ ] Slide presentation đã hoàn thiện
- [ ] Phân công ai demo phần nào

---

## 5. QUY TRÌNH QUẢN LÝ LỖI (BUG TRACKING)

### 5.1 Workflow

```
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

### 5.2 Chi tiết từng bước

#### Bước 1: Phát hiện & Báo cáo (Tester)

Khi phát hiện bug, tester tạo **GitHub Issue** với template:

```markdown
## Bug Report

**Bug ID:** # (GitHub tự sinh)
**Người báo:** @username
**Ngày báo:** DD/MM/YYYY
**Module:** [Tên module]

### Mô tả
Mô tả ngắn gọn bug là gì

### Môi trường
- OS: Windows 11 / macOS / Linux
- Browser: Chrome 120 / Firefox 119
- Environment: Development / Staging

### Steps to Reproduce
1. Bước 1
2. Bước 2
3. Bước 3

### Expected Result
Điều đáng lẽ phải xảy ra

### Actual Result
Điều thực tế xảy ra

### Severity
- [ ] Critical - System crash, blocker
- [ ] High - Major feature broken
- [ ] Medium - Feature hoạt động sai
- [ ] Low - Cosmetic

### Priority
- [ ] High - Cần fix ngay
- [ ] Medium - Fix trong sprint này
- [ ] Low - Fix khi có thời gian

### Attachments
- Screenshot/Video: [Link hoặc attach file]
- Log: [Nếu có]

### Test Case liên quan
TC_ID: TC_XXX_XXX
```

#### Bước 2: Xác nhận & Gán (Tech Lead / Dev Lead)

- Review bug report, xác nhận có phải bug thật không
- Gán cho dev phụ trách module
- Set label: `bug`, `severity:high`, `priority:medium`
- Chuyển status: **NEW → OPEN**

#### Bước 3: Fix (Developer)

- Nhận bug, chuyển status: **OPEN → IN PROGRESS**
- Fix bug, commit với message: `fix: mô tả bug (fixes #ID)`
- Push lên branch, tạo PR
- Sau khi PR merged, chuyển status: **IN PROGRESS → FIXED**
- Comment vào issue: "Đã fix, mời test lại"

#### Bước 4: Test lại (Tester)

- Tester nhận thông báo, test lại
- **Nếu Pass:** Chuyển status → **CLOSED**, comment "Verified ✅"
- **Nếu Fail:** Chuyển status → **REOPENED**, comment mô tả lý do + screenshot

#### Bước 5: Đóng (Final)

- Bug đã closed không được reopen trừ khi có regression
- Tech Lead review danh sách bug closed hàng tuần

### 5.3 Quy tắc đặt Label GitHub Issues

| Label | Màu | Dùng khi |
|-------|-----|----------|
| `bug` | 🔴 đỏ | Lỗi chức năng |
| `enhancement` | 🟢 xanh | Cải tiến tính năng |
| `severity:critical` | ⚫ đen | System down, blocker |
| `severity:high` | 🔴 đỏ | Major feature broken |
| `severity:medium` | 🟡 vàng | Feature hoạt động sai |
| `severity:low` | 🟢 xanh | Cosmetic |
| `priority:high` | 🔴 đỏ | Fix ngay |
| `priority:medium` | 🟡 vàng | Fix trong sprint |
| `priority:low` | 🟢 xanh | Fix khi rảnh |
| `duplicate` | ⚪ xám | Trùng issue khác |
| `wontfix` | ⚪ xám | Không fix (có lý do) |

### 5.4 SLA (Service Level Agreement)

| Severity | Thời gian phản hồi | Thời gian fix |
|----------|-------------------|---------------|
| Critical | 2 giờ | 24 giờ |
| High | 4 giờ | 48 giờ |
| Medium | 8 giờ | 1 sprint |
| Low | 24 giờ | Khi có thời gian |

### 5.5 Báo cáo bug hàng tuần

Cuối mỗi tuần, Tech Lead tổng hợp:

| Metric | Giá trị |
|--------|---------|
| Tổng bug mới phát hiện | |
| Bug đã fix | |
| Bug còn open | |
| Bug reopen rate | |
| Top 3 module nhiều bug nhất | |

---

## 6. PHÂN CÔNG & TIMELINE

### 6.1 Phân công vai trò

| Thành viên | Vai trò | Trách nhiệm |
|------------|---------|-------------|
| [Tên 1] | QA Lead | Viết test plan, review test case, báo cáo |
| [Tên 2] | Tester UI | Manual testing UI, viết test case UI |
| [Tên 3] | Tester API | API automation, AI testing |

### 6.2 Timeline

| Tuần | Nhiệm vụ | Người phụ trách | Deliverable |
|------|----------|-----------------|-------------|
| Tuần 1 | Viết test plan, test case | QA Lead | Test Plan, Test Case Sheet |
| Tuần 2 | Test UI module Auth, Profile | Tester UI | Test report UI |
| Tuần 2 | Setup Postman collection | Tester API | Postman collection |
| Tuần 3 | Test UI module Job, Apply | Tester UI | Test report UI |
| Tuần 3 | Test API + AI Testing | Tester API | API test report, AI metrics |
| Tuần 4 | Regression test, fix bug | Toàn nhóm | Final report |
| Tuần 4 | Chuẩn bị demo | Toàn nhóm | Demo script, data mẫu |

---

## 7. RỦI RO & PHƯƠNG ÁN DỰ PHÒNG

| Rủi ro | Khả năng | Tác động | Phương án dự phòng |
|--------|----------|----------|-------------------|
| Server down khi demo | Trung bình | Cao | Quay video demo sẵn |
| AI gợi ý không chính xác | Cao | Cao | Có data mẫu pre-computed |
| Không đủ thời gian test | Trung bình | Trung bình | Ưu tiên test High priority trước |
| Bug phát sinh sát ngày demo | Cao | Cao | Code freeze 3 ngày trước demo |
| Thành viên vắng khi demo | Thấp | Cao | Phân công backup person |

---

## 8. XÁC NHẬN CỦA NHÓM

> Tài liệu này đã được review bởi tất cả thành viên và thống nhất áp dụng.

| Thành viên | Vai trò | Chữ ký | Ngày | Nhận xét |
|------------|---------|--------|------|----------|
| [Tên 1] | QA Lead | | | |
| [Tên 2] | Tester UI | | | |
| [Tên 3] | Tester API | | | |

---

## PHỤ LỤC

### A. Glossary

| Thuật ngữ | Giải thích |
|-----------|-----------|
| TC_ID | Test Case ID - Mã định danh test case |
| Pass | Test case thực thi thành công, đúng expected result |
| Fail | Test case thực thi không đúng expected result |
| Skipped | Test case không thể thực thi (do dependency, blocker) |
| Regression | Test lại sau khi fix bug để đảm bảo không ảnh hưởng tính năng khác |
| Edge Case | Trường hợp biên, ít xảy ra nhưng cần test |
| SLA | Service Level Agreement - Cam kết thời gian phản hồi |

### B. Tài liệu tham khảo

- [Link Figma Design]
- [Link API Documentation]
- [Link Project Requirements]
- [Link Google Sheets Test Case]

---

> **Tài liệu này sẽ được cập nhật khi có thay đổi. Phiên bản mới nhất luôn được lưu tại repository của dự án.**
