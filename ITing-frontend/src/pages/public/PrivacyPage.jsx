import React from 'react';
import SEO from '../../components/common/SEO';

const PrivacyPage = () => {
  return (
    <>
      <SEO
        title="Chính sách bảo mật"
        description="Chính sách bảo mật dữ liệu cá nhân của ITing — tuân thủ Nghị định 13/2023/NĐ-CP."
        canonical="https://iting.vn/privacy"
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-slate-800 leading-relaxed">
        <h1 className="text-3xl font-bold mb-2">Chính sách bảo mật</h1>
        <p className="text-sm text-slate-500 mb-8">Cập nhật lần cuối: 2026-05-11</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Phạm vi áp dụng</h2>
          <p>
            Chính sách này áp dụng cho mọi người dùng truy cập và sử dụng ITing
            (<code className="bg-slate-100 px-1 rounded">iting.vn</code>), bao gồm ứng viên (Candidate),
            nhà tuyển dụng (Employer/HR) và quản trị viên.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Dữ liệu cá nhân được thu thập</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Thông tin cơ bản:</strong> họ tên, email, số điện thoại, ảnh đại diện.</li>
            <li><strong>Thông tin hồ sơ:</strong> CV (PDF), kỹ năng, kinh nghiệm, học vấn, chứng chỉ, mạng xã hội.</li>
            <li><strong>Thông tin sử dụng:</strong> lịch sử tìm kiếm, view job, apply, save, follow company.</li>
            <li><strong>Thông tin thiết bị:</strong> địa chỉ IP, user-agent, thời gian đăng nhập.</li>
            <li><strong>Đối với HR:</strong> thông tin công ty, giấy phép kinh doanh, mã số thuế.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Mục đích sử dụng</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cung cấp dịch vụ kết nối ứng viên — nhà tuyển dụng IT.</li>
            <li>Đề xuất việc làm phù hợp dựa trên AI (recommendation engine).</li>
            <li>Gửi thông báo email/web khi có việc làm mới phù hợp (nếu bật).</li>
            <li>Phân tích tổng hợp (anonymous) để cải thiện sản phẩm.</li>
            <li>Tuân thủ yêu cầu pháp lý của cơ quan có thẩm quyền.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Chia sẻ dữ liệu với bên thứ ba</h2>
          <p>Chúng tôi KHÔNG bán dữ liệu cá nhân. ITing chỉ chia sẻ trong các trường hợp:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Khi bạn chủ động <strong>ứng tuyển</strong> → CV được gửi cho nhà tuyển dụng tương ứng.</li>
            <li>Nhà cung cấp hạ tầng (AWS, Cloudinary, Google) trong phạm vi vận hành.</li>
            <li>Theo yêu cầu hợp pháp của cơ quan nhà nước.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Quyền của bạn (theo Nghị định 13/2023/NĐ-CP)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Truy cập & sao chép</strong>: tải toàn bộ dữ liệu cá nhân — <code>GET /api/me/data-export</code>.</li>
            <li><strong>Chỉnh sửa</strong>: cập nhật profile, xóa CV, đổi mật khẩu trong Settings.</li>
            <li><strong>Xóa</strong>: gửi yêu cầu đến <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a>.</li>
            <li><strong>Phản đối xử lý</strong>: từ chối nhận email alerts trong saved searches.</li>
            <li><strong>Khiếu nại</strong>: gửi email đến địa chỉ trên hoặc Cục An toàn thông tin.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Bảo mật & lưu trữ</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mật khẩu được hash bằng BCrypt (cost ≥ 10), không lưu plain-text.</li>
            <li>Phiên đăng nhập dùng JWT + refresh token có hạn 7 ngày.</li>
            <li>HTTPS bắt buộc cho mọi kết nối (HSTS enabled).</li>
            <li>Dữ liệu lưu tại datacenter tại Việt Nam (Render/AWS Singapore region).</li>
            <li>Dữ liệu được giữ tối đa <strong>5 năm</strong> kể từ lần cuối hoạt động (sau đó tự xóa).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Cookie</h2>
          <p>Xem chi tiết tại <a href="/cookies" className="text-blue-600 underline">Chính sách Cookie</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Liên hệ</h2>
          <p>Email: <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a></p>
          <p>Hotline: 1900-xxxx</p>
        </section>
      </article>
    </>
  );
};

export default PrivacyPage;
