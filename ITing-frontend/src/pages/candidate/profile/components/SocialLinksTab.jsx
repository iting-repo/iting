import React, { useState, useEffect } from 'react';
import { FaLinkedin, FaGithub, FaFacebook, FaTwitter, FaGlobe, FaSave } from 'react-icons/fa';
import axiosInstance from '../../../../utils/axiosInstance';
import { toast } from 'sonner';

const SocialLinksTab = () => {
    const socialPlatforms = [
        { id: 'LINKEDIN', label: 'LinkedIn', icon: <FaLinkedin className="text-[#0077b5]" />, placeholder: 'https://linkedin.com/in/username' },
        { id: 'GITHUB', label: 'GitHub', icon: <FaGithub className="text-[#333]" />, placeholder: 'https://github.com/username' },
        { id: 'FACEBOOK', label: 'Facebook', icon: <FaFacebook className="text-[#1877f2]" />, placeholder: 'https://facebook.com/username' },
        { id: 'TWITTER', label: 'Twitter (X)', icon: <FaTwitter className="text-[#1da1f2]" />, placeholder: 'https://twitter.com/username' },
        { id: 'WEBSITE', label: 'Website Cá nhân', icon: <FaGlobe className="text-gray-600" />, placeholder: 'https://yourwebsite.com' },
    ];

    const [links, setLinks] = useState({});
    const [originalLinks, setOriginalLinks] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const fetchedData = await axiosInstance.get('/user/professional-profile/social-links');
            const dataArray = fetchedData || [];
            const newLinks = {};
            const newOriginalLinks = {};
            dataArray.forEach(item => {
                newLinks[item.platform] = item.url;
                newOriginalLinks[item.platform] = item;
            });
            setLinks(newLinks);
            setOriginalLinks(newOriginalLinks);
        } catch (error) {
            console.error("Failed to fetch social links", error);
        }
    };

    const handleChange = (platformId, value) => {
        setLinks(prev => ({ ...prev, [platformId]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const errors = {};
        for (const platform of socialPlatforms) {
            const currentUrl = links[platform.id] || "";
            if (currentUrl.trim() !== "" && !/^https?:\/\/.+/.test(currentUrl.trim())) {
                errors[platform.id] = "URL không hợp lệ, phải bắt đầu bằng http:// hoặc https://";
            }
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        setIsSaving(true);
        try {
            for (const platform of socialPlatforms) {
                const currentUrl = links[platform.id] || "";
                const originalLink = originalLinks[platform.id];
                const originalUrl = originalLink ? originalLink.url : "";

                if (currentUrl !== originalUrl) {
                    // Xóa url cũ nếu có
                    if (originalLink && originalLink.id) {
                        try {
                            await axiosInstance.delete(`/user/professional-profile/social-link/${originalLink.id}`);
                        } catch (err) {
                            console.error(`Failed to delete old link for ${platform.id}`, err);
                        }
                    }
                    // Thêm mới nếu field không rỗng
                    if (currentUrl.trim() !== "") {
                        try {
                            await axiosInstance.post('/user/professional-profile/social-link', {
                                platform: platform.id,
                                url: currentUrl.trim()
                            });
                        } catch (err) {
                            console.error(`Failed to create link for ${platform.id}`, err);
                        }
                    }
                }
            }
            toast.success("Cập nhật tất cả liên kết thành công!");
            fetchLinks();
        } catch (error) {
            console.error("Failed to update social links", error);
            toast.error("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full bg-white">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Liên kết mạng xã hội</h3>
                <p className="text-sm text-gray-500 mt-1">Gắn các liên kết này để nhà tuyển dụng có cái nhìn tổng quan hơn về bạn.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSave}>
                {socialPlatforms.map((platform) => (
                    <div key={platform.id} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{platform.label}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xl">
                                {platform.icon}
                            </div>
                            <input 
                                type="text"
                                value={links[platform.id] || ""}
                                onChange={(e) => handleChange(platform.id, e.target.value)}
                                className={`block w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${formErrors[platform.id] ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm`}
                                placeholder={platform.placeholder}
                            />
                        </div>
                        {formErrors[platform.id] && <span className="text-red-500 text-sm mt-1 block">* {formErrors[platform.id]}</span>}
                    </div>
                ))}

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className={`w-full md:w-auto flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] ${isSaving ? 'bg-[#7fcbed] cursor-not-allowed' : 'bg-[#3AB4E6] hover:bg-[#2fa1cf]'}`}>
                        <FaSave /> {isSaving ? "Đang lưu..." : "Cập nhật tất cả liên kết"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialLinksTab;
