# Module Override Instructions: Auth Service

Module này xử lý xác thực, phân quyền, token và thông tin nhạy cảm. Mọi thay đổi phải được thực hiện cẩn thận hơn mặc định của dự án.

## Bảo mật bắt buộc

- Không bao giờ in trực tiếp token, refresh token, password, OTP, API key hoặc secret ra console/log.
- Không dùng `System.out.println` để debug thông tin xác thực.
- Nếu cần log, chỉ log metadata an toàn như user id, request id hoặc thời điểm xử lý.
- Không log toàn bộ request/response body nếu có khả năng chứa thông tin nhạy cảm.
- Password phải luôn được hash bằng cơ chế bảo mật phù hợp; không lưu plain text.
- Không tự viết thuật toán mã hóa/hash nếu framework hoặc thư viện bảo mật đã cung cấp giải pháp chuẩn.

## Token và session

- Token phải có thời hạn hợp lý.
- Refresh token, nếu có, phải được lưu và kiểm tra theo cơ chế an toàn.
- Khi logout hoặc revoke token, cần đảm bảo token không còn hợp lệ theo logic hiện có của hệ thống.
- Không đưa secret signing key vào source code.

## API auth

- Response lỗi đăng nhập không nên tiết lộ chi tiết như “email tồn tại nhưng sai mật khẩu”.
- Các endpoint nhạy cảm phải kiểm tra authentication và authorization rõ ràng.
- Không bỏ qua kiểm tra quyền chỉ để làm test hoặc debug nhanh.

## Hibernate / JPA trong module auth

- Kiểm tra kỹ các câu JPQL/native query liên quan đến user, role, permission và token.
- Tránh N+1 problem khi load user kèm roles/permissions.
- Chỉ fetch dữ liệu cần thiết cho quá trình xác thực/phân quyền.
- Với query native, phải kiểm tra kỹ parameter binding để tránh SQL injection.
- Không nối chuỗi thủ công để tạo query từ input người dùng.

## Testing bắt buộc

- Thêm hoặc cập nhật test cho các luồng quan trọng:
  - Đăng nhập thành công.
  - Đăng nhập sai thông tin.
  - Token hết hạn hoặc không hợp lệ.
  - User không có quyền truy cập.
  - Logout/revoke token nếu module hỗ trợ.
- Test không được chứa secret thật, token thật hoặc password thật từ môi trường production.

## Review trước khi hoàn thành

- Kiểm tra lại toàn bộ log mới thêm vào.
- Kiểm tra không có thông tin nhạy cảm trong exception message.
- Kiểm tra các endpoint auth không vô tình public.
- Kiểm tra query có nguy cơ N+1 hoặc load thừa dữ liệu.
