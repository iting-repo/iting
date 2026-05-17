import React, { useState, useEffect } from 'react';
import { FaTimes, FaEnvelope, FaPhone, FaDownload, FaStar, FaRegStar, FaUserTie, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import axiosInstance from '../../../../utils/axiosInstance';

const CandidatePreviewModal = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [candidateData, setCandidateData] = useState(null);

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                setIsLoading(true);
                // Fetch basic and professional profile in parallel
                const [basicInfo, professionalInfo, cvs, experiences] = await Promise.all([
                    axiosInstance.get('/user/profile'),
                    axiosInstance.get('/user/professional-profile'),
                    axiosInstance.get('/user/professional-profile/cv'),
                    axiosInstance.get('/user/professional-profile/experience')
                ]);

                // Find default CV or just use the first one
                let cvUrl = null;
                let cvFileName = null;
                if (cvs && cvs.length > 0) {
                    const defaultCv = cvs.find(cv => cv.isDefault) || cvs[0];
                    cvUrl = defaultCv.fileUrl || defaultCv.filePath; 
                    cvFileName = defaultCv.title;
                }

                setCandidateData({
                    id: basicInfo.id,
                    applicantName: basicInfo.fullName,
                    email: basicInfo.email,
                    phoneNumber: basicInfo.phoneNum,
                    avatarUrl: basicInfo.avatarUrl,
                    jobTitle: professionalInfo?.headline,
                    introduction: professionalInfo?.shortBio,
                    cvUrl: cvUrl,
                    cvFileName: cvFileName,
                    experiences: experiences || []
                });
            } catch (error) {
                console.error("Failed to load generic candidate preview data", error);
                
                // Hiển thị lỗi ra giao diện thay vì chỉ tắt modal
                setCandidateData({ hasError: true, errorMsg: error.message || "Lỗi tải dữ liệu" });
                toast.error("Không thể tải dữ liệu xem trước!");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidateData();
    }, []);

    if (candidateData?.hasError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
                 <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center" onClick={(e) => e.stopPropagation()}>
                     <h3 className="text-red-500 font-bold mb-4 text-xl">Đã xảy ra lỗi khi tải Preview</h3>
                     <p className="text-gray-600">{candidateData.errorMsg}</p>
                     <button onClick={onClose} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">Đóng</button>
                 </div>
            </div>
        );
    }

    if (!candidateData && !isLoading) return null;

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
                            <h3 className="font-bold text-slate-800">Review Hồ sơ ứng viên (Xem trước)</h3>
                        </div>
                        {candidateData?.cvUrl && (
                            <a
                                href={candidateData.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#1967D2] hover:underline flex items-center gap-1"
                            >
                                <FaExternalLinkAlt size={10} /> Mở trong tab mới
                            </a>
                        )}
                    </div>

                    <div className="flex-1 bg-[#525659] overflow-hidden">
                        {isLoading ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                                <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
                                <p className="text-gray-500">Đang tải hồ sơ của bạn...</p>
                            </div>
                        ) : candidateData?.cvUrl ? (
                            <iframe
                                src={`${candidateData.cvUrl}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="Xem trước CV"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-12 text-center bg-slate-100">
                                <div className="p-6 bg-slate-200 rounded-full">
                                    <FaUserTie size={48} className="opacity-20" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-600">Bạn chưa tải CV lên</p>
                                    <p className="text-sm">Hãy thêm CV để nhà tuyển dụng có thể xem chi tiết hồ sơ của bạn.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN & THAO TÁC (3/7) */}
                <div className="flex-[3] flex flex-col bg-white overflow-hidden relative">
                    {/* Header Action */}
                    <div className="p-6 border-b border-slate-100 flex justify-end items-center shrink-0">
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
                                <p className="text-gray-500">Đang tải thông tin...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Profile Summary */}
                                <div className="flex items-center gap-5">
                                    <img
                                        src={candidateData?.avatarUrl || "https://via.placeholder.com/150"}
                                        alt={candidateData?.applicantName}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                    />
                                    <div className="mb-2">
                                        <h2 className="text-3xl font-bold text-gray-800">{candidateData?.applicantName || "Chưa cập nhật"}</h2>
                                        <p className="text-gray-500 font-medium">{candidateData?.jobTitle || "Chưa cập nhật chức danh"}</p>
                                    </div>
                                </div>

                                {/* Introduction */}
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Giới thiệu bản thân
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                        {candidateData?.introduction || "Bạn chưa cập nhật thông tin giới thiệu chi tiết."}
                                    </p>
                                </section>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                    {/* Cột Trái: Thông tin chính */}
                                    <div className="lg:col-span-2 space-y-8">
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Kinh nghiệm làm việc</h3>
                                            <div className="space-y-4">
                                                {candidateData?.experiences && candidateData.experiences.length > 0 ? (
                                                    candidateData.experiences.map((exp, idx) => (
                                                        <div key={idx} className="flex gap-4">
                                                            <div className="mt-1"><FaUserTie className="text-gray-400" /></div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-800">{exp.position}</h4>
                                                                <p className="text-sm text-gray-500">{exp.companyName} • {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.isCurrent ? 'Hiện tại' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm italic">Chưa có kinh nghiệm làm việc.</p>
                                                )}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Cột Phải: Thông tin liên hệ & CV */}
                                    <div className="space-y-6">

                                        {/* Box Download CV */}
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col opacity-60">
                                            <h4 className="font-bold text-gray-800 mb-4">Download CV</h4>
                                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" className="w-8 h-8" alt="PDF" />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700 truncate w-24">
                                                            {candidateData?.cvFileName || "Chưa có CV"}
                                                        </p>
                                                        <p className="text-xs text-gray-400">PDF</p>
                                                    </div>
                                                </div>
                                                <button disabled className="p-2 text-blue-500 disabled:text-gray-300 rounded-lg transition-colors cursor-not-allowed">
                                                    <FaDownload />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 italic text-center">(Chức năng tải xuống dành cho NTD)</p>
                                        </div>

                                        {/* Box Contact Info */}
                                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm opacity-80">
                                            <h4 className="font-bold text-gray-800 mb-4">Thông tin liên hệ</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-full text-blue-600"><FaPhone size={14} /></div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold">Số điện thoại</p>
                                                        <p className="text-sm font-medium text-gray-700">{candidateData?.phoneNumber || "Chưa cập nhật"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-full text-blue-600"><FaEnvelope size={14} /></div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                                        <p className="text-sm font-medium text-gray-700">{candidateData?.email || "Chưa cập nhật"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidatePreviewModal;
