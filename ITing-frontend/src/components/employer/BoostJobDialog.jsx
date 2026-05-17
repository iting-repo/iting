import React, { useEffect, useState } from 'react';
import { FaTimes, FaCheckCircle, FaCopy, FaRocket, FaSpinner, FaClock } from 'react-icons/fa';
import { toast } from 'sonner';
import paymentService from '../../services/paymentService';
import { trackEvent } from '../../utils/analytics';
import PremiumUpgradeBanner from './PremiumUpgradeBanner';

/**
 * Boost-job payment dialog with SEPAY bank-transfer QR code.
 *
 * Stages:
 *   1) `select`  → user picks a boost tier (7d/14d/30d)
 *   2) `qr`      → show SEPAY QR + bank info + poll order status
 *   3) `paid`    → success screen, auto-close after 3s
 *   4) `expired` → "Order hết hạn" with retry
 */
const BoostJobDialog = ({ open, onClose, jobId, jobTitle }) => {
  const [stage, setStage] = useState('select');     // select | qr | paid | expired
  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load tiers on first open
  useEffect(() => {
    if (open && tiers.length === 0) {
      paymentService.getBoostTiers().then(setTiers).catch(() => {
        toast.error('Không tải được bảng giá. Thử lại sau.');
      });
    }
  }, [open, tiers.length]);

  // Poll status every 3s while in QR stage
  useEffect(() => {
    if (stage !== 'qr' || !order) return;

    const interval = setInterval(async () => {
      try {
        const s = await paymentService.getOrderStatus(order.orderId);
        if (s.status === 'PAID') {
          setStage('paid');
          trackEvent('boost_job_paid', { job_id: jobId, tier: order.tier, amount: order.amount });
          setTimeout(() => {
            onClose?.(true);  // close + signal parent to refresh
          }, 3500);
        } else if (s.status === 'EXPIRED' || s.status === 'FAILED' || s.status === 'CANCELED') {
          setStage('expired');
        }
      } catch (e) {
        console.warn('Status poll failed:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [stage, order, jobId, onClose]);

  if (!open) return null;

  const handleSelectTier = async (tier) => {
    setSelectedTier(tier);
    setLoading(true);
    try {
      const ord = await paymentService.boostJob(jobId, tier.code);
      setOrder(ord);
      setStage('qr');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không tạo được đơn thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('select');
    setSelectedTier(null);
    setOrder(null);
  };

  const copyOrderCode = () => {
    if (order?.orderCode) {
      navigator.clipboard.writeText(order.orderCode);
      toast.success('Đã copy mã giao dịch: ' + order.orderCode);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onClose?.(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose?.(false)}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
          aria-label="Đóng"
        >
          <FaTimes />
        </button>

        {/* ── STAGE: SELECT TIER ─────────────────────────────────── */}
        {stage === 'select' && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <FaRocket className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Boost tin tuyển dụng</h2>
                <p className="text-sm text-slate-500 truncate max-w-xs">{jobTitle}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              Job được boost sẽ hiển thị <strong>đầu danh sách</strong> + có badge "Featured".
              Trung bình tăng <strong>3-5x lượt apply</strong>.
            </p>

            <PremiumUpgradeBanner
              feature="Boost không giới hạn với PRO"
              reason="Gói PRO 499k/tháng đã bao gồm 20 boost free + nhiều quyền lợi khác. Tiết kiệm hơn mua từng boost lẻ."
              dismissKey="boost_dialog"
            />

            <div className="space-y-3">
              {tiers.length === 0 && (
                <div className="text-center py-4 text-slate-400">Đang tải bảng giá...</div>
              )}
              {tiers.map((t) => (
                <button
                  key={t.code}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectTier(t)}
                  className="w-full p-4 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl text-left transition disabled:opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{t.displayName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Hiển thị đầu danh sách trong {t.durationDays} ngày
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        {Number(t.priceVnd).toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-slate-400">
                        ~ {Math.round(t.priceVnd / t.durationDays).toLocaleString('vi-VN')}đ/ngày
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STAGE: QR CODE ──────────────────────────────────────── */}
        {stage === 'qr' && order && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Quét mã chuyển khoản</h2>
            <p className="text-sm text-slate-500 mb-4">
              {selectedTier?.displayName} — <strong>{Number(order.amount).toLocaleString('vi-VN')}đ</strong>
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 flex justify-center">
              <img
                src={order.bank.qrImageUrl}
                alt="QR chuyển khoản SEPAY"
                className="w-64 h-64 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  toast.error('Không tải được mã QR — vui lòng nhập thủ công thông tin bên dưới');
                }}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-amber-900 mb-2">⚠️ Lưu ý quan trọng:</p>
              <p className="text-amber-800">
                Nội dung chuyển khoản <strong>PHẢI chính xác</strong> là mã bên dưới.
                Sai một ký tự sẽ không nhận diện được.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <Row label="Ngân hàng" value={order.bank.bankCode} />
              <Row label="Số tài khoản" value={order.bank.accountNumber} copyable />
              <Row label="Chủ tài khoản" value={order.bank.accountName} />
              <Row label="Số tiền" value={`${Number(order.amount).toLocaleString('vi-VN')}đ`} />
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg ring-1 ring-blue-200">
                <div>
                  <div className="text-xs text-blue-600 font-medium">Nội dung chuyển khoản</div>
                  <div className="font-mono font-bold text-lg text-blue-900">{order.orderCode}</div>
                </div>
                <button
                  onClick={copyOrderCode}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                >
                  <FaCopy /> Copy
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
              <FaSpinner className="animate-spin text-blue-500" />
              <span>Đang chờ xác nhận thanh toán...</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <FaClock /> Đơn hàng hết hạn sau 30 phút
            </div>
          </>
        )}

        {/* ── STAGE: PAID ─────────────────────────────────────────── */}
        {stage === 'paid' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-600 mb-4">
              Job "<strong>{jobTitle}</strong>" đã được boost. Cảm ơn bạn!
            </p>
            <p className="text-sm text-slate-400">Đang đóng cửa sổ...</p>
          </div>
        )}

        {/* ── STAGE: EXPIRED ──────────────────────────────────────── */}
        {stage === 'expired' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Đơn hàng hết hạn</h2>
            <p className="text-slate-600 mb-4">
              Nếu bạn đã chuyển khoản, vui lòng liên hệ support@iting.vn để được xử lý.
            </p>
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Tạo đơn hàng mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, copyable }) => (
  <div className="flex items-center justify-between p-2.5 bg-white rounded ring-1 ring-slate-100">
    <span className="text-slate-500 text-xs">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-medium text-slate-800">{value}</span>
      {copyable && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success('Đã copy: ' + value);
          }}
          className="text-slate-400 hover:text-blue-600"
          aria-label="Copy"
        >
          <FaCopy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

export default BoostJobDialog;
