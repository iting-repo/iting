import React, { useEffect, useMemo, useState } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaPen,
} from "react-icons/fa";
import { toast } from "sonner";
import applicationService from "../services/applicationService";
import axiosInstance from "../utils/axiosInstance";
import { storage } from "../utils/storage";

const JobApplyModal = ({ isOpen, onClose, jobTitle, jobId }) => {
  const [cvMethod, setCvMethod] = useState("recent"); // 'recent', 'library', 'upload'
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentCVs, setRecentCVs] = useState([]);
  const [allCVs, setAllCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isLoadingCVs, setIsLoadingCVs] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadCVs = async () => {
      if (!storage.getToken()) return;
      setIsLoadingCVs(true);
      try {
        const [recent, all] = await Promise.all([
          axiosInstance.get('/candidates/cvs/recent'),
          axiosInstance.get('/user/professional-profile/cv'),
        ]);
        const recentList = Array.isArray(recent) ? recent : [];
        const allList = Array.isArray(all) ? all : [];

        setRecentCVs(recentList);
        setAllCVs(allList);

        const defaultCv = allList.find((cv) => cv.isDefault) || recentList[0] || allList[0] || null;
        setSelectedCVId(defaultCv?.id || null);

        if (!defaultCv) {
          setCvMethod("upload");
        } else {
          setCvMethod("recent");
        }
      } catch {
        setRecentCVs([]);
        setAllCVs([]);
        setSelectedCVId(null);
      } finally {
        setIsLoadingCVs(false);
      }
    };

    loadCVs();
  }, [isOpen]);

  const selectedCV = useMemo(
    () => allCVs.find((cv) => cv.id === selectedCVId) || recentCVs.find((cv) => cv.id === selectedCVId) || null,
    [allCVs, recentCVs, selectedCVId]
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!storage.getToken()) {
      toast.error("Vui long dang nhap de ung tuyen");
      return;
    }

    if (!jobId) {
      toast.error("Không tìm thấy thông tin công việc!");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalCvId = selectedCVId;

      if (cvMethod === "upload") {
        if (!uploadFile) {
          toast.error("Vui long chon file CV de tai len");
          return;
        }

        const form = new FormData();
        form.append("file", uploadFile);
        if (uploadTitle.trim()) {
          form.append("title", uploadTitle.trim());
        }

        const uploaded = await axiosInstance.post('/candidates/cvs/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalCvId = uploaded?.id;
      }

      if (!finalCvId) {
        toast.error("Vui long chon CV de ung tuyen");
        return;
      }

      const payload = {
        jobId: jobId,
        cvId: finalCvId,
        coverLetter: coverLetter || "Toi rat quan tam co hoi nay va mong duoc trao doi them.",
      };

      await applicationService.applyJob(payload);
      toast.success("Ứng tuyển thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi ứng tuyển:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi nộp hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ứng tuyển <span className="text-[#00B4D8]">{jobTitle}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <h3 className="font-bold text-gray-800 text-sm">
            Chọn CV để ứng tuyển
          </h3>

          {/* OPTION 1: CV Gần nhất */}
          <div
            onClick={() => setCvMethod("recent")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "recent"
                ? "border-[#00B4D8] bg-[#E6F6FD]/30"
                : "border-gray-200 hover:border-[#00B4D8]"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "recent" ? "border-[#00B4D8]" : "border-gray-300"
                }`}
              >
                {cvMethod === "recent" && (
                  <div className="w-3 h-3 bg-[#00B4D8] rounded-full"></div>
                )}
              </div>
              <span className="font-bold text-[#00B4D8] text-sm flex items-center gap-2">
                CV ứng tuyển gần nhất: {recentCVs[0]?.title || recentCVs[0]?.fileName || "Chua co"}
              </span>
              {recentCVs[0]?.fileUrl ? (
                <a
                  href={recentCVs[0].fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-[#00B4D8] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem
                </a>
              ) : null}
            </div>

            <div className="pl-8 text-sm text-gray-600 space-y-1">
              {isLoadingCVs ? (
                <p>Dang tai CV...</p>
              ) : selectedCV ? (
                <>
                  <p>
                    <span className="text-gray-400">Tieu de CV:</span>{" "}
                    <span className="font-medium text-gray-800">{selectedCV.title || selectedCV.fileName || 'CV'}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Trang thai:</span>{" "}
                    <span className="font-medium text-gray-800">{selectedCV.isDefault ? 'Mac dinh' : 'Da tai len'}</span>
                  </p>
                </>
              ) : (
                <p>Chua co CV gan day.</p>
              )}
            </div>
          </div>

          {/* OPTION 2: Chọn từ thư viện */}
          <div
            onClick={() => setCvMethod("library")}
            className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-all ${
              cvMethod === "library"
                ? "border-[#00B4D8]"
                : "border-gray-200 hover:border-[#00B4D8]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                cvMethod === "library" ? "border-[#00B4D8]" : "border-gray-300"
              }`}
            >
              {cvMethod === "library" && (
                <div className="w-3 h-3 bg-[#00B4D8] rounded-full"></div>
              )}
            </div>
            <span className="font-medium text-gray-700 text-sm">
              Chọn CV khác trong thư viện CV của tôi
            </span>
          </div>

          {cvMethod === "library" && (
            <div className="ml-8 mt-2 border border-gray-200 rounded-lg p-3 space-y-2">
              {allCVs.length === 0 ? (
                <p className="text-sm text-gray-500">Ban chua co CV trong thu vien.</p>
              ) : (
                allCVs.map((cv) => (
                  <label key={cv.id} className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="selectedCv"
                      checked={selectedCVId === cv.id}
                      onChange={() => setSelectedCVId(cv.id)}
                    />
                    <span className="flex-1 text-gray-700">{cv.title || cv.fileName || `CV #${cv.id}`}</span>
                    {cv.fileUrl ? (
                      <a
                        href={cv.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#00B4D8] hover:underline"
                      >
                        Xem
                      </a>
                    ) : null}
                  </label>
                ))
              )}
            </div>
          )}

          {/* OPTION 3: Upload */}
          <div
            onClick={() => setCvMethod("upload")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "upload"
                ? "border-[#00B4D8]"
                : "border-gray-200 hover:border-[#00B4D8]"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "upload" ? "border-[#00B4D8]" : "border-gray-300"
                }`}
              >
                {cvMethod === "upload" && (
                  <div className="w-3 h-3 bg-[#00B4D8] rounded-full"></div>
                )}
              </div>
              <span className="font-medium text-gray-700 text-sm">
                Tải lên CV từ máy tính, chọn hoặc kéo thả
              </span>
            </div>

            {cvMethod === "upload" && (
              <div className="ml-8 mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <FaCloudUploadAlt size={32} className="text-gray-400 mb-2" />
                <p className="text-sm">
                  Hỗ trợ định dạng .doc, .docx, pdf có kích thước dưới 5MB
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="mt-3 text-sm"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <input
                  type="text"
                  placeholder="Ten CV (tuy chon)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-3 w-full max-w-sm px-3 py-2 border border-gray-200 rounded text-sm"
                />
                {uploadFile ? (
                  <p className="mt-2 text-xs text-gray-600">Da chon: {uploadFile.name}</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Thư giới thiệu */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800 text-sm">
                Thư giới thiệu:
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Một thư giới thiệu ngắn gọn, chỉnh chu sẽ giúp bạn trở nên chuyên
              nghiệp và gây ấn tượng hơn với nhà tuyển dụng.
            </p>
            <div className="relative">
              <textarea
                rows="3"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#00B4D8] outline-none resize-none bg-gray-50"
                placeholder="Viết giới thiệu ngắn gọn về bản thân (Điểm mạnh, kinh nghiệm liên quan)..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              ></textarea>
              <div className="absolute bottom-3 right-3 text-[#00B4D8] cursor-pointer bg-white p-1 rounded-full shadow-sm border border-gray-100">
                <FaPen size={12} />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] transition-colors text-sm shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Đang nộp hồ sơ..." : "Nộp hồ sơ ứng tuyển"}
            </button>
          </div>

          {/* Warning Section */}
          <div className="bg-[#FFF5F5] border border-red-100 rounded-lg p-4 text-xs text-gray-600 space-y-2">
            <p className="font-bold text-red-500 flex items-center gap-1">
              Lưu ý:
            </p>
            <p>
              ITing khuyên tất cả các bạn hãy luôn cẩn trọng trong quá trình
              tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc
              làm trước khi ứng tuyển.
            </p>
            <p>
              Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu
              bạn gặp phải tin tuyển dụng hoặc nhận được liên lạc đáng ngờ, hãy
              báo cáo ngay cho ITing qua email{" "}
              <span className="text-[#00B4D8] cursor-pointer">
                hotro@iting.vn
              </span>{" "}
              để được hỗ trợ kịp thời.
            </p>
            <p>
              Tìm hiểu thêm kinh nghiệm phòng tránh lừa đảo{" "}
              <span className="text-[#00B4D8] cursor-pointer hover:underline">
                tại đây
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplyModal;
