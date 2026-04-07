import React, { useState } from "react";
import { Upload, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { Button } from "../../components/common";
import companyService from "../../services/companyService";
import { toast } from "sonner";

const Verification = () => {
  const [selectedType, setSelectedType] = useState("business");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      setError("");
    }
  };

  const handleSave = async () => {
    if (!file) {
      setError("Vui lòng chọn file để tải lên");
      return;
    }

    try {
      setSubmitting(true);
      await companyService.uploadBusinessLicense(file);
      toast.success("Tải lên giấy phép kinh doanh thành công! Admin sẽ sớm xét duyệt hồ sơ của bạn.");
      setError("");
    } catch (err) {
      console.error("Lỗi upload:", err);
      toast.error(err?.response?.data?.message || "Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Xác thực tài khoản</h1>
        <p className="text-gray-500">Nâng cao độ tin cậy và mở khóa đầy đủ tính năng bằng cách xác thực doanh nghiệp của bạn.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3AB4E6]" />
            Thông tin Giấy đăng ký doanh nghiệp
            <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Chưa cập nhật</span>
          </h2>
          <p className="text-sm text-gray-500">
            Vui lòng chọn phương thức đăng tải, xem hướng dẫn đăng tải{" "}
            <button className="text-[#3AB4E6] font-medium hover:underline">Tại đây</button>
          </p>
        </div>

        <div className="space-y-6">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                checked={selectedType === "business"}
                onChange={() => setSelectedType("business")}
                className="w-5 h-5 border-2 border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6] cursor-pointer"
              />
            </div>
            <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
              Giấy đăng ký doanh nghiệp hoặc Giấy tờ tương đương khác
            </span>
          </label>

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

                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-bold text-sm bg-green-50 py-2 rounded-lg border border-green-100 animate-scale-up">
                      <CheckCircle className="w-4 h-4" />
                      {file.name}
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
                <div className="bg-gray-100 rounded-xl aspect-[3/4] flex flex-col items-center justify-center text-center p-4 border border-gray-200">
                  <div className="w-16 h-20 border-2 border-gray-300 rounded mb-4 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                    <div className="w-full h-2 bg-blue-500/20 mb-1"></div>
                    <div className="w-2/3 h-1 bg-gray-200 mb-1"></div>
                    <div className="w-1/2 h-1 bg-gray-200"></div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Bản scan rõ nét, không bị lóa sáng hoặc mất góc</p>
                </div>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                checked={selectedType === "identity"}
                onChange={() => setSelectedType("identity")}
                className="w-5 h-5 border-2 border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6] cursor-pointer"
              />
            </div>
            <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
              Giấy ủy quyền và Giấy tờ định danh
            </span>
          </label>
        </div>

        <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
          <Button
            onClick={handleSave}
            disabled={submitting || !file}
            className="px-10 py-6 min-w-[200px] text-base font-bold shadow-lg shadow-blue-500/20"
          >
            {submitting ? "Đang xử lý..." : "Lưu và Gửi duyệt"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Verification;
