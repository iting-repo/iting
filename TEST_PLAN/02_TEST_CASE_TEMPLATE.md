# 02. TEMPLATE TEST CASE

> **Dự án:** ITing - Hệ thống gợi ý việc làm IT  
> **Tài liệu:** Test Case Template & Hướng dẫn  
> **Phiên bản:** 1.0  
> **Ngày:** 22/04/2026  
> **Người soạn:** QA Lead  
> **Trạng thái:** Draft

---

## MỤC LỤC

1. [Cấu trúc Test Case](#1-cấu-trúc-test-case)
2. [Quy ước đặt tên](#2-quy-ước-đặt-tên)
3. [Ma trận Priority & Severity](#3-ma-trận-priority--severity)
4. [Hướng dẫn điền Test Case](#4-hướng-dẫn-điền-test-case)
5. [Ví dụ minh họa](#5-ví-dụ-minh-họa)
6. [Quy trình Review Template](#6-quy-trình-review-template)

---

## 1. CẤU TRÚC TEST CASE

Test case được lưu trữ trên **Google Sheets / Excel** với cấu trúc cột chuẩn hóa.

### 1.1 Danh sách cột

| STT | Cột | Kiểu dữ liệu | Bắt buộc | Mô tả |
|-----|-----|--------------|----------|-------|
| 1 | `TC_ID` | String | ✅ | Mã định danh duy nhất (VD: TC_UI_001) |
| 2 | `Module` | String | ✅ | Tên module/tính năng (VD: Đăng nhập) |
| 3 | `Test_Case_Name` | String | ✅ | Mô tả ngắn gọn mục đích test |
| 4 | `Priority` | Enum | ✅ | High / Medium / Low |
| 5 | `Preconditions` | Text | ⚠️ | Điều kiện cần có trước khi test |
| 6 | `Test_Steps` | Text | ✅ | Các bước thực hiện (đánh số 1, 2, 3...) |
| 7 | `Test_Data` | Text | ⚠️ | Dữ liệu đầu vào cụ thể |
| 8 | `Expected_Result` | Text | ✅ | Kết quả mong đợi hệ thống trả về |
| 9 | `Actual_Result` | Text | ❌ | Kết quả thực tế (điền khi chạy test) |
| 10 | `Status` | Enum | ❌ | Pass / Fail / Skipped / Blocked |
| 11 | `Severity` | Enum | ❌ | Critical / High / Medium / Low (nếu Fail) |
| 12 | `Bug_ID` | String | ❌ | Link/Mã bug report (nếu Fail) |
| 13 | `Tester` | String | ❌ | Người thực hiện test |
| 14 | `Date` | Date | ❌ | Ngày thực hiện test |
| 15 | `Notes` | Text | ❌ | Ghi chú, screenshot link, v.v. |

### 1.2 Giải thích chi tiết

- **TC_ID:** Mã duy nhất, không trùng lặp, dùng để traceability.
- **Module:** Nhóm tính năng liên quan, giúp filter/báo cáo dễ dàng.
- **Priority:** Mức ưu tiên thực thi test case (không phải mức độ nghiêm trọng của bug).
- **Preconditions:** Trạng thái hệ thống, data, quyền hạn cần có trước khi bắt đầu.
- **Test_Steps:** Mô tả chi tiết, rõ ràng, có thể lặp lại bởi bất kỳ ai.
- **Test_Data:** Dữ liệu cụ thể dùng trong bước test (email, password, input...).
- **Expected_Result:** Kết quả chính xác hệ thống PHẢI trả về nếu hoạt động đúng.
- **Actual_Result:** Kết quả thực tế quan sát được khi chạy test.
- **Status:** Trạng thái cuối cùng của test case sau khi thực thi.
- **Severity:** Mức độ ảnh hưởng của lỗi nếu test case Fail.
- **Bug_ID:** Tham chiếu đến issue trên GitHub/Jira để track.
- **Tester/Date:** Audit trail, biết ai test, khi nào.
- **Notes:** Thông tin bổ sung, link ảnh/video, workaround, v.v.

---

## 2. QUY ƯỚC ĐẶT TÊN

### 2.1 TC_ID Convention

```
TC_[LOẠI]_[MODULE]_[STT]

LOẠI:
  UI   → Manual UI Testing
  API  → API Automation Testing
  AI   → AI Recommendation Testing
  PERF → Performance Testing
  SEC  → Security Testing

MODULE (Optional):
  AUTH → Authentication
  PROF → Profile
  JOB  → Job Management
  APP  → Application
  REC  → Recommendation
  DASH → Dashboard

STT: Số thứ tự 3 chữ số (001, 002, ...)
```

**Ví dụ:**
- `TC_UI_AUTH_001`: Test UI Đăng nhập thành công
- `TC_API_JOB_015`: Test API Tạo job mới
- `TC_AI_REC_003`: Test AI Gợi ý cho profile Junior
- `TC_UI_PROF_010`: Test UI Upload CV

### 2.2 Test Case Name Convention
- Bắt đầu bằng động từ: "Kiểm tra", "Xác minh", "Đảm bảo"
- Ngắn gọn, rõ ràng, không viết tắt khó hiểu
- **VD:** "Kiểm tra đăng nhập với email hợp lệ và đúng password"

---

## 3. MA TRẬN PRIORITY & SEVERITY

### 3.1 Priority (Mức ưu tiên thực thi)

| Level | Định nghĩa | Tiêu chí | Ví dụ |
|-------|------------|----------|-------|
| **High** | Must test | Core functionality, ảnh hưởng trực tiếp đến user flow chính | Login, Register, Apply Job, Payment |
| **Medium** | Should test | Tính năng quan trọng nhưng không blocker | Filter, Sort, Profile Update, Notification |
| **Low** | Nice to test | Cosmetic, edge case ít gặp, cải tiến nhỏ | Màu sắc button, Font size, Tooltip |

### 3.2 Severity (Mức độ nghiêm trọng của bug)

| Level | Định nghĩa | Tiêu chí | Ví dụ |
|-------|------------|----------|-------|
| **Critical** | Blocker | System crash, data loss, không thể tiếp tục test | Server 500, Database corrupt, Login fail toàn bộ |
| **High** | Major | Tính năng chính broken, workaround khó/không có | Không apply được job, Sai kết quả search |
| **Medium** | Minor | Tính năng hoạt động nhưng sai/sót, workaround dễ | Filter sai 1 trường, UI lệch nhẹ |
| **Low** | Trivial | Cosmetic, chính tả, alignment, không ảnh hưởng chức năng | Lỗi font, Màu không đúng design, Typo |

### 3.3 Priority vs Severity Matrix

| | Severity: Critical | Severity: High | Severity: Medium | Severity: Low |
|-|-------------------|----------------|------------------|---------------|
| **Priority: High** | Fix ngay lập tức | Fix trong 24h | Fix trong sprint | Fix khi rảnh |
| **Priority: Medium** | Fix trong 24h | Fix trong sprint | Fix sprint sau | Backlog |
| **Priority: Low** | Fix trong sprint | Fix sprint sau | Backlog | Cân nhắc fix |

---

## 4. HƯỚNG DẪN ĐIỀN TEST CASE

### 4.1 Quy trình viết Test Case
1. **Xác định yêu cầu:** Đọc user story/SRS, hiểu rõ tính năng.
2. **Phân tích điều kiện:** Xác định precondition, test data.
3. **Viết bước thực hiện:** Chi tiết, rõ ràng, đánh số thứ tự.
4. **Xác định kết quả mong đợi:** Cụ thể, đo lường được.
5. **Review:** Gửi cho Dev/BA review trước khi thực thi.

### 4.2 Nguyên tắc vàng
- **1 Test Case = 1 Scenario:** Không gộp nhiều kịch bản vào 1 case.
- **Independent:** Test case không phụ thuộc vào kết quả của case khác (trừ khi cần).
- **Reproducible:** Bất kỳ ai đọc cũng có thể thực hiện và ra cùng kết quả.
- **Clear Expected Result:** Không mơ hồ, phải biết chính xác hệ thống trả về gì.
- **Traceable:** Link ngược lại requirement/user story.

### 4.3 Cách điền khi chạy test
- **Pass:** Ghi "Như expected" hoặc kết quả cụ thể nếu cần.
- **Fail:** Ghi kết quả thực tế, chụp ảnh/video, tạo Bug ID.
- **Skipped:** Ghi lý do (VD: Dependency chưa xong, Feature chưa implement).
- **Blocked:** Ghi nguyên nhân chặn (VD: Server down, Bug blocker #123).

---

## 5. VÍ DỤ MINH HỌA

### 5.1 UI Test Case

| TC_ID | TC_UI_AUTH_001 |
|-------|----------------|
| **Module** | Authentication |
| **Name** | Kiểm tra đăng nhập thành công với email và password hợp lệ |
| **Priority** | High |
| **Preconditions** | User đã đăng ký tài khoản, tài khoản đã verify, hệ thống đang hoạt động |
| **Test Steps** | 1. Mở trình duyệt, truy cập `/login`<br>2. Nhập email vào trường "Email"<br>3. Nhập password vào trường "Password"<br>4. Click nút "Đăng nhập" |
| **Test Data** | Email: `testuser@example.com`<br>Password: `SecurePass123!` |
| **Expected Result** | - Hệ thống chuyển hướng đến `/dashboard`<br>- Hiển thị thông báo "Đăng nhập thành công"<br>- Header hiển thị tên user và avatar<br>- Session được lưu (refresh không logout) |
| **Actual Result** | *(Để trống khi viết, điền khi chạy test)* |
| **Status** | ⬜ Pass / ❌ Fail / ⏭️ Skipped |
| **Notes** | Test trên Chrome 120, Firefox 119 |

### 5.2 API Test Case

| TC_ID | TC_API_JOB_005 |
|-------|----------------|
| **Module** | Job Management |
| **Name** | Kiểm tra API tạo job mới với dữ liệu hợp lệ |
| **Priority** | High |
| **Preconditions** | Đã login với role Recruiter, có valid access token |
| **Test Steps** | 1. Gửi POST request đến `/api/jobs`<br>2. Headers: `Authorization: Bearer <token>`<br>3. Body: JSON hợp lệ (title, company, description, skills, salary, location)<br>4. Verify response |
| **Test Data** | `{ "title": "Frontend Dev", "company": "ABC Corp", "description": "...", "skills": ["React"], "salary": 1500, "location": "HN" }` |
| **Expected Result** | - Status Code: `201 Created`<br> - Response có `id`, `createdAt`, `status: "pending"`<br>- Job xuất hiện trong danh sách của recruiter<br>- Database có record mới |
| **Actual Result** | *(Để trống)* |
| **Status** | ⬜ Pass / ❌ Fail / ⏭️ Skipped |
| **Notes** | Dùng Postman, script validate schema |

### 5.3 AI Test Case

| TC_ID | TC_AI_REC_002 |
|-------|----------------|
| **Module** | AI Recommendation |
| **Name** | Kiểm tra độ chính xác gợi ý cho profile Junior React Developer |
| **Priority** | High |
| **Preconditions** | Profile P1 đã tạo (Skills: React, JS, CSS; Exp: 0-1 năm), DB có >= 50 jobs |
| **Test Steps** | 1. Gọi API `/api/recommendations?userId=P1&limit=10`<br>2. Nhận danh sách 10 jobs<br>3. Đánh giá từng job: Phù hợp (React/Frontend, Junior/Intern)<br>4. Tính Precision@10, Relevance Score |
| **Test Data** | User P1, Top 10 jobs trả về |
| **Expected Result** | - Precision@10 >= 70% (>= 7 job phù hợp)<br>- Relevance Score trung bình >= 3.5/5<br>- Không có job Senior/Lead<br>- Không trùng lặp > 2 jobs cùng công ty |
| **Actual Result** | *(Để trống)* |
| **Status** | ⬜ Pass / ❌ Fail / ⏭️ Skipped |
| **Notes** | Đánh giá bởi 2 người, tính trung bình |

---

## 6. QUY TRÌNH REVIEW TEMPLATE

### 6.1 Mục đích
Đảm bảo template dễ sử dụng, đầy đủ thông tin, phù hợp với quy trình nhóm.

### 6.2 Các bước Review
1. **QA Lead** soạn draft template.
2. **Gửi cho 2 thành viên còn lại** (Dev/Tester) review.
3. **Feedback tập trung vào:**
   - Cột có thừa/thiếu không?
   - Hướng dẫn có rõ ràng không?
   - Ví dụ có dễ hiểu không?
   - Có khó điền khi test thực tế không?
4. **Cập nhật** dựa trên feedback.
5. **Sign-off** xác nhận template chính thức.

### 6.3 Checklist Review
- [ ] Cấu trúc cột đầy đủ, không thừa thiếu
- [ ] Quy ước đặt tên rõ ràng, nhất quán
- [ ] Ví dụ minh họa sát với thực tế dự án
- [ ] Hướng dẫn dễ hiểu, người mới cũng làm được
- [ ] Tương thích với công cụ quản lý (Google Sheets/Excel)
- [ ] Đã nhận feedback từ ít nhất 2 thành viên
- [ ] Đã cập nhật theo feedback
- [ ] Được xác nhận "Dễ điền & Sẵn sàng sử dụng"

### 6.4 Biên bản xác nhận
| Thành viên | Vai trò | Nhận xét | Xác nhận | Ngày |
|------------|---------|----------|----------|------|
| [Tên 2] | UI Tester | "Template rõ ràng, đủ cột, ví dụ dễ hiểu" | ✅ Đồng ý | 22/04 |
| [Tên 3] | API Tester | "Nên thêm cột 'Test Data' riêng biệt, đã cập nhật" | ✅ Đồng ý | 22/04 |

---

> **Template này đã được review và xác nhận sử dụng chính thức cho dự án ITing.**
