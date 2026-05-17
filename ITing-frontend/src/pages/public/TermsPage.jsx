import React, { useState, useEffect } from 'react';
import SEO from '../../components/common/SEO';
import axiosInstance from '../../utils/axiosInstance';

const TermsPage = () => {
  const [apiContent, setApiContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axiosInstance.get('/public/pages/terms');
        if (res && res.content) {
          setApiContent(res);
        }
      } catch {
        // API chưa có → dùng nội dung mặc định bên dưới
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const title = apiContent?.title || 'Điều khoản sử dụng';
  const description = apiContent?.metaDescription || 'Điều khoản sử dụng dịch vụ ITing — nền tảng tuyển dụng IT hàng đầu Việt Nam.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical="https://iting.vn/terms"
      />
      <article className="mx-auto max-w-3xl px-4 py-12 text-slate-800 leading-relaxed">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
          </div>
        ) : apiContent?.content ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-sm text-slate-500 mb-8">
              Cập nhật lần cuối: {apiContent.publishedAt
                ? new Date(apiContent.publishedAt).toLocaleDateString('vi-VN')
                : new Date().toISOString().split('T')[0]}
            </p>
            <div dangerouslySetInnerHTML={{ __html: apiContent.content }} />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Điều khoản sử dụng</h1>
            <p className="text-sm text-slate-500 mb-8">Cập nhật lần cuối: 01/07/2025 · Phiên bản 2.0</p>

            {/* ── GIỚI THIỆU ── */}
            <section className="mb-8">
              <p className="mb-4">
                Chào mừng bạn đến với <strong>ITing</strong> — nền tảng tuyển dụng công nghệ thông tin trực tuyến
                tại địa chỉ <code className="bg-slate-100 px-1 rounded text-sm">iting.vn</code>.
                Bằng việc truy cập, đăng ký và sử dụng dịch vụ của ITing, bạn xác nhận đã đọc, hiểu và đồng ý
                tuân thủ toàn bộ các điều khoản dưới đây.
              </p>
              <p>
                Điều khoản này được xây dựng phù hợp với <strong>Bộ luật Dân sự 2015</strong> (Luật số 91/2015/QH13),{' '}
                <strong>Luật Giao dịch điện tử 2023</strong> (Luật số 20/2023/QH15),{' '}
                <strong>Nghị định 52/2013/NĐ-CP</strong> (sửa đổi bởi Nghị định 85/2021/NĐ-CP) về thương mại điện tử,
                và các văn bản pháp luật liên quan hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
              </p>
            </section>

            {/* ── ĐIỀU 1 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 1. Định nghĩa</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Nền tảng"</strong>: website iting.vn và các ứng dụng di động liên quan do ITing vận hành.</li>
                <li><strong>"Người dùng"</strong>: cá nhân hoặc tổ chức đăng ký tài khoản trên Nền tảng, bao gồm Ứng viên (Candidate) và Nhà tuyển dụng (Employer).</li>
                <li><strong>"Ứng viên"</strong>: người tìm kiếm việc làm trong lĩnh vực CNTT thông qua Nền tảng.</li>
                <li><strong>"Nhà tuyển dụng"</strong>: tổ chức, doanh nghiệp đăng tin tuyển dụng và tìm kiếm ứng viên trên Nền tảng.</li>
                <li><strong>"Nội dung"</strong>: mọi thông tin, dữ liệu, văn bản, hình ảnh, CV do Người dùng đăng tải lên Nền tảng.</li>
                <li><strong>"Dịch vụ"</strong>: các chức năng kết nối tuyển dụng, tư vấn việc làm, gợi ý việc làm phù hợp, và các tiện ích liên quan mà ITing cung cấp.</li>
              </ul>
            </section>

            {/* ── ĐIỀU 2 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 2. Đối tượng và phạm vi áp dụng</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Điều khoản này áp dụng cho mọi cá nhân, tổ chức truy cập và sử dụng Nền tảng tại lãnh thổ Việt Nam.</li>
                <li>Người dùng phải đủ <strong>18 tuổi trở lên</strong> và có năng lực hành vi dân sự đầy đủ theo Điều 20–22 Bộ luật Dân sự 2015. Đối với người từ 15–17 tuổi: phải có sự đồng ý bằng văn bản của cha, mẹ hoặc người giám hộ.</li>
                <li>Nhà tuyển dụng phải là tổ chức có <strong>Giấy chứng nhận đăng ký doanh nghiệp</strong> hoặc giấy phép hoạt động hợp lệ theo pháp luật Việt Nam.</li>
                <li>Mỗi cá nhân chỉ được đăng ký <strong>01 (một) tài khoản</strong> duy nhất với 01 địa chỉ email.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 3 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 3. Đăng ký tài khoản và bảo mật</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Người dùng phải cung cấp thông tin <strong>chính xác, đầy đủ và cập nhật</strong> khi đăng ký. Việc cung cấp thông tin sai lệch có thể dẫn đến khóa hoặc xóa tài khoản theo Điều 9.</li>
                <li>Mật khẩu của bạn được <strong>mã hóa an toàn</strong> theo tiêu chuẩn bảo mật cao. ITing không lưu trữ và không thể xem được mật khẩu gốc của bạn.</li>
                <li>Người dùng <strong>tự chịu trách nhiệm bảo mật</strong> tài khoản và mật khẩu. Mọi hoạt động phát sinh từ tài khoản đều được coi là hành vi của chủ tài khoản.</li>
                <li>Khi phát hiện truy cập trái phép, Người dùng phải thông báo ngay cho ITing qua email{' '}
                  <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a>.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 4 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 4. Quyền và nghĩa vụ của Ứng viên</h2>
              <p className="mb-3 font-medium">4.1. Quyền:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Tìm kiếm, xem và ứng tuyển các vị trí việc làm IT trên Nền tảng.</li>
                <li>Tạo, chỉnh sửa, tải lên và quản lý hồ sơ cá nhân, CV.</li>
                <li>Nhận gợi ý việc làm phù hợp dựa trên hệ thống phân tích thông minh của ITing.</li>
                <li>Thực hiện các quyền về dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (xem Chính sách Bảo mật).</li>
              </ul>
              <p className="mb-3 font-medium">4.2. Nghĩa vụ:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cung cấp thông tin <strong>trung thực</strong> trong hồ sơ và CV. Nghiêm cấm giả mạo bằng cấp, chứng chỉ, kinh nghiệm.</li>
                <li>Tôn trọng Nhà tuyển dụng — phản hồi lịch sự khi được liên hệ phỏng vấn.</li>
                <li>Không sử dụng Nền tảng vào mục đích lừa đảo, quấy rối hoặc vi phạm pháp luật.</li>
              </ul>
            </section>

            {/* ── ĐIỀU 5 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 5. Quyền và nghĩa vụ của Nhà tuyển dụng</h2>
              <p className="mb-3 font-medium">5.1. Quyền:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Đăng tin tuyển dụng, tìm kiếm và quản lý hồ sơ ứng viên.</li>
                <li>Sử dụng các công cụ quản lý hồ sơ ứng viên và quy trình tuyển dụng trên Nền tảng.</li>
              </ul>
              <p className="mb-3 font-medium">5.2. Nghĩa vụ:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cung cấp đầy đủ <strong>Giấy phép kinh doanh, mã số thuế</strong> khi tạo hồ sơ công ty để xác minh danh tính doanh nghiệp.</li>
                <li>Đăng tin tuyển dụng <strong>chính xác</strong>: mức lương, địa điểm, mô tả công việc phải phản ánh đúng thực tế.</li>
                <li>Tuân thủ <strong>Điều 8 Bộ luật Lao động 2019</strong> (Luật số 45/2019/QH14): nghiêm cấm phân biệt đối xử dựa trên giới tính, độ tuổi, dân tộc, tôn giáo, tình trạng hôn nhân, khuyết tật, tình trạng thai sản, nguồn gốc xã hội trong nội dung tuyển dụng.</li>
                <li>Phản hồi đơn ứng tuyển trong vòng tối đa <strong>30 ngày</strong> làm việc.</li>
                <li><strong>Không thu phí</strong> ứng viên dưới bất kỳ hình thức nào (theo Khoản 1 Điều 11 Bộ luật Lao động 2019).</li>
                <li>Không tiết lộ thông tin ứng viên cho bên thứ ba khi chưa được sự đồng ý rõ ràng của ứng viên (theo Nghị định 13/2023/NĐ-CP).</li>
                <li>Tuân thủ <strong>Luật Việc làm 2013</strong> (Luật số 38/2013/QH13) về hoạt động dịch vụ việc làm (Chương V, Điều 37–41).</li>
              </ul>
            </section>

            {/* ── ĐIỀU 6 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 6. Các hành vi bị nghiêm cấm</h2>
              <p className="mb-3">Người dùng không được thực hiện các hành vi sau trên Nền tảng:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Đăng tin tuyển dụng <strong>giả mạo, lừa đảo, đa cấp</strong> hoặc có dấu hiệu vi phạm pháp luật.</li>
                <li>Phân biệt đối xử trong tuyển dụng theo quy định tại <strong>Khoản 8 Điều 3 và Điều 8 Bộ luật Lao động 2019</strong>.</li>
                <li>Đăng nội dung vi phạm <strong>Luật An ninh mạng 2018</strong> (Luật số 24/2018/QH14): thông tin chống Nhà nước, kích động bạo lực, nội dung đồi trụy, xâm phạm quyền và lợi ích hợp pháp của tổ chức, cá nhân.</li>
                <li>Sử dụng <strong>nhiều tài khoản</strong> hoặc phần mềm tự động để gửi tin rác, thu thập dữ liệu trái phép.</li>
                <li>Cố gắng truy cập trái phép hoặc phá hoại hệ thống an ninh của Nền tảng.</li>
                <li>Tải lên nội dung vi phạm <strong>quyền sở hữu trí tuệ</strong> theo Luật Sở hữu trí tuệ 2005 (sửa đổi 2022).</li>
                <li>Liên hệ ứng viên ngoài Nền tảng để tránh nghĩa vụ thuế/báo cáo hoặc thực hiện hành vi bất hợp pháp.</li>
                <li>Thu phí ứng viên dưới bất kỳ hình thức nào thông qua Nền tảng.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 7 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 7. Quyền sở hữu trí tuệ</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Tên thương hiệu "ITing", logo, giao diện, hệ thống gợi ý việc làm và toàn bộ tài sản trí tuệ trên Nền tảng thuộc quyền sở hữu của ITing, được bảo hộ theo <strong>Luật Sở hữu trí tuệ 2005</strong> (sửa đổi, bổ sung 2009, 2019, 2022).</li>
                <li>Nội dung do Người dùng đăng tải (CV, tin tuyển dụng, bài đăng) thuộc quyền sở hữu của người tạo. Tuy nhiên, khi đăng tải lên Nền tảng, Người dùng <strong>cấp cho ITing quyền sử dụng không độc quyền</strong>, không giới hạn thời gian để hiển thị, phân phối và phân tích tổng hợp (ẩn danh) phục vụ cải thiện dịch vụ.</li>
                <li>Quyền sử dụng nêu tại Khoản 2 tự động chấm dứt khi Người dùng xóa nội dung hoặc xóa tài khoản.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 8 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 8. Giới hạn trách nhiệm</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>ITing hoạt động với tư cách <strong>nền tảng trung gian kết nối</strong> (theo Nghị định 52/2013/NĐ-CP về sàn giao dịch thương mại điện tử), không phải bên tuyển dụng hoặc bên được tuyển dụng.</li>
                <li>ITing <strong>không chịu trách nhiệm</strong> về:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Tính chính xác của thông tin do Người dùng đăng tải;</li>
                    <li>Tranh chấp lao động phát sinh giữa Ứng viên và Nhà tuyển dụng;</li>
                    <li>Thiệt hại do Người dùng vi phạm điều khoản sử dụng hoặc pháp luật.</li>
                  </ul>
                </li>
                <li>Người dùng có trách nhiệm <strong>tự xác minh</strong> thông tin trước khi ra quyết định tuyển dụng hoặc ứng tuyển.</li>
                <li>Trong mọi trường hợp, tổng mức bồi thường của ITing (nếu có) không vượt quá số tiền dịch vụ mà Người dùng đã thanh toán cho ITing trong 12 tháng gần nhất.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 9 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 9. Tạm khóa và chấm dứt tài khoản</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>ITing có quyền <strong>tạm khóa</strong> tài khoản trong vòng 72 giờ để điều tra khi phát hiện dấu hiệu vi phạm.</li>
                <li>ITing có quyền <strong>xóa vĩnh viễn</strong> tài khoản vi phạm nghiêm trọng các điều khoản tại Điều 6 mà không cần thông báo trước.</li>
                <li>Người dùng có quyền yêu cầu <strong>xóa tài khoản</strong> bất kỳ lúc nào bằng cách:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Sử dụng chức năng xóa tài khoản trong phần Cài đặt; hoặc</li>
                    <li>Gửi yêu cầu qua email <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a>.</li>
                  </ul>
                </li>
                <li>Khi tài khoản bị xóa, ITing sẽ xóa dữ liệu cá nhân theo quy định tại Điều 16 Nghị định 13/2023/NĐ-CP, trừ trường hợp pháp luật yêu cầu lưu trữ.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 10 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 10. Cơ chế giải quyết tranh chấp</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Mọi tranh chấp phát sinh được ưu tiên giải quyết bằng <strong>thương lượng</strong> trực tiếp giữa các bên.</li>
                <li>Nếu thương lượng không thành, tranh chấp sẽ được giải quyết bằng <strong>hòa giải</strong> thông qua cơ chế hòa giải trực tuyến của Nền tảng hoặc tổ chức hòa giải thương mại theo Nghị định 22/2017/NĐ-CP.</li>
                <li>Trường hợp hòa giải không thành, tranh chấp sẽ được đưa ra giải quyết tại <strong>Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh</strong>, theo quy định của Bộ luật Tố tụng dân sự 2015.</li>
                <li>ITing hỗ trợ Người dùng <strong>khiếu nại</strong> qua kênh:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Email: <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a></li>
                    <li>Thời hạn phản hồi: tối đa <strong>05 ngày làm việc</strong> kể từ khi nhận được khiếu nại.</li>
                  </ul>
                </li>
              </ol>
            </section>

            {/* ── ĐIỀU 11 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 11. Bảo vệ dữ liệu cá nhân</h2>
              <p>
                ITing cam kết bảo vệ dữ liệu cá nhân của Người dùng theo <strong>Nghị định 13/2023/NĐ-CP</strong>{' '}
                về bảo vệ dữ liệu cá nhân (có hiệu lực từ 01/07/2023). Chi tiết về việc thu thập, xử lý, lưu trữ
                và quyền của chủ thể dữ liệu được quy định tại{' '}
                <a href="/privacy" className="text-blue-600 underline">Chính sách Bảo mật</a>.
              </p>
            </section>

            {/* ── ĐIỀU 12 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 12. Sửa đổi điều khoản</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>ITing có quyền cập nhật, sửa đổi Điều khoản sử dụng này vào bất kỳ thời điểm nào.</li>
                <li>Phiên bản cập nhật sẽ được thông báo qua <strong>email đăng ký</strong> và <strong>banner trên Nền tảng</strong> ít nhất <strong>07 ngày</strong> trước khi có hiệu lực.</li>
                <li>Việc tiếp tục sử dụng Nền tảng sau khi Điều khoản sửa đổi có hiệu lực được coi là sự chấp nhận của Người dùng đối với phiên bản mới.</li>
              </ol>
            </section>

            {/* ── ĐIỀU 13 ── */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Điều 13. Luật áp dụng</h2>
              <p>
                Điều khoản này được điều chỉnh và giải thích theo pháp luật nước <strong>Cộng hòa Xã hội Chủ nghĩa
                Việt Nam</strong>, bao gồm nhưng không giới hạn:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-3">
                <li>Bộ luật Dân sự 2015 (Luật số 91/2015/QH13)</li>
                <li>Bộ luật Lao động 2019 (Luật số 45/2019/QH14)</li>
                <li>Luật Việc làm 2013 (Luật số 38/2013/QH13)</li>
                <li>Luật Giao dịch điện tử 2023 (Luật số 20/2023/QH15)</li>
                <li>Luật An ninh mạng 2018 (Luật số 24/2018/QH14)</li>
                <li>Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân</li>
                <li>Nghị định 52/2013/NĐ-CP (sửa đổi bởi NĐ 85/2021/NĐ-CP) về thương mại điện tử</li>
              </ul>
            </section>

            {/* ── THÔNG TIN LIÊN HỆ ── */}
            <section className="mb-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h2 className="text-xl font-semibold mb-3">Thông tin liên hệ</h2>
              <p className="mb-1"><strong>Nền tảng tuyển dụng IT — ITing</strong></p>
              <p className="mb-1">Email: <a href="mailto:support@iting.vn" className="text-blue-600 underline">support@iting.vn</a></p>
              <p className="mb-1">Website: <a href="https://iting.vn" className="text-blue-600 underline">https://iting.vn</a></p>
            </section>
          </>
        )}
      </article>
    </>
  );
};

export default TermsPage;
