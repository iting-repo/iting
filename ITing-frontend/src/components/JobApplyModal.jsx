import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useModalEscape } from "../hooks/useModalEscape";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaPen,
  FaFilePdf,
  FaUserEdit,
  FaCheckCircle,
  FaExclamationCircle,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaArrowRight
} from "react-icons/fa";
import { toast } from "sonner";
import applicationService from "../services/applicationService";
import cvService from "../services/cvService";
import authService from "../services/authService";
import jobService from "../services/jobService";
import { storage } from "../utils/storage";

// Map cvLanguage → CTA hiển thị cho ứng viên (cả CV và cover letter)
const CV_LANGUAGE_CTA = {
  VIETNAMESE: {
    badge: '🇻🇳 Yêu cầu tiếng Việt',
    cls: 'bg-red-50 text-red-700 border-red-200',
    cvHint: 'Hãy chọn CV viết bằng tiếng Việt. Hồ sơ nộp sai ngôn ngữ có thể bị loại.',
    coverHint: 'Viết thư giới thiệu bằng tiếng Việt.',
  },
  ENGLISH: {
    badge: '🇬🇧 Required: English',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
    cvHint: 'HR requires an English CV. Please pick (or upload) a CV written in English.',
    coverHint: 'Write your cover letter in English.',
  },
  BOTH: {
    badge: '🇻🇳 + 🇬🇧 Song ngữ',
    cls: 'bg-purple-50 text-purple-700 border-purple-200',
    cvHint: 'HR yêu cầu CV song ngữ (Việt + Anh). Đảm bảo CV của bạn có cả 2 ngôn ngữ.',
    coverHint: 'Thư giới thiệu nên viết bằng tiếng Anh, kèm 1-2 câu tóm tắt tiếng Việt.',
  },
  ANY: {
    badge: '✓ Việt hoặc Anh',
    cls: 'bg-gray-50 text-gray-600 border-gray-200',
    cvHint: 'HR chấp nhận CV tiếng Việt hoặc tiếng Anh — chọn loại bạn tự tin nhất.',
    coverHint: 'Viết thư giới thiệu bằng ngôn ngữ phù hợp với CV bạn nộp.',
  },
};

