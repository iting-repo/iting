-- Seed Terms & Privacy pages into static_contents
-- These pages are managed by Admin via /admin/pages (StaticContent CMS)

INSERT INTO static_contents (slug, type, title, content, meta_description, meta_keywords, published, sort_order, view_count, published_at, created_at, updated_at)
VALUES
(
  'terms',
  'PAGE',
  'Điều khoản sử dụng',
  '<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">1. Chấp nhận điều khoản</h2>
  <p>Khi đăng ký và sử dụng dịch vụ ITing, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ các điều khoản dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">2. Đối tượng sử dụng</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Người dùng <strong>≥ 18 tuổi</strong> tại Việt Nam. Người từ 15–17 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ.</li>
    <li>Tổ chức/doanh nghiệp có giấy phép kinh doanh hợp lệ (đối với tài khoản Nhà tuyển dụng).</li>
    <li>Mỗi cá nhân chỉ được tạo 1 tài khoản với 1 email duy nhất.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">3. Hành vi bị cấm</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Đăng tin tuyển dụng giả mạo, lừa đảo, đa cấp.</li>
    <li>Phân biệt đối xử trong tuyển dụng (theo Điều 8 Bộ luật Lao động 2019).</li>
    <li>Sử dụng nhiều tài khoản hoặc phần mềm tự động để gửi tin rác, thu thập dữ liệu trái phép.</li>
    <li>Tải lên nội dung vi phạm pháp luật, bản quyền, hoặc thuần phong mỹ tục.</li>
    <li>Cố gắng truy cập trái phép hoặc phá hoại hệ thống an ninh của Nền tảng.</li>
    <li>Thu phí ứng viên dưới bất kỳ hình thức nào (theo Khoản 1 Điều 11 Bộ luật Lao động 2019).</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">4. Nghĩa vụ của Nhà tuyển dụng</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Cung cấp đầy đủ giấy phép kinh doanh, mã số thuế khi tạo hồ sơ công ty.</li>
    <li>Đăng tin tuyển dụng chính xác: mức lương, địa điểm, mô tả công việc phải phản ánh đúng thực tế.</li>
    <li>Phản hồi đơn ứng tuyển trong vòng tối đa 30 ngày làm việc.</li>
    <li>Không thu phí ứng viên dưới bất kỳ hình thức nào.</li>
    <li>Không tiết lộ thông tin ứng viên cho bên thứ ba khi chưa được đồng ý (theo Nghị định 13/2023/NĐ-CP).</li>
    <li>Tuân thủ Luật Việc làm 2013 (Luật số 38/2013/QH13) về hoạt động dịch vụ việc làm.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">5. Nghĩa vụ của Ứng viên</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Cung cấp thông tin trung thực trong CV và hồ sơ. Nghiêm cấm giả mạo bằng cấp, chứng chỉ.</li>
    <li>Tự bảo vệ tài khoản, không chia sẻ mật khẩu.</li>
    <li>Tôn trọng nhà tuyển dụng — phản hồi lịch sự khi được liên hệ.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">6. Quyền sở hữu trí tuệ</h2>
  <p>Thương hiệu, logo, giao diện, hệ thống gợi ý việc làm và toàn bộ tài sản trí tuệ trên Nền tảng thuộc quyền sở hữu của ITing, được bảo hộ theo Luật Sở hữu trí tuệ 2005. Nội dung do người dùng đăng tải thuộc về người tạo, nhưng cho ITing quyền sử dụng không độc quyền để hiển thị và phân tích tổng hợp (ẩn danh).</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">7. Giới hạn trách nhiệm</h2>
  <p>ITing là <strong>nền tảng trung gian kết nối</strong> (theo Nghị định 52/2013/NĐ-CP), không phải bên tuyển dụng hoặc bên được tuyển. ITing không chịu trách nhiệm về tranh chấp lao động giữa ứng viên và nhà tuyển dụng. Người dùng tự xác minh thông tin trước khi quyết định.</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">8. Chấm dứt dịch vụ</h2>
  <p>ITing có quyền tạm khóa hoặc xóa tài khoản vi phạm. Người dùng có thể yêu cầu xóa tài khoản qua phần Cài đặt hoặc email <a href="mailto:support@iting.vn" class="text-blue-600 underline">support@iting.vn</a>.</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">9. Giải quyết tranh chấp</h2>
  <p>Tranh chấp được ưu tiên giải quyết bằng thương lượng. Nếu không thành, đưa ra Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh theo Bộ luật Tố tụng dân sự 2015.</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">10. Luật áp dụng</h2>
  <p>Điều khoản này tuân theo pháp luật Việt Nam, bao gồm: Bộ luật Dân sự 2015, Bộ luật Lao động 2019, Luật Việc làm 2013, Luật Giao dịch điện tử 2023, Luật An ninh mạng 2018, Nghị định 13/2023/NĐ-CP, Nghị định 52/2013/NĐ-CP.</p>
</section>',
  'Điều khoản sử dụng dịch vụ ITing — nền tảng tuyển dụng IT hàng đầu Việt Nam.',
  'điều khoản, terms, ITing, tuyển dụng IT',
  true,
  1,
  0,
  NOW(),
  NOW(),
  NOW()
),
(
  'privacy',
  'PAGE',
  'Chính sách bảo mật',
  '<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">1. Phạm vi áp dụng</h2>
  <p>Chính sách này áp dụng cho mọi người dùng truy cập và sử dụng ITing (iting.vn), bao gồm ứng viên, nhà tuyển dụng và quản trị viên. Được xây dựng theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">2. Dữ liệu cá nhân được thu thập</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Thông tin cơ bản:</strong> họ tên, email, số điện thoại, ảnh đại diện.</li>
    <li><strong>Thông tin hồ sơ:</strong> CV, kỹ năng, kinh nghiệm, học vấn, chứng chỉ.</li>
    <li><strong>Thông tin sử dụng:</strong> lịch sử tìm kiếm, xem việc làm, ứng tuyển, lưu tin.</li>
    <li><strong>Đối với Nhà tuyển dụng:</strong> thông tin công ty, giấy phép kinh doanh, mã số thuế.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">3. Mục đích sử dụng</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Cung cấp dịch vụ kết nối ứng viên — nhà tuyển dụng IT.</li>
    <li>Đề xuất việc làm phù hợp dựa trên hệ thống phân tích thông minh.</li>
    <li>Gửi thông báo khi có việc làm mới phù hợp (nếu bật).</li>
    <li>Phân tích tổng hợp (ẩn danh) để cải thiện dịch vụ.</li>
    <li>Tuân thủ yêu cầu pháp lý của cơ quan có thẩm quyền.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">4. Chia sẻ dữ liệu với bên thứ ba</h2>
  <p>ITing <strong>KHÔNG bán</strong> dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ khi:</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li>Bạn chủ động <strong>ứng tuyển</strong> — CV được gửi cho nhà tuyển dụng tương ứng.</li>
    <li>Nhà cung cấp dịch vụ hạ tầng trong phạm vi vận hành, có ràng buộc bảo mật.</li>
    <li>Theo yêu cầu bằng văn bản của cơ quan nhà nước có thẩm quyền.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">5. Quyền của bạn (theo Nghị định 13/2023/NĐ-CP)</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Quyền được biết:</strong> được thông báo về việc xử lý dữ liệu cá nhân.</li>
    <li><strong>Quyền truy cập:</strong> yêu cầu cung cấp bản sao dữ liệu cá nhân.</li>
    <li><strong>Quyền chỉnh sửa:</strong> cập nhật thông tin qua phần Cài đặt tài khoản.</li>
    <li><strong>Quyền xóa:</strong> gửi yêu cầu đến <a href="mailto:support@iting.vn" class="text-blue-600 underline">support@iting.vn</a>.</li>
    <li><strong>Quyền phản đối:</strong> từ chối nhận email thông báo, gợi ý việc làm.</li>
    <li><strong>Quyền khiếu nại:</strong> khiếu nại đến ITing hoặc Cục An toàn thông tin mạng quốc gia.</li>
  </ul>
  <p class="mt-2">ITing phản hồi yêu cầu trong vòng <strong>72 giờ</strong> (theo Điều 14 NĐ 13/2023/NĐ-CP).</p>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">6. Biện pháp bảo mật</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Mật khẩu được <strong>mã hóa an toàn</strong> theo tiêu chuẩn bảo mật cao.</li>
    <li>Mọi kết nối đều được <strong>mã hóa toàn bộ</strong>, đảm bảo thông tin không bị đánh cắp.</li>
    <li>Hệ thống được trang bị nhiều lớp bảo vệ chống các hình thức tấn công mạng phổ biến.</li>
    <li>Mỗi tài khoản chỉ được truy cập đúng phạm vi quyền hạn được cấp.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">7. Lưu trữ dữ liệu</h2>
  <ul class="list-disc pl-6 space-y-1">
    <li>Dữ liệu được lưu trữ tại Việt Nam (theo Khoản 3 Điều 26 Luật An ninh mạng 2018).</li>
    <li>Dữ liệu tài khoản đã xóa: xóa trong 30 ngày, trừ trường hợp pháp luật yêu cầu lưu trữ.</li>
  </ul>
</section>
<section class="mb-8">
  <h2 class="text-xl font-semibold mb-3">8. Liên hệ</h2>
  <p><strong>Bộ phận Bảo vệ dữ liệu — ITing</strong></p>
  <p>Email: <a href="mailto:support@iting.vn" class="text-blue-600 underline">support@iting.vn</a></p>
  <p class="mt-2 text-sm text-slate-500">Cơ quan tiếp nhận khiếu nại: Cục An toàn thông tin mạng quốc gia — Bộ Thông tin và Truyền thông.</p>
</section>',
  'Chính sách bảo mật dữ liệu cá nhân của ITing — tuân thủ Nghị định 13/2023/NĐ-CP.',
  'chính sách bảo mật, privacy, ITing, dữ liệu cá nhân',
  true,
  2,
  0,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
