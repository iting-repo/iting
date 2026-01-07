import React from 'react';
import { FaTimes, FaEnvelope, FaPhone, FaDownload, FaStar, FaRegStar, FaCheckCircle, FaUserTie } from 'react-icons/fa';

const CandidateDetailModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose} >

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-scale-up max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-[#3AB4E6]"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                <div className="px-8 pb-8">
                    {/* Profile Section (Avatar đè lên Header) */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 mb-8">
                        <div className="flex items-end gap-6">
                            <img
                                src={candidate.avatar || "https://via.placeholder.com/150"}
                                alt={candidate.applicantName}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                            />
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold text-gray-800">{candidate.applicantName}</h2>
                                <p className="text-gray-500 font-medium">{candidate.jobPosition}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 md:mt-0">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
                                <FaRegStar /> Lưu hồ sơ
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3AB4E6] text-[#3AB4E6] rounded-lg hover:bg-blue-50 shadow-sm transition-colors">
                                <FaEnvelope /> Liên hệ
                            </button>
                            <button className="flex items-center gap-2 px-6 py-2 bg-[#1967D2] text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors">
                                <FaCheckCircle /> Tuyển dụng
                            </button>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Cột Trái: Thông tin chính */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thư xin việc (Cover Letter)</h3>
                                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                    {candidate.coverLetter || "Ứng viên chưa nhập thư xin việc."}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Kinh nghiệm làm việc</h3>
                                <div className="space-y-4">
                                    {/* Mock Item - API chưa trả về experience */}
                                    <div className="flex gap-4">
                                        <div className="mt-1"><FaUserTie className="text-gray-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Chưa có thông tin kinh nghiệm</h4>
                                            <p className="text-sm text-gray-500">...</p>
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
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-gray-700 truncate w-32" title={candidate.cvTitle || candidate.cvUrl}>
                                                {candidate.cvTitle || (candidate.cvUrl ? candidate.cvUrl.split('/').pop() : 'No CV File')}
                                            </p>
                                            <p className="text-xs text-gray-400">PDF</p>
                                        </div>
                                    </div>
                                    {candidate.cvUrl && (
                                        <a
                                            href={candidate.cvUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FaDownload />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Box Contact Info */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4">Thông tin liên hệ</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-full text-blue-600"><FaPhone size={14} /></div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-gray-400 uppercase font-bold">Số điện thoại</p>
                                            <p className="text-sm font-medium text-gray-700 truncate">{candidate.applicantPhone || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-full text-blue-600"><FaEnvelope size={14} /></div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                            <p className="text-sm font-medium text-gray-700 truncate" title={candidate.applicantEmail}>{candidate.applicantEmail || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CandidateDetailModal;