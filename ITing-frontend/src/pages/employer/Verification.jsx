import React, { useState, useEffect } from "react";
import { Upload, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { Button, Breadcrumb } from "../../components/common";
import companyService from "../../services/companyService";
import affiliationService from "../../services/affiliationService";
import { toast } from "sonner";

/**
 * Phase 5 (HR ↔ Company refactor):
 *   * Bỏ radio "Giấy ủy quyền và Giấy tờ định danh" (identity flow đã bỏ ở backend).
 *   * Status hiển thị giờ đọc từ `affiliation.submissionStatus` (thay vì `company.documentReviewStatus`).
 *   * Upload license + submit review đi qua affiliationService (companyService cũng đã redirect nội bộ).
 */
const Verification = () => {
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null); // local blob preview
  const [serverPreviewUrl, setServerPreviewUrl] = useState(null); // presigned S3 URL
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState(null);
  const [affiliation, setAffiliation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);

      // Phase 5: ưu tiên đọc affiliation để biết submission status + snapshot license URL.
      const aff = await affiliationService.getMe().catch(() => null);
      setAffiliation(aff);

      const data = await companyService.getMyCompany().catch(() => null);
      setCompany(data);

      // Preview: ưu tiên license HR đã submit ở snapshot affiliation; fallback Company license.
      const licenseUrl = aff?.submittedLicenseUrl || data?.businessLicenseFileUrl;
      if (licenseUrl) {
        try {
          // affiliationService.getLicensePresignedUrl trả {url} cho license snapshot HR
          const res = aff?.submittedLicenseUrl
            ? await affiliationService.getLicensePresignedUrl()
            : await companyService.getBusinessLicensePresignedUrl();
          setServerPreviewUrl(res?.url || null);
        } catch (_) {
          // ignore - chỉ ảnh hưởng preview
        }
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin công ty:", err);
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
    APPROVED: { label: "Đã xác thực", color: "bg-emerald-100 text-emerald-600" },
    REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-600" },
  };

  // Ưu tiên submission status của affiliation (mới); fallback document status cũ của Company.
  const submissionState = affiliation?.submissionStatus || company?.documentReviewStatus;
  const currentStatus = statusMap[submissionState] || statusMap.MISSING;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        setError("Dung lượng tối đa 5MB");
        return;
      }
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(f.type)) {
        setError("Định dạng cho phép: jpeg, jpg, png, pdf");
        return;
      }
      setFile(f);
      // Tạo local preview
      setFilePreviewUrl(URL.createObjectURL(f));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file để tải lên");
      return;
    }

    try {
      setSubmitting(true);
      await companyService.uploadBusinessLicense(file);
      toast.success("Đã tải lên tài liệu thành công. Bạn có thể gửi duyệt ngay bây giờ.");
      setFile(null);
      setFilePreviewUrl(null);
      setError("");
      await fetchCompany();
    } catch (err) {
      console.error("Lỗi upload:", err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      
      // Nếu có file mới được chọn, tải lên trước
      if (file) {
        await companyService.uploadBusinessLicense(file);
        setFile(null);
        setFilePreviewUrl(null);
      }

      // Gửi duyệt GPKD độc lập
      await companyService.submitBusinessLicenseReview();
      toast.success("Giấy phép kinh doanh đã được gửi đi xét duyệt!");
      await fetchCompany();
    } catch (err) {
      console.error("Lỗi gửi duyệt:", err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Không thể gửi duyệt. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Lấy tên file từ URL S3
  const getFilenameFromUrl = (url) => {
    if (!url) return null;
    try {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1].split('?')[0]);
    } catch { return url; }
  };

  const activePreviewUrl = filePreviewUrl || serverPreviewUrl;
  const activeFilename = file?.name || getFilenameFromUrl(company?.businessLicenseFileUrl);
  const isPdf = activeFilename?.toLowerCase().endsWith('.pdf');

  if (loading) {
     return (
        <div className="flex h-64 items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3AB4E6] border-t-transparent"></div>
        </div>
     );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Breadcrumb
        rootLabel="Tổng quan"
        rootLink="/employer/dashboard"
        items={[{ label: 'Xác thực tài khoản' }]}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Xác thực tài khoản</h1>
        <p className="text-gray-500">Nâng cao độ tin cậy và mở khóa đầy đủ tính năng bằng cách xác thực doanh nghiệp của bạn.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3AB4E6]" />
            Thông tin Giấy đăng ký doanh nghiệp
            <span className={`ml-2 text-xs font-bold px-3 py-1 rounded-full ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            Vui lòng chọn phương thức đăng tải, xem hướng dẫn đăng tải{" "}
            <button className="text-[#3AB4E6] font-medium hover:underline">Tại đây</button>
          </p>
        </div>

        <div className="space-y-6">
          {/* Phase 5: bỏ radio chọn loại tài liệu — chỉ còn 1 loại (Giấy đăng ký doanh nghiệp).
              Radio "Giấy ủy quyền và Giấy tờ định danh" đã bỏ hoàn toàn ở backend. */}
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-[#3AB4E6]" />
            <span className="text-gray-700 font-medium">
              Giấy đăng ký doanh nghiệp hoặc Giấy tờ tương đương khác
            </span>
          </div>

          <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-8">
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
              Tài liệu xác thực <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-10 text-center hover:border-[#3AB4E6]/40 transition-all group relative">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#3AB4E6] group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                  </div>

                  <p className="text-gray-900 font-bold mb-1">Chọn hoặc kéo file vào đây</p>
                  <p className="text-xs text-gray-400 mb-4 font-medium">
                    Dung lượng tối đa 5MB, định dạng: jpeg, jpg, png, pdf
                  </p>

                  <label className="inline-flex items-center px-4 py-2 bg-[#EAF6FF] text-[#3AB4E6] text-sm font-bold rounded-lg cursor-pointer hover:bg-[#3AB4E6] hover:text-white transition-all">
                    Chọn file từ máy tính
                    <input type="file" className="hidden" accept=".jpeg,.jpg,.png,.pdf" onChange={handleFileChange} />
                  </label>

                  {/* Hiển thị file đang chọn hoặc file đã upload trên server */}
                  {(file || company?.businessLicenseFileUrl) && (
                    <div className="mt-4 flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg border font-medium"
                      style={file
                        ? { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }
                        : { background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }
                      }
                    >
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[200px]">{activeFilename}</span>
                      {!file && (
                        <span className="text-[10px] uppercase tracking-wide opacity-60 ml-1">• đã lưu</span>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-500 mt-3 flex items-center gap-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  <div className="bg-orange-50/70 rounded-xl p-4 border border-orange-100/50">
                    <p className="text-xs text-orange-700 flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-orange-500" />
                      Các văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa/che/cắt thông tin
                    </p>
                  </div>
                  <div className="bg-orange-50/70 rounded-xl p-4 border border-orange-100/50">
                    <p className="text-xs text-orange-700 flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-orange-500" />
                      Vui lòng đăng tải Giấy đăng ký doanh nghiệp có thông tin trùng khớp với dữ liệu của doanh nghiệp
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-64 shrink-0">
                <p className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">HƯỚNG DẪN MINH HỌA</p>
                {activePreviewUrl ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[3/4] relative group">
                    {isPdf ? (
                      <iframe
                        src={activePreviewUrl}
                        className="w-full h-full"
                        title="Preview"
                      />
                    ) : (
                      <img
                        src={activePreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a
                        href={activePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 shadow-lg"
                      >
                        Xem đầy đủ ↗
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
          </div>

          {/* Phase 5: radio "Giấy ủy quyền và Giấy tờ định danh" đã bỏ —
              identity flow đã được loại khỏi spec ở Phase 4 redesign (xem REFACTOR_HR_COMPANY_SPEC.md). */}
        </div>

        <div className="flex justify-end mt-10 pt-6 border-t border-gray-100 gap-4">
          {file && (
            <Button
              variant="outline"
              onClick={handleUpload}
              disabled={submitting}
              className="px-8 py-6 text-base font-bold border-[#3AB4E6] text-[#3AB4E6] hover:bg-blue-50"
            >
              {submitting ? "Đang tải lên..." : "Tải lên tài liệu"}
            </Button>
          )}

          <Button
            onClick={handleSubmitReview}
            disabled={
              submitting ||
              submissionState === 'PENDING_REVIEW' ||
              (!file && !affiliation?.submittedLicenseUrl && !company?.businessLicenseFileUrl)
            }
            className="px-10 py-6 min-w-[200px] text-base font-bold shadow-lg shadow-blue-500/20"
          >
            {submitting
              ? "Đang xử lý..."
              : submissionState === 'PENDING_REVIEW'
                ? "Đang chờ duyệt"
                : file
                  ? "Tải lên & Gửi xét duyệt"
                  : "Gửi hồ sơ xét duyệt"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Verification;
