import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaCopy, FaShare, FaFacebook, FaLinkedin, FaTwitter, FaUsers, FaGift, FaCheckCircle, FaClock } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import marketingService from '../../services/marketingService';
import { trackEvent } from '../../utils/analytics';

/**
 * Referral dashboard — hiển thị code, share URL, leaderboard cá nhân.
 *
 * Yêu cầu user đăng nhập. Backend auto-create code lần đầu user truy cập.
 */
const ReferralPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    marketingService.getMyReferral()
      .then(setData)
      .catch(() => toast.error('Không tải được dữ liệu giới thiệu'))
      .finally(() => setLoading(false));
  }, [currentUser, navigate]);

  const copyCode = () => {
    if (!data?.code) return;
    navigator.clipboard.writeText(data.code);
    trackEvent('referral_code_copied');
    toast.success('Đã copy code: ' + data.code);
  };

  const copyShareUrl = () => {
    if (!data?.shareUrl) return;
    navigator.clipboard.writeText(data.shareUrl);
    trackEvent('referral_url_copied');
    toast.success('Đã copy link mời bạn');
  };

  const shareTo = (network) => {
    if (!data?.shareUrl) return;
    const text = encodeURIComponent(
        '🚀 Mình vừa tìm được job ở ITing — nền tảng tuyển dụng IT có AI matching. Đăng ký qua link mình, cùng được tặng quà:'
    );
    const url = encodeURIComponent(data.shareUrl);
    const networks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    window.open(networks[network], '_blank', 'noopener,noreferrer,width=600,height=500');
    trackEvent('referral_shared', { network });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Mời bạn — Cùng nhau tìm việc IT" noIndex />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaGift className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mời bạn cùng tham gia ITing</h1>
          <p className="text-slate-600">
            Mỗi người bạn đăng ký qua link của bạn — cả hai cùng nhận badge & ưu đãi premium 1 tháng.
          </p>
        </div>

        {/* Code + Share URL card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Code box */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Code giới thiệu của bạn
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-white rounded-lg font-mono font-bold text-xl text-blue-700 text-center ring-1 ring-slate-200">
                  {data?.code || '...'}
                </div>
                <button
                  onClick={copyCode}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition"
                >
                  <FaCopy /> Copy
                </button>
              </div>
            </div>

            {/* Share URL */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Link mời bạn
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={data?.shareUrl || ''}
                  className="flex-1 px-3 py-3 bg-white rounded-lg text-sm text-slate-700 ring-1 ring-slate-200 font-mono"
                />
                <button
                  onClick={copyShareUrl}
                  className="px-3 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition"
                  aria-label="Copy link"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>

          {/* Share social */}
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-600 mb-3">Chia sẻ ngay:</p>
            <div className="flex gap-2">
              <button onClick={() => shareTo('facebook')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1877F2] hover:bg-[#0e6cea] text-white rounded-lg flex items-center justify-center gap-2 font-medium transition">
                <FaFacebook /> Facebook
              </button>
              <button onClick={() => shareTo('linkedin')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#0A66C2] hover:bg-[#085bb1] text-white rounded-lg flex items-center justify-center gap-2 font-medium transition">
                <FaLinkedin /> LinkedIn
              </button>
              <button onClick={() => shareTo('twitter')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg flex items-center justify-center gap-2 font-medium transition">
                <FaTwitter /> X (Twitter)
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Đã đăng ký" value={data?.totalSignups || 0} icon={<FaUsers className="text-blue-500" />} />
          <StatCard label="Đã apply việc" value={data?.converted || 0} icon={<FaCheckCircle className="text-green-500" />} />
          <StatCard label="Tỉ lệ conversion" value={`${data?.conversionRate || 0}%`} icon={<FaShare className="text-purple-500" />} />
        </div>

        {/* Recent invitees */}
        <div className="bg-white rounded-2xl p-6 ring-1 ring-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FaClock className="text-slate-400" /> Người bạn đã mời gần đây
          </h2>

          {(!data?.recentInvitees || data.recentInvitees.length === 0) ? (
            <div className="text-center py-8 text-slate-400">
              Chưa có ai đăng ký qua link của bạn. Share ngay để bắt đầu!
            </div>
          ) : (
            <div className="divide-y">
              {data.recentInvitees.map((inv, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm text-slate-700">{inv.referredEmail}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(inv.signupAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {inv.converted && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Đã apply
                      </span>
                    )}
                    {inv.rewarded && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        🎁 Đã nhận
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <section className="mt-12 bg-slate-50 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Cách thức hoạt động:</h3>
          <ol className="space-y-2 text-sm text-slate-700">
            <li><strong>1.</strong> Chia sẻ link giới thiệu của bạn với bạn bè đang tìm việc IT.</li>
            <li><strong>2.</strong> Khi họ đăng ký qua link → tài khoản của bạn được +1 invited.</li>
            <li><strong>3.</strong> Khi họ apply job đầu tiên → bạn được tính 1 "converted".</li>
            <li><strong>4.</strong> Mỗi 5 conversion → bạn nhận 1 tháng Premium (xem CV ẩn, ưu tiên hiển thị profile, v.v).</li>
          </ol>
        </section>
      </div>
    </>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
      {icon} {label}
    </div>
    <div className="text-3xl font-bold text-slate-900">{value}</div>
  </div>
);

export default ReferralPage;
