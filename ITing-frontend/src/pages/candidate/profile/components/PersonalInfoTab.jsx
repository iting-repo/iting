import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCamera, FaSave, FaEnvelope } from 'react-icons/fa';
import axiosInstance from '../../../../utils/axiosInstance';

const PersonalInfoTab = () => {

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNum: '',
        avatarUrl: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch basic personal info
                const data = await axiosInstance.get('/user/profile');
                setFormData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phoneNum: data.phoneNum || '',
                    avatarUrl: data.avatarUrl || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdatePersonal = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axiosInstance.put('user/profile/personal', {
                fullName: formData.fullName,
                phoneNum: formData.phoneNum,
                avatarUrl: formData.avatarUrl
            });
            alert("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Failed to update personal info", error);
            alert("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Đang tải thông tin cá nhân...</div>;
    }

    return (
        <div className="max-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Avatar and Basic Identifiers */}
                <div className="lg:col-span-1 border-r border-gray-100 pr-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4 group">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-50 bg-gray-100 flex items-center justify-center overflow-hidden">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle className="w-full h-full text-gray-300" />
                                )}
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-blue-700 transition-colors shadow-sm">
                                <FaCamera size={14} />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">{formData.fullName || "Đang tải..."}</h3>
                        <p className="text-gray-500 text-sm">Cài đặt hồ sơ cá nhân</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Trạng thái hồ sơ</p>
                            <p className="text-sm text-blue-800 font-medium italic">Không thiết lập giới hạn thông tin</p>
                        </div>
                    </div>
                </div>

                {/* Right side: Form Fields */}
                <div className="lg:col-span-2">
                    <form className="space-y-6" onSubmit={handleUpdatePersonal}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                                <input
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal text-xs">(Không thể đổi)</span></label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-9 pr-4 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                <input
                                    name="phoneNum"
                                    type="text"
                                    value={formData.phoneNum}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* 
                            // Các trường ẩn theo yêu cầu:
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div> 
                            */}

                        </div>

                        {/* 
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú</label>
                            <textarea 
                                rows="3"
                                placeholder="VD: 123 Đường ABC, Quận X, TP. HCM"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            ></textarea>
                        </div> 
                        */}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex items-center gap-2 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                <FaSave /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoTab;