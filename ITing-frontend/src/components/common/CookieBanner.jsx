import React, { useEffect, useState } from 'react';
import { FaCookieBite, FaTimes } from 'react-icons/fa';

const COOKIE_KEY = 'iting_cookie_consent';

/**
 * GDPR / Nghị định 13 cookie consent banner.
 *
 * Hiển thị 1 lần khi user lần đầu vào site (chưa có giá trị "accepted" / "declined" trong localStorage).
 * 2 nút: Đồng ý tất cả / Chỉ cần thiết. Lưu lựa chọn vào localStorage.
 *
 * Khi declined → có thể disable analytics scripts, A/B testing, v.v.
 * Hiện tại chỉ lưu preference; integration với analytics tool sẽ là step tiếp theo.
 */
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(COOKIE_KEY);
    if (!choice) {
      setVisible(true);
    }
  }, []);

  const setChoice = (value) => {
    localStorage.setItem(COOKIE_KEY, value);
    localStorage.setItem(`${COOKIE_KEY}_date`, new Date().toISOString());
    setVisible(false);
    // Optional: emit event so analytics scripts react
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { value } }));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 p-5"
    >
      <button
        type="button"
        aria-label="Đóng banner"
        onClick={() => setChoice('declined')}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
      >
        <FaTimes className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 mb-3">
        <FaCookieBite className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 id="cookie-banner-title" className="font-semibold text-slate-900 mb-1">
            Trang web dùng cookie 🍪
          </h3>
          <p id="cookie-banner-desc" className="text-sm text-slate-600 leading-snug">
            Chúng tôi dùng cookie để cải thiện trải nghiệm, ghi nhớ phiên đăng nhập và phân tích lưu lượng.
            Xem thêm tại{' '}
            <a href="/privacy" className="text-blue-600 underline">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          type="button"
          onClick={() => setChoice('declined')}
          className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          Chỉ cần thiết
        </button>
        <button
          type="button"
          onClick={() => setChoice('accepted')}
          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Đồng ý tất cả
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
