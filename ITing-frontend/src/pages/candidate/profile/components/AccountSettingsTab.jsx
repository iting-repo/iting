import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaBriefcase, FaEye, FaEyeSlash, FaTimesCircle 
} from 'react-icons/fa';

const AccountSettingsTab = () => {
  // State cho mật khẩu
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // State cho Toggle Privacy
  const [isProfilePublic, setIsProfilePublic] = useState(true);

  // Mock dữ liệu checkbox thông báo
  const [notifications, setNotifications] = useState({
    notify1: true, // Thông báo khi nhà tuyển dụng đưa tôi vào danh sách...
    notify2: false, // Thông báo khi có việc làm phù hợp...
    notify3: true, // Thông báo khi việc đã ứng tuyển hết hạn...
    notify4: true, // Thông báo cho tôi khi nhà tuyển dụng lưu hồ sơ...
    notify5: true, // Thông báo cho tôi khi có đến 5 thông báo việc làm...
  });

  const handleCheckboxChange = (name) => {
    setNotifications({ ...notifications, [name]: !notifications[name] });
  };

  return (
    <div className="max-w-4xl animate-fade-in pb-10">
      
      {/* ================= SECTION 1: THÔNG TIN LIÊN HỆ ================= */}
      <section className="mb-12">
        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Thông tin liên hệ</h3>
        
        <div className="space-y-6">
           {/* Map Location */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ trên bản đồ</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
           </div>

           {/* Phone */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <div className="flex gap-2">
                 <select className="px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-[#3AB4E6]">
                    <option>🇻🇳 +84</option>
                    <option>🇺🇸 +1</option>
                 </select>
                 <input type="text" placeholder="Phone number..." className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
              </div>
           </div>

           {/* Email */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                 <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input type="email" placeholder="Nhập email" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
              </div>
           </div>

           <button className="bg-[#3AB4E6] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
              Lưu Thay Đổi
           </button>
        </div>
      </section>


      {/* ================= SECTION 2: THÔNG BÁO (NOTIFICATIONS) ================= */}
      <section className="mb-12">
         <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Thông báo</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <label className="flex items-start gap-3 cursor-pointer">
               <input type="checkbox" checked={notifications.notify1} onChange={() => handleCheckboxChange('notify1')} className="mt-1 w-5 h-5 text-[#3AB4E6] rounded focus:ring-[#3AB4E6]" />
               <span className="text-sm text-gray-600">Thông báo cho tôi khi nhà tuyển dụng đưa tôi vào danh sách phỏng vấn.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
               <input type="checkbox" checked={notifications.notify2} onChange={() => handleCheckboxChange('notify2')} className="mt-1 w-5 h-5 text-[#3AB4E6] rounded focus:ring-[#3AB4E6]" />
               <span className="text-sm text-gray-600">Thông báo cho tôi khi nhà tuyển dụng lưu hồ sơ của tôi.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
               <input type="checkbox" checked={notifications.notify3} onChange={() => handleCheckboxChange('notify3')} className="mt-1 w-5 h-5 text-[#3AB4E6] rounded focus:ring-[#3AB4E6]" />
               <span className="text-sm text-gray-600">Thông báo cho tôi khi các công việc tôi đã ứng tuyển hết hạn.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
               <input type="checkbox" checked={notifications.notify4} onChange={() => handleCheckboxChange('notify4')} className="mt-1 w-5 h-5 text-[#3AB4E6] rounded focus:ring-[#3AB4E6]" />
               <span className="text-sm text-gray-600">Thông báo cho tôi khi nhà tuyển dụng từ chối hồ sơ của tôi.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
               <input type="checkbox" checked={notifications.notify5} onChange={() => handleCheckboxChange('notify5')} className="mt-1 w-5 h-5 text-[#3AB4E6] rounded focus:ring-[#3AB4E6]" />
               <span className="text-sm text-gray-600">Thông báo cho tôi khi có đến 5 thông báo việc làm.</span>
            </label>
         </div>
      </section>


      {/* ================= SECTION 3: THÔNG BÁO CÔNG VIỆC (JOB ALERTS) ================= */}
      <section className="mb-12">
         <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Thông báo công việc</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
               <div className="relative">
                  <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Nhập vai trò công việc của bạn" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
               <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Nhập thành phố của bạn" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" />
               </div>
            </div>
         </div>

         <button className="bg-[#3AB4E6] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
            Lưu Thay Đổi
         </button>
      </section>


      {/* ================= SECTION 4: QUYỀN RIÊNG TƯ (PROFILE PRIVACY) ================= */}
      <section className="mb-12">
         <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Quyền riêng tư hồ sơ</h3>
         
         <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">Hồ sơ của bạn hiện đang ở chế độ:</div>
            
            {/* Custom Toggle Switch */}
            <div 
               onClick={() => setIsProfilePublic(!isProfilePublic)}
               className={`relative w-20 h-9 rounded-full cursor-pointer transition-colors duration-300 flex items-center px-1 ${isProfilePublic ? 'bg-[#3AB4E6]' : 'bg-gray-300'}`}
            >
               {/* Circle Thumb */}
               <div className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isProfilePublic ? 'translate-x-11' : 'translate-x-0'}`}></div>
               
               {/* Text Label inside Toggle */}
               <span className={`absolute text-xs font-bold text-white ${isProfilePublic ? 'left-3' : 'right-3'}`}>
                  {isProfilePublic ? 'YES' : 'NO'}
               </span>
            </div>
            
            <div className="text-sm text-gray-500 italic">
               {isProfilePublic ? "(Công khai)" : "(Riêng tư)"}
            </div>
         </div>
      </section>


      {/* ================= SECTION 5: THAY ĐỔI MẬT KHẨU ================= */}
      <section className="mb-12">
         <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Thay đổi mật khẩu</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             {/* Pass Hiện tại */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                    <input 
                       type={showCurrentPass ? "text" : "password"} 
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" 
                       placeholder="********"
                    />
                    <button onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
             </div>

             {/* Pass Mới */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                    <input 
                       type={showNewPass ? "text" : "password"} 
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" 
                       placeholder="********"
                    />
                    <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNewPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
             </div>

             {/* Xác nhận Pass */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                    <input 
                       type={showConfirmPass ? "text" : "password"} 
                       className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]" 
                       placeholder="********"
                    />
                    <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
             </div>
         </div>

         <button className="bg-[#3AB4E6] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors">
            Lưu Thay Đổi
         </button>
      </section>


      {/* ================= SECTION 6: XÓA TÀI KHOẢN ================= */}
      <section>
         <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Xóa tài khoản của bạn</h3>
         
         <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
               Nếu bạn xóa tài khoản, bạn sẽ không còn nhận được thông tin về các việc làm phù hợp, nhà tuyển dụng đang theo dõi, thông báo việc làm, danh sách việc đã được chọn và nhiều dịch vụ khác.
            </p>
            <button className="flex items-center gap-2 text-red-500 font-bold hover:underline">
               <FaTimesCircle /> Xóa tài khoản
            </button>
         </div>
      </section>

    </div>
  );
};

export default AccountSettingsTab;