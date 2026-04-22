# 🌪️ UNHAPPY CASES & BUSINESS LOGIC SCENARIOS

Tài liệu này tổng hợp các tình huống lỗi (unhappy cases), các ràng buộc nghiệp vụ phức tạp và các kịch bản cạnh biên (edge cases) trong hệ thống ITing Job Portal.

---

## 1. 🔐 AUTHENTICATION & SECURITY

### **SC-01: Truy cập từ tài khoản bị BANNED**
*   **Tình huống:** Người dùng đã đăng nhập thành công nhưng sau đó bị Admin khóa tài khoản (BANNED).
*   **Unhappy Path:**
    *   Sử dụng Access Token cũ để gọi API: Hệ thống phải kiểm tra status trong `AuthUser` và trả về `403 Forbidden` hoặc `401 Unauthorized`.
    *   Sử dụng Refresh Token để lấy Access Token mới: `RefreshTokenService` phải kiểm tra status của `Account`, nếu `BANNED` thì từ chối cấp mới và thu hồi tất cả token hiện có.
    *   Đăng nhập lại: `AuthServiceImpl` phải chặn ngay lập tức và thông báo lý do bị khóa.

### **SC-02: Đăng ký trùng lặp thông tin nhạy cảm**
*   **Tình huống:** Người dùng cố tình đăng ký nhiều tài khoản với cùng một Email.
*   **Unhappy Path:** Hệ thống phải rollback giao dịch (Transaction) để đảm bảo không tạo bản ghi `Account` nếu bản ghi `User` hoặc `Company` tương ứng bị lỗi (và ngược lại).

---

## 2. 👤 CANDIDATE & PROFILE

### **SC-03: Ứng tuyển với hồ sơ trống (Incomplete Profile)**
*   **Tình huống:** Ứng viên chưa cập nhật Họ tên, Email liên hệ hoặc chưa có CV nhưng nhấn "Ứng tuyển".
*   **Unhappy Path:** `ApplicationService` phải chặn và yêu cầu hoàn thiện Profile. Nếu cho phép đính kèm CV mới lúc ứng tuyển, phải kiểm tra định dạng file (chỉ PDF/DOCX) và dung lượng (max 5MB).

### **SC-04: Thao tác trên Resume của người khác**
*   **Tình huống:** Candidate A đoán được ID hoặc URL file CV của Candidate B và cố tình xóa/sửa.
*   **Unhappy Path:** `CVService` phải kiểm tra `ownerId` trước mọi thao tác DELETE/UPDATE.

---

## 3. 🏢 EMPLOYER & COMPANY

### **SC-05: Công ty chưa duyệt (Unverified) nhưng đăng tin**
*   **Tình huống:** Employer vừa đăng ký, chưa được Admin phê duyệt thông tin công ty nhưng đã cố tạo và đăng Job.
*   **Unhappy Path:**
    *   Hệ thống cho phép tạo Job ở trạng thái `DRAFT`.
    *   Khi nhấn "Gửi duyệt" (`PENDING`), hệ thống phải kiểm tra `CompanyReviewStatus`. Nếu không phải `APPROVED`, chặn hành động và yêu cầu xác thực công ty trước.

### **SC-06: Nhà tuyển dụng "chéo sân"**
*   **Tình huống:** HR của công ty A cố tình gửi ID của Job thuộc công ty B vào API Update/Delete.
*   **Unhappy Path:** `JobService` phải thực hiện `checkOwnership` bằng cách so sánh `job.company.id` với `currentUser.id` (vì ID Account trùng với ID Company/User). Trả về `403 Forbidden`.

---

## 4. 💼 JOB MANAGEMENT

### **SC-07: Gia hạn Job đã đóng hoặc hết hạn quá lâu**
*   **Tình huống:** Một Job đã bị Admin gỡ bỏ do vi phạm hoặc đã đóng từ 1 năm trước, Employer cố tình gọi API `/extend`.
*   **Unhappy Path:** `JobService` phải chặn gia hạn nếu Job đang ở trạng thái `REJECTED` (bị Admin từ chối) hoặc `DELETED`.

### **SC-08: Sửa thông tin quan trọng khi Job đang ACTIVE**
*   **Tình huống:** Job đang hiển thị công khai, Employer sửa "Vị trí tuyển dụng" từ "Intern" thành "Senior" hoặc đổi "Mô tả công việc" hoàn toàn khác.
*   **Unhappy Path:** Khi có thay đổi ở các trường trọng yếu (Position, Description, Salary), hệ thống phải tự động chuyển trạng thái Job từ `ACTIVE` về lại `PENDING` để Admin duyệt lại, tránh treo đầu dê bán thịt chó.

---

## 5. 📄 APPLICATION WORKFLOW

### **SC-09: Ứng tuyển "Spam"**
*   **Tình huống:** Một ứng viên nhấn ứng tuyển liên tục vào 1 Job hoặc ứng tuyển 100 Jobs trong 1 phút.
*   **Unhappy Path:**
    *   **Logic:** `ApplicationService` chặn nếu đã tồn tại bản ghi trong `ApplyFormSentToJob` cho cặp (User, Job).
    *   **System:** `RateLimitInterceptor` chặn nếu vượt quá ngưỡng request cho phép trên endpoint `/api/applications/apply`.

### **SC-10: Ứng tuyển vào Job không khả dụng**
*   **Tình huống:** Người dùng lưu link Job, sau khi Job đã `CLOSED` hoặc `EXPIRED`, họ mới nhấn ứng tuyển.
*   **Unhappy Path:** `ApplicationService` phải kiểm tra `job.status == ACTIVE` và `job.dueDate >= now` trước khi tạo đơn.

---

## 6. 👑 ADMIN & MODERATION

### **SC-11: Admin tự Ban chính mình hoặc Admin khác**
*   **Tình huống:** Một Admin (có thể bị chiếm quyền) cố tình khóa tài khoản của các Admin khác hoặc chính mình.
*   **Unhappy Path:** `AccountService` phải kiểm tra target Role. Không được phép Ban người có Role `ADMIN` trừ khi có quyền `SUPER_ADMIN` (nếu có).

### **SC-12: Xử lý báo cáo (Report) mâu thuẫn**
*   **Tình huống:** Hai Admin cùng xử lý một `UserReport` tại một thời điểm.
*   **Unhappy Path:** Sử dụng Optimistic Locking hoặc kiểm tra status của Report. Nếu đã là `HANDLED`, Admin thứ hai sẽ nhận thông báo lỗi "Báo cáo này đã được xử lý".

---

## 7. ⚙️ SYSTEM EDGE CASES

### **SC-13: Race Condition khi hết hạn Job**
*   **Tình huống:** Đúng thời điểm Scheduler đang chạy để chuyển Job sang `EXPIRED` thì có ứng viên nhấn `Apply`.
*   **Unhappy Path:** Sử dụng `@Transactional` với Isolation Level phù hợp và chặn `Apply` nếu Job đã sang trạng thái `EXPIRED` trong DB.

### **SC-14: Token Theft (Chiếm đoạt Refresh Token)**
*   **Tình huống:** Kẻ tấn công lấy được Refresh Token và cố gắng lấy Access Token mới.
*   **Unhappy Path:** Hệ thống sử dụng **Refresh Token Rotation**. Mỗi lần dùng Refresh Token sẽ sinh ra cặp mới và vô hiệu hóa cái cũ. Nếu Refresh Token cũ được dùng lại, hệ thống nghi ngờ bị chiếm đoạt và thu hồi toàn bộ phiên đăng nhập của User đó.
