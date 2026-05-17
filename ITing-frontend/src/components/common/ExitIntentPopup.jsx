import React, { useEffect, useState } from 'react';
import { FaTimes, FaGift, FaBriefcase, FaChartLine } from 'react-icons/fa';
import NewsletterSignup from './NewsletterSignup';
import { getVariant, trackVariantConversion } from '../../utils/abTest';
import { trackEvent } from '../../utils/analytics';

const DISMISSED_KEY = 'iting_exit_popup_dismissed';
const DISMISS_TTL_DAYS = 7;

/**
 * 3 variants:
 *  A) Original — "Đợi đã! 🎁" + free salary report (control)
 *  B) Job-focused — "10 việc làm IT hot tuần này" + email signup
 *  C) Urgency — "Đăng ký ngay — 5 phút thôi" with countdown timer feel
 */
const VARIANT_COPY = {
  A: {
    icon: <FaGift className="w-8 h-8 text-amber-500" />,
    iconBg: 'bg-amber-100',
    title: 'Đợi đã! 🎁',
    description: (
      <>
        Đăng ký newsletter để nhận{' '}
        <strong className="text-blue-600">Báo cáo lương IT 2026</strong>{' '}
        miễn phí + 10 việc làm hot mỗi tuần.
      </>
    ),
    leadMagnet: 'salary-report-2026',
  },
  B: {
    icon: <FaBriefcase className="w-8 h-8 text-blue-500" />,
    iconBg: 'bg-blue-100',
    title: '10 việc làm IT hot tuần này 💼',
    description: (
      <>
        Mỗi tuần ITing chọn lọc <strong className="text-blue-600">10 việc làm cao cấp nhất</strong>{' '}
        gửi vào email bạn. Không spam, hủy bất cứ lúc nào.
      </>
    ),
    leadMagnet: null,
  },
  C: {
    icon: <FaChartLine className="w-8 h-8 text-green-500" />,
    iconBg: 'bg-green-100',
    title: 'Bạn xứng đáng mức lương cao hơn 📈',
    description: (
      <>
        Nhận miễn phí <strong className="text-green-600">Báo cáo lương IT 2026</strong> —
        biết mình có đang bị underpaid không. 5.230+ dev đã download.
      </>
    ),
    leadMagnet: 'salary-report-2026',
  },
};

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
  // A/B test: 3 variants, assigned on first exposure & persisted
  const [variant] = useState(() => getVariant('exit_intent_popup', ['A', 'B', 'C']));
  const copy = VARIANT_COPY[variant] || VARIANT_COPY.A;

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
        trackEvent('exit_intent_shown', { variant });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [shownThisSession]);

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
    trackEvent('exit_intent_dismissed', { variant });
  };

  const onConverted = () => {
    trackVariantConversion('exit_intent_popup', 'newsletter_signup');
    setTimeout(close, 2000);
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

        <div className={`w-16 h-16 ${copy.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {copy.icon}
        </div>

        <h2 id="exit-intent-title" className="text-2xl font-bold text-center text-slate-900 mb-2">
          {copy.title}
        </h2>
        <p className="text-center text-slate-600 mb-6">{copy.description}</p>

        <NewsletterSignup
          variant="compact"
          source="EXIT_INTENT"
          leadMagnet={copy.leadMagnet}
          onSuccess={onConverted}
        />

        {/* Tiny variant indicator (only visible in DevTools — for debugging) */}
        <div className="hidden" data-ab-variant={variant} />

        <p className="text-xs text-slate-400 text-center mt-4">
          Không spam. Hủy bất cứ lúc nào.
        </p>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
