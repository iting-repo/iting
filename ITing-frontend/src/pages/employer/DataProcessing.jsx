import React, { useState } from "react";
import { Upload, AlertTriangle, FileText, CheckCircle, Download } from "lucide-react";
import { Button, Breadcrumb } from "../../components/common";
import companyService from "../../services/companyService";
import { toast } from "sonner";

const DataProcessing = () => {
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const data = await companyService.getMyCompany();
      setCompany(data);
    } catch (err) {
      console.error("Lỗi lấy thông tin công ty:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    MISSING: { label: "Chưa cập nhật", color: "bg-gray-100 text-gray-500" },
    UPLOADED: { label: "Đã tải lên", color: "bg-blue-100 text-blue-600" },
    PENDING_REVIEW: { label: "Đang chờ duyệt", color: "bg-amber-100 text-amber-600" },
    APPROVED: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-600" },
    REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-600" },
  };

  const currentStatus = statusMap[company?.documentReviewStatus] || statusMap.MISSING;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        setErrors({ file: "Dung lượng tối đa 5MB" });
        return;
      }
      const validTypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/pdf"];
      if (!validTypes.includes(f.type) && !f.name.endsWith('.docx') && !f.name.endsWith('.doc')) {
        setErrors({ file: "Định dạng cho phép: docx, doc, pdf" });
        return;
      }
      setFile(f);
      setErrors({});
    }
  };

  const handleSave = async () => {
    const errs = {};
    if (!file && !company?.consentDocumentFileUrl) errs.file = "Vui lòng chọn file để tải lên";
    if (!agreed) errs.agreed = "Vui lòng xác nhận cam đoan";
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    try {
      setSubmitting(true);

      // Nếu có file mới chọn, upload trước
      if (file) {
        await companyService.uploadConsentDocument(file, agreed);
      }

      // Gửi duyệt Thỏa thuận dữ liệu độc lập
      await companyService.submitConsentDocumentReview();
      toast.success("Văn bản thỏa thuận đã được gửi đi xét duyệt!");
      setFile(null);
      setAgreed(false);
      await fetchCompany();
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Gửi duyệt thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return (
        <div className="flex h-64 items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3AB4E6] border-t-transparent"></div>
        </div>
     );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <Breadcrumb
        rootLabel="Tổng quan"
        rootLink="/employer/dashboard"
        items={[{ label: 'Thỏa thuận dữ liệu' }]}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Thỏa thuận xử lý Dữ liệu cá nhân</h1>
        <p className="text-gray-500">Xác thực văn bản thỏa thuận xử lý dữ liệu giữa Nhà tuyển dụng và Ứng viên theo quy định pháp luật.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3AB4E6]" />
            Thỏa thuận dữ liệu cá nhân
            <span className={`ml-2 text-xs font-bold px-3 py-1 rounded-full ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            Xem mục đích sử dụng và hướng dẫn đăng tải <button className="text-[#3AB4E6] font-medium hover:underline">Tại đây</button>
          </p>
        </div>

        <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                Văn bản Thỏa thuận <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Văn bản thể hiện việc Ứng viên đồng ý cho phép Nhà tuyển dụng thu thập, lưu trữ và sử dụng dữ liệu cá nhân của Ứng viên để phục vụ mục đích tuyển dụng.
              </p>

              <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-10 text-center hover:border-[#3AB4E6]/40 transition-all group">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#3AB4E6] group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                </div>
                
                <p className="text-gray-900 font-bold mb-1">Chọn hoặc kéo file vào đây</p>
                <p className="text-xs text-gray-400 mb-5 font-medium">
                  Dung lượng tối đa 5MB, định dạng: docx, doc, pdf
                </p>
                
                <label className="inline-flex items-center px-4 py-2 bg-[#EAF6FF] text-[#3AB4E6] text-sm font-bold rounded-lg cursor-pointer hover:bg-[#3AB4E6] hover:text-white transition-all">
                  Chọn file từ máy tính
                  <input type="file" className="hidden" accept=".docx,.doc,.pdf" onChange={handleFileChange} />
                </label>

                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-bold text-sm bg-green-50 py-2 rounded-lg border border-green-100 animate-scale-up">
                    <CheckCircle className="w-4 h-4" />
                    {file.name}
                  </div>
                )}
              </div>

              {errors.file && (
                <p className="text-sm text-red-500 mt-3 flex items-center gap-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {errors.file}
                </p>
              )}

              <div className="mt-6 bg-orange-50/70 rounded-xl p-4 border border-orange-100/50">
                <p className="text-xs text-orange-700 flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-orange-500" />
                  Văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa/che/cắt thông tin
                </p>
              </div>
            </div>

            <div className="w-64 shrink-0 flex flex-col gap-4">
              <p className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-tight">Văn bản mẫu</p>
              <div className="bg-gray-100 rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center text-center gap-3">
                 <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                 </div>
                 <p className="text-xs text-gray-500 font-medium px-2">Vui lòng tải xuống bản mẫu để điền thông tin doanh nghiệp</p>
                 <Button variant="outline" className="w-full text-xs py-2 h-auto gap-2">
                   <Download className="w-3 h-3" /> Tải mẫu văn bản
                 </Button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
            <div className="relative flex items-center h-5">
              <input
                id="agree-data"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6] cursor-pointer"
              />
            </div>
            <label htmlFor="agree-data" className="text-sm text-gray-600 leading-relaxed cursor-pointer select-none">
              Tôi cam đoan văn bản này là tài liệu hợp pháp của doanh nghiệp và chịu hoàn toàn trách nhiệm về tính chính xác, hợp lệ của nội dung.
            </label>
          </div>
          {errors.agreed && (
            <p className="text-sm text-red-500 mt-2 ml-8 font-medium">
               {errors.agreed}
            </p>
          )}
        </div>

        <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
          <Button 
            onClick={handleSave} 
            disabled={submitting || company?.documentReviewStatus === 'PENDING_REVIEW'} 
            className="px-10 py-6 min-w-[200px] text-base font-bold shadow-lg shadow-blue-500/20"
          >
            {submitting
              ? "Đang xử lý..."
              : company?.documentReviewStatus === 'PENDING_REVIEW'
                ? "Đang chờ duyệt"
                : file
                  ? "Tải lên & Gửi xét duyệt"
                  : "Gửi xét duyệt"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataProcessing;
