import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLink } from 'react-icons/fa';
import { toast } from 'sonner';

const SettingsTab = () => {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <div className="max-w-4xl">
      
      {/* 1. THÔNG TIN LIÊN HỆ */}
      <h3 className="text-lg font-bold text-gray-800 mb-6">Thông tin liên hệ</h3>
      
      <div className="space-y-6 mb-10">
         <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ trên map</label>
            <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
            </div>
         </div>

         <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Số điện thoại</label>
            <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Phone number..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
            </div>
         </div>

         <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="Địa chỉ email" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
            </div>
         </div>

         <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Website công ty</label>
            <div className="relative">
                <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Website url..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
            </div>
         </div>
      </div>

      <button 
        onClick={() => toast.success("Cập nhật thông tin liên hệ thành công!")}
        className="bg-[#1967D2] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors mb-12"
      >
        Lưu Thay Đổi
      </button>

      {/* 2. ĐỔI MẬT KHẨU */}
      <div className="border-t border-gray-200 pt-10">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Đổi mật khẩu</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             {/* Pass Hiện tại */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                    <input 
                       type={showCurrentPass ? "text" : "password"} 
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" 
                       placeholder="Password"
                    />
                    <button onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
             </div>

             {/* Pass Mới */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Mật khẩu mới</label>
                <div className="relative">
                    <input 
                       type={showNewPass ? "text" : "password"} 
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" 
                       placeholder="Password"
                    />
                    <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNewPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
             </div>

             {/* Xác nhận Pass */}
             <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                    <input 
                       type={showConfirmPass ? "text" : "password"} 
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" 
                       placeholder="Password"
                    />
                    <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
             </div>
          </div>

          <button 
            onClick={() => toast.success("Đổi mật khẩu thành công!")}
            className="bg-[#1967D2] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
          >
             Đổi Mật Khẩu
          </button>
      </div>

    </div>
  );
};

export default SettingsTab;