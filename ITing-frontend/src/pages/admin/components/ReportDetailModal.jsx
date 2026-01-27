import React from 'react';
import { FaTimes, FaUser, FaUserShield, FaExclamationCircle } from 'react-icons/fa';

const ReportDetailModal = ({ isOpen, onClose, report }) => {
    if (!isOpen || !report) return null;

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Panel */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full transform transition-all overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaExclamationCircle className="text-white/80" />
                            Chi tiết báo cáo {report.id}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-600/50"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* 1. Người báo cáo & Người bị báo cáo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Reporter */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <FaUserShield className="text-blue-500" />
                                    Người báo cáo
                                </h4>
                                <div className="font-medium text-gray-800">{report.reporter}</div>
                                <div className="text-sm text-gray-500 mt-1">Role: {report.reporterRole || 'User'}</div>
                            </div>

                            {/* Reported User */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <FaUser className="text-red-500" />
                                    Người bị báo cáo
                                </h4>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={report.avatar || "https://via.placeholder.com/150"}
                                        alt={report.reportedUser}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-800">{report.reportedUser}</div>
                                        <div className="text-sm text-gray-500">ID: {report.reportedUserId || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Thông tin vi phạm */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Thông tin vi phạm</h4>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Loại vi phạm:</span>
                                    <span className="text-sm font-bold text-gray-800">{report.violation}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Đối tượng:</span>
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                        {report.type}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Thời gian báo cáo:</span>
                                    <span className="text-sm text-gray-800">{formatDate(report.date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Mức độ nghiêm trọng:</span>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${report.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                                            report.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                                                report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                        }`}>
                                        {report.severity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Lí do & Bằng chứng */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Lí do chi tiết & Bằng chứng</h4>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    {report.reason || report.evidenceText || "Không có mô tả chi tiết."}
                                </p>

                                {report.evidenceImages && report.evidenceImages.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Hình ảnh đính kèm</h5>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {report.evidenceImages.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="h-24 w-auto rounded border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Đóng
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Xử lý ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;
