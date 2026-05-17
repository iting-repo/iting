import React, { useState, useEffect } from 'react';
import SEO from '../../components/common/SEO';
import axiosInstance from '../../utils/axiosInstance';

const PrivacyPage = () => {
  const [apiContent, setApiContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axiosInstance.get('/public/pages/privacy');
        if (res && res.content) setApiContent(res);
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchContent();
  }, []);

  const title = apiContent?.title || 'Chính sách bảo mật';
  const desc = apiContent?.metaDescription || 'Chính sách bảo mật dữ liệu cá nhân của ITing — tuân thủ Nghị định 13/2023/NĐ-CP.';

  return (
    <>
      <SEO title={title} description={desc} canonical="https://iting.vn/privacy" />
      <article className="mx-auto max-w-3xl px-4 py-12 text-slate-800 leading-relaxed">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
          </div>
        ) : apiContent?.content ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-sm text-slate-500 mb-8">
              Cập nhật lần cuối: {apiContent.publishedAt ? new Date(apiContent.publishedAt).toLocaleDateString('vi-VN') : new Date().toISOString().split('T')[0]}
            </p>
            <div dangerouslySetInnerHTML={{ __html: apiContent.content }} />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Chính sách bảo mật</h1>
            <p className="text-sm text-slate-500 mb-8">Cập nhật lần cuối: 01/07/2025 · Phiên bản 2.0</p>

            <section className="mb-6">
              <p>Chính sách bảo mật này được xây dựng phù hợp với <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân (hiệu lực 01/07/2023), <strong>Luật An ninh mạng 2018</strong> (Luật số 24/2018/QH14), và <strong>Nghị định 53/2022/NĐ-CP</strong> hướng dẫn Luật An ninh mạng.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 1. Phạm vi áp dụng</h2>
              <p>Chính sách này áp dụng cho mọi cá nhân, tổ chức truy cập và sử dụng nền tảng ITing (<code className="bg-slate-100 px-1 rounded text-sm">iting.vn</code>), bao gồm Ứng viên (Candidate), Nhà tuyển dụng (Employer/HR) và Quản trị viên. ITing đóng vai trò <strong>Bên Kiểm soát dữ liệu cá nhân</strong> theo Điều 2 Nghị định 13/2023/NĐ-CP.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 2. Dữ liệu cá nhân được thu thập</h2>
              <p className="mb-3 font-medium">2.1. Dữ liệu cá nhân cơ bản (theo Khoản 3 Điều 2 NĐ 13/2023):</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Họ tên, ngày sinh, giới tính, địa chỉ email, số điện thoại, ảnh đại diện.</li>
                <li>Dữ liệu tài khoản: tên đăng nhập, thời gian sử dụng dịch vụ, địa chỉ IP đăng nhập/đăng xuất.</li>
              </ul>
              <p className="mb-3 font-medium">2.2. Dữ liệu hồ sơ nghề nghiệp:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>CV (PDF), kỹ năng, kinh nghiệm làm việc, học vấn, chứng chỉ, liên kết mạng xã hội.</li>
                <li>Lịch sử tìm kiếm, xem việc làm, ứng tuyển, lưu tin, theo dõi công ty.</li>
              </ul>
              <p className="mb-3 font-medium">2.3. Dữ liệu của Nhà tuyển dụng:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Thông tin công ty: tên, địa chỉ, giấy phép kinh doanh, mã số thuế, logo.</li>
              </ul>
              <p className="mb-3 font-medium">2.4. Dữ liệu kỹ thuật tự động thu thập:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Địa chỉ IP, user-agent trình duyệt, thời gian truy cập, cookie phiên đăng nhập.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 3. Mục đích xử lý dữ liệu</h2>
              <p className="mb-3">Theo Điều 3 và Điều 11 Nghị định 13/2023/NĐ-CP, ITing xử lý dữ liệu cá nhân cho các mục đích:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Cung cấp dịch vụ kết nối tuyển dụng IT giữa Ứng viên và Nhà tuyển dụng.</li>
                <li>Đề xuất việc làm phù hợp dựa trên thuật toán AI (recommendation engine).</li>
                <li>Gửi thông báo email/web về việc làm phù hợp (khi Người dùng bật tính năng).</li>
                <li>Phân tích tổng hợp ẩn danh (anonymized) để cải thiện chất lượng dịch vụ.</li>
                <li>Xác minh danh tính Nhà tuyển dụng (KYB — Know Your Business).</li>
                <li>Tuân thủ yêu cầu pháp lý của cơ quan nhà nước có thẩm quyền.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 4. Cơ sở pháp lý xử lý dữ liệu</h2>
              <p className="mb-3">ITing xử lý dữ liệu dựa trên các cơ sở pháp lý theo Điều 11 NĐ 13/2023/NĐ-CP:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Sự đồng ý:</strong> Người dùng đồng ý khi đăng ký tài khoản và chấp nhận Điều khoản sử dụng.</li>
                <li><strong>Thực hiện hợp đồng:</strong> Xử lý dữ liệu cần thiết để cung cấp dịch vụ theo thỏa thuận.</li>
                <li><strong>Nghĩa vụ pháp lý:</strong> Tuân thủ yêu cầu từ cơ quan nhà nước có thẩm quyền.</li>
                <li><strong>Lợi ích hợp pháp:</strong> Ngăn chặn gian lận, bảo vệ an ninh hệ thống.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 5. Chia sẻ dữ liệu với bên thứ ba</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>ITing <strong>KHÔNG bán</strong> dữ liệu cá nhân của Người dùng cho bất kỳ bên thứ ba nào.</li>
                <li>Dữ liệu chỉ được chia sẻ trong các trường hợp sau:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Khi Ứng viên chủ động <strong>ứng tuyển</strong>: CV và thông tin hồ sơ được gửi cho Nhà tuyển dụng tương ứng.</li>
                    <li>Nhà cung cấp dịch vụ hạ tầng trong phạm vi vận hành, có ràng buộc bảo mật theo hợp đồng.</li>
                    <li>Theo yêu cầu bằng văn bản của <strong>cơ quan nhà nước có thẩm quyền</strong> (Bộ Công an, Tòa án) theo quy định pháp luật.</li>
                  </ul>
                </li>
                <li>Khi chuyển dữ liệu ra nước ngoài, ITing thực hiện <strong>đánh giá tác động</strong> theo Điều 25 NĐ 13/2023/NĐ-CP và thông báo cho Cục An ninh mạng — Bộ Công an.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 6. Quyền của chủ thể dữ liệu</h2>
              <p className="mb-3">Theo Điều 9 Nghị định 13/2023/NĐ-CP, Người dùng có các quyền sau:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Quyền được biết</strong> (Khoản 1): được thông báo về việc xử lý dữ liệu cá nhân, bao gồm loại dữ liệu, mục đích, phương thức xử lý.</li>
                <li><strong>Quyền đồng ý / rút lại đồng ý</strong> (Khoản 2–3): có quyền rút lại sự đồng ý bất kỳ lúc nào bằng cách liên hệ ITing.</li>
                <li><strong>Quyền truy cập</strong> (Khoản 4): yêu cầu cung cấp bản sao dữ liệu cá nhân đang được xử lý.</li>
                <li><strong>Quyền chỉnh sửa</strong> (Khoản 6): cập nhật, sửa đổi dữ liệu cá nhân không chính xác qua phần Cài đặt tài khoản.</li>
                <li><strong>Quyền xóa dữ liệu</strong> (Khoản 5): yêu cầu xóa dữ liệu cá nhân khi không còn cần thiết cho mục đích thu thập.</li>
                <li><strong>Quyền hạn chế xử lý</strong> (Khoản 7): yêu cầu hạn chế việc xử lý trong một số trường hợp cụ thể.</li>
                <li><strong>Quyền phản đối xử lý</strong> (Khoản 8): từ chối nhận email thông báo, gợi ý việc làm.</li>
                <li><strong>Quyền khiếu nại, tố cáo</strong> (Khoản 10): khiếu nại đến ITing hoặc Cục An toàn thông tin mạng quốc gia.</li>
              </ul>
              <p className="mt-3">ITing phản hồi yêu cầu của chủ thể dữ liệu trong vòng <strong>72 giờ</strong> kể từ khi nhận được yêu cầu hợp lệ (theo Điều 14 NĐ 13/2023/NĐ-CP).</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 7. Biện pháp bảo mật</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mật khẩu của bạn được <strong>mã hóa an toàn</strong> theo tiêu chuẩn bảo mật cao. ITing không lưu trữ và không thể xem được mật khẩu gốc của bạn.</li>
                <li>Phiên đăng nhập được bảo vệ bằng hệ thống xác thực hiện đại, thời hạn phiên tối đa <strong>7 ngày</strong>. Sau đó bạn cần đăng nhập lại.</li>
                <li>Mọi kết nối giữa bạn và ITing đều được <strong>mã hóa toàn bộ</strong>, đảm bảo thông tin không bị đánh cắp trên đường truyền.</li>
                <li>Hệ thống được trang bị nhiều lớp bảo vệ chống các hình thức <strong>tấn công mạng phổ biến</strong>.</li>
                <li>Mỗi tài khoản chỉ được truy cập đúng phạm vi quyền hạn được cấp, theo nguyên tắc <strong>quyền tối thiểu</strong>.</li>
                <li>ITing ghi nhận lịch sử truy cập và hành vi bất thường để <strong>phát hiện sớm</strong> các xâm nhập trái phép.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 8. Lưu trữ dữ liệu</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>Địa điểm lưu trữ:</strong> Dữ liệu cá nhân của người dùng Việt Nam được lưu trữ tại Việt Nam, tuân thủ Khoản 3 Điều 26 Luật An ninh mạng 2018 và Nghị định 53/2022/NĐ-CP.</li>
                <li><strong>Thời hạn lưu trữ:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Dữ liệu tài khoản hoạt động: lưu trữ trong suốt thời gian sử dụng dịch vụ.</li>
                    <li>Dữ liệu tài khoản đã xóa: xóa trong vòng <strong>30 ngày</strong>, trừ dữ liệu cần lưu theo yêu cầu pháp luật (tối đa 24 tháng theo NĐ 53/2022/NĐ-CP).</li>
                    <li>Nhật ký hoạt động hệ thống: lưu tối đa <strong>12 tháng</strong> cho mục đích bảo mật và kiểm toán.</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 9. Cookie</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>Cookie cần thiết:</strong> duy trì phiên đăng nhập của bạn, không thể tắt vì ảnh hưởng đến chức năng cơ bản.</li>
                <li><strong>Cookie phân tích:</strong> theo dõi lượt xem trang, hành vi sử dụng (ẩn danh) để cải thiện trải nghiệm. Người dùng có quyền từ chối qua thông báo cookie.</li>
                <li>ITing <strong>KHÔNG sử dụng</strong> cookie theo dõi quảng cáo của bên thứ ba.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 10. Sửa đổi chính sách</h2>
              <p>ITing có quyền cập nhật Chính sách bảo mật này. Phiên bản mới sẽ được thông báo qua email và hiển thị trên Nền tảng ít nhất <strong>07 ngày</strong> trước khi có hiệu lực.</p>
            </section>

            <section className="mb-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h2 className="text-xl font-semibold mb-3">Liên hệ về bảo mật dữ liệu</h2>
              <p className="mb-1"><strong>Bộ phận Bảo vệ dữ liệu — ITing</strong></p>
              <p className="mb-1">Email: <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a></p>
              <p className="mb-1">Website: <a href="https://iting.vn" className="text-blue-600 underline">https://iting.vn</a></p>
              <p className="mt-3 text-sm text-slate-500">Cơ quan tiếp nhận khiếu nại: <strong>Cục An toàn thông tin mạng quốc gia</strong> — Bộ Thông tin và Truyền thông.</p>
            </section>
          </>
        )}
      </article>
    </>
  );
};

export default PrivacyPage;
