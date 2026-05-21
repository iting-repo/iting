import React, { useState } from "react";
import { Upload, AlertTriangle, FileText, CheckCircle, Download } from "lucide-react";
import { Button, Breadcrumb } from "../../components/common";
import affiliationService from "../../services/affiliationService";
import { toast } from "sonner";

const DataProcessing = () => {
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [affiliation, setAffiliation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [serverPreviewUrl, setServerPreviewUrl] = useState(null);

  React.useEffect(() => {
    fetchAffiliation();
  }, []);

  const fetchAffiliation = async () => {
    try {
      setLoading(true);
      const aff = await affiliationService.getMe().catch(() => null);
      setAffiliation(aff);
      if (aff?.submittedConsentConfirmed) setAgreed(true);
      if (aff?.submittedConsentUrl) {
        try {
          const res = await affiliationService.getConsentPresignedUrl();
          setServerPreviewUrl(res?.url || null);
        } catch (_) {}
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin affiliation:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    NONE: { label: "Chưa bắt đầu", color: "bg-gray-100 text-gray-500" },
    DRAFT: { label: "Đang soạn", color: "bg-gray-100 text-gray-500" },
    MISSING: { label: "Chưa cập nhật", color: "bg-gray-100 text-gray-500" },
    UPLOADED: { label: "Đã tải lên", color: "bg-blue-100 text-blue-600" },
    PENDING_REVIEW: { label: "Đang chờ duyệt", color: "bg-amber-100 text-amber-600" },
    APPROVED: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-600" },
    REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-600" },
  };

  const submissionState = affiliation?.submissionStatus;
  const currentStatus = statusMap[submissionState] || statusMap.MISSING;

  // Đã có file thỏa thuận trên server (HR đã upload trước đó)
  const hasUploadedConsent = Boolean(affiliation?.submittedConsentUrl);
  // Đầy đủ điều kiện gửi duyệt: có file (mới hoặc cũ) + đã tick cam đoan
  const canSubmit = (file || hasUploadedConsent) && agreed;

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
      setFilePreviewUrl(URL.createObjectURL(f));
      setErrors({});
    }
  };

  const handleSave = async () => {
    const errs = {};
    if (!file && !affiliation?.submittedConsentUrl) errs.file = "Vui lòng chọn file để tải lên";
    if (!agreed) errs.agreed = "Vui lòng xác nhận cam đoan";
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    try {
      setSubmitting(true);

      // Upload consent vào snapshot affiliation (nếu có file mới)
      if (file) {
        await affiliationService.uploadConsent(file, agreed);
      }

      // Gửi duyệt — cùng 1 endpoint với license + basic info
      await affiliationService.submitReview();
      toast.success("Đã gửi hồ sơ (gồm văn bản thỏa thuận) cho admin xét duyệt!");
      setFile(null);
      await fetchAffiliation();
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Gửi duyệt thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const activePreviewUrl = filePreviewUrl || serverPreviewUrl;
  const activeFilename = file?.name || affiliation?.submittedConsentUrl?.split('/').pop() || "";
  const isPdf = activeFilename.toLowerCase().endsWith('.pdf');

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

                {file ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-bold text-sm bg-green-50 py-2 rounded-lg border border-green-100 animate-scale-up">
                    <CheckCircle className="w-4 h-4" />
                    {file.name}
                    <span className="text-[10px] uppercase tracking-wide opacity-70 ml-1">• file mới</span>
                  </div>
                ) : hasUploadedConsent ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 py-2 rounded-lg border border-blue-100">
                    <CheckCircle className="w-4 h-4" />
                    Văn bản thỏa thuận đã tải lên
                    <span className="text-[10px] uppercase tracking-wide opacity-70 ml-1">• đã lưu trên hệ thống</span>
                  </div>
                ) : null}
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
              <p className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-tight">HƯỚNG DẪN MINH HỌA</p>
                 <a 
                   href="/[EXIMBANK] Thoa thuan bao mat và XLDL theo ND13.pdf" 
                   download 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center text-xs py-2.5 h-auto gap-2 bg-[#EAF6FF] text-[#3AB4E6] border border-[#3AB4E6]/30 rounded-lg font-bold hover:bg-[#3AB4E6] hover:text-white transition-colors"
                 >
                   <Download className="w-3 h-3" /> Xem văn bản mẫu
                 </a>
              
              {activePreviewUrl ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[3/4] relative group">
                  {isPdf ? (
                    <iframe
                      src={activePreviewUrl}
                      className="w-full h-full"
                      title="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 p-4 text-center">
                      <FileText className="w-12 h-12 text-[#3AB4E6] mb-3" />
                      <p className="text-xs text-gray-600 font-medium">Tệp định dạng Word. Bấm để tải xuống.</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a
                      href={activePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 shadow-lg"
                    >
                      Xem đầy đủ / Tải về ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl aspect-[3/4] flex flex-col items-center justify-center text-center p-4 border border-gray-200">
                  <div className="w-16 h-20 border-2 border-gray-300 rounded mb-4 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                    <div className="w-full h-2 bg-blue-500/20 mb-1"></div>
                    <div className="w-2/3 h-1 bg-gray-200 mb-1"></div>
                    <div className="w-1/2 h-1 bg-gray-200"></div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Tải lên tài liệu để xem trước tại đây</p>
                </div>
              )}
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
            disabled={submitting || submissionState === 'PENDING_REVIEW' || !canSubmit}
            title={
              submissionState === 'PENDING_REVIEW'
                ? 'Hồ sơ đang chờ admin xét duyệt'
                : !file && !hasUploadedConsent
                  ? 'Vui lòng tải lên văn bản thỏa thuận trước khi gửi duyệt'
                  : !agreed
                    ? 'Vui lòng tick xác nhận cam đoan'
                    : ''
            }
            className="px-10 py-6 min-w-[200px] text-base font-bold shadow-lg shadow-blue-500/20"
          >
            {submitting
              ? "Đang xử lý..."
              : submissionState === 'PENDING_REVIEW'
                ? "Đang chờ duyệt"
                : !file && !hasUploadedConsent
                  ? "Vui lòng upload trước"
                  : !agreed
                    ? "Tick cam đoan để gửi"
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
