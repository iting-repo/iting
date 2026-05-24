import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FaCheck,
  FaCrown,
  FaRocket,
  FaStar,
  FaCopy,
  FaTimes,
  FaCalendarAlt,
  FaSync,
  FaCheckCircle,
  FaShieldAlt,
  FaGem,
  FaArrowRight,
  FaInfoCircle,
  FaBolt,
  FaHeadset,
  FaChartLine,
  FaUsers,
  FaMagic,
} from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import { Breadcrumb } from '../../components/common';
import subscriptionService from '../../services/subscriptionService';
import paymentService from '../../services/paymentService';

/* ─── Icon + colour per tier ─── */
const TIER_META = {
  BASIC: {
    icon: FaStar,
    gradient: 'from-sky-400 to-blue-600',
    bg: 'bg-sky-50',
    ring: 'ring-sky-200',
    text: 'text-sky-600',
    btnBg: 'bg-sky-500 hover:bg-sky-600',
    badge: null,
    featureIcons: [FaBolt, FaHeadset, FaShieldAlt, FaUsers, FaChartLine, FaMagic],
  },
  PRO: {
    icon: FaRocket,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    ring: 'ring-amber-300',
    text: 'text-amber-600',
    btnBg: 'bg-amber-500 hover:bg-amber-600',
    badge: 'PHỔ BIẾN NHẤT',
    featureIcons: [FaBolt, FaUsers, FaChartLine, FaHeadset, FaMagic, FaShieldAlt],
  },
  ENTERPRISE: {
    icon: FaCrown,
    gradient: 'from-violet-500 to-purple-700',
    bg: 'bg-violet-50',
    ring: 'ring-violet-300',
    text: 'text-violet-600',
    btnBg: 'bg-violet-600 hover:bg-violet-700',
    badge: 'DOANH NGHIỆP',
    featureIcons: [FaBolt, FaUsers, FaMagic, FaChartLine, FaHeadset, FaShieldAlt],
  },
};