const JobApplyModal = ({ isOpen, onClose, onSuccess, jobTitle, jobId, cvLanguage }) => {
  const langCta = CV_LANGUAGE_CTA[cvLanguage] || CV_LANGUAGE_CTA.ANY;
  const navigate = useNavigate();
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

  // Success state
  const [applySuccess, setApplySuccess] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

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

  /**
   * Mở preview CV trong tab mới — luôn xin presigned URL TƯƠI từ BE
   * (URL S3 lưu sẵn trong DB chỉ valid 1h → 403 sau khi hết hạn).
   *
   * @param {object|number|string} cv  CV object {id,fileUrl}, id, hoặc fileUrl string fallback.
   */
  const previewCV = async (cv) => {
    if (typeof cv === 'string') {
      window.open(cv, '_blank', 'noopener');
      return;
    }
    if (!cv) return;

    const cvId = typeof cv === 'object' ? cv.id : cv;
    const fallbackUrl = typeof cv === 'object' ? cv.fileUrl : null;

    if (!cvId) {
      if (fallbackUrl) window.open(fallbackUrl, '_blank', 'noopener');
      return;
    }

    // Mở tab trống ngay để tránh popup blocker, set URL sau khi fetch xong.
    const win = window.open('', '_blank', 'noopener');
    try {
      const freshUrl = await cvService.getViewUrl(cvId);
      const target = freshUrl || fallbackUrl;
      if (!target) {
        toast.error('Không lấy được URL xem CV.');
        if (win) win.close();
        return;
      }
      if (win) win.location.href = target;
      else window.open(target, '_blank', 'noopener');
    } catch (err) {
      console.error('Preview failed:', err);
      if (fallbackUrl && win) {
        win.location.href = fallbackUrl;
        toast.warning('Đang dùng link cũ — có thể đã hết hạn.');
      } else {
        toast.error(err?.message || 'Không thể xem CV lúc này.');
        if (win) win.close();
      }
    }
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

      // Dispatch event to refresh notification bell in Header
      window.dispatchEvent(new CustomEvent('notification-refresh'));

      // Show success screen with similar jobs
      setApplySuccess(true);
      fetchSimilarJobs();
    } catch (error) {
      console.error("Lỗi khi ứng tuyển:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi nộp hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSimilarJobs = async () => {
    try {
      setLoadingSimilar(true);
      // Extract keywords from job title for search
      const keywords = (jobTitle || '').split(/[\s\-–,/]+/).filter(w => w.length > 2).slice(0, 3).join(' ');
      const res = await jobService.getJobs({ keyword: keywords, size: 4, page: 0 });
      const jobs = res?.content || res?.data?.content || res || [];
      // Filter out the current job
      const filtered = (Array.isArray(jobs) ? jobs : []).filter(j => j.id !== jobId).slice(0, 3);
      setSimilarJobs(filtered);
    } catch (err) {
      console.error('Failed to load similar jobs:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleCloseSuccess = () => {
    setApplySuccess(false);
    setSimilarJobs([]);
    onClose();
  };

  if (!isOpen) return null;

  // ── Success Screen ──
  if (applySuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        onClick={handleCloseSuccess}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-1">Ứng tuyển thành công!</h2>
            <p className="text-sm text-gray-500">
              Hồ sơ của bạn đã được gửi đến nhà tuyển dụng cho vị trí <span className="font-bold text-[#3AB4E6]">{jobTitle}</span>
            </p>
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 font-medium">
              📬 Thông báo đã được gửi. Theo dõi trạng thái tại mục <Link to="/candidate/applied-jobs" onClick={handleCloseSuccess} className="underline font-bold">"Việc đã ứng tuyển"</Link>
            </div>
          </div>

          {/* Similar Jobs */}
          <div className="px-6 pb-6">
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <FaBriefcase className="text-[#3AB4E6]" />
              Việc làm tương tự có thể bạn quan tâm
            </h3>

            {loadingSimilar ? (
              <div className="text-center py-6 text-gray-400 text-sm">Đang tải...</div>
            ) : similarJobs.length > 0 ? (
              <div className="space-y-3">
                {similarJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    onClick={handleCloseSuccess}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#3AB4E6]/40 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {job.companyLogo || job.company?.logoUrl ? (
                        <img src={job.companyLogo || job.company?.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FaBuilding className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#3AB4E6] transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {job.companyName || job.company?.name || 'Công ty'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                        {(job.location || job.locationName) && (
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt /> {job.location || job.locationName}
                          </span>
                        )}
                        {job.salary && <span>{job.salary}</span>}
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-300 group-hover:text-[#3AB4E6] transition-colors mt-3 shrink-0" size={12} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                Không tìm thấy việc làm tương tự
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleCloseSuccess}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Đóng
            </button>
            <Link
              to="/jobs"
              onClick={handleCloseSuccess}
              className="flex-1 py-2.5 bg-[#3AB4E6] text-white font-bold rounded-xl hover:bg-[#2C9ACD] transition-colors text-sm text-center"
            >
              Xem thêm việc làm
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Ứng tuyển <span className="text-[#3AB4E6]">{jobTitle}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* CTA: Yêu cầu ngôn ngữ CV (do HR thiết lập) */}
          <div className={`rounded-lg p-3 border ${langCta.cls} flex items-start gap-3`}>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${langCta.cls} shrink-0`}>
              {langCta.badge}
            </span>
            <div className="text-xs leading-relaxed">
              <p className="font-semibold mb-0.5">{langCta.cvHint}</p>
              <p className="opacity-80">{langCta.coverHint}</p>
            </div>
          </div>

          {/* CTA: Thông tin ứng tuyển (compact, trên cùng) */}
          {user && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  {user.fullName ? <FaCheckCircle className="text-green-500" size={8} /> : <FaExclamationCircle className="text-orange-400" size={8} />}
                  {user.fullName || 'Chưa có tên'}
                </span>
                <span className="flex items-center gap-1">
                  {user.email ? <FaCheckCircle className="text-green-500" size={8} /> : <FaExclamationCircle className="text-orange-400" size={8} />}
                  {user.email || 'Chưa có email'}
                </span>
                <span className="flex items-center gap-1">
                  {user.phone ? <FaCheckCircle className="text-green-500" size={8} /> : <FaExclamationCircle className="text-orange-400" size={8} />}
                  {user.phone || 'Chưa có SĐT'}
                </span>
              </div>
              <Link
                to="/candidate/profile"
                onClick={onClose}
                className="text-[11px] text-[#3AB4E6] font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <FaUserEdit size={10} />
                Cập nhật hồ sơ
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-gray-800 text-sm">Chọn CV để ứng tuyển</h3>
            <span className="text-[11px] text-gray-500 italic">
              💡 {langCta.cvHint}
            </span>
          </div>

          {/* OPTION 1: Recent CV */}
          <div
            onClick={() => recentCVs.length > 0 && setCvMethod("recent")}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              cvMethod === "recent"
                ? "border-[#3AB4E6] bg-[#E6F6FD]/30"
                : "border-gray-200 hover:border-[#3AB4E6]"
            } ${recentCVs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "recent" ? "border-[#3AB4E6]" : "border-gray-300"
                }`}
              >
                {cvMethod === "recent" && <div className="w-2.5 h-2.5 bg-[#3AB4E6] rounded-full"></div>}
              </div>
              <span className="font-bold text-[#3AB4E6] text-sm flex-1">
                CV ứng tuyển gần nhất: {recentCVs[0]?.title || "Chưa có"}
              </span>
              {recentCVs[0]?.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); previewCV(recentCVs[0]); }}
                  className="text-xs text-[#3AB4E6] hover:underline"
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
              cvMethod === "library" ? "border-[#3AB4E6] bg-[#E6F6FD]/10" : "border-gray-200 hover:border-[#3AB4E6]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "library" ? "border-[#3AB4E6]" : "border-gray-300"
                }`}
              >
                {cvMethod === "library" && <div className="w-2.5 h-2.5 bg-[#3AB4E6] rounded-full"></div>}
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
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${selectedCVId === cv.id ? 'border-[#3AB4E6] bg-white shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FaFilePdf className="text-red-500 shrink-0" />
                        <span className="truncate">{cv.title}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); previewCV(cv); }}
                        className="text-[#3AB4E6] text-xs font-bold hover:underline"
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
              cvMethod === "upload" ? "border-[#3AB4E6] bg-[#E6F6FD]/10" : "border-gray-200 hover:border-[#3AB4E6]"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  cvMethod === "upload" ? "border-[#3AB4E6]" : "border-gray-300"
                }`}
              >
                {cvMethod === "upload" && <div className="w-2.5 h-2.5 bg-[#3AB4E6] rounded-full"></div>}
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
                  <div className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-[#3AB4E6]">
                    <div className="flex items-center gap-3 truncate">
                      <FaFilePdf size={24} className="text-red-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-800 truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); previewLocalFile(); }} className="text-[#3AB4E6] text-xs font-bold">Xem</button>
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
                    className="mt-4 w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-[#3AB4E6]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
              Thư giới thiệu
              <FaPen size={10} className="text-gray-300" />
            </h3>
            <p className="text-[11px] text-gray-500 italic mb-2">
              💡 {langCta.coverHint}
            </p>
            <div className="relative">
              <textarea
                rows="3"
                maxLength={500}
                className={`w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#3AB4E6] outline-none resize-none bg-gray-50 ${
                  coverLetter.length >= 500 ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Giới thiệu nhanh về bản thân..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              ></textarea>
              <div className={`text-right text-xs mt-1 ${
                coverLetter.length >= 500 ? 'text-red-500 font-semibold' :
                coverLetter.length >= 400 ? 'text-orange-500' :
                'text-gray-400'
              }`}>
                {coverLetter.length}/500 ký tự
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm">Hủy</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-2.5 bg-[#3AB4E6] text-white font-bold rounded-lg hover:bg-[#2C9ACD] transition-colors text-sm shadow-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting
                ? (cvMethod === 'upload'
                    ? "Đang tải lên & AI phân tích CV…"
                    : "Đang xử lý…")
                : "Nộp hồ sơ ứng tuyển"}
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
