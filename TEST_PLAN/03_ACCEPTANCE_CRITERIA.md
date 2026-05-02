# 03. ACCEPTANCE CRITERIA CHECKLIST

> **Dự án:** ITing - Hệ thống gợi ý việc làm IT  
> **Tài liệu:** Acceptance Criteria Checklist  
> **Phiên bản:** 1.0  
> **Ngày:** 22/04/2026  
> **Người soạn:** QA Lead  
> **Trạng thái:** Draft

---

## MỤC LỤC

1. [Định nghĩa "Done"](#1-định-nghĩa-done)
2. [Checklist theo Module](#2-checklist-theo-module)
3. [Checklist Phi chức năng](#3-checklist-phi-chức-năng)
4. [Checklist trước khi Demo](#4-checklist-trước-khi-demo)
5. [Quy trình Sign-off](#5-quy-trình-sign-off)

---

## 1. ĐỊNH NGHĨA "DONE"

Một tính năng được coi là **HOÀN THÀNH (DONE)** khi thỏa mãn **TẤT CẢ** điều kiện sau:

### 1.1 Definition of Done (DoD) Checklist

| STT | Tiêu chí | Mô tả | Trạng thái |
|-----|----------|-------|------------|
| 1 | **Code Complete** | Code đã viết xong, không còn TODO/WIP | ⬜ |
| 2 | **Code Review** | Ít nhất 1 thành viên khác đã review và approve PR | ⬜ |
| 3 | **Unit Test** | Unit test pass >= 80% coverage (nếu có) | ⬜ |
| 4 | **Test Case Executed** | 100% test case liên quan đã thực thi, Pass >= 95% | ⬜ |
| 5 | **No Critical/High Bugs** | Không còn bug Critical hoặc High open | ⬜ |
| 6 | **UI/UX Match** | Giao diện đúng Figma >= 90% | ⬜ |
| 7 | **API Contract** | Response đúng schema, status code chuẩn | ⬜ |
| 8 | **Cross-browser** | Hoạt động trên Chrome, Firefox, Edge | ⬜ |
| 9 | **Responsive** | Hiển thị đúng trên Desktop, Tablet, Mobile | ⬜ |
| 10 | **Edge Cases** | Đã test các trường hợp biên, lỗi input | ⬜ |
| 11 | **Documentation** | README/API docs đã cập nhật (nếu cần) | ⬜ |
| 12 | **PO Approval** | Product Owner/BA đã xác nhận chấp nhận | ⬜ |

> **Quy tắc:** Chỉ khi TẤT CẢ 12 tiêu chí trên được check ✅, tính năng mới được coi là DONE.

---

## 2. CHECKLIST THEO MODULE

### 2.1 Module: Authentication (Đăng ký / Đăng nhập)

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_AUTH_01 | Đăng ký với email hợp lệ, password đạt chuẩn → Tạo tài khoản thành công, gửi email xác thực | UI, API | ⬜ |
| AC_AUTH_02 | Đăng ký với email đã tồn tại → Báo lỗi "Email đã được sử dụng", không tạo mới | UI, API | ⬜ |
| AC_AUTH_03 | Đăng ký với password yếu (< 8 ký tự, không có chữ hoa/số) → Báo lỗi cụ thể, không tạo | UI | ⬜ |
| AC_AUTH_04 | Đăng ký với email không đúng định dạng → Báo lỗi "Email không hợp lệ" | UI | ⬜ |
| AC_AUTH_05 | Xác thực email qua link trong email → Tài khoản active, login được | UI, API | ⬜ |
| AC_AUTH_06 | Đăng nhập đúng email/password → Redirect dashboard, tạo session/token | UI, API | ⬜ |
| AC_AUTH_07 | Đăng nhập sai password → Báo "Sai mật khẩu", không redirect, không lock tài khoản (dưới 5 lần) | UI, API | ⬜ |
| AC_AUTH_08 | Đăng nhập với tài khoản chưa verify → Báo "Vui lòng xác thực email", cho resend | UI | ⬜ |
| AC_AUTH_09 | Đăng nhập sai 5 lần liên tiếp → Lock tài khoản 15 phút, báo "Tài khoản tạm khóa" | UI, API | ⬜ |
| AC_AUTH_10 | Forgot password → Nhập email, nhận link reset, đặt password mới thành công | UI, API | ⬜ |
| AC_AUTH_11 | Session timeout (30 phút không hoạt động) → Tự động logout, redirect login | UI | ⬜ |
| AC_AUTH_12 | OAuth Google Login → Login thành công qua Google, tạo/tìm user | UI, API | ⬜ |

### 2.2 Module: User Profile (Hồ sơ ứng viên)

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_PROF_01 | Tạo profile mới với đầy đủ thông tin → Lưu thành công, hiển thị đúng | UI, API | ⬜ |
| AC_PROF_02 | Cập nhật thông tin profile → Thay đổi được lưu, hiển thị đúng | UI, API | ⬜ |
| AC_PROF_03 | Upload CV (PDF, DOCX, <= 5MB) → File lưu thành công, preview được | UI, API | ⬜ |
| AC_PROF_04 | Upload file sai định dạng (EXE, ZIP) hoặc > 5MB → Báo lỗi, không lưu | UI | ⬜ |
| AC_PROF_05 | Thêm kỹ năng (search & select) → Hiển thị tag, lưu vào DB | UI, API | ⬜ |
| AC_PROF_06 | Xóa kỹ năng → Tag biến mất, cập nhật DB | UI, API | ⬜ |
| AC_PROF_07 | Thêm kinh nghiệm làm việc → Lưu đúng, hiển thị timeline | UI, API | ⬜ |
| AC_PROF_08 | Profile trống → Hiển thị placeholder, gợi ý hoàn thiện profile | UI | ⬜ |
| AC_PROF_09 | Xem profile công khai → Hiển thị đúng thông tin public, ẩn thông tin nhạy cảm | UI | ⬜ |
| AC_PROF_10 | Xóa tài khoản → Xác nhận 2 bước, xóa/anonymize data, logout | UI, API | ⬜ |

### 2.3 Module: Job Management (Quản lý việc làm)

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_JOB_01 | Nhà tuyển dụng đăng job mới → Job lưu ở trạng thái "Pending", hiển thị preview | UI, API | ⬜ |
| AC_JOB_02 | Chỉnh sửa job → Thay đổi được lưu, cập nhật timestamp | UI, API | ⬜ |
| AC_JOB_03 | Đóng job → Job không hiển thị với ứng viên, trạng thái "Closed" | UI, API | ⬜ |
| AC_JOB_04 | Xóa job → Xác nhận, xóa mềm (soft delete), không hiển thị | UI, API | ⬜ |
| AC_JOB_05 | Job hết hạn tự động → Cron job chuyển status "Expired", không hiển thị | API | ⬜ |
| AC_JOB_06 | Xem chi tiết job → Hiển thị đầy đủ: title, company, description, skills, salary, location, deadline | UI, API | ⬜ |
| AC_JOB_07 | Job không có required fields → Validate lỗi, không cho submit | UI, API | ⬜ |

### 2.4 Module: Search & Filter (Tìm kiếm & Lọc)

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_SEARCH_01 | Search bằng keyword (title, company, skills) → Trả kết quả liên quan, highlight keyword | UI, API | ⬜ |
| AC_SEARCH_02 | Filter theo location → Chỉ hiển thị job đúng location | UI, API | ⬜ |
| AC_SEARCH_03 | Filter theo salary range → Chỉ job trong khoảng lương | UI, API | ⬜ |
| AC_SEARCH_04 | Filter theo experience level (Intern, Fresher, Junior, Mid, Senior) → Đúng level | UI, API | ⬜ |
| AC_SEARCH_05 | Filter theo job type (Full-time, Part-time, Remote, Internship) → Đúng type | UI, API | ⬜ |
| AC_SEARCH_06 | Multiple filters kết hợp → Kết quả thỏa TẤT CẢ điều kiện | UI, API | ⬜ |
| AC_SEARCH_07 | Sort by Newest → Job mới nhất lên đầu | UI | ⬜ |
| AC_SEARCH_08 | Sort by Salary (High-Low / Low-High) → Đúng thứ tự | UI | ⬜ |
| AC_SEARCH_09 | Sort by Relevance → Job phù hợp nhất lên đầu | UI, API | ⬜ |
| AC_SEARCH_10 | Pagination (10 jobs/trang) → Chuyển trang đúng, giữ filter, total count đúng | UI, API | ⬜ |
| AC_SEARCH_11 | Không có kết quả → Hiển thị "Không tìm thấy việc làm phù hợp", gợi ý bỏ filter | UI | ⬜ |
| AC_SEARCH_12 | Search với keyword rỗng → Trả về tất cả job đang mở | UI, API | ⬜ |

### 2.5 Module: Application (Nộp đơn ứng tuyển)

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_APP_01 | Apply với CV trong profile → Thành công, trạng thái "Applied", hiển thị trong danh sách | UI, API | ⬜ |
| AC_APP_02 | Apply với CV mới upload → Upload + Apply thành công, CV mới lưu | UI, API | ⬜ |
| AC_APP_03 | Apply job đã apply trước đó → Báo "Bạn đã apply job này", không tạo duplicate | UI, API | ⬜ |
| AC_APP_04 | Apply job hết hạn/đã đóng → Báo lỗi "Job không còn nhận hồ sơ" | UI, API | ⬜ |
| AC_APP_05 | Apply khi chưa login → Redirect login, sau đó quay lại job để apply | UI | ⬜ |
| AC_APP_06 | Xem danh sách apply của ứng viên → Hiển thị đúng job, trạng thái, ngày apply | UI, API | ⬜ |
| AC_APP_07 | Rút đơn apply → Xác nhận, trạng thái "Withdrawn", job không còn trong danh sách active | UI, API | ⬜ |
| AC_APP_08 | Nhà tuyển dụng xem danh sách apply → Hiển thị đúng ứng viên, CV, thông tin | UI, API | ⬜ |
| AC_APP_09 | Cập nhật trạng thái apply (Pending → Interview → Accepted/Rejected) → Ứng viên nhận thông báo | UI, API | ⬜ |
| AC_APP_10 | Tải CV ứng viên → File tải về đúng, mở được | UI | ⬜ |

### 2.6 Module: AI Recommendation (Gợi ý việc làm)

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_AI_01 | Gợi ý dựa trên kỹ năng profile → Jobs trả về có skill match cao | AI, API | ⬜ |
| AC_AI_02 | Gợi ý dựa trên kinh nghiệm → Không gợi ý job yêu cầu exp cao hơn user | AI, API | ⬜ |
| AC_AI_03 | Gợi ý dựa trên location preference → Ưu tiên job đúng location mong muốn | AI, API | ⬜ |
| AC_AI_04 | Precision@10 >= 70% → Ít nhất 7/10 job phù hợp với profile | AI | ⬜ |
| AC_AI_05 | Relevance Score >= 3.5/5 → Đánh giá bởi 2 người, trung bình đạt | AI | ⬜ |
| AC_AI_06 | Không gợi ý job hết hạn/đã đóng → Chỉ job đang mở | AI, API | ⬜ |
| AC_AI_07 | Diversity >= 50% → Không quá 2 jobs cùng công ty trong top 10 | AI | ⬜ |
| AC_AI_08 | Fallback khi không có gợi ý → Hiển thị job popular/newest thay vì empty | UI, API | ⬜ |
| AC_AI_09 | Refresh gợi ý → Kết quả thay đổi khi profile cập nhật | UI, API | ⬜ |
| AC_AI_10 | Response time < 2s → API trả kết quả trong thời gian chấp nhận được | API | ⬜ |

### 2.7 Module: Dashboard & Notification

| AC_ID | Tiêu chí chấp nhận | Loại test | Trạng thái |
|-------|-------------------|-----------|------------|
| AC_DASH_01 | Dashboard ứng viên → Hiển thị số apply, pending, interview, accepted | UI, API | ⬜ |
| AC_DASH_02 | Dashboard nhà tuyển dụng → Hiển thị số job đang mở, tổng apply, pending review | UI, API | ⬜ |
| AC_DASH_03 | Biểu đồ thống kê → Dữ liệu đúng, render đúng chart | UI | ⬜ |
| AC_DASH_04 | Thông báo mới → Badge count đúng, click redirect đúng trang | UI | ⬜ |
| AC_DASH_05 | Đánh dấu đã đọc → Thông báo biến mất khỏi unread list | UI, API | ⬜ |

---

## 3. CHECKLIST PHI CHỨC NĂNG

### 3.1 Performance

| AC_ID | Tiêu chí | Target | Trạng thái |
|-------|----------|--------|------------|
| AC_PERF_01 | Load trang chủ | < 3s | ⬜ |
| AC_PERF_02 | API response time (p95) | < 500ms | ⬜ |
| AC_PERF_03 | AI Recommendation response time | < 2s | ⬜ |
| AC_PERF_04 | Upload CV (5MB) | < 5s | ⬜ |
| AC_PERF_05 | Search results load | < 1s | ⬜ |

### 3.2 Security

| AC_ID | Tiêu chí | Trạng thái |
|-------|----------|------------|
| AC_SEC_01 | Password được hash (bcrypt/argon2), không lưu plaintext | ⬜ |
| AC_SEC_02 | API yêu cầu authentication (JWT) cho protected routes | ⬜ |
| AC_SEC_03 | Input validation, chống SQL Injection cơ bản | ⬜ |
| AC_SEC_04 | XSS protection, escape output | ⬜ |
| AC_SEC_05 | Rate limiting cho login API (chống brute force) | ⬜ |
| AC_SEC_06 | CORS cấu hình đúng, không allow * | ⬜ |
| AC_SEC_07 | File upload chỉ chấp nhận định dạng cho phép (PDF, DOCX) | ⬜ |
| AC_SEC_08 | HTTPS enforced trên production | ⬜ |

### 3.3 Usability & Accessibility

| AC_ID | Tiêu chí | Trạng thái |
|-------|----------|------------|
| AC_USAB_01 | Navigation rõ ràng, user không bị lạc | ⬜ |
| AC_USAB_02 | Error messages dễ hiểu, hướng dẫn cách sửa | ⬜ |
| AC_USAB_03 | Loading states, skeleton screens khi fetch data | ⬜ |
| AC_USAB_04 | Keyboard navigation cơ bản (Tab, Enter, Esc) | ⬜ |
| AC_USAB_05 | Alt text cho images, aria labels cho buttons | ⬜ |
| AC_USAB_06 | Color contrast đạt WCAG AA (tỷ lệ >= 4.5:1) | ⬜ |

---

## 4. CHECKLIST TRƯỚC KHI DEMO

### 4.1 Technical Readiness

| STT | Hạng mục | Trạng thái | Ghi chú |
|-----|----------|------------|---------|
| 1 | Server staging/production hoạt động ổn định | ⬜ | |
| 2 | Database có data mẫu đa dạng, thực tế | ⬜ | |
| 3 | API endpoints hoạt động, không lỗi 500 | ⬜ | |
| 4 | Frontend build thành công, không console errors | ⬜ | |
| 5 | AI Recommendation hoạt động, trả kết quả | ⬜ | |
| 6 | Email service hoạt động (hoặc mock) | ⬜ | |
| 7 | Backup plan sẵn sàng (video demo nếu server sự cố) | ⬜ | |

### 4.2 Demo Script

| STT | Bước demo | Người thực hiện | Thời gian | Trạng thái |
|-----|-----------|-----------------|-----------|------------|
| 1 | Giới thiệu dự án, vấn đề giải quyết | [Tên] | 2 phút | ⬜ |
| 2 | Đăng ký tài khoản ứng viên | [Tên] | 2 phút | ⬜ |
| 3 | Hoàn thiện profile, upload CV, thêm kỹ năng | [Tên] | 3 phút | ⬜ |
| 4 | Xem AI recommendation, giải thích độ phù hợp | [Tên] | 3 phút | ⬜ |
| 5 | Search & filter job, apply thử | [Tên] | 3 phút | ⬜ |
| 6 | Switch sang recruiter, đăng job mới | [Tên] | 2 phút | ⬜ |
| 7 | Xem danh sách apply, cập nhật trạng thái | [Tên] | 2 phút | ⬜ |
| 8 | Dashboard thống kê | [Tên] | 2 phút | ⬜ |
| 9 | Q&A | Toàn nhóm | 5 phút | ⬜ |

### 4.3 Rehearsal Checklist

| STT | Hạng mục | Lần 1 | Lần 2 | Lần 3 |
|-----|----------|-------|-------|-------|
| 1 | Demo flow trơn tru, không chết máy | ⬜ | ⬜ | ⬜ |
| 2 | Thời gian đúng kế hoạch (<= 20 phút) | ⬜ | ⬜ | ⬜ |
| 3 | Chuyển tiếp giữa các phần mượt mà | ⬜ | ⬜ | ⬜ |
| 4 | Xử lý tình huống bất ngờ (lỗi, câu hỏi khó) | ⬜ | ⬜ | ⬜ |
| 5 | Slide presentation đồng bộ với demo | ⬜ | ⬜ | ⬜ |
| 6 | Phân công rõ ràng, không lấn sân nhau | ⬜ | ⬜ | ⬜ |

---

## 5. QUY TRÌNH SIGN-OFF

### 5.1 Quy trình
1. **Tester** thực thi test case, điền kết quả vào checklist.
2. **QA Lead** tổng hợp, kiểm tra tiêu chí Exit Criteria.
3. **Tech Lead** review technical readiness.
4. **Product Owner/BA** xác nhận tính năng đúng yêu cầu.
5. **Toàn nhóm** sign-off trước khi demo.

### 5.2 Bảng Sign-off

| Thành viên | Vai trò | Sign-off | Ngày | Ghi chú |
|------------|---------|----------|------|---------|
| [Tên 1] | QA Lead | ⬜ | | |
| [Tên 2] | UI Tester | ⬜ | | |
| [Tên 3] | API/AI Tester | ⬜ | | |
| [Tên 4] | Tech Lead | ⬜ | | |
| [Tên 5] | Product Owner | ⬜ | | |

### 5.3 Tiêu chí Sign-off
- [ ] Tất cả module core đạt Acceptance Criteria.
- [ ] Không còn bug Critical/High open.
- [ ] AI Metrics đạt target.
- [ ] Demo script đã rehearsal >= 2 lần.
- [ ] Backup plan sẵn sàng.

---

> **Checklist này là tài liệu bắt buộc trước khi demo. Chỉ demo khi TẤT CẢ đã được sign-off.**
