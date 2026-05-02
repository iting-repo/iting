import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import bgImage from '../../assets/bg_login.jpg';
import authService from '../../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Token đặt lại mật khẩu không hợp lệ. Vui lòng dùng liên kết trong email.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) return;
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    try {
      setLoading(true);
      await authService.resetPassword(token, password);
      // Success -> go to login
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-20 xl:px-32 relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-gray-800 tracking-tight">ITing</span>
        </div>

        <div className="mt-10">
          <h1 className="text-[32px] font-bold text-[#1F2937] mb-6 leading-tight text-center">Đặt lại mật khẩu</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded border border-red-100">{error}</div>
          )}

          {!error && (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
              <div className="text-sm text-gray-600 mb-4">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-5 py-3.5 bg-[#F0F5FA] border border-transparent rounded-lg text-gray-700 focus:outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#3AB4E6] hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'} <FaArrowRight />
              </button>

              <div className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-[#3AB4E6]">Quay lại đăng nhập</Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="hidden lg:block w-[50%] relative bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, clipPath: 'polygon(80px 0, 100% 0, 100% 100%, 0 100%)', marginLeft: '-1px' }}>
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
