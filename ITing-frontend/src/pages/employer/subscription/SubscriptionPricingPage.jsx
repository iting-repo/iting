import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaCheck, FaCrown, FaRocket, FaStar, FaCopy } from 'react-icons/fa';
import SEO from '../../../components/common/SEO';
import subscriptionService from '../../../services/subscriptionService';

const TIER_ICONS = {
  BASIC: <FaStar className="text-blue-500" />,
  PRO: <FaRocket className="text-amber-500" />,
  ENTERPRISE: <FaCrown className="text-purple-500" />,
};

const SubscriptionPricingPage = () => {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Order modal state
  const [order, setOrder] = useState(null);    // {orderId, orderCode, bank, ...}
  const [orderStage, setOrderStage] = useState('idle');  // idle | qr | paid

  useEffect(() => {
    Promise.all([
      subscriptionService.getTiers(),
      subscriptionService.getMine().catch(() => ({ active: false })),
    ])
      .then(([tList, mine]) => {
        setTiers(tList);
        setCurrent(mine);
      })
      .catch(() => toast.error('Không tải được dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  // Poll order status when QR shown
  useEffect(() => {
    if (orderStage !== 'qr' || !order) return;
    const itv = setInterval(async () => {
      try {
        const r = await import('../../../services/paymentService').then(m =>
            m.default.getOrderStatus(order.orderId));
        if (r.status === 'PAID') {
          setOrderStage('paid');
          setTimeout(() => {
            setOrder(null);
            setOrderStage('idle');
            navigate('/employer/manage-subscription');
          }, 3000);
        } else if (['EXPIRED', 'FAILED', 'CANCELED'].includes(r.status)) {
          toast.error('Đơn hàng hết hạn. Vui lòng thử lại.');
          setOrder(null);
          setOrderStage('idle');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(itv);
  }, [orderStage, order, navigate]);

  const subscribe = async (tierCode) => {
    try {
      const ord = await subscriptionService.subscribe(tierCode, true);
      setOrder(ord);
      setOrderStage('qr');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Tạo đơn thất bại');
    }
  };

  const tierFeatures = (t) =>
    t.benefits.split('·').map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <SEO title="Gói dịch vụ HR — Premium" noIndex />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gói dịch vụ HR Premium</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tuyển dụng nhanh hơn, smart hơn với các công cụ Premium. Hủy bất cứ lúc nào.
          </p>
          {current?.active && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <FaCheck /> Bạn đang dùng gói {current.tierDisplayName}
              <button
                onClick={() => navigate('/employer/manage-subscription')}
                className="ml-2 underline hover:no-underline"
              >
                Quản lý
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Đang tải bảng giá...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t) => {
              const isCurrent = current?.active && current.tier === t.code;
              const isPro = t.code === 'PRO';
              return (
                <div
                  key={t.code}
                  className={`relative bg-white rounded-2xl ring-1 ring-slate-200 p-6 ${
                    isPro ? 'ring-2 ring-amber-400 shadow-xl scale-105' : 'shadow-sm'
                  }`}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-white text-xs font-bold rounded-full">
                      PHỔ BIẾN NHẤT
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    {TIER_ICONS[t.code]}
                    <h3 className="text-lg font-bold text-slate-900">{t.code}</h3>
                  </div>
                  <div className="mb-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {Number(t.priceVnd).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-slate-500 text-sm"> / {t.periodDays} ngày</span>
                  </div>

                  <ul className="space-y-2 my-6 text-sm text-slate-700">
                    {tierFeatures(t).map((f) => (
                      <li key={f} className="flex gap-2">
                        <FaCheck className="text-green-500 flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => subscribe(t.code)}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isPro
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isCurrent ? 'Đang sử dụng' : 'Đăng ký ngay'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Order QR modal */}
        {orderStage === 'qr' && order && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setOrder(null); setOrderStage('idle'); }}
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-2">Quét mã chuyển khoản</h2>
              <p className="text-sm text-slate-500 mb-4">
                Số tiền: <strong>{Number(order.amount).toLocaleString('vi-VN')}đ</strong>
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-4 flex justify-center">
                <img src={order.bank.qrImageUrl} alt="QR" className="w-64 h-64 object-contain" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                Nội dung chuyển khoản: <strong className="font-mono">{order.orderCode}</strong>
                <button
                  onClick={() => { navigator.clipboard.writeText(order.orderCode); toast.success('Đã copy'); }}
                  className="ml-2 text-blue-600"
                ><FaCopy className="inline" /></button>
              </div>
              <p className="text-xs text-slate-500 text-center">Đang chờ xác nhận thanh toán...</p>
            </div>
          </div>
        )}

        {orderStage === 'paid' && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
              <FaCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Đăng ký thành công!</h2>
              <p className="text-slate-600">Tài khoản Premium đã được kích hoạt.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SubscriptionPricingPage;
