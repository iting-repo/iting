import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import authService from "../../services/authService";
import Button from "../../components/common/Button";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
      toast.error("Vui lòng nhập đủ 6 chữ số");
      return;
    }

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 scale-in-center">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#E6F6FD] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#3AB4E6]">
            <ShieldCheck size={40} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Xác thực tài khoản</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Chúng tôi đã gửi mã xác thực 6 chữ số tới <br/>
            <span className="font-bold text-gray-900">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl border-gray-100 focus:border-[#3AB4E6] focus:ring-4 focus:ring-[#3AB4E6]/10 outline-none transition-all"
              />
            ))}
          </div>

          <div className="space-y-4">
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

        <div className="mt-10 pt-6 border-t border-gray-50 flex items-start gap-3 bg-blue-50/30 p-4 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
            Mẹo: Hãy kiểm tra cả hộp thư <strong>Spam (Thư rác)</strong> hoặc <strong>Quảng cáo</strong> nếu bạn không thấy email trong Hộp thư đến.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