const EmployerServicesPage = () => {
  const navigate = useNavigate();

  /* ─── State ─── */
  const [tiers, setTiers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null); // tier code being subscribed

  // QR modal
  const [order, setOrder] = useState(null);
  const [orderStage, setOrderStage] = useState('idle'); // idle | qr | paid

  // Cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  /* ─── Fetch data ─── */
  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      subscriptionService.getTiers(),
      subscriptionService.getMine().catch(() => ({ active: false })),
    ])
      .then(([tList, mine]) => {
        setTiers(Array.isArray(tList) ? tList : []);
        setCurrent(mine || { active: false });
      })
      .catch(() => toast.error('Không tải được dữ liệu dịch vụ'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ─── Poll order status when QR shown ─── */
  useEffect(() => {
    if (orderStage !== 'qr' || !order) return;
    const itv = setInterval(async () => {
      try {
        const r = await paymentService.getOrderStatus(order.orderId);
        if (r.status === 'PAID') {
          setOrderStage('paid');
          setTimeout(() => {
            setOrder(null);
            setOrderStage('idle');
            loadData();           // refresh current sub
          }, 3000);
        } else if (['EXPIRED', 'FAILED', 'CANCELED'].includes(r.status)) {
          toast.error('Đơn hàng hết hạn hoặc bị hủy. Vui lòng thử lại.');
          setOrder(null);
          setOrderStage('idle');
        }
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(itv);
  }, [orderStage, order, loadData]);

  /* ─── Subscribe ─── */
  const subscribe = async (tierCode) => {
    setSubscribing(tierCode);
    try {
      const ord = await subscriptionService.subscribe(tierCode, true);
      setOrder(ord);
      setOrderStage('qr');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Tạo đơn hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubscribing(null);
    }
  };

  /* ─── Cancel auto-renew ─── */
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await subscriptionService.cancel(cancelReason || 'User-initiated');
      toast.success('Đã hủy tự động gia hạn. Premium vẫn active cho tới ngày hết hạn.');
      setShowCancelDialog(false);
      setCancelReason('');
      loadData();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi hủy subscription');
    } finally {
      setCancelling(false);
    }
  };

  /* ─── Helpers ─── */
  const tierFeatures = (t) =>
    t.benefits.split('·').map((s) => s.trim()).filter(Boolean);

  const fmtDate = (s) => (s ? new Date(s).toLocaleDateString('vi-VN') : '-');

  const fmtPrice = (v) => Number(v).toLocaleString('vi-VN');

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AB4E6]" />
          <p className="text-gray-400 text-sm animate-pulse">Đang tải dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Dịch vụ & Gói Premium" noIndex />

      <div className="p-4 md:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-screen">
        <Breadcrumb
          rootLabel="Tổng quan"
          rootLink="/employer/dashboard"
          items={[{ label: 'Dịch vụ' }]}
        />

        {/* ═══ Header ═══ */}
        <div className="text-center mb-12 mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full text-amber-700 text-xs font-bold mb-4">
            <FaCrown className="text-amber-500" /> HR PREMIUM
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Gói dịch vụ tuyển dụng
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Tuyển dụng nhanh hơn, smart hơn với các công cụ Premium.
            <br className="hidden sm:block" />
            Hủy bất cứ lúc nào — không ràng buộc.
          </p>
        </div>

        {/* ═══ Current subscription banner ═══ */}
        {current?.active && (
          <div className="mb-10 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <FaCheckCircle className="text-emerald-500 text-2xl" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Gói hiện tại</div>
                  <h3 className="text-xl font-bold text-gray-900">{current.tierDisplayName}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-emerald-400" />
                  <span>Hết hạn: <strong className="text-gray-900">{fmtDate(current.expiresAt)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaSync className={`${current.autoRenew ? 'text-emerald-400' : 'text-gray-300'}`} />
                  <span>Tự động gia hạn: <strong className={current.autoRenew ? 'text-emerald-600' : 'text-gray-400'}>{current.autoRenew ? 'Bật' : 'Tắt'}</strong></span>
                </div>
                {current.autoRenew && (
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    className="text-red-500 hover:text-red-600 text-xs font-bold underline underline-offset-2 transition-colors"
                  >
                    Hủy gia hạn
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Pricing Cards ═══ */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((t, idx) => {
            const meta = TIER_META[t.code] || TIER_META.BASIC;
            const Icon = meta.icon;
            const isCurrent = current?.active && current.tier === t.code;
            const isPro = t.code === 'PRO';
            const features = tierFeatures(t);

            return (
              <div
                key={t.code}
                className={`relative group bg-white rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPro
                    ? 'ring-2 ring-amber-400 shadow-lg scale-[1.03] z-10'
                    : 'ring-1 ring-gray-200 shadow-sm'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Badge */}
                {meta.badge && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-extrabold text-white rounded-full shadow-md bg-gradient-to-r ${meta.gradient}`}>
                    {meta.badge}
                  </span>
                )}

                {/* Tier icon + name */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${meta.gradient} shadow-lg shadow-${t.code === 'BASIC' ? 'sky' : t.code === 'PRO' ? 'amber' : 'violet'}-200/50`}>
                  <Icon className="text-white text-xl" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{t.code}</h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {fmtPrice(t.priceVnd)}
                  </span>
                  <span className="text-gray-400 font-medium ml-1">đ</span>
                  <span className="text-gray-400 text-sm font-medium"> / {t.periodDays} ngày</span>
                </div>

                {/* Credits badge */}
                {t.credits > 0 && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${meta.bg} ${meta.text} text-xs font-bold mb-5`}>
                    💰 +{t.credits} credits/tháng
                  </div>
                )}

                {/* Divider */}
                <div className={`h-0.5 w-full rounded-full bg-gradient-to-r ${meta.gradient} opacity-20 mb-6`} />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f, i) => {
                    const FeatureIcon = meta.featureIcons[i % meta.featureIcons.length];
                    return (
                      <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${meta.bg} ${meta.text} mt-0.5`}>
                          <FeatureIcon className="text-xs" />
                        </span>
                        <span className="font-medium">{f}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <button
                  type="button"
                  disabled={isCurrent || subscribing === t.code}
                  onClick={() => subscribe(t.code)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed ring-1 ring-gray-200'
                      : subscribing === t.code
                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                        : `${meta.btnBg} text-white shadow-md hover:shadow-lg active:scale-[0.98]`
                  }`}
                >
                  {isCurrent ? (
                    <><FaCheckCircle /> Đang sử dụng</>
                  ) : subscribing === t.code ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" /> Đang xử lý...</>
                  ) : (
                    <><FaArrowRight /> Đăng ký ngay</>
                  )}
                </button>

                {isCurrent && (
                  <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                    Hết hạn: {fmtDate(current.expiresAt)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ Bottom info section ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 ring-1 ring-sky-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <FaShieldAlt className="text-sky-500" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">An toàn & Bảo mật</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">Thanh toán an toàn qua chuyển khoản ngân hàng. Mọi giao dịch được mã hóa và bảo mật.</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 ring-1 ring-amber-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <FaSync className="text-amber-500" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Tự động gia hạn</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">3 ngày trước khi hết hạn, chúng tôi gửi email nhắc kèm QR để bạn renew nhanh chóng.</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 ring-1 ring-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <FaGem className="text-emerald-500" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Hủy bất cứ lúc nào</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">Không ràng buộc — hủy tự động gia hạn bất cứ lúc nào. Premium vẫn active cho tới hết kỳ.</p>
          </div>
        </div>

        {/* FAQ-style tip */}
        <div className="bg-slate-50 rounded-2xl p-5 ring-1 ring-slate-100 flex items-start gap-3">
          <FaInfoCircle className="text-[#3AB4E6] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-800">Lưu ý:</strong> Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận thanh toán trong vòng 1-3 phút.
            Nếu sau 5 phút chưa nhận được xác nhận, vui lòng liên hệ bộ phận hỗ trợ qua trang <strong>Liên hệ</strong>.
          </div>
        </div>
      </div>

      {/* ═══════════ QR Payment Modal ═══════════ */}
      {orderStage === 'qr' && order && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setOrder(null); setOrderStage('idle'); }}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setOrder(null); setOrderStage('idle'); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <FaTimes />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3AB4E6] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaGem className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Quét mã chuyển khoản</h2>
              <p className="text-sm text-gray-500">
                Số tiền: <strong className="text-gray-900">{fmtPrice(order.amount)}đ</strong>
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 mb-4 flex justify-center ring-1 ring-gray-100">
              <img src={order.bank?.qrImageUrl} alt="QR Code chuyển khoản" className="w-64 h-64 object-contain" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm flex items-center gap-3">
              <div className="flex-1">
                <div className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">Nội dung CK</div>
                <div className="font-mono font-bold text-gray-900 text-base break-all">{order.orderCode}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.orderCode);
                  toast.success('Đã copy nội dung chuyển khoản');
                }}
                className="flex-shrink-0 p-2.5 bg-white hover:bg-amber-100 text-amber-600 rounded-lg transition-colors ring-1 ring-amber-200"
                aria-label="Copy nội dung chuyển khoản"
              >
                <FaCopy />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3AB4E6]" />
              <span>Đang chờ xác nhận thanh toán...</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Payment Success Modal ═══════════ */}
      {orderStage === 'paid' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <FaCheck className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Đăng ký thành công! 🎉</h2>
            <p className="text-gray-500 font-medium">Tài khoản Premium đã được kích hoạt. Chúc bạn tuyển dụng hiệu quả!</p>
          </div>
        </div>
      )}

      {/* ═══════════ Cancel Auto-renew Dialog ═══════════ */}
      {showCancelDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCancelDialog(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCancelDialog(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <FaTimes className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hủy tự động gia hạn?</h2>
                <p className="text-xs text-gray-500">Subscription vẫn active cho tới hết kỳ.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
              ⚠️ Sau khi hủy, gói Premium vẫn tiếp tục cho tới <strong>{fmtDate(current?.expiresAt)}</strong>.
              Sau đó tài khoản sẽ chuyển về Free tier.
            </p>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Lý do hủy <span className="text-gray-400 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: giá quá cao, không cần dùng nữa..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3AB4E6] focus:border-transparent outline-none transition-all resize-none"
              rows={3}
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors"
              >
                Giữ lại
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Đang hủy...</>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerServicesPage;
