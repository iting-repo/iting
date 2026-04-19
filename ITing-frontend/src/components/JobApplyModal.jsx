import React, { useState } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaPen,
  FaFilePdf,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "sonner";
import applicationService from "../services/applicationService";
import cvService from "../services/cvService";
import authService from "../services/authService";

const JobApplyModal = ({ isOpen, onClose, onSuccess, jobTitle, jobId }) => {
  const [cvMethod, setCvMethod] = useState("recent"); // 'recent', 'library', 'upload'
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stats
  const [recentCV, setRecentCV] = useState(null);
  const [libraryCVs, setLibraryCVs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedLibraryId, setSelectedLibraryId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [cvs, userInfo] = await Promise.all([
        cvService.getRecentCVs(),
        authService.getCurrentUser()
      ]);
      
      setLibraryCVs(cvs || []);
      if (cvs && cvs.length > 0) {
        setRecentCV(cvs[0]);
        setSelectedLibraryId(cvs[0].id);
      }
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to load apply data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
        toast.error('Chỉ chấp nhận file PDF');
        return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước CV tối đa là 5MB');
        return;
    }
    setUploadedFile(file);
  };

  const previewCV = (url) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const previewLocalFile = () => {
    if (!uploadedFile) return;
    const url = URL.createObjectURL(uploadedFile);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!jobId) {
      toast.error("Không tìm thấy thông tin công việc!");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalCvId = null;
      let finalCvUrl = "";

      if (cvMethod === 'recent' && recentCV) {
        finalCvId = recentCV.id;
        finalCvUrl = recentCV.fileUrl;
      } else if (cvMethod === 'library' && selectedLibraryId) {
        const selected = libraryCVs.find(c => c.id === selectedLibraryId);
        finalCvId = selected?.id;
        finalCvUrl = selected?.fileUrl;
      } else if (cvMethod === 'upload') {
        if (!uploadedFile) {
          toast.error("Vui lòng chọn file CV để tải lên!");
          setIsSubmitting(false);
          return;
        }
        // Upload to S3 first
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('title', uploadedFile.name.replace(/\.pdf$/i, ''));
        const uploadedCv = await cvService.uploadCV(formData);
        finalCvId = uploadedCv.id;
        finalCvUrl = uploadedCv.fileUrl;
      }

      if (!finalCvId) {
        toast.error("Vui lòng chọn hoặc tải lên CV!");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        jobId: jobId,
        cvUrl: finalCvUrl,
        cvId: finalCvId,
        coverLetter: coverLetter.trim() || undefined,
      };

      await applicationService.applyJob(payload);
      toast.success("Ứng tuyển thành công!");
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
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
            } ${!recentCV ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                CV ứng tuyển gần nhất: {recentCV ? recentCV.title : "Chưa có CV nào"}
              </span>
              {recentCV && (
                <span 
                  onClick={(e) => { e.stopPropagation(); previewCV(recentCV.fileUrl); }}
                  className="ml-auto text-xs text-[#00B4D8] hover:underline"
                >
                  Xem
                </span>
              )}
            </div>

            <div className="pl-8 text-sm text-gray-600 space-y-1">
              <p>
                <span className="text-gray-400">Họ và tên:</span>{" "}
                <span className="font-medium text-gray-800">
                  {user?.fullName || user?.name || "Đang tải..."}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <span className="font-medium text-gray-800">
                  {user?.email || "..."}
                </span>
              </p>
              {user?.phoneNum && (
                <p>
                  <span className="text-gray-400">Số điện thoại:</span>{" "}
                  <span className="font-medium text-gray-800">{user.phoneNum}</span>
                </p>
              )}
            </div>
          </div>

          {/* OPTION 2: Chọn từ thư viện */}
          <div
            onClick={() => setCvMethod("library")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "library"
                ? "border-[#00B4D8]"
                : "border-gray-200 hover:border-[#00B4D8]"
            }`}
          >
            <div className="flex items-center gap-3">
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
            
            {cvMethod === "library" && libraryCVs.length > 0 && (
              <div className="ml-8 mt-3 grid grid-cols-1 gap-2">
                {libraryCVs.map(cv => (
                  <div 
                    key={cv.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedLibraryId(cv.id); }}
                    className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-all ${selectedLibraryId === cv.id ? 'border-[#00B4D8] bg-[#E6F6FD]/20 border-l-4' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FaFilePdf size={14} className="text-red-500 shrink-0" />
                      <span className="truncate">{cv.title}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); previewCV(cv.fileUrl); }}
                      className="text-[#00B4D8] text-xs font-bold hover:underline shrink-0"
                    >
                      Xem
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {cvMethod === "library" && libraryCVs.length === 0 && (
              <p className="ml-8 mt-2 text-xs text-gray-400 italic">Thư viện trống. Vui lòng tải CV mới.</p>
            )}
          </div>

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
              <div className="ml-8 mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-gray-500 relative group overflow-hidden">
                {!uploadedFile ? (
                  <>
                    <FaCloudUploadAlt size={32} className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-center">
                      Hỗ trợ định dạng .pdf có kích thước dưới 5MB
                    </p>
                    <label className="mt-3 px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 cursor-pointer shadow-sm">
                      Chọn file
                      <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-[#00B4D8] shadow-sm">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center text-red-500 shrink-0">
                        <FaFilePdf size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-800 truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); previewLocalFile(); }}
                         className="text-[#00B4D8] text-xs font-bold hover:underline"
                      >
                         Xem
                      </button>
                      <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                         className="text-gray-400 hover:text-red-500"
                      >
                         ✕
                      </button>
                    </div>
                  </div>
                )}
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
