import React, { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaPhone, FaShieldAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';

import companyService from '../../../../services/companyService';
import authService from '../../../../services/authService';

const PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
const OTP_RESEND_SECONDS = 60;

const SettingsTab = () => {
   // ─── PHONE VERIFY STATE ─────────────────────────────────────────────
   const [phone, setPhone] = useState('');
   const [phoneSaved, setPhoneSaved] = useState(''); // số đã verify trong DB
   const [otpCode, setOtpCode] = useState('');
   const [otpStep, setOtpStep] = useState('idle'); // idle | sent | verifying
   const [sendingOtp, setSendingOtp] = useState(false);
   const [verifyingPhone, setVerifyingPhone] = useState(false);
   const [resendCountdown, setResendCountdown] = useState(0);
   const [loadingCompany, setLoadingCompany] = useState(true);

   // ─── PASSWORD STATE ─────────────────────────────────────────────────
   const [oldPassword, setOldPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showCurrentPass, setShowCurrentPass] = useState(false);
   const [showNewPass, setShowNewPass] = useState(false);
   const [showConfirmPass, setShowConfirmPass] = useState(false);
   const [changingPassword, setChangingPassword] = useState(false);

   // Lấy số điện thoại hiện tại
   useEffect(() => {
      const load = async () => {
         try {
            const res = await companyService.getMyCompany();
            const current = res?.phone || '';
            setPhone(current);
            setPhoneSaved(current);
         } catch (err) {
            console.error('Load company phone error:', err);
         } finally {
            setLoadingCompany(false);
         }
      };
      load();
   }, []);

   // Đếm ngược nút "Gửi lại OTP"
   useEffect(() => {
      if (resendCountdown <= 0) return undefined;
      const timer = setInterval(() => setResendCountdown((v) => v - 1), 1000);
      return () => clearInterval(timer);
   }, [resendCountdown]);

   const handleSendOtp = async () => {
      const normalized = (phone || '').replace(/\s+/g, '');
      if (!PHONE_REGEX.test(normalized)) {
         toast.error('Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx.');
         return;
      }
      try {
         setSendingOtp(true);
         await companyService.sendPhoneOtp(normalized);
         setOtpStep('sent');
         setResendCountdown(OTP_RESEND_SECONDS);
         toast.success('Đã gửi mã OTP. Vui lòng kiểm tra điện thoại của bạn.');
      } catch (err) {
         toast.error(err?.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
      } finally {
         setSendingOtp(false);
      }
   };

   const handleVerifyOtp = async () => {
      if (!otpCode.trim() || otpCode.trim().length < 4) {
         toast.error('Vui lòng nhập mã OTP gồm 6 chữ số.');
         return;
      }
      try {
         setVerifyingPhone(true);
         await companyService.verifyPhone(phone.replace(/\s+/g, ''), otpCode.trim());
         toast.success('Xác minh số điện thoại thành công!');
         setPhoneSaved(phone.replace(/\s+/g, ''));
         setOtpCode('');
         setOtpStep('idle');
      } catch (err) {
         toast.error(err?.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      } finally {
         setVerifyingPhone(false);
      }
   };

   const handleChangePassword = async () => {
      if (!oldPassword) {
         toast.error('Vui lòng nhập mật khẩu hiện tại.');
         return;
      }
      if (!newPassword || newPassword.length < 8) {
         toast.error('Mật khẩu mới phải có ít nhất 8 ký tự.');
         return;
      }
      if (newPassword !== confirmPassword) {
         toast.error('Mật khẩu xác nhận không khớp.');
         return;
      }
      if (newPassword === oldPassword) {
         toast.error('Mật khẩu mới phải khác mật khẩu hiện tại.');
         return;
      }
      try {
         setChangingPassword(true);
         await authService.changePassword(oldPassword, newPassword);
         toast.success('Đổi mật khẩu thành công!');
         setOldPassword('');
         setNewPassword('');
         setConfirmPassword('');
      } catch (err) {
         toast.error(err?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
      } finally {
         setChangingPassword(false);
      }
   };

   const isPhoneVerified = phoneSaved && phoneSaved === phone.replace(/\s+/g, '');
   const phoneChanged = phoneSaved !== phone.replace(/\s+/g, '');

   return (
      <div className="max-w-4xl">
         {/* ── 1. XÁC MINH SỐ ĐIỆN THOẠI ────────────────────────────── */}
         <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
               <h3 className="text-lg font-bold text-gray-800">Xác minh số điện thoại</h3>
               {isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                     <FaCheckCircle /> Đã xác minh
                  </span>
               )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
               Xác minh số điện thoại để tăng độ tin cậy của tài khoản nhà tuyển dụng và nhận thông báo quan trọng.
            </p>

            {loadingCompany ? (
               <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
                  <FaSpinner className="animate-spin" /> Đang tải thông tin...
               </div>
            ) : (
               <div className="space-y-5">
                  {/* Phone input + Send OTP */}
                  <div>
                     <label className="block text-gray-700 text-sm font-medium mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                     </label>
                     <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                           <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                 setPhone(e.target.value);
                                 if (otpStep === 'sent') {
                                    setOtpStep('idle');
                                    setOtpCode('');
                                 }
                              }}
                              placeholder="VD: 0901234567"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                              disabled={otpStep === 'sent'}
                           />
                        </div>
                        <button
                           onClick={handleSendOtp}
                           disabled={sendingOtp || (otpStep === 'sent' && resendCountdown > 0) || (isPhoneVerified && !phoneChanged)}
                           className="px-6 py-3 bg-[#1967D2] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                           {sendingOtp ? (
                              <span className="flex items-center gap-2">
                                 <FaSpinner className="animate-spin" /> Đang gửi...
                              </span>
                           ) : otpStep === 'sent' && resendCountdown > 0 ? (
                              `Gửi lại sau ${resendCountdown}s`
                           ) : otpStep === 'sent' ? (
                              'Gửi lại OTP'
                           ) : (
                              'Gửi mã OTP'
                           )}
                        </button>
                     </div>
                     {isPhoneVerified && !phoneChanged && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                           <FaCheckCircle /> Số điện thoại này đã được xác minh.
                        </p>
                     )}
                  </div>

                  {/* OTP Input — chỉ hiện sau khi gửi OTP thành công */}
                  {otpStep === 'sent' && (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4 animate-fade-in">
                        <div className="flex items-start gap-3">
                           <FaShieldAlt className="text-[#1967D2] mt-0.5 flex-shrink-0" />
                           <p className="text-sm text-gray-700">
                              Mã OTP gồm 6 chữ số đã được gửi đến <strong>{phone}</strong>. Mã có hiệu lực trong <strong>5 phút</strong>.
                           </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                           <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="Nhập mã OTP"
                              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-center font-mono text-lg tracking-widest"
                           />
                           <button
                              onClick={handleVerifyOtp}
                              disabled={verifyingPhone || otpCode.length < 6}
                              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                           >
                              {verifyingPhone ? (
                                 <span className="flex items-center gap-2">
                                    <FaSpinner className="animate-spin" /> Đang xác minh...
                                 </span>
                              ) : (
                                 'Xác minh'
                              )}
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* ── 2. ĐỔI MẬT KHẨU ──────────────────────────────────────── */}
         <div className="border-t border-gray-200 pt-10">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Đổi mật khẩu</h3>
            <p className="text-sm text-gray-500 mb-6">
               Mật khẩu mới phải có ít nhất 8 ký tự và khác mật khẩu hiện tại.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {/* Mật khẩu hiện tại */}
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                     <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                        placeholder="Mật khẩu hiện tại"
                        autoComplete="current-password"
                     />
                     <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                     >
                        {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                     </button>
                  </div>
               </div>

               {/* Mật khẩu mới */}
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Mật khẩu mới</label>
                  <div className="relative">
                     <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6]"
                        placeholder="Tối thiểu 8 ký tự"
                        autoComplete="new-password"
                     />
                     <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                     >
                        {showNewPass ? <FaEyeSlash /> : <FaEye />}
                     </button>
                  </div>
               </div>

               {/* Xác nhận */}
               <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                     <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none ${
                           confirmPassword && confirmPassword !== newPassword
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-gray-200 focus:border-[#3AB4E6]'
                        }`}
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                     />
                     <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                     >
                        {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                     </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                     <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp.</p>
                  )}
               </div>
            </div>

            <button
               onClick={handleChangePassword}
               disabled={changingPassword}
               className="bg-[#1967D2] text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
               {changingPassword ? (
                  <>
                     <FaSpinner className="animate-spin" /> Đang xử lý...
                  </>
               ) : (
                  'Đổi Mật Khẩu'
               )}
            </button>
         </div>
      </div>
   );
};

export default SettingsTab;
