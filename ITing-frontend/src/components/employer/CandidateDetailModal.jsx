import React, { useState, useEffect } from 'react';
import { useModalEscape } from '../../hooks/useModalEscape';
import {
    FaTimes, FaEnvelope, FaPhone, FaDownload,
    FaStar, FaRegStar, FaCheckCircle, FaUserTie,
    FaExclamationTriangle, FaExternalLinkAlt
} from 'react-icons/fa';
import { toast } from 'sonner';
import applicationService from '../../services/applicationService';
import reportService from '../../services/reportService';
import favoriteCandidateService from '../../services/favoriteCandidateService';
import messageService from '../../services/messageService';
import { employerCandidateService } from '../../services/employerCandidateService';
import { useNavigate } from 'react-router-dom';

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam / Tin nhắn rác', priority: 'LOW' },
    { value: 'SCAM', label: 'Lừa đảo / Dấu hiệu lừa đảo', priority: 'CRITICAL' },
    { value: 'FAKE_INFO', label: 'Thông tin giả mạo', priority: 'HIGH' },
    { value: 'HARASSMENT', label: 'Quấy rối / Đe dọa', priority: 'HIGH' },
    { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp', priority: 'MEDIUM' },
    { value: 'OTHER', label: 'Lý do khác...', priority: 'LOW' },
];

