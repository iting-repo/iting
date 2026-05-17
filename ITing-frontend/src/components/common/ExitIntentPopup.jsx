import React, { useEffect, useState } from 'react';
import { FaTimes, FaGift } from 'react-icons/fa';
import NewsletterSignup from './NewsletterSignup';

const DISMISSED_KEY = 'iting_exit_popup_dismissed';
const DISMISS_TTL_DAYS = 7;

/**
 * Exit-intent popup: hiện khi user di chuột lên top (về tab address bar) để rời site.
 * Mục đích: convert visitor thành newsletter subscriber trước khi họ thoát.
 *
 * Logic:
 * - Listen `mouseleave` event ở document, chỉ trigger khi `e.clientY < 20` (about to close tab).
 * - Đã đăng ký / đã dismiss trong 7 ngày → không show.
 * - Hiển thị 1 lần per session.
 */
const ExitIntentPopup = () => {
  const [visible, setVisible] = useState(false);
  const [shownThisSession, setShownThisSession] = useState(false);

  useEffect(() => {
    // Check dismissed timestamp
    const dismissedAt = parseInt(localStorage.getItem(DISMISSED_KEY) || '0', 10);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleMouseLeave = (e) => {
      if (shownThisSession) return;
      // Trigger only when mouse goes UP near viewport top (about to leave page)
      if (e.clientY < 20 && e.relatedTarget == null) {
        setVisible(true);
        setShownThisSession(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [shownThisSession]);

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Đóng"
          onClick={close}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaTimes />
        </button>

        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaGift className="w-8 h-8 text-amber-500" />
        </div>

        <h2 id="exit-intent-title" className="text-2xl font-bold text-center text-slate-900 mb-2">
          Đợi đã! 🎁
        </h2>
        <p className="text-center text-slate-600 mb-6">
          Đăng ký newsletter để nhận{' '}
          <strong className="text-blue-600">Báo cáo lương IT 2026</strong>{' '}
          miễn phí + 10 việc làm hot mỗi tuần.
        </p>

        <NewsletterSignup
          variant="compact"
          source="EXIT_INTENT"
          leadMagnet="salary-report-2026"
          onSuccess={() => setTimeout(close, 2000)}
        />

        <p className="text-xs text-slate-400 text-center mt-4">
          Không spam. Hủy bất cứ lúc nào.
        </p>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
