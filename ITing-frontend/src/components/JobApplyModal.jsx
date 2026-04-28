import React, { useEffect, useMemo, useState } from "react";
import { useModalEscape } from "../hooks/useModalEscape";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaPen,
  FaFilePdf
} from "react-icons/fa";
import { toast } from "sonner";
import applicationService from "../services/applicationService";
import cvService from "../services/cvService";
import authService from "../services/authService";
import { storage } from "../utils/storage";

const JobApplyModal = ({ isOpen, onClose, onSuccess, jobTitle, jobId }) => {
  const [cvMethod, setCvMethod] = useState("recent"); // 'recent', 'library', 'upload'
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States
  const [recentCVs, setRecentCVs] = useState([]);
  const [libraryCVs, setLibraryCVs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCVId, setSelectedCVId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useModalEscape(isOpen ? onClose : null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    const token = storage.getToken();
    if (!token) return;
    
    try {
      setIsLoading(true);
      const [recent, cvs, userInfo] = await Promise.all([
        cvService.getRecentCVs().catch(() => []),
        cvService.getUserCVs().catch(() => []),
        authService.getCurrentUser().catch(() => null)
      ]);
      
      setRecentCVs(recent || []);
      setLibraryCVs(cvs || []);
      setUser(userInfo);
      
      // Select default CV
      const defaultCv = recent?.[0] || cvs?.find(c => c.isDefault) || cvs?.[0] || null;
      if (defaultCv) {
        setSelectedCVId(defaultCv.id);
        setCvMethod("recent");
      } else {
        setCvMethod("upload");
      }
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
    if (file) {
      setUploadTitle(file.name.replace(/\.pdf$/i, ''));
    }
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

  const currentSelectedCV = useMemo(() => {
    if (cvMethod === 'upload') return null;
    return recentCVs.find(c => c.id === selectedCVId) || libraryCVs.find(c => c.id === selectedCVId);
  }, [cvMethod, selectedCVId, recentCVs, libraryCVs]);

  const handleSubmit = async () => {
    if (!storage.getToken()) {
      toast.error("Vui lòng đăng nhập để ứng tuyển");
      return;
    }

    if (!jobId) {
      toast.error("Không tìm thấy thông tin công việc!");
      return;
    }

    let finalCvId = null;
    let finalCvUrl = "";

    try {
      setIsSubmitting(true);

      if (cvMethod === 'upload') {
        if (!uploadedFile) {
          toast.error("Vui lòng chọn file CV để tải lên!");
          return;
        }
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('title', uploadTitle || uploadedFile.name.replace(/\.pdf$/i, ''));
        const uploadedCv = await cvService.uploadCV(formData);
        finalCvId = uploadedCv.id;
        finalCvUrl = uploadedCv.fileUrl;
      } else {
        if (!selectedCVId || !currentSelectedCV) {
          toast.error("Vui lòng chọn CV để ứng tuyển!");
          return;
        }
        finalCvId = currentSelectedCV.id;
        finalCvUrl = currentSelectedCV.fileUrl;
      }

      const payload = {
        jobId: jobId,
        cvId: finalCvId,
        cvUrl: finalCvUrl,
        coverLetter: coverLetter.trim() || undefined,
      };

      await applicationService.applyJob(payload);
      toast.success("Ứng tuyển thành công!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi ứng tuyển:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi nộp hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ứng tuyển <span className="text-[#00B4D8]">{jobTitle}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <h3 className="font-bold text-gray-800 text-sm">Chọn CV để ứng tuyển</h3>

          {/* OPTION 1: Recent CV */}
          <div
            onClick={() => recentCVs.length > 0 && setCvMethod("recent")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "recent"
                ? "border-[#00B4D8] bg-[#E6F6FD]/30"
                : "border-gray-200 hover:border-[#00B4D8]"
            } ${recentCVs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "recent" ? "border-[#00B4D8]" : "border-gray-300"
                }`}
              >
                {cvMethod === "recent" && <div className="w-2.5 h-2.5 bg-[#00B4D8] rounded-full"></div>}
              </div>
              <span className="font-bold text-[#00B4D8] text-sm flex-1">
                CV ứng tuyển gần nhất: {recentCVs[0]?.title || "Chưa có"}
              </span>
              {recentCVs[0]?.fileUrl && (
                <button 
                  onClick={(e) => { e.stopPropagation(); previewCV(recentCVs[0].fileUrl); }}
                  className="text-xs text-[#00B4D8] hover:underline"
                >
                  Xem
                </button>
              )}
            </div>
            <div className="pl-8 text-sm text-gray-500 space-y-1">
              <p>Họ tên: <span className="font-medium text-gray-700">{user?.fullName || user?.name || "..."}</span></p>
              <p>Email: <span className="font-medium text-gray-700">{user?.email || "..."}</span></p>
            </div>
          </div>

          {/* OPTION 2: Library CV */}
          <div
            onClick={() => setCvMethod("library")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "library" ? "border-[#00B4D8] bg-[#E6F6FD]/10" : "border-gray-200 hover:border-[#00B4D8]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "library" ? "border-[#00B4D8]" : "border-gray-300"
                }`}
              >
                {cvMethod === "library" && <div className="w-2.5 h-2.5 bg-[#00B4D8] rounded-full"></div>}
              </div>
              <span className="font-medium text-gray-700 text-sm">Chọn CV khác trong thư viện</span>
            </div>
            
            {cvMethod === "library" && (
              <div className="ml-8 mt-4 space-y-2">
                {libraryCVs.length > 0 ? (
                  libraryCVs.map(cv => (
                    <div 
                      key={cv.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedCVId(cv.id); }}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${selectedCVId === cv.id ? 'border-[#00B4D8] bg-white shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FaFilePdf className="text-red-500 shrink-0" />
                        <span className="truncate">{cv.title}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); previewCV(cv.fileUrl); }}
                        className="text-[#00B4D8] text-xs font-bold hover:underline"
                      >
                        Xem
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Thư viện trống.</p>
                )}
              </div>
            )}
          </div>

          {/* OPTION 3: Upload */}
          <div
            onClick={() => setCvMethod("upload")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "upload" ? "border-[#00B4D8] bg-[#E6F6FD]/10" : "border-gray-200 hover:border-[#00B4D8]"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "upload" ? "border-[#00B4D8]" : "border-gray-300"
                }`}
              >
                {cvMethod === "upload" && <div className="w-2.5 h-2.5 bg-[#00B4D8] rounded-full"></div>}
              </div>
              <span className="font-medium text-gray-700 text-sm">Tải lên CV mới</span>
            </div>

            {cvMethod === "upload" && (
              <div className="ml-8 mt-2 border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 relative group">
                {!uploadedFile ? (
                  <>
                    <FaCloudUploadAlt size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">PDF, tối đa 5MB</p>
                    <label className="mt-3 px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 cursor-pointer shadow-sm">
                      Chọn file
                      <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-[#00B4D8]">
                    <div className="flex items-center gap-3 truncate">
                      <FaFilePdf size={24} className="text-red-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-800 truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); previewLocalFile(); }} className="text-[#00B4D8] text-xs font-bold">Xem</button>
                      <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  </div>
                )}
                {uploadedFile && (
                  <input 
                    type="text" 
                    placeholder="Đặt tên cho CV này"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="mt-4 w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-[#00B4D8]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              Thư giới thiệu
              <FaPen size={10} className="text-gray-300" />
            </h3>
            <textarea
              rows="3"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#00B4D8] outline-none resize-none bg-gray-50"
              placeholder="Giới thiệu nhanh về bản thân..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm">Hủy</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#118AB2] transition-colors text-sm shadow-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Đang xử lý..." : "Nộp hồ sơ ứng tuyển"}
            </button>
          </div>

          {/* Footer warning */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-[10px] text-gray-500 italic">
            Lưu ý: Hãy luôn cẩn thận khi tìm việc. ITing không bao giờ yêu cầu ứng viên trả phí để nộp hồ sơ.
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplyModal;
