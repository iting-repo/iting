import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import publicService from '../../services/publicService';
import { FaArrowRight, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { BsBriefcaseFill, BsBuilding, BsPeopleFill } from 'react-icons/bs';
import bgImage from '../../assets/bg_login.jpg';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // State quản lý bước: 1 (Nhập mail) -> 2 (Nhập pass mới)
  const [step, setStep] = useState(1);
  
  // State dữ liệu
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State hiện/ẩn pass
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [stats, setStats] = useState({ totalJobs: 0, totalCandidates: 0, totalCompanies: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicService.getHomeStats();
        setStats({ totalJobs: 0, totalCandidates: 0, totalCompanies: 0, ...(data || {}) });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Xử lý gửi Email (Bước 1)
  const handleSendEmail = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email) errors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email không hợp lệ";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      alert(err || 'Gửi email thất bại');
    }
  };

  // Xử lý Đổi mật khẩu (Bước 2)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!otp || otp.length < 6) errors.otp = "Vui lòng nhập mã OTP 6 chữ số";
    if (!password) errors.password = "Vui lòng nhập mật khẩu mới";
    else if (password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!confirmPassword) errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (password !== confirmPassword) errors.confirmPassword = "Mật khẩu xác nhận không khớp!";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
        await authService.resetPassword(email, otp, password);
        alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.");
        navigate('/login');
    } catch (err) {
        alert(err || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* ================= LEFT COLUMN ================= */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-6 sm:px-10 md:px-20 xl:px-32 relative z-10 py-8 md:py-12">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
           <BsBriefcaseFill className="text-[#3AB4E6] text-2xl" />
           <span className="text-2xl font-bold text-gray-800 tracking-tight">ITing</span>
        </div>

        <div className="mt-10">
            {/* === BƯỚC 1: NHẬP EMAIL === */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h1 className="text-[32px] font-bold text-[#1F2937] mb-2 leading-tight">
                  Quên mật khẩu
                </h1>
                <div className="text-[#6B7280] text-sm mb-8 space-y-1">
                  <p>
                    Quay lại <Link to="/login" className="text-[#3AB4E6] font-medium hover:underline">Đăng nhập</Link>
                  </p>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-5">
                  <div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email tài khoản" 
                      className={`w-full px-5 py-3.5 bg-[#F0F5FA] border ${formErrors.email ? 'border-red-500' : 'border-transparent'} rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`}
                    />
                    {formErrors.email && <span className="text-red-500 text-sm mt-1 block">* {formErrors.email}</span>}
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[#3AB4E6] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                    Gửi Mã Xác Nhận <FaArrowRight size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* === BƯỚC 2: NHẬP MẬT KHẨU MỚI === */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h1 className="text-[32px] font-bold text-[#1F2937] mb-6 leading-tight text-center">
                  Đặt lại mật khẩu
                </h1>

                {/* Thông báo đã gửi mail */}
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-0.5 text-lg shrink-0" />
                    <p className="text-sm text-gray-600">
                      Mã xác thực đã được gửi tới <span className="font-bold text-gray-800">{email}</span>.<br/>
                      Vui lòng nhập mã OTP và mật khẩu mới bên dưới.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                   
                   <div>
                     <input 
                       type="text" 
                       required
                       value={otp}
                       onChange={(e) => setOtp(e.target.value)}
                       placeholder="Nhập mã xác nhận (OTP) 6 chữ số" 
                       className={`w-full px-5 py-3.5 bg-[#F0F5FA] rounded-lg focus:outline-none focus:border-[#3AB4E6] border ${formErrors.otp ? 'border-red-500' : 'border-transparent'} font-bold tracking-widest text-center`}
                     />
                     {formErrors.otp && <span className="text-red-500 text-sm mt-1 block">* {formErrors.otp}</span>}
                   </div> 
                  

                   {/* Mật khẩu mới */}
                   <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới" 
                      className={`w-full px-5 py-3.5 bg-[#F0F5FA] border ${formErrors.password ? 'border-red-500' : 'border-transparent'} rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && <span className="text-red-500 text-sm mt-1 block">* {formErrors.password}</span>}

                  {/* Nhập lại mật khẩu mới */}
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới" 
                      className={`w-full px-5 py-3.5 bg-[#F0F5FA] border ${formErrors.confirmPassword ? 'border-red-500' : 'border-transparent'} rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <span className="text-red-500 text-sm mt-1 block">* {formErrors.confirmPassword}</span>}

                  <button 
                    type="submit" 
                    className="w-full bg-[#3AB4E6] hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-400/30"
                  >
                    Đặt Lại Mật Khẩu <FaArrowRight size={14} />
                  </button>
                </form>
              </div>
            )}
        </div>

        {/* Copyright */}
        <div className="absolute bottom-6 text-xs text-gray-400">
           © 2024 ITing. Bảo lưu mọi quyền.
        </div>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
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
            <h2 className="text-4xl font-bold leading-tight mb-8 drop-shadow-lg">
              Hơn <span className="text-blue-400">{(stats.totalCandidates || 0).toLocaleString('vi-VN')}</span> ứng viên đang tham gia để có công việc chất lượng.
            </h2>
            
             <div className="flex gap-4">
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-blue-300">
                     <BsBriefcaseFill size={20} />
                  </div>
                  <div className="text-xl font-bold">{(stats.totalJobs || 0).toLocaleString('vi-VN')}</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Việc làm đang tuyển</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-sky-300">
                     <BsBuilding size={20} />
                  </div>
                  <div className="text-xl font-bold">{(stats.totalCompanies || 0).toLocaleString('vi-VN')}</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Công ty</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-green-300">
                     <BsPeopleFill size={20} />
                  </div>
                  <div className="text-xl font-bold">{(stats.totalCandidates || 0).toLocaleString('vi-VN')}</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Ứng viên</div>
               </div>
            </div>

        </div>
      </div>

    </div>
  );
};

export default ForgotPasswordPage;
