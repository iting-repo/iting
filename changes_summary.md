# Tổng hợp thay đổi - Form đăng công việc

## 1. ✅ Tiêu đề không cho ghi quá dài (max 150 ký tự)

**Frontend** ([PostJob.jsx](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-frontend/src/pages/employer/PostJob.jsx)):
- `maxLength={150}` trên input + block trong `handleChange` khi vượt 150
- Hiển thị bộ đếm ký tự (`0/150`), đổi đỏ khi chạm giới hạn
- Validate khi submit

**Backend**:
- `@Size(max = 150)` trên [CreateJobRequest](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-backend/src/main/java/com/iting/jobportal/job/dto/request/CreateJobRequest.java) và [UpdateJobRequest](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-backend/src/main/java/com/iting/jobportal/job/dto/request/UpdateJobRequest.java)
- Check `title.length() > 150` trong [validateJobBeforeSubmit](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-backend/src/main/java/com/iting/jobportal/job/service/impl/JobServiceImpl.java#L815-L820)

## 2. ✅ Hạn ứng tuyển không được ở quá khứ

**Frontend**:
- `min={todayStr}` trên input date → browser chặn chọn ngày quá khứ
- Validate JS khi submit: so sánh deadline với ngày hiện tại
- Border đổi đỏ khi có lỗi

**Backend**:
- `@FutureOrPresent` annotation trên `dueDate` trong cả 2 DTO
- `validateJobBeforeSubmit()`: tách riêng check null vs check `isBefore(now)`

## 3. ✅ Tỉnh/Thành phố & Phường/Xã có ô tìm kiếm

**Frontend** - Component `SearchableSelect`:
- Thay thế `<select>` thường bằng custom dropdown có ô search
- Click mở dropdown → hiện input tìm kiếm + danh sách lọc theo keyword
- Click bên ngoài tự đóng
- Hỗ trợ disabled, loading state

## 4. ✅ Ngày làm việc - Enum thay vì nhập tự do

**Frontend**:
- Dropdown 3 lựa chọn: `Thứ 2 - Thứ 6`, `Thứ 2 - Thứ 7`, `Linh động`
- Value: `MON_TO_FRI`, `MON_TO_SAT`, `FLEXIBLE`

**Backend**:
- Tạo enum [WorkingDays.java](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-backend/src/main/java/com/iting/jobportal/job/entity/enums/WorkingDays.java)
- Cập nhật [Job.java](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-backend/src/main/java/com/iting/jobportal/job/entity/Job.java) entity: `@Enumerated(EnumType.STRING) WorkingDays workingDays`
- Cập nhật cả 2 DTO request
- Migration [V41](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-backend/src/main/resources/db/migration/V41__migrate_working_days_enum.sql): chuyển đổi dữ liệu cũ

**Hiển thị** - [JobDetailPage.jsx](file:///c:/Users/Admin/Desktop/dacn/ITing/ITing-frontend/src/pages/public/JobDetailPage.jsx#L519):
- Thay hardcode "Thứ 2 - Thứ 6" → mapping động từ enum value

## 5. ✅ Lương khi nhập tách số (1.000.000 VND)

**Frontend**:
- Input type `text` thay `number`
- `formatSalaryDisplay()`: hiển thị `1.000.000` (dùng `toLocaleString("vi-VN")`)
- `parseSalaryValue()`: strip separator trước khi lưu vào state (raw number)
- `handleChange`: chỉ cho nhập số, auto format hiển thị
- Giá trị gửi lên backend vẫn là số thuần (Number)

## Files đã thay đổi

| File | Thay đổi |
|------|----------|
| `PostJob.jsx` | Title limit, working days dropdown, deadline min, searchable selects, salary format |
| `JobDetailPage.jsx` | Dynamic working days display |
| `WorkingDays.java` | **Mới** - Enum |
| `Job.java` | workingDays → WorkingDays enum |
| `CreateJobRequest.java` | @Size, @FutureOrPresent, WorkingDays |
| `UpdateJobRequest.java` | @Size, @FutureOrPresent, WorkingDays |
| `JobResponse.java` | Convert enum → String |
| `JobServiceImpl.java` | Title length + deadline validation |
| `V41__migrate_working_days_enum.sql` | **Mới** - Data migration |
