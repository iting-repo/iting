import React from 'react';
import { FaUserCircle, FaCamera, FaSave } from 'react-icons/fa';

const PersonalInfoTab = () => {
    return (
        <div className="max-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Avatar and Basic Identifiers */}
                <div className="lg:col-span-1 border-r border-gray-100 pr-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4 group">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-50 bg-gray-100 flex items-center justify-center overflow-hidden">
                                <FaUserCircle className="w-full h-full text-gray-300" />
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-blue-700 transition-colors shadow-sm">
                                <FaCamera size={14} />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Nguyễn Văn A</h3>
                        <p className="text-gray-500 text-sm">Ứng viên #12345</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Trạng thái hồ sơ</p>
                            <p className="text-sm text-blue-800 font-medium italic">Hồ sơ đã được xác minh danh tính</p>
                        </div>
                    </div>
                </div>

                {/* Right side: Form Fields */}
                <div className="lg:col-span-2">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                                <input 
                                    type="text" 
                                    defaultValue="Nguyễn Văn A"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                <input 
                                    type="text" 
                                    defaultValue="0123456789"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú</label>
                            <textarea 
                                rows="3"
                                placeholder="VD: 123 Đường ABC, Quận X, TP. HCM"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
                                <FaSave /> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoTab;