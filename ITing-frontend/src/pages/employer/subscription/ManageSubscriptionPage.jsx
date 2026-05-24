import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FaCrown, FaCheckCircle, FaTimes, FaCalendarAlt, FaSync, FaCoins } from 'react-icons/fa';
import SEO from '../../../components/common/SEO';
import subscriptionService from '../../../services/subscriptionService';
import creditService from '../../../services/creditService';

const ManageSubscriptionPage = () => {
  const [data, setData] = useState(null);
  const [credit, setCredit] = useState({ balance: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      subscriptionService.getMine().catch(() => null),
      creditService.getBalance().catch(() => ({ balance: 0 })),
      creditService.getHistory(0, 10).catch(() => ({ items: [] })),
    ])
      .then(([sub, bal, hist]) => {
        setData(sub);
        setCredit(bal || { balance: 0 });
        setHistory(hist?.items || []);
      })
      .catch(() => toast.error('Không tải được dữ liệu subscription'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    try {
      await subscriptionService.cancel(cancelReason || 'User-initiated');
      toast.success('Đã hủy tự động gia hạn. Premium vẫn active cho tới ngày hết hạn.');
      setShowCancelDialog(false);
      setCancelReason('');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi hủy subscription');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Đang tải...</div>;
  }

  return (
    <>
      <SEO title="Quản lý gói dịch vụ" noIndex />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Quản lý gói dịch vụ</h1>

        {/* Credit balance card — luôn hiển thị (cả khi chưa subscribe vẫn cho thấy 0 credits) */}
        <div className="bg-gradient-to-r from-[#3AB4E6] to-[#1E3A8A] rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-blue-100 mb-1">
                <FaCoins /> Credit của bạn
              </div>
              <div className="text-4xl font-black">
                {(credit.balance || 0).toLocaleString('vi-VN')}
                <span className="text-base font-medium text-blue-100 ml-2">credits</span>
              </div>
              {credit.premiumSource && (
                <p className="text-xs text-blue-100 mt-2">
                  Nguồn gói gần nhất: <strong>{credit.premiumSource}</strong>
                </p>
              )}
            </div>
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <FaCoins className="text-3xl text-yellow-300" />
            </div>
          </div>
        </div>

        {/* History list */}
        {history.length > 0 && (
          <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FaCoins className="text-amber-500" /> Lịch sử giao dịch credit
            </h3>
            <ul className="divide-y divide-slate-100">
              {history.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="text-slate-700 truncate">{tx.description || tx.source}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleString('vi-VN')} · {tx.source}
                    </p>
                  </div>
                  <div className={`font-bold tabular-nums ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('vi-VN')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!data?.active ? (
          // FREE state — CTA to subscribe
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 text-center ring-1 ring-slate-200">
            <FaCrown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Bạn đang dùng gói Free</h2>
            <p className="text-slate-600 mb-6">
              Nâng cấp Premium để mở khóa Talent Pool, Bulk Boost, Analytics và nhiều quyền lợi khác.
            </p>
            <Link
              to="/employer/subscriptions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <FaCrown /> Xem các gói Premium
            </Link>
          </div>
        ) : (
          // ACTIVE state — current plan + actions
          <>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-6 ring-1 ring-amber-200 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-semibold text-amber-700 mb-3">
                    <FaCheckCircle /> Đang active
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{data.tierDisplayName}</h2>
                  <p className="text-sm text-slate-600 mt-1">{data.benefits}</p>
                </div>
                <FaCrown className="w-12 h-12 text-amber-500" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-amber-200">
                <Info icon={<FaCalendarAlt />} label="Bắt đầu" value={fmtDate(data.startedAt)} />
                <Info icon={<FaCalendarAlt />} label="Hết hạn" value={fmtDate(data.expiresAt)} highlight />
                <Info
                  icon={<FaSync />}
                  label="Tự động gia hạn"
                  value={data.autoRenew ? 'Đang bật' : 'Đã tắt'}
                  highlight={data.autoRenew}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white ring-1 ring-slate-200 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-slate-900 mb-4">Tùy chọn</h3>

              <div className="space-y-3">
                <Link
                  to="/employer/subscriptions"
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg ring-1 ring-slate-100 transition"
                >
                  <div>
                    <div className="font-medium text-slate-900">Đổi gói hoặc nâng cấp</div>
                    <div className="text-sm text-slate-500">Xem so sánh các tier hiện có</div>
                  </div>
                  <span className="text-blue-600 text-sm">Xem →</span>
                </Link>

                {data.autoRenew && (
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-lg ring-1 ring-slate-100 transition text-left"
                  >
                    <div>
                      <div className="font-medium text-slate-900">Hủy tự động gia hạn</div>
                      <div className="text-sm text-slate-500">
                        Premium vẫn active cho tới {fmtDate(data.expiresAt)}
                      </div>
                    </div>
                    <span className="text-red-600 text-sm">Hủy →</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5 text-sm text-slate-700">
              💡 <strong>Mẹo:</strong> Subscription hiện tại là bank-transfer thủ công (SEPAY). 3 ngày trước
              khi hết hạn chúng tôi sẽ gửi email nhắc kèm QR để bạn renew nhanh chóng.
            </div>
          </>
        )}
      </div>

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCancelDialog(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCancelDialog(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-2"
              aria-label="Đóng"
            ><FaTimes /></button>

            <h2 className="text-xl font-bold mb-3">Hủy tự động gia hạn?</h2>
            <p className="text-sm text-slate-600 mb-4">
              Subscription hiện tại vẫn active cho tới hết kỳ. Sau đó tài khoản sẽ chuyển về Free tier.
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lý do (tùy chọn, giúp chúng tôi cải thiện)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: giá quá cao, không cần dùng nữa, sản phẩm cạnh tranh..."
              className="w-full p-3 border border-slate-300 rounded-lg text-sm"
              rows={3}
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
              >Giữ lại</button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
              >Xác nhận hủy</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Info = ({ icon, label, value, highlight }) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
      {icon} {label}
    </div>
    <div className={`font-semibold ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>
      {value}
    </div>
  </div>
);

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN') : '-';

export default ManageSubscriptionPage;
