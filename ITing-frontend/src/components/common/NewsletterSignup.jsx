import React, { useState } from 'react';
import { toast } from 'sonner';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import marketingService from '../../services/marketingService';
import { getStoredUtm, trackEvent } from '../../utils/analytics';

/**
 * Newsletter signup form — compact (for footer) hoặc expanded (for landing pages).
 *
 * Props:
 *   - variant: 'compact' (default) | 'expanded' | 'inline'
 *   - source: 'FOOTER' (default) | 'POPUP' | 'LEAD_MAGNET' | 'EXIT_INTENT'
 *   - leadMagnet?: e.g. 'salary-report-2026'
 *   - title?: heading override
 *   - description?: subtitle override
 *   - onSuccess?: callback after subscribe
 */
const NewsletterSignup = ({
  variant = 'compact',
  source = 'FOOTER',
  leadMagnet,
  title,
  description,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const utm = getStoredUtm() || {};
      await marketingService.subscribeNewsletter({
        email: email.trim().toLowerCase(),
        source,
        leadMagnet,
        utmSource: utm.utm_source,
        utmMedium: utm.utm_medium,
        utmCampaign: utm.utm_campaign,
      });
      setSubscribed(true);
      trackEvent('newsletter_subscribe', { source, lead_magnet: leadMagnet });
      toast.success('Đăng ký thành công! Cảm ơn bạn.');
      onSuccess?.(email);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đăng ký thất bại. Thử lại sau.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
        <FaCheckCircle />
        Đã đăng ký nhận newsletter — kiểm tra email!
      </div>
    );
  }

  // Compact (1-line, for footer)
  if (variant === 'compact') {
    return (
      <form onSubmit={submit} className="flex gap-2 max-w-sm">
        <input
          type="email"
          required
          aria-label="Email nhận newsletter"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-md ring-1 ring-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? '...' : 'Đăng ký'}
        </button>
      </form>
    );
  }

  // Expanded card (for landing pages, popup)
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-start gap-3 mb-3">
        <FaEnvelope className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-1">
            {title || 'Nhận tin việc làm IT hot nhất'}
          </h3>
          <p className="text-blue-100 text-sm">
            {description || 'Mỗi tuần, ITing gửi cho bạn 10 việc làm IT cao cấp nhất Việt Nam. Không spam, hủy bất cứ lúc nào.'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 mt-4">
        <input
          type="email"
          required
          aria-label="Email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 font-bold bg-amber-400 text-blue-900 rounded-lg hover:bg-amber-300 transition disabled:opacity-60"
        >
          {loading ? 'Đang đăng ký...' : leadMagnet ? 'Tải miễn phí' : 'Đăng ký ngay'}
        </button>
      </form>

      <p className="text-blue-200 text-xs mt-3">
        Bằng việc đăng ký, bạn đồng ý với{' '}
        <a href="/privacy" className="underline">Chính sách bảo mật</a>.
      </p>
    </div>
  );
};

export default NewsletterSignup;
