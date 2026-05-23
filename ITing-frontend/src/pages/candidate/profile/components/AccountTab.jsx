import React, { useState } from 'react';
import { FaLock, FaEnvelope, FaTrashAlt, FaShieldAlt } from 'react-icons/fa';

const AccountTab = () => {
    const [email, setEmail] = useState('nghiavolecra@gmail.com');
    
    return (
        <div className="space-y-8 max-full">
            {/* Password Section */}
            <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <FaLock />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Đổi mật khẩu</h3>
                        <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo mật tài khoản</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button className="mt-2 w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Cập nhật mật khẩu
                    </button>
                </div>
            </section>

            {/* Email Section */}
            <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <FaEnvelope />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Thay đổi Email</h3>
                        <p className="text-sm text-gray-500">Email hiện tại: <span className="font-medium text-gray-700">{email}</span></p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email mới</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="new-email@example.com"
                        />
                    </div>
                    <button className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Cập nhật Email
                    </button>
                </div>
            </section>

            {/* Delete Account Section */}
            <section className="bg-red-50 p-6 rounded-lg border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <FaTrashAlt />
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-800">Xóa tài khoản</h3>
                        <p className="text-sm text-red-600">Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.</p>
                    </div>
                </div>
                <button className="w-full md:w-auto bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                    Xóa tài khoản ngay
                </button>
            </section>
        </div>
    );
};

export default AccountTab;
