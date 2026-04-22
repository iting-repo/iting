import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { FaArrowRight, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { BsBriefcaseFill, BsBuilding, BsFileText } from 'react-icons/bs';
import bgImage from '../../assets/bg_login.jpg';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // State quản lý bước: 1 (Nhập mail) -> 2 (Nhập pass mới)
  const [step, setStep] = useState(1);
  
  // State dữ liệu
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // Nếu bạn cần nhập mã OTP thì dùng state này
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State hiện/ẩn pass
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Xử lý gửi Email (Bước 1)
  const handleSendEmail = (e) => {
    e.preventDefault();
    (async () => {
      try {
        await authService.forgotPassword(email);
        setStep(2);
      } catch (err) {
        alert(err?.message || 'Gửi email thất bại');
      }
    })();
  };

  // Xử lý Đổi mật khẩu (Bước 2)
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    console.log("Reset mật khẩu với:", { email, password, otp }); // Gửi kèm OTP nếu có
    // Gọi API đổi pass...
    // Thành công thì về trang login
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* ================= LEFT COLUMN ================= */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-20 xl:px-32 relative z-10">
        
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
                      className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
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

            {/* === BƯỚC 2: NHẬP MẬT KHẨU MỚI (Như hình bạn gửi) === */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h1 className="text-[32px] font-bold text-[#1F2937] mb-6 leading-tight text-center">
                  Đặt lại mật khẩu
                </h1>

                {/* Thông báo đã gửi mail */}
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-0.5 text-lg shrink-0" />
                    <p className="text-sm text-gray-600">
                      Một email đặt lại mật khẩu đã được gửi tới <span className="font-bold text-gray-800">{email}</span>.<br/>
                      Vui lòng kiểm tra hòm thư và nhấn vào liên kết để đặt lại mật khẩu (liên kết hết hạn sau 1 giờ).
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                   
                   {/* NOTE: Thường thì cần 1 ô nhập "Mã xác nhận (OTP)" ở đây 
                       để server biết đúng là người dùng đó đang đổi pass.
                       Nếu bạn muốn thêm ô OTP thì uncomment đoạn dưới:
                   */}
                   <div>
                     <input 
                       type="text" 
                       placeholder="(Nếu bạn có mã) Nhập mã xác nhận (OTP)" 
                       className="w-full px-5 py-3.5 bg-[#F0F5FA] rounded-lg focus:outline-none focus:border-blue-500 border border-transparent"
                     />
                   </div> 
                  

                   {/* Mật khẩu mới */}
                   <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới" 
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

                  {/* Nhập lại mật khẩu mới */}
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới" 
                      className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>

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

      {/* ================= RIGHT COLUMN (Giữ nguyên) ================= */}
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
              Hơn <span className="text-blue-400">1,75,324</span> ứng viên đang tham gia để có công việc chất lượng.
            </h2>
            
            {/* Stats Cards (Copy lại từ trang trước nếu cần) */}
             <div className="flex gap-4">
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-blue-300">
                     <BsBriefcaseFill size={20} />
                  </div>
                  <div className="text-xl font-bold">1,75,324</div>
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">Việc làm đang tuyển</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1 min-w-[140px]">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-sky-300">
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
                  <div className="text-[11px] text-gray-300 uppercase tracking-wide mt-1">CV Mới</div>
               </div>
            </div>

        </div>
      </div>

    </div>
  );
};

export default ForgotPasswordPage;
