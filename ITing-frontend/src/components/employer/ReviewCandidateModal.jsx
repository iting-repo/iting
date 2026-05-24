import React, { useEffect, useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
    FaTimes, FaEnvelope, FaPhone,
    FaUserTie,
    FaExclamationTriangle, FaExternalLinkAlt,
    FaRegStar, FaStar
} from 'react-icons/fa';
import { toast } from "sonner";
import reportService from "../../services/reportService";
import favoriteCandidateService from "../../services/favoriteCandidateService";
import messageService from "../../services/messageService";
import { useNavigate } from "react-router-dom";
import StagePopover, { STAGES, stageMeta } from "./StagePopover";

const REPORT_REASONS = [
  { value: "SPAM", label: "Tin nhắn rác / Spam" },
  { value: "FAKE_INFO", label: "Thông tin giả mạo" },
  { value: "INAPPROPRIATE", label: "Hành vi không đúng mực" },
  { value: "SCAM", label: "Lừa đảo / Đa cấp" },
  { value: "HARASSMENT", label: "Quấy rối / Đe dọa" },
  { value: "OTHER", label: "Lý do khác" },
];

/**
 * @param {object} props
 * @param {object} props.candidate
 * @param {() => void} props.onClose
 * @param {number} [props.applyFormId] - Nếu có → hiển thị stage bar + StagePopover ở đầu
 *                                       (ứng viên đã apply). Nếu null → luồng AI/search,
 *                                       chỉ cho nhắn tin.
 * @param {number} [props.jobId]       - Job đang xét stage (đi cùng applyFormId).
 * @param {string} [props.currentStage] - Pipeline stage hiện tại.
 * @param {(newStage: string) => void} [props.onStageMoved]
 */
