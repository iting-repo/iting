import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { loginRequest, googleLoginRequest, facebookLoginRequest } from '../store/auth/authSlice';
import useFacebookLogin from '../hooks/useFacebookLogin';
import { FaEye, FaEyeSlash, FaTimes, FaUser, FaBriefcase, FaArrowRight } from 'react-icons/fa';
import logoIting from '../assets/logo-iting.png';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#1877F2" d="M24,4C12.954,4,4,12.954,4,24c0,9.961,7.266,18.232,16.712,19.724V29.771H15.68V24h5.032v-4.367c0-4.965,2.951-7.705,7.474-7.705c2.166,0,4.432,0.387,4.432,0.387v4.872h-2.497c-2.46,0-3.228,1.526-3.228,3.091V24h5.489l-0.877,5.771h-4.612v13.953C36.734,42.232,44,33.961,44,24C44,12.954,35.046,4,24,4z" />
    <path fill="#fff" d="M30.419,24L31.296,29.771H26.684V43.724C25.803,43.868,24.909,44,24,44c-0.909,0-1.803-0.132-2.684-0.276V29.771H15.68V24h5.636v-4.367c0-4.965,2.951-7.705,7.474-7.705c2.166,0,4.432,0.387,4.432,0.387v4.872h-2.497c-2.46,0-3.228,1.526-3.228,3.091V24H30.419z" />
  </svg>
);

const AuthModal = ({ isOpen, onClose, onLoginSuccess, contextTitle, contextDesc }) => {
  const [tab, setTab]               = useState('login');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);

  const wasLoadingRef = useRef(false);

  // Detect login success (loading → false, no error → trigger callback)
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && !error && isOpen) {
      onLoginSuccess?.();
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, error, isOpen, onLoginSuccess]);

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setTab('login');
      wasLoadingRef.current = false;
    }
  }, [isOpen]);

  // No-op navigate: không redirect sau login trong modal
  const noop = () => {};

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password, navigate: noop }));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLoginRequest({ tokenId: tokenResponse.access_token, navigate: noop }));
    },
    onError: () => {},
  });

  const { login: handleFacebookLogin, loading: fbLoading, configured: fbConfigured } = useFacebookLogin({
    onSuccess: ({ accessToken }) => {
      dispatch(facebookLoginRequest({ accessToken, navigate: noop }));
    },
    onError: () => {},
  });

  const handleRegisterClick = (role) => {
    const returnUrl = window.location.pathname + window.location.search;
    navigate(`/register?role=${role}&from=${encodeURIComponent(returnUrl)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#3AB4E6] to-[#2196F3] px-8 pt-8 pb-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <FaTimes size={14} />
          </button>

          <div className="mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <img src={logoIting} alt="ITing" className="h-8 w-auto object-contain" onError={(e) => { e.target.style.display='none'; }} />
            </div>
            <h2 className="text-xl font-black">{contextTitle || 'Đăng nhập để tiếp tục'}</h2>
            {contextDesc && <p className="text-sm text-white/80 mt-1">{contextDesc}</p>}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/15 rounded-xl p-1">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === t ? 'bg-white text-[#3AB4E6] shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-700 text-sm focus:outline-none focus:bg-white focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-700 text-sm focus:outline-none focus:bg-white focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/20 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3AB4E6] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#3AB4E6] text-white font-bold rounded-xl hover:bg-[#2fa0d1] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                ) : (
                  <><span>Đăng nhập</span><FaArrowRight size={13} /></>
                )}
              </button>

              <div className="relative my-1 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <span className="relative bg-white px-3 text-xs text-slate-400">hoặc</span>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full py-3 border-2 border-slate-100 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2.5 text-sm disabled:opacity-60"
              >
                <GoogleIcon /> Đăng nhập bằng Google
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoading || fbLoading || !fbConfigured}
                title={!fbConfigured ? 'REACT_APP_FACEBOOK_APP_ID chưa cấu hình' : ''}
                className="w-full py-3 border-2 border-slate-100 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FacebookIcon /> {fbLoading ? 'Đang xử lý...' : 'Đăng nhập bằng Facebook'}
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-[#3AB4E6] font-bold hover:underline">
                  Đăng ký ngay
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center">Chọn loại tài khoản bạn muốn tạo:</p>

              <button
                onClick={() => handleRegisterClick('CANDIDATE')}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-[#3AB4E6] hover:bg-[#E6F6FD] text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaUser size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">Ứng viên</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tìm việc, ứng tuyển, quản lý hồ sơ</p>
                  </div>
                  <FaArrowRight className="text-slate-300 group-hover:text-[#3AB4E6] transition-colors" size={14} />
                </div>
              </button>

              <button
                onClick={() => handleRegisterClick('EMPLOYER')}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-[#3AB4E6] hover:bg-[#E6F6FD] text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <FaBriefcase size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">Nhà tuyển dụng</p>
                    <p className="text-xs text-slate-400 mt-0.5">Đăng tin, tìm ứng viên, quản lý công ty</p>
                  </div>
                  <FaArrowRight className="text-slate-300 group-hover:text-[#3AB4E6] transition-colors" size={14} />
                </div>
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-[#3AB4E6] font-bold hover:underline">
                  Đăng nhập
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
