import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaPhone, FaDownload, FaStar, FaRegStar, FaCheckCircle, FaUserTie, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import applicationService from '../../services/applicationService';

const CandidateDetailModal = ({ candidate, onClose }) => {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    if (!candidate) return null;

    const handleToggleFavorite = () => {
        setIsFavorited(!isFavorited);
    };

    const handleStartConversation = async () => {
        try {
            setIsStartingChat(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Đã mở cuộc trò chuyện với ứng viên!');
        } catch (error) {
            console.error('Lỗi khi mở chat:', error);
            toast.error('Có lỗi xảy ra.');
        } finally {
            setIsStartingChat(false);
        }
    };

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            await applicationService.acceptApplication(candidate.id, 'Nhà tuyển dụng đã phản hồi thông qua UI');
            toast.success('Đã đánh dấu tuyển dụng ứng viên thành công!');
            onClose();
        } catch (error) {
            console.error('Lỗi khi tuyển dụng:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsAccepting(false);
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
                                className={`p-2.5 rounded-xl transition-all ${
                                    isFavorited
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
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="space-y-8">
                            {/* Profile Summary */}
                            <div className="flex items-center gap-5">
                                <img
                                    src={candidate.avatarUrl || "https://via.placeholder.com/150"}
                                    alt={candidate.applicantName}
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                />
                                <div className="mb-2">
                                    <h2 className="text-3xl font-bold text-gray-800">{candidate.applicantName || "Chưa cập nhật"}</h2>
                                    <p className="text-gray-500 font-medium">{candidate.jobTitle || "Chưa cập nhật"}</p>
                                </div>
                            </div>

                            {/* Introduction */}
                            <section>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Giới thiệu bản thân
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {candidate.introduction || "Ứng viên chưa cập nhật thông tin giới thiệu chi tiết."}
                                </p>
                            </section>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Cột Trái: Thông tin chính */}
                                <div className="lg:col-span-2 space-y-8">
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Kinh nghiệm làm việc</h3>
                                        <div className="space-y-4">
                                            {/* Mock Item */}
                                            <div className="flex gap-4">
                                                <div className="mt-1"><FaUserTie className="text-gray-400" /></div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">Senior UI Designer</h4>
                                                    <p className="text-sm text-gray-500">Google Inc • 2020 - Present</p>
                                                    <p className="text-sm text-gray-600 mt-1">Chịu trách nhiệm thiết kế hệ thống Design System...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Cột Phải: Thông tin liên hệ & CV */}
                                <div className="space-y-6">

                                    {/* Box Download CV */}
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <h4 className="font-bold text-gray-800 mb-4">Download CV</h4>
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" className="w-8 h-8" alt="PDF" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700 truncate w-24">{candidate.cvFileName || `CV_${candidate.applicantName || candidate.id}`}</p>
                                                    <p className="text-xs text-gray-400">PDF</p>
                                                </div>
                                            </div>
                                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Box Contact Info */}
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-4">Thông tin liên hệ</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-full text-blue-600"><FaPhone size={14} /></div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Số điện thoại</p>
                                                    <p className="text-sm font-medium text-gray-700">{candidate.phoneNumber || "Chưa cập nhật"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-full text-blue-600"><FaEnvelope size={14} /></div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                                    <p className="text-sm font-medium text-gray-700">{candidate.email || "Chưa cập nhật"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Footer Section - Action Buttons */}
                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    onClick={handleStartConversation}
                                    disabled={isStartingChat}
                                    className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    <FaEnvelope /> {isStartingChat ? 'Dang mo chat...' : 'Gui tin nhan'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3AB4E6] text-[#3AB4E6] rounded-lg hover:bg-blue-50 shadow-sm transition-colors">
                                    <FaEnvelope /> Liên hệ
                                </button>
                                <button 
                                    onClick={handleAccept}
                                    disabled={isAccepting}
                                    className={`flex items-center gap-2 px-6 py-2 bg-[#1967D2] text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors ${isAccepting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <FaCheckCircle /> {isAccepting ? 'Đang xử lý...' : 'Tuyển dụng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CandidateDetailModal;
