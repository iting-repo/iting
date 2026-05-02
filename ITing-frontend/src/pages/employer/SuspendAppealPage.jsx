import React from 'react';
import { FaGavel, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SuspendAppealPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-screen">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-[#3AB4E6] font-medium text-sm hover:underline mb-4 inline-block"
        >
          &larr; Quay lại
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <FaGavel className="text-red-500" /> Hướng dẫn khiếu nại
        </h1>
        <p className="text-gray-500 font-medium text-lg mt-2">
          Thông tin chi tiết về chính sách đình chỉ và các bước để khiếu nại quyết định từ Ban Quản Trị ITing.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl">
        
        {/* Điều khoản */}
        <section className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            Lý do công ty có thể bị đình chỉ
          </h2>
          <ul className="list-disc pl-5 space-y-3 text-red-700 leading-relaxed text-sm">
            <li><strong>Tuyển dụng sai mục đích:</strong> Đăng tải các công việc không liên quan đến lĩnh vực Công nghệ Thông tin (IT) hoặc các ngành nghề trái phép.</li>
            <li><strong>Giả mạo thông tin:</strong> Sử dụng thông tin giả, mạo danh công ty khác hoặc không cung cấp đủ giấy phép kinh doanh hợp lệ.</li>
            <li><strong>Hành vi lừa đảo ứng viên:</strong> Thu phí ứng viên, yêu cầu nạp tiền, đa cấp hoặc có các hành vi lừa đảo được ứng viên báo cáo và xác minh.</li>
            <li><strong>Vi phạm chính sách:</strong> Đăng tải nội dung phản cảm, vi phạm pháp luật hoặc các chính sách cộng đồng của ITing.</li>
          </ul>
        </section>

        {/* Hướng dẫn khiếu nại */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quy trình nộp đơn khiếu nại
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Nếu bạn tin rằng tài khoản của công ty bị đình chỉ do sự nhầm lẫn hoặc bạn đã khắc phục xong các vi phạm, bạn có quyền gửi yêu cầu khiếu nại. Ban quản trị sẽ xem xét và phản hồi trong vòng <strong>3 - 5 ngày làm việc</strong>.
            </p>
            
            <ol className="list-decimal pl-5 space-y-4 text-gray-700 text-sm">
              <li>
                <strong>Chuẩn bị hồ sơ:</strong> Thu thập các tài liệu chứng minh, giấy phép kinh doanh hợp lệ, hoặc văn bản giải trình lý do vi phạm.
              </li>
              <li>
                <strong>Gửi email:</strong> Gửi email khiếu nại đến địa chỉ hỗ trợ chính thức của chúng tôi tại: 
                <a href="mailto:support@iting.vn" className="text-[#3AB4E6] font-bold mx-1 hover:underline">support@iting.vn</a>
              </li>
              <li>
                <strong>Tiêu đề email:</strong> Ghi rõ tiêu đề theo cú pháp: <code>[KHIẾU NẠI ĐÌNH CHỈ] - Tên Công Ty Của Bạn - Mã Số Thuế</code>
              </li>
              <li>
                <strong>Nội dung email:</strong> Trình bày rõ ràng vấn đề, lý do vì sao bạn cho rằng quyết định đình chỉ là chưa chính xác hoặc đính kèm các giấy tờ đã được cập nhật/sửa đổi.
              </li>
            </ol>
          </div>
        </section>

        {/* Cảnh báo thêm */}
        <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
          <div className="mt-1 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaEnvelope className="text-[#3AB4E6]" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Lưu ý quan trọng</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Trong thời gian chờ xử lý khiếu nại, tài khoản của bạn vẫn sẽ ở trạng thái bị đình chỉ. Tất cả tin tuyển dụng đang hoạt động sẽ được tạm ẩn. Chúng tôi sẽ thông báo kết quả cho bạn qua email ngay khi quá trình kiểm tra hoàn tất.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SuspendAppealPage;
