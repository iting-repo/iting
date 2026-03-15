import React from 'react';
import { FaLinkedin, FaGithub, FaFacebook, FaTwitter, FaGlobe, FaSave } from 'react-icons/fa';

const SocialLinksTab = () => {
    const socialPlatforms = [
        { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin className="text-[#0077b5]" />, placeholder: 'https://linkedin.com/in/username' },
        { id: 'github', label: 'GitHub', icon: <FaGithub className="text-[#333]" />, placeholder: 'https://github.com/username' },
        { id: 'facebook', label: 'Facebook', icon: <FaFacebook className="text-[#1877f2]" />, placeholder: 'https://facebook.com/username' },
        { id: 'twitter', label: 'Twitter (X)', icon: <FaTwitter className="text-[#1da1f2]" />, placeholder: 'https://twitter.com/username' },
        { id: 'website', label: 'Website Cá nhân', icon: <FaGlobe className="text-gray-600" />, placeholder: 'https://yourwebsite.com' },
    ];

    return (
        <div className="max-full bg-white">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Liên kết mạng xã hội</h3>
                <p className="text-sm text-gray-500 mt-1">Gắn các liên kết này để nhà tuyển dụng có cái nhìn tổng quan hơn về bạn.</p>
            </div>

            <form className="space-y-5">
                {socialPlatforms.map((platform) => (
                    <div key={platform.id} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{platform.label}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xl">
                                {platform.icon}
                            </div>
                            <input 
                                type="text"
                                className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm"
                                placeholder={platform.placeholder}
                            />
                        </div>
                    </div>
                ))}

                <div className="pt-4">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#3AB4E6] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2fa1cf] transition-all shadow-lg active:scale-[0.98]">
                        <FaSave /> Cập nhật tất cả liên kết
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialLinksTab;
