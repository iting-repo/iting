import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FaCrown, FaCheckCircle, FaTimes, FaCalendarAlt, FaSync, FaCoins,
  FaArrowUp, FaArrowDown, FaHistory, FaChartPie, FaSearch,
  FaChevronLeft, FaChevronRight, FaFilter, FaRocket, FaStar,
  FaExchangeAlt, FaBolt, FaGem, FaShieldAlt,
} from 'react-icons/fa';
import SEO from '../../../components/common/SEO';
import { Breadcrumb } from '../../../components/common';
import subscriptionService from '../../../services/subscriptionService';
import creditService from '../../../services/creditService';

/* ─── Source labels & colours ─── */
const SOURCE_CONFIG = {
  SUBSCRIPTION: { label: 'Gói Premium', color: '#3AB4E6', icon: FaCrown, bg: 'bg-sky-50 text-sky-700' },
  JOB_POST:     { label: 'Đăng tin', color: '#f59e0b', icon: FaBolt, bg: 'bg-amber-50 text-amber-700' },
  JOB_BOOST:    { label: 'Boost tin', color: '#8b5cf6', icon: FaRocket, bg: 'bg-violet-50 text-violet-700' },
  ADJUSTMENT:   { label: 'Điều chỉnh', color: '#64748b', icon: FaExchangeAlt, bg: 'bg-slate-50 text-slate-700' },
  REFUND:       { label: 'Hoàn credit', color: '#10b981', icon: FaShieldAlt, bg: 'bg-emerald-50 text-emerald-700' },
};

const getSourceMeta = (src) => SOURCE_CONFIG[src] || SOURCE_CONFIG.ADJUSTMENT;

