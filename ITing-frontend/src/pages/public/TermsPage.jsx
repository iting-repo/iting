import React from 'react';
import SEO from '../../components/common/SEO';

const TermsPage = () => {
  return (
    <>
      <SEO
        title="Điều khoản sử dụng"
        description="Điều khoản sử dụng dịch vụ ITing — nền tảng tuyển dụng IT."
        canonical="https://iting.vn/terms"
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-slate-800 leading-relaxed">
        <h1 className="text-3xl font-bold mb-2">Điều khoản sử dụng</h1>
        <p className="text-sm text-slate-500 mb-8">Cập nhật lần cuối: 2026-05-11</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Chấp nhận điều khoản</h2>
          <p>
            Khi đăng ký và sử dụng dịch vụ ITing, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ
            các điều khoản dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Đối tượng sử dụng</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Người dùng <strong>≥ 16 tuổi</strong> tại Việt Nam hoặc nơi cho phép.</li>
            <li>Tổ chức/doanh nghiệp có giấy phép kinh doanh hợp lệ (đối với tài khoản HR).</li>
            <li>1 cá nhân chỉ được tạo 1 tài khoản với 1 email duy nhất.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Hành vi bị cấm</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Đăng tin tuyển dụng giả mạo, lừa đảo, đa cấp.</li>
            <li>Phân biệt đối xử (giới tính, tuổi, dân tộc, tôn giáo) trong tin tuyển dụng.</li>
            <li>Sử dụng nhiều tài khoản, dùng bot để spam, scrape data.</li>
            <li>Tải lên nội dung vi phạm pháp luật, bản quyền, hoặc thuần phong mỹ tục.</li>
            <li>Cố gắng truy cập trái phép, tấn công bảo mật hệ thống.</li>
            <li>Liên hệ ứng viên ngoài luồng để tránh nghĩa vụ thuế/báo cáo.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Nghĩa vụ của HR/Nhà tuyển dụng</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cung cấp đầy đủ giấy phép kinh doanh + mã số thuế khi tạo company profile.</li>
            <li>Đăng đúng tin (mức lương, địa điểm, JD chính xác).</li>
            <li>Phản hồi đơn ứng tuyển trong vòng tối đa 30 ngày.</li>
            <li>Không thu phí ứng viên dưới bất kỳ hình thức nào.</li>
            <li>Không tiết lộ thông tin ứng viên cho bên thứ ba khi chưa được đồng ý.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Nghĩa vụ của Ứng viên</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cung cấp thông tin trung thực trong CV và hồ sơ.</li>
            <li>Tự bảo vệ tài khoản, không chia sẻ mật khẩu.</li>
            <li>Tôn trọng nhà tuyển dụng — trả lời lịch sự khi được liên hệ.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Quyền sở hữu trí tuệ</h2>
          <p>
            Logo, giao diện, source code, thuật toán recommendation thuộc bản quyền của ITing.
            Nội dung do người dùng đăng (CV, tin tuyển dụng) thuộc về người tạo, nhưng cho ITing quyền
            sử dụng để hiển thị trên nền tảng và phân tích tổng hợp (anonymous).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Giới hạn trách nhiệm</h2>
          <p>
            ITing là <strong>nền tảng kết nối</strong>, không phải bên tuyển dụng/được tuyển. ITing không
            chịu trách nhiệm về tranh chấp lao động giữa ứng viên — nhà tuyển dụng. Người dùng tự xác minh
            thông tin trước khi quyết định.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Chấm dứt dịch vụ</h2>
          <p>
            ITing có quyền tạm khóa hoặc xóa tài khoản vi phạm các điều khoản trên. Người dùng có thể
            yêu cầu xóa tài khoản qua email <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Sửa đổi điều khoản</h2>
          <p>
            ITing có quyền cập nhật điều khoản. Phiên bản mới sẽ được thông báo qua email + banner 7 ngày
            trước khi có hiệu lực.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Luật áp dụng</h2>
          <p>
            Điều khoản này tuân theo pháp luật Việt Nam. Mọi tranh chấp được giải quyết tại
            Tòa án có thẩm quyền tại TP. Hồ Chí Minh.
          </p>
        </section>
      </article>
    </>
  );
};

export default TermsPage;
