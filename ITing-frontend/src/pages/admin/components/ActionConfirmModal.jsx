import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaBan, FaTimes } from 'react-icons/fa';

const ActionConfirmModal = ({ isOpen, onClose, onConfirm, actionType, reportId }) => {
    const [notifyReporter, setNotifyReporter] = useState(true);
    const [notifyReportedUser, setNotifyReportedUser] = useState(false);

    if (!isOpen) return null;

    // Configuration based on action type
    const getConfig = () => {
        switch (actionType) {
            case 'resolve':
                return {
                    title: 'Xác nhận xử lý an toàn',
                    message: `Bạn có chắc chắn muốn đánh dấu báo cáo ${reportId} là "Đã giải quyết" (An toàn)?`,
                    icon: <FaCheckCircle size={40} />,
                    color: 'green',
                    btnColor: 'bg-green-600 hover:bg-green-700',
                    lightBg: 'bg-green-50',
                    text: 'text-green-600'
                };
            case 'warn':
                return {
                    title: 'Gửi cảnh báo',
                    message: `Bạn có chắc chắn muốn gửi cảnh báo tới người dùng bị báo cáo trong ${reportId}?`,
                    icon: <FaExclamationTriangle size={40} />,
                    color: 'yellow',
                    btnColor: 'bg-yellow-500 hover:bg-yellow-600',
                    lightBg: 'bg-yellow-50',
                    text: 'text-yellow-600'
                };
            case 'block':
                return {
                    title: 'Khóa tài khoản',
                    message: `Hành động này sẽ khóa tài khoản bị báo cáo trong ${reportId}. Bạn có chắc chắn không?`,
                    icon: <FaBan size={40} />,
                    color: 'red',
                    btnColor: 'bg-red-600 hover:bg-red-700',
                    lightBg: 'bg-red-50',
                    text: 'text-red-600'
                };
            default:
                return {
                    title: 'Xác nhận hành động',
                    message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
                    icon: <FaExclamationTriangle size={40} />,
                    color: 'gray',
                    btnColor: 'bg-gray-600 hover:bg-gray-700',
                    lightBg: 'bg-gray-50',
                    text: 'text-gray-600'
                };
        }
    };

    const config = getConfig();

    const handleConfirmClick = () => {
        onConfirm(notifyReporter, notifyReportedUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Panel */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full transform transition-all overflow-hidden p-6 text-center">

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>

                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.lightBg} ${config.text}`}>
                        {config.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        {config.message}
                    </p>

                    {/* Notification Options */}
                    <div className="text-left bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Tùy chọn thông báo</label>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifyReporter}
                                        onChange={(e) => setNotifyReporter(e.target.checked)}
                                        className="peer w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">Gửi thông báo cho người báo cáo</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifyReportedUser}
                                        onChange={(e) => setNotifyReportedUser(e.target.checked)}
                                        className="peer w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">Gửi thông báo cho người bị báo cáo</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white text-gray-700 font-bold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleConfirmClick}
                            className={`flex-1 px-4 py-2 text-white font-bold rounded-lg transition-colors shadow-lg shadow-${config.color}-200 ${config.btnColor}`}
                        >
                            Xác nhận
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ActionConfirmModal;