const ManageSubscriptionPage = () => {
  const [data, setData] = useState(null);
  const [credit, setCredit] = useState({ balance: 0 });
  const [history, setHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const PAGE_SIZE = 10;

  const load = (page = 0) => {
    setLoading(true);
    Promise.all([
      subscriptionService.getMine().catch(() => null),
      creditService.getBalance().catch(() => ({ balance: 0 })),
      creditService.getHistory(page, PAGE_SIZE).catch(() => ({ items: [], totalPages: 0, totalElements: 0 })),
    ])
      .then(([sub, bal, hist]) => {
        setData(sub);
        setCredit(bal || { balance: 0 });
        setHistory(hist?.items || []);
        setTotalPages(hist?.totalPages || 0);
        setTotalElements(hist?.totalElements || 0);
      })
      .catch(() => toast.error('Không tải được dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(historyPage); }, [historyPage]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await subscriptionService.cancel(cancelReason || 'User-initiated');
      toast.success('Đã hủy tự động gia hạn.');
      setShowCancelDialog(false);
      setCancelReason('');
      load(historyPage);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi hủy subscription');
    } finally {
      setCancelling(false);
    }
  };

  /* ─── Computed: credit stats ─── */
  const stats = useMemo(() => {
    const earned = history.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const spent = history.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { earned, spent };
  }, [history]);

  /* ─── Filtered history ─── */
  const filteredHistory = useMemo(() => {
    let items = history;
    if (historyFilter !== 'ALL') {
      items = items.filter(tx => tx.source === historyFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(tx =>
        (tx.description || '').toLowerCase().includes(q) ||
        (tx.source || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [history, historyFilter, searchTerm]);

  const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN') : '-';
  const fmtDateTime = (s) => s ? new Date(s).toLocaleString('vi-VN') : '-';
  const fmtNumber = (n) => (n || 0).toLocaleString('vi-VN');

  /* ─── Loading ─── */
  if (loading && !data) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AB4E6]" />
          <p className="text-gray-400 text-sm animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Quản lý Credit & Gói dịch vụ" noIndex />

      <div className="p-4 md:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-screen">
        <Breadcrumb
          rootLabel="Tổng quan"
          rootLink="/employer/dashboard"
          items={[
            { label: 'Dịch vụ', link: '/employer/services' },
            { label: 'Quản lý Credit' },
          ]}
        />

        {/* ═══ Credit Balance Hero ═══ */}
        <div className="mt-6 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0c4a6e] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3AB4E6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 mb-2 font-bold">
                <FaCoins className="text-amber-400" /> Credit của bạn
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-6xl font-black tabular-nums tracking-tight">
                  {fmtNumber(credit.balance)}
                </span>
                <span className="text-lg font-medium text-blue-200">credits</span>
              </div>
              {credit.premiumSource && (
                <p className="text-sm text-blue-300 mt-3">
                  Nguồn gói gần nhất: <strong className="text-white">{credit.premiumSource}</strong>
                </p>
              )}
            </div>

            {/* Mini stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
                  <FaArrowUp className="text-[10px]" /> Đã nhận
                </div>
                <div className="text-xl font-bold tabular-nums">+{fmtNumber(stats.earned)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-red-300 text-xs font-bold mb-1">
                  <FaArrowDown className="text-[10px]" /> Đã dùng
                </div>
                <div className="text-xl font-bold tabular-nums">-{fmtNumber(stats.spent)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Subscription Status + Quick Actions ═══ */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Active subscription card */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 ring-1 ring-amber-200 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {data?.active
                    ? <FaCrown className="text-amber-500 text-xl" />
                    : <FaStar className="text-gray-300 text-xl" />}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600">Gói hiện tại</div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {data?.active ? data.tierDisplayName : 'Free'}
                  </h3>
                </div>
                {data?.active && (
                  <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    Active
                  </span>
                )}
              </div>

              {data?.active ? (
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendarAlt className="text-amber-400 flex-shrink-0" />
                    <span>Bắt đầu: <strong className="text-gray-900">{fmtDate(data.startedAt)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendarAlt className="text-amber-400 flex-shrink-0" />
                    <span>Hết hạn: <strong className="text-gray-900">{fmtDate(data.expiresAt)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaSync className={data.autoRenew ? 'text-emerald-400' : 'text-gray-300'} />
                    <span>Tự động gia hạn: <strong className={data.autoRenew ? 'text-emerald-600' : 'text-gray-400'}>{data.autoRenew ? 'Bật' : 'Tắt'}</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Nâng cấp Premium để nhận credits và mở khóa tính năng nâng cao.
                </p>
              )}
            </div>
          </div>

          {/* Quick actions card */}
          <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <FaGem className="text-[#3AB4E6]" /> Tùy chọn nhanh
            </h3>
            <div className="space-y-3">
              <Link
                to="/employer/services"
                className="flex items-center justify-between p-4 hover:bg-sky-50 rounded-xl ring-1 ring-gray-100 transition-all group"
              >
                <div>
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-[#3AB4E6] transition-colors">
                    {data?.active ? 'Đổi gói hoặc nâng cấp' : 'Xem các gói Premium'}
                  </div>
                  <div className="text-xs text-gray-500">So sánh BASIC · PRO · ENTERPRISE</div>
                </div>
                <span className="text-[#3AB4E6] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>

              {data?.active && data.autoRenew && (
                <button
                  type="button"
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-xl ring-1 ring-gray-100 transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors">Hủy tự động gia hạn</div>
                    <div className="text-xs text-gray-500">Premium vẫn active tới {fmtDate(data.expiresAt)}</div>
                  </div>
                  <span className="text-red-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Transaction History ═══ */}
        <div className="mt-8 bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
          {/* Header + filters */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FaHistory className="text-[#3AB4E6]" /> Lịch sử giao dịch credit
                <span className="text-xs font-medium text-gray-400 ml-1">({totalElements})</span>
              </h3>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AB4E6] focus:border-transparent outline-none w-40 transition-all"
                  />
                </div>
                {/* Filter */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3AB4E6] focus:border-transparent outline-none appearance-none bg-white cursor-pointer transition-all"
                  >
                    <option value="ALL">Tất cả</option>
                    {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction list */}
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <FaChartPie className="text-4xl text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredHistory.map((tx) => {
                const meta = getSourceMeta(tx.source);
                const Icon = meta.icon;
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon className="text-sm" />
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.description || meta.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-400">{fmtDateTime(tx.createdAt)}</span>
                      </div>
                    </div>
                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{fmtNumber(tx.amount)}
                      </div>
                      {tx.balanceAfter != null && (
                        <div className="text-[10px] text-gray-400 tabular-nums">
                          Còn lại: {fmtNumber(tx.balanceAfter)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Trang {historyPage + 1} / {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={historyPage === 0}
                  onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-xs text-gray-600" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(historyPage - 2, totalPages - 5)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setHistoryPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pageNum === historyPage
                          ? 'bg-[#3AB4E6] text-white shadow-md'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  disabled={historyPage >= totalPages - 1}
                  onClick={() => setHistoryPage(p => Math.min(totalPages - 1, p + 1))}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-xs text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Info tip ═══ */}
        <div className="mt-6 bg-sky-50 rounded-2xl p-5 ring-1 ring-sky-100 flex items-start gap-3">
          <FaCoins className="text-[#3AB4E6] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-800">Mẹo:</strong> Credits được cộng tự động khi kích hoạt gói Premium.
            Sử dụng credits để đăng tin tuyển dụng, boost vị trí hiển thị, và mở khóa tính năng nâng cao.
            3 ngày trước khi hết hạn, chúng tôi sẽ gửi email nhắc kèm QR để bạn renew nhanh chóng.
          </div>
        </div>
      </div>

      {/* ═══ Cancel Dialog ═══ */}
      {showCancelDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCancelDialog(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCancelDialog(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Đóng"
            ><FaTimes /></button>

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
              ⚠️ Sau khi hủy, gói Premium vẫn tiếp tục cho tới <strong>{fmtDate(data?.expiresAt)}</strong>.
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
              >Giữ lại</button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Đang hủy...</>
                ) : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageSubscriptionPage;
