
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Sử dụng bộ icon Feather hoặc FontAwesome đơn giản cho tinh tế
import { FaFacebookF, FaGoogle, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import { BsBriefcaseFill, BsBuilding, BsFileText } from 'react-icons/bs';
// Import hình background caro của bạn
import bgImage from '../../assets/Image.png'; 

const LoginPage = () => {
  const [role, setRole] = useState('candidate'); // 'candidate' | 'company'
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* ================= LEFT COLUMN: FORM ================= */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-20 xl:px-32 relative z-10">
        
        {/* Logo Area */}
        <div className="absolute top-10 left-8 md:left-20 flex items-center gap-2">
           <BsBriefcaseFill className="text-blue-600 text-2xl" />
           <span className="text-2xl font-bold text-gray-800 tracking-tight">ITWork</span>
        </div>

        <div className="mt-10">
            {/* Header */}
            <h1 className="text-[32px] font-bold text-[#1F2937] mb-2 leading-tight">
              Chào mừng bạn đến với ITWork
            </h1>
            <p className="text-[#6B7280] text-sm mb-8">
              Cùng tìm cộng việc IT chất lượng.<br/>
              Bạn không có tài khoản? <Link to="/register" className="text-blue-500 font-medium hover:underline">Tạo mới ngay</Link>
            </p>

            {/* Role Switcher (Custom Tabs) */}
            <div className="bg-[#F3F4F6] p-1.5 rounded-lg flex mb-6">
              <button
                onClick={() => setRole('candidate')}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  role === 'candidate' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Ứng viên
              </button>
              <button
                onClick={() => setRole('company')}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  role === 'company' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nhà tuyển dụng
              </button>
            </div>

            {/* Login Form */}
            <form className="space-y-5">
              {/* Email Input */}
              <div>
                <input 
                  type="email" 
                  placeholder="boss@gmail.com" // Placeholder giả lập như ảnh
                  className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="•••••••••" 
                  className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {/* Remember & Forgot */}
              <div className="flex justify-between items-center text-sm mt-2">
                <label className="flex items-center text-gray-500 cursor-pointer select-none">
                  <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  Ghi nhớ tài khoản
                </label>
                <Link to="/forgot-password" className="text-blue-500 font-medium hover:underline">
                  Quên mật khẩu
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="button" // Đổi thành type="submit" khi integrate
                className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Đăng Nhập <FaArrowRight size={14} />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-wide">
                    Hoặc đăng nhập bằng
                </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-600">
                <FaFacebookF className="text-[#1877F2] text-lg" /> 
                <span className="text-sm">Facebook</span>
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-600">
                <FaGoogle className="text-red-500 text-lg" /> 
                <span className="text-sm">Google</span>
              </button>
            </div>
        </div>

        {/* Copyright */}
        <div className="absolute bottom-6 text-xs text-gray-400">
           © 2024 ITWork. All rights reserved.
        </div>
      </div>

      {/* ================= RIGHT COLUMN: BACKGROUND & STATS ================= */}
      {/* Sử dụng clip-path để tạo đường vát chéo đặc trưng */}
      <div 
        className="hidden lg:block w-[45%] relative bg-cover bg-center"
        style={{ 
            backgroundImage: `url(${bgImage})`,
            // Đây là kỹ thuật tạo đường chéo: Top thụt vào 80px, Bottom giữ nguyên
            clipPath: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%)',
            marginLeft: '-1px' // Fix đường viền trắng nhỏ nếu có
        }}
      >
        {/* Overlay gradient tối màu để làm nổi text */}
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-90"></div>

        {/* Content bên phải */}
        <div className="absolute bottom-0 left-0 right-0 p-12 pl-24 text-white">
            <h2 className="text-4xl font-bold leading-tight mb-8 drop-shadow-lg">
              Hơn <span className="text-blue-400">1,75,324</span> ứng viên đang tham gia để có công việc chất lượng.
            </h2>

            {/* Stats Cards - Glassmorphism */}
            <div className="flex gap-4">
               {/* Card 1 */}
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-blue-300">
                     <BsBriefcaseFill size={20} />
                  </div>
                  <div className="text-xl font-bold">1,75,324</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Việc làm active</div>
               </div>

               {/* Card 2 */}
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-purple-300">
                     <BsBuilding size={20} />
                  </div>
                  <div className="text-xl font-bold">97,354</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Công ty</div>
               </div>

               {/* Card 3 */}
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-green-300">
                     <BsFileText size={20} />
                  </div>
                  <div className="text-xl font-bold">7,532</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">CV Mới</div>
               </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;