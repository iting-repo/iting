import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaTimes } from 'react-icons/fa';
import subscriptionService from '../../services/subscriptionService';

/**
 * Soft paywall — shows a yellow banner CTA when free HR hits a limit.
 *
 * Props:
 *   - feature: short label (e.g. "Talent pool search")
 *   - reason: explanation (e.g. "Free tier không có quyền search ứng viên")
 *   - dismissKey: localStorage key to remember dismissal (default: per-feature)
 *
 * Auto-hides itself if user has an active subscription.
 */
const PremiumUpgradeBanner = ({ feature, reason, dismissKey }) => {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Check if dismissed within last 7 days
    const key = `iting_premium_banner_${dismissKey || feature || 'default'}`;
    const dismissedAt = parseInt(localStorage.getItem(key) || '0', 10);
    if (dismissedAt && Date.now() - dismissedAt < 7 * 86400_000) {
      setHidden(true);
      return;
    }

    // Check sub status
    subscriptionService.getMine()
      .then((d) => setHidden(d?.active === true))
      .catch(() => setHidden(false));
  }, [feature, dismissKey]);

  if (hidden) return null;

  const dismiss = () => {
    const key = `iting_premium_banner_${dismissKey || feature || 'default'}`;
    localStorage.setItem(key, String(Date.now()));
    setHidden(true);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-4 relative">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 p-1.5 text-amber-600 hover:bg-amber-100 rounded"
        aria-label="Đóng"
      ><FaTimes className="w-3 h-3" /></button>

      <div className="flex items-start gap-3 pr-6">
        <FaCrown className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-amber-900 mb-1">
            Nâng cấp Premium để dùng {feature || 'tính năng này'}
          </h3>
          {reason && <p className="text-sm text-amber-800 mb-2">{reason}</p>}
          <Link
            to="/employer/subscriptions"
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold"
          >
            <FaCrown /> Xem gói Premium từ 199.000đ/tháng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeBanner;
