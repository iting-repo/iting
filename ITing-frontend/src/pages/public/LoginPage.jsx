import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../../store/auth/authSlice';
import { FaEye, FaEyeSlash, FaArrowRight, FaUserShield, FaUserTie } from 'react-icons/fa';
import { BsBriefcaseFill, BsBuilding, BsFileText } from 'react-icons/bs';
// Import hình background caro của bạn
import bgImage from '../../assets/bg_login.jpg';

// 1. Component Logo Google chuẩn
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

// 2. Component Logo Facebook chuẩn
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#1877F2" d="M24,4C12.954,4,4,12.954,4,24c0,9.961,7.266,18.232,16.712,19.724V29.771H15.68V24h5.032v-4.367c0-4.965,2.951-7.705,7.474-7.705c2.166,0,4.432,0.387,4.432,0.387v4.872h-2.497c-2.46,0-3.228,1.526-3.228,3.091V24h5.489l-0.877,5.771h-4.612v13.953C36.734,42.232,44,33.961,44,24C44,12.954,35.046,4,24,4z" />
    <path fill="#fff" d="M30.419,24L31.296,29.771H26.684V43.724C25.803,43.868,24.909,44,24,44c-0.909,0-1.803-0.132-2.684-0.276V29.771H15.68V24h5.636v-4.367c0-4.965,2.951-7.705,7.474-7.705c2.166,0,4.432,0.387,4.432,0.387v4.872h-2.497c-2.46,0-3.228,1.526-3.228,3.091V24H30.419z" />
  </svg>
);

const LoginPage = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // STATE MỚI: Quản lý loại đăng nhập ('user' hoặc 'admin')
  const [loginType, setLoginType] = useState('user'); 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Gửi thêm loginType để Saga/API biết đường xử lý nếu cần
    dispatch(loginRequest({ email, password, navigate, loginType }));
  }

  // Hàm chuyển tab
  const switchTab = (type) => {
    setLoginType(type);
    setEmail(""); // Reset form khi chuyển tab
    setPassword("");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* ================= LEFT COLUMN ================= */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-20 xl:px-32 relative z-10">

        {/* Logo Area */}
        <div className="flex items-center gap-2 mb-8">
          <BsBriefcaseFill className="text-[#3AB4E6] text-2xl" />
          <span className="text-2xl font-semibold text-gray-800 tracking-tight">ITWork</span>
        </div>

        <div>
          {/* Header */}
          <h1 className="text-[32px] font-semibold text-[#1F2937] mb-6 leading-tight h-10">
            {loginType === 'user' ? 'Chào mừng trở lại!' : 'Đăng nhập Quản trị'}
          </h1>

          {/* === 2. TAB SWITCHER (STYLE MỚI THEO YÊU CẦU) === */}
          <div className="bg-[#F3F4F6] p-1.5 rounded-lg flex mb-6 shadow-inner w-full">
            <button
                type="button"
                onClick={() => switchTab('user')}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    loginType === 'user'
                    ? 'bg-[#3AB4E6] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-600'
                }`}
            >
                <FaUserTie /> Ứng viên / Nhà tuyển dụng
            </button>
            <button
                type="button"
                onClick={() => switchTab('admin')}
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    loginType === 'admin'
                    ? 'bg-[#3AB4E6] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-600'
                }`}
            >
                <FaUserShield /> Admin
            </button>
          </div>
          {/* ================================================== */}
          
          {/* Mô tả */}
          <p className="text-[#6B7280] text-md mb-8 min-h-[50px]">
            {loginType === 'user' ? (
                <>
                    Cùng tìm công việc IT chất lượng.<br />
                    Bạn chưa có tài khoản? <Link to="/register" className="text-[#3AB4E6] font-medium hover:underline">Tạo mới ngay</Link>
                </>
            ) : (
                <>
                    Truy cập vào hệ thống quản trị viên.<br />
                    Vui lòng sử dụng tài khoản được cấp quyền.
                </>
            )}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded border border-red-100 flex items-center gap-2 animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginType === 'user' ? "Nhập email của bạn" : "admin@system.com"}
                className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#3AB4E6] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#3AB4E6] focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3AB4E6]"
                >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mt-2">
              <label className="flex items-center text-gray-500 cursor-pointer select-none">
                <input type="checkbox" className="mr-2 w-4 h-4 text-[#3AB4E6] border-gray-300 rounded focus:ring-blue-500" />
                Ghi nhớ tài khoản
              </label>
              <Link to="/forgot-password" className="text-[#3AB4E6] font-medium hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#3AB4E6] hover:bg-[#2fa0d1] text-white font-bold py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang xử lý...' : (loginType === 'user' ? 'Đăng Nhập' : 'Vào trang quản trị')}
              {!isLoading && <FaArrowRight size={14} />}
            </button>
          </form>

          {/* Social Buttons Area */}
          <div className="min-h-[140px]">
              {loginType === 'user' && (
                 <div className="animate-fade-in">
                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-wide">
                        Hoặc đăng nhập bằng
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                        <FacebookIcon />
                        <span className="text-sm">Facebook</span>
                        </button>

                        <button type="button" className="flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
                        <GoogleIcon />
                        <span className="text-sm">Google</span>
                        </button>
                    </div>
                 </div>
              )}
          </div>

        </div>

        {/* Copyright */}
        <div className="absolute bottom-6 text-xs text-gray-400">
          © 2024 ITWork. All rights reserved.
        </div>
      </div>

      {/* ================= RIGHT COLUMN: BACKGROUND & STATS ================= */}
      {/* Giữ nguyên phần bên phải của bạn */}
      <div
        className="hidden lg:block w-[50%] relative bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          clipPath: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%)',
          marginLeft: '-1px'
        }}
      >
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-90"></div>

        <div className="absolute bottom-0 left-0 right-0 p-12 pl-24 text-white">
          <h2 className="text-4xl font-bold leading-tight mb-8 drop-shadow-lg animate-fade-in-up">
             {loginType === 'user' ? (
                <>Hơn <span className="text-blue-400">1,75,324</span> ứng viên đang tham gia để có công việc chất lượng.</>
             ) : (
                <>Hệ thống <span className="text-blue-400">Quản trị tập trung</span> dành cho Admin & Staff.</>
             )}
          </h2>

          <div className="flex gap-4 animate-fade-in-up delay-100">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-blue-300">
                <BsBriefcaseFill size={20} />
              </div>
              <div className="text-xl font-bold">1,75,324</div>
              <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Việc làm đang tuyển</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-purple-300">
                <BsBuilding size={20} />
              </div>
              <div className="text-xl font-bold">97,354</div>
              <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Công ty</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-green-300">
                <BsFileText size={20} />
              </div>
              <div className="text-xl font-bold">7,532</div>
              <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Công việc Mới</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;