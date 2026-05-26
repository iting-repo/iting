import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import authService from "../../services/authService";
import Button from "../../components/common/Button";

const bgImage = "/homepage-page.png";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!email) {
      toast.error("Yêu cầu không hợp lệ. Vui lòng đăng ký lại.");
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setFormErrors({ otp: "Vui lòng nhập đủ 6 chữ số" });
      return;
    }
    setFormErrors({});

    try {
      setIsLoading(true);
      await authService.verifyOtp({ email, code: otpCode });
      
      toast.success("Xác thực tài khoản thành công! Vui lòng đăng nhập.");
      
      setTimeout(() => {
        navigate("/login", { state: { email } });
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã xác thực không chính xác hoặc đã hết hạn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    try {
      setIsResending(true);
      await authService.resendOtp({ email });
      toast.success("Mã OTP mới đã được gửi tới email của bạn");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs[0].current.focus();
    } catch (error) {
      toast.error("Không thể gửi lại mã. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-6 sm:px-10 md:px-20 xl:px-32 relative z-10 h-full overflow-y-auto no-scrollbar py-8 md:py-12">
        <div className="flex items-center gap-2 mb-8">
           <span className="text-2xl font-bold text-[#3AB4E6] tracking-tight">ITing</span>
        </div>

        <div className="mt-4">
            <div className="mb-10">
              <div className="w-16 h-16 bg-[#E6F6FD] rounded-2xl flex items-center justify-center mb-6 text-[#3AB4E6]">
                <ShieldCheck size={32} className="animate-pulse" />
              </div>
              <h1 className="text-[32px] font-bold text-[#1F2937] mb-2 leading-tight">Xác thực tài khoản</h1>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Chúng tôi đã gửi mã xác thực 6 chữ số tới <br/>
                <span className="font-bold text-gray-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              <div className="flex justify-between gap-2 max-w-sm">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-[#F0F5FA] ${formErrors.otp ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-[#3AB4E6] focus:ring-4 focus:ring-[#3AB4E6]/10 outline-none transition-all`}
                  />
                ))}
              </div>
              {formErrors.otp && <span className="text-red-500 text-sm mt-1 block">* {formErrors.otp}</span>}

              <div className="space-y-4 max-w-sm">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#3AB4E6] hover:bg-[#2fa0cf] text-white rounded-xl font-bold shadow-lg shadow-[#3AB4E6]/20 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? "Đang xác thực..." : (
                    <>
                      Kích hoạt tài khoản <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Bạn không nhận được mã?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={timer > 0 || isResending}
                    className={`flex items-center justify-center gap-2 mx-auto font-bold text-sm transition-colors ${timer > 0 ? "text-gray-300 cursor-not-allowed" : "text-[#3AB4E6] hover:text-[#2fa0cf]"}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                    {timer > 0 ? `Gửi lại sau (${timer}s)` : "Gửi lại mã ngay"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl max-w-sm">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
                Mẹo: Hãy kiểm tra cả hộp thư <strong>Spam (Thư rác)</strong> hoặc <strong>Quảng cáo</strong> nếu bạn không thấy email trong Hộp thư đến.
              </p>
            </div>
        </div>
      </div>

      <div className="hidden lg:block w-[50%] relative bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, clipPath: "polygon(80px 0, 100% 0, 100% 100%, 0 100%)", marginLeft: "-1px" }}>
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 pl-24 text-white">
           <h2 className="text-4xl font-bold leading-tight mb-8">Bảo mật tài khoản <span className="text-blue-400">tuyệt đối</span>.</h2>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