const ReviewCandidateModal = ({ candidate, onClose, applyFormId, jobId, currentStage, onStageMoved }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [stage, setStage] = useState(currentStage || 'SCREENING');
  const [reportData, setReportData] = useState({
    type: "OTHER",
    description: ""
  });
  const isApplied = !!applyFormId;

  useEffect(() => { setStage(currentStage || 'SCREENING'); }, [currentStage]);

  useEffect(() => {
    if (candidate) {
      setIsFavorited(favoriteCandidateService.isFavorite(candidate.id));
    }
  }, [candidate]);

  const handleCloseModal = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showReportModal) {
            setShowReportModal(false);
        } else {
            handleCloseModal();
        }
      }
    };
    if (candidate) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [candidate, handleCloseModal, showReportModal]);

  const handleReport = async () => {
    if (!candidate) return;
    setIsReporting(true);
    try {
      await reportService.createReport({
        targetId: Number(candidate.id),
        targetType: "USER",
        targetName: candidate.name,
        type: reportData.type,
        reason: REPORT_REASONS.find(r => r.value === reportData.type)?.label || "Báo cáo vi phạm",
        description: reportData.description || `Báo cáo ứng viên ${candidate.name} (ID: ${candidate.id})`,
        priority: "MEDIUM"
      });
      toast.success("Đã gửi báo cáo vi phạm. Chúng tôi sẽ xem xét sớm nhất.");
      setShowReportModal(false);
    } catch (error) {
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại sau.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!candidate) return;
    const newStatus = favoriteCandidateService.toggleFavorite(candidate);
    setIsFavorited(newStatus);
    toast.success(newStatus ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích");
  };

  const handleSendMessage = () => {
    if (!candidate) return;
    // Điều hướng sang trang chat với userId của ứng viên và truyền thông tin qua state
    navigate(`/messages?userId=${candidate.id}`, { 
      state: { 
        userName: candidate.name, 
        userAvatar: candidate.cvUrl ? null : null // Candidate avatar logic if needed
      } 
    });
    onClose();
  };

  if (!candidate) return null;

  const modalRoot = document.body;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden relative animate-scale-up border border-white/20 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CỘT TRÁI: PREVIEW CV (4/7) */}
        <div className="flex-[4] bg-slate-100 flex flex-col border-r border-slate-200">
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-[#1967D2]">
                <FaUserTie size={18} />
              </div>
              <h3 className="font-bold text-slate-800">Review Hồ sơ ứng viên</h3>
            </div>
            {candidate.cvUrl && (
              <a
                href={candidate.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#1967D2] hover:underline flex items-center gap-1"
              >
                <FaExternalLinkAlt size={10} /> Mở trong tab mới
              </a>
            )}
          </div>

          <div className="flex-1 bg-[#525659] overflow-hidden relative">
            {candidate.cvUrl ? (
              <iframe
                src={`${candidate.cvUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title="Xem trước CV"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-12 text-center bg-slate-100">
                <div className="p-6 bg-slate-200 rounded-full animate-pulse">
                  <FaUserTie size={48} className="opacity-20" />
                </div>
                <div>
                  <p className="font-bold text-slate-600 uppercase tracking-widest text-xs mb-2">Không tìm thấy file CV</p>
                  <p className="text-sm">Ứng viên có thể chưa đính kèm CV hoặc file đã bị lỗi.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN & THAO TÁC (3/7) */}
        <div className="flex-[3] flex flex-col bg-white overflow-hidden relative">
          {/* Pipeline stage bar — chỉ hiện khi ứng viên đã apply */}
          {isApplied && (
            <div className="px-6 pt-4 pb-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái pipeline</p>
                <StagePopover
                  applyFormId={applyFormId}
                  jobId={jobId}
                  currentStage={stage}
                  onMoved={(newStage) => { setStage(newStage); onStageMoved?.(newStage); }}
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {STAGES.filter(s => s.value !== 'REJECTED').map((s, idx, arr) => {
                  const meta = stageMeta(s.value);
                  const currentIdx = arr.findIndex(x => x.value === stage);
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <React.Fragment key={s.value}>
                      <span
                        title={meta.label}
                        className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCurrent ? meta.color + ' ring-2 ring-offset-1 ring-[#3AB4E6]/40' :
                          isPast    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {meta.label}
                      </span>
                      {idx < arr.length - 1 && (
                        <span className={`h-px flex-1 min-w-2 ${isPast ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {stage === 'REJECTED' && (
                <p className="mt-2 text-[11px] font-semibold text-red-600">Hồ sơ đã bị từ chối.</p>
              )}
            </div>
          )}

          {/* Header Action */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowReportModal(true)}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Báo cáo vi phạm"
              >
                <FaExclamationTriangle size={18} />
              </button>
              <button 
                onClick={handleToggleFavorite}
                className={`p-2.5 rounded-xl transition-all ${isFavorited ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                title={isFavorited ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
              >
                {isFavorited ? <FaStar size={18} /> : <FaRegStar size={18} /> }
              </button>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Profile Summary */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-slate-100 shadow-sm object-cover bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center shrink-0 overflow-hidden">
                <FaUserTie size={32} className="text-[#1967D2]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-7 truncate">
                  {candidate.name || "Ứng viên"}
                </h2>
                <p className="text-blue-600 font-bold text-sm mt-1 truncate">
                  {candidate.title || "Chưa có vị trí"}
                </p>
                <p className="text-slate-400 text-xs font-medium mt-0.5">ID: #{candidate.id}</p>
              </div>
            </div>

            {/* Contact Quick Box */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                  <FaPhone className="text-blue-500 rotate-90" size={12} />
                  {candidate.phoneNumber || "0901111111"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm truncate" title={candidate.email}>
                  <FaEnvelope className="text-blue-500" size={12} />
                  {candidate.email || "N/A"}
                </div>
              </div>
            </div>

            {/* Introduction */}
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Giới thiệu bản thân
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {candidate.summary || "Ứng viên chưa cập nhật thông tin giới thiệu chi tiết."}
              </p>
            </section>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={handleSendMessage}
                className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-[#1967D2] text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                <FaEnvelope /> Gửi tin nhắn
              </button>
              {!isApplied && (
                <p className="text-xs text-slate-400 text-center">
                  Ứng viên này chưa apply. Sau khi ứng viên gửi hồ sơ, bạn có thể chuyển trạng thái phỏng vấn / nhận.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ════════════ NESTED REPORT MODAL ════════════ */}
        {showReportModal && (
          <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-scale-up">
              <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                  <FaExclamationTriangle size={24} />
                </div>
                Báo cáo vi phạm
              </h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">
                Bạn đang báo cáo ứng viên <span className="text-slate-800 font-bold">{candidate.name || candidate.applicantName}</span>. Vui lòng chọn lý do chính xác.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Lý do chính</label>
                  <div className="relative">
                    <select
                      value={reportData.type}
                      onChange={(e) => setReportData({ ...reportData, type: e.target.value })}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="w-full h-14 px-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:border-blue-400 outline-none transition-all cursor-pointer appearance-none"
                    >
                      {REPORT_REASONS.map(r => (
                        <option key={r.value} value={r.value} style={{ fontFamily: "'Inter', sans-serif" }}>{r.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mô tả chi tiết</label>
                  <textarea
                    rows="4"
                    placeholder="Vui lòng cung cấp thêm thông tin để bộ phận hỗ trợ xử lý nhanh hơn..."
                    value={reportData.description}
                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-medium focus:border-blue-400 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={isReporting}
                    className="flex-[1.5] py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all disabled:opacity-50"
                  >
                    {isReporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default ReviewCandidateModal;