const CandidateDetailModal = ({ candidate, onClose, onStatusUpdate }) => {
    const navigate = useNavigate();
    const [isAccepting, setIsAccepting] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({
        type: 'SPAM',
        description: ''
    });
    const [isReporting, setIsReporting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [fullProfile, setFullProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    useModalEscape(onClose);

    useEffect(() => {
        if (candidate && candidate.status === 'PENDING') {
            applicationService.markViewed(candidate.id)
                .then(() => {
                    if (onStatusUpdate) {
                        onStatusUpdate(candidate.id, 'VIEWED');
                    }
                })
                .catch(err => console.error("Could not mark as viewed", err));
        }
        // Check favorite status
        if (candidate) {
            setIsFavorited(favoriteCandidateService.isFavorite(candidate.id));
            fetchFullProfile();
        }
    }, [candidate, onStatusUpdate]);

    const fetchFullProfile = async () => {
        try {
            setIsLoadingProfile(true);
            const candidateUserId = candidate?.userId || candidate?.applicantId;
            if (candidateUserId) {
                const response = await employerCandidateService.getFullProfile(candidateUserId);
                setFullProfile(response.data || response);
            }
        } catch (error) {
            console.error('Failed to fetch full profile:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    if (!candidate) return null;

    const handleToggleFavorite = () => {
        const newStatus = favoriteCandidateService.toggleFavorite(candidate);
        setIsFavorited(newStatus);
        if (newStatus) {
            toast.success(`Đã thêm ${candidate.applicantName} vào danh sách yêu thích!`);
        } else {
            toast('Đã xóa khỏi danh sách yêu thích.', { icon: '🗑️' });
        }
    };

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            await applicationService.acceptApplication(candidate.id, 'Nhà tuyển dụng đã phản hồi thông qua UI');
            toast.success('Đã chấp nhận tuyển dụng và gửi email thông báo cho ứng viên!');
            onClose();
        } catch (error) {
            console.error('Lỗi khi tuyển dụng:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReport = async () => {
        if (!reportData.description.trim()) {
            toast.error('Vui lòng nhập mô tả chi tiết lý do báo cáo.');
            return;
        }

        try {
            setIsReporting(true);
            const selectedReason = REPORT_REASONS.find(r => r.value === reportData.type);

            await reportService.createReport({
                targetId: candidate.userId || candidate.applicantId,
                targetType: 'USER',
                targetName: candidate.applicantName,
                type: reportData.type,
                reason: selectedReason.label,
                description: reportData.description,
                priority: selectedReason.priority,
                status: 'PENDING'
            });

            toast.success('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất!');
            setShowReportModal(false);
            setReportData({ type: 'SPAM', description: '' });
        } catch (error) {
            console.error('Lỗi khi báo cáo:', error);
            toast.error('Gửi báo cáo thất bại. Vui lòng thử lại.');
        } finally {
            setIsReporting(false);
        }
    };

    const handleStartConversation = async () => {
        const candidateUserId = candidate?.userId || candidate?.applicantId;
        if (!candidateUserId) {
            toast.error('Không xác định được ứng viên để nhắn tin.');
            return;
        }

        setIsStartingChat(true);
        try {
            const sent = await messageService.sendMessage({
                receiverId: candidateUserId,
                receiverType: 'USER',
                senderType: 'COMPANY',
                content: 'Chào bạn, chúng tôi muốn kết nối về cơ hội công việc.',
            });

            onClose();
            navigate(`/messages?conversationId=${sent.conversationId}`);
            toast.success('Đã mở cuộc trò chuyện với ứng viên.');
        } catch (error) {
            toast.error(error?.message || 'Không thể tạo cuộc trò chuyện lúc này.');
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={onClose} >

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden relative animate-scale-up border border-white/20 flex flex-col md:flex-row"
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
                        <a
                            href={candidate.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#1967D2] hover:underline flex items-center gap-1"
                        >
                            <FaExternalLinkAlt size={10} /> Mở trong tab mới
                        </a>
                    </div>

                    <div className="flex-1 bg-[#525659] overflow-hidden">
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
                                    <p className="font-bold text-slate-600">Không tìm thấy file CV</p>
                                    <p className="text-sm">Ứng viên có thể chưa đính kèm CV hoặc file đã bị lỗi.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN & THAO TÁC (3/7) */}
                <div className="flex-[3] flex flex-col bg-white overflow-hidden">
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
                                className={`p-2.5 rounded-xl transition-all ${isFavorited
                                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                                    }`}
                                title={isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                            >
                                {isFavorited ? <FaStar size={18} /> : <FaRegStar size={18} />}
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        {/* Profile Summary */}
                        <div className="flex items-center gap-5">
                            <img
                                src={candidate.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.applicantName || 'Ung vien')}&background=random`}
                                alt={candidate.applicantName}
                                className="w-20 h-20 rounded-2xl border-2 border-slate-100 shadow-sm object-cover bg-white"
                            />
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-7">{candidate.applicantName || "Chưa cập nhật"}</h2>
                                <p className="text-blue-600 font-bold text-sm mt-1">{candidate.jobTitle || "Vị trí ứng tuyển"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-slate-400 text-xs">ID: #{candidate.id}</p>
                                    {isFavorited && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">
                                            <FaStar size={8} /> Đã yêu thích
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Quick Box */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số điện thoại</p>
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                    <FaPhone className="text-blue-500" size={12} />
                                    {candidate.phoneNumber || "N/A"}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</p>
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm truncate" title={candidate.email}>
                                    <FaEnvelope className="text-blue-500" size={12} />
                                    {candidate.email || "N/A"}
                                </div>
                            </div>

                            {/* Introduction */}
                            <section>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Giới thiệu bản thân
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {fullProfile?.profile?.shortBio || candidate.introduction || "Ứng viên chưa cập nhật thông tin giới thiệu chi tiết."}
                                </p>
                            </section>

                            {/* Skills Section */}
                            {fullProfile?.skills && fullProfile.skills.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Kỹ năng
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {fullProfile.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-100 flex items-center gap-1.5">
                                                {skill.name}

                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Social Links Section */}
                            {fullProfile?.socialLinks && fullProfile.socialLinks.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                        Liên kết mạng xã hội
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {fullProfile.socialLinks.map((link, idx) => (
                                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2 w-max">
                                                <FaExternalLinkAlt size={12} /> {link.platform || link.url}
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Experience Section */}
                            {fullProfile?.experiences && fullProfile.experiences.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                        Kinh nghiệm làm việc
                                    </h4>
                                    <div className="space-y-4">
                                        {fullProfile.experiences.map((exp, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <h5 className="font-bold text-slate-800">{exp.position} - {exp.companyName}</h5>
                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN') : ''} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                                </p>
                                                {exp.description && (
                                                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{exp.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Education Section */}
                            {fullProfile?.educations && fullProfile.educations.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Học vấn
                                    </h4>
                                    <div className="space-y-4">
                                        {fullProfile.educations.map((edu, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <h5 className="font-bold text-slate-800">{edu.schoolName}</h5>
                                                <p className="text-sm text-slate-600 font-medium">{edu.fieldOfStudy} {edu.degree && `- ${edu.degree}`}</p>
                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                    {edu.startDate ? new Date(edu.startDate).toLocaleDateString('vi-VN') : ''} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                                </p>
                                                {edu.description && (
                                                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{edu.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Certificates Section */}
                            {fullProfile?.certificates && fullProfile.certificates.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                        Chứng chỉ
                                    </h4>
                                    <div className="space-y-3">
                                        {fullProfile.certificates.map((cert, idx) => (
                                            <div key={idx} className="p-3 bg-yellow-50/50 rounded-xl border border-yellow-100">
                                                <h5 className="font-bold text-slate-800">{cert.name}</h5>
                                                <p className="text-sm text-slate-600">{cert.organization}</p>
                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                    Cấp: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                    {cert.credentialUrl && (
                                                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                                                            Xem chứng chỉ
                                                        </a>
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Portfolios Section */}
                            {fullProfile?.portfolios && fullProfile.portfolios.length > 0 && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        Portfolio / Dự án
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {fullProfile.portfolios.map((port, idx) => (
                                            <div key={idx} className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
                                                <h5 className="font-bold text-slate-800">{port.title}</h5>
                                                {port.url && (
                                                    <a href={port.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                        <FaExternalLinkAlt size={10} /> Link dự án
                                                    </a>
                                                )}
                                                {port.description && (
                                                    <p className="text-sm text-slate-600 mt-2 line-clamp-3" title={port.description}>{port.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Footer Section - Action Buttons */}
                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    onClick={handleStartConversation}
                                    disabled={isStartingChat}
                                    className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    <FaEnvelope /> {isStartingChat ? 'Đang mở chat...' : 'Gửi tin nhắn'}
                                </button>
                                <button
                                    onClick={handleAccept}
                                    disabled={isAccepting}
                                    className={`w-full flex justify-center items-center gap-2 px-6 py-4 bg-[#1967D2] text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 ${isAccepting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <FaCheckCircle /> {isAccepting ? 'Đang xử lý...' : 'Chấp nhận tuyển dụng'}
                                </button>
                            </div>
                        </div>
                    </div>

                    </div>

                    {/* MODAL BÁO CÁO (NESTED) */}
                    {showReportModal && (
                        <div className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                                <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                        <FaExclamationTriangle size={24} />
                                    </div>
                                    Báo cáo vi phạm
                                </h3>
                                <p className="text-slate-500 text-sm mb-8 font-medium">Bạn đang báo cáo ứng viên <span className="text-slate-800 font-bold">{candidate.applicantName}</span>. Vui lòng chọn lý do chính xác.</p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Lý do chính</label>
                                        <div className="relative">
                                            <select
                                                value={reportData.type}
                                                onChange={(e) => setReportData({ ...reportData, type: e.target.value })}
                                                className="w-full h-14 px-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:border-blue-400 outline-none transition-all cursor-pointer appearance-none"
                                            >
                                                {REPORT_REASONS.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
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
};


export default CandidateDetailModal;
