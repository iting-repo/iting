import React, { useEffect, useState } from 'react';
import { FaGlobe, FaUsers, FaEnvelope, FaBullhorn, FaTrophy, FaArrowUp, FaFilePdf, FaSync } from 'react-icons/fa';
import { toast } from 'sonner';
import adminMarketingService from '../../../services/adminMarketingService';
import axiosInstance from '../../../utils/axiosInstance';

/**
 * Admin marketing dashboard:
 *   - KPI overview (4 cards)
 *   - UTM funnel by source / medium / campaign
 *   - Top 20 referrers leaderboard
 *   - Recent 50 referrals timeline
 */
const AdminMarketingPage = () => {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    Promise.all([
      adminMarketingService.overview(days),
      adminMarketingService.utmFunnel(days),
      adminMarketingService.topReferrers(20),
      adminMarketingService.recentReferrals(50),
    ])
      .then(([ov, fn, tr, rr]) => {
        if (cancel) return;
        setOverview(ov);
        setFunnel(fn);
        setTopReferrers(tr);
        setRecentReferrals(rr);
      })
      .catch(() => toast.error('Không tải được dữ liệu marketing'))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, [days]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            UTM funnel + referral leaderboard + newsletter stats
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 flex-wrap">
          <RegenerateSalaryReportButton />
          <label className="text-sm text-slate-600 ml-2">Khoảng:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
            <option value={365}>1 năm</option>
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi
          icon={<FaUsers className="text-blue-500" />}
          label="Tổng signup"
          value={overview?.totalSignups ?? '-'}
          loading={loading}
        />
        <Kpi
          icon={<FaEnvelope className="text-green-500" />}
          label="Newsletter active"
          value={overview?.activeNewsletterSubs ?? '-'}
          loading={loading}
        />
        <Kpi
          icon={<FaTrophy className="text-amber-500" />}
          label="Tổng referrals"
          value={overview?.totalReferrals ?? '-'}
          loading={loading}
        />
        <Kpi
          icon={<FaArrowUp className="text-purple-500" />}
          label="Referral conversion"
          value={overview ? `${overview.referralConversionRate}%` : '-'}
          subtitle={`${overview?.convertedReferrals ?? 0} đã apply`}
          loading={loading}
        />
      </div>

      {/* UTM funnel */}
      <section className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FaGlobe className="text-blue-500" /> UTM Funnel
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <UtmList title="Theo SOURCE" rows={funnel?.bySource} loading={loading} />
          <UtmList title="Theo MEDIUM" rows={funnel?.byMedium} loading={loading} />
          <UtmList title="Theo CAMPAIGN" rows={funnel?.byCampaign} loading={loading} />
        </div>
      </section>

      {/* Top referrers */}
      <section className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FaTrophy className="text-amber-500" /> Top Referrers
        </h2>

        {topReferrers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Chưa có referral nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b">
                <tr>
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium text-right">Signups</th>
                  <th className="pb-2 font-medium text-right">Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topReferrers.map((r, idx) => (
                  <tr key={r.accountId}>
                    <td className="py-2 text-slate-400">#{idx + 1}</td>
                    <td className="py-2">
                      <div className="font-medium text-slate-700">{r.fullName || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{r.email}</div>
                    </td>
                    <td className="py-2 font-mono text-xs text-blue-600">{r.code}</td>
                    <td className="py-2 text-right font-semibold">{r.totalSignups}</td>
                    <td className="py-2 text-right">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        {r.convertedCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent referrals timeline */}
      <section className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FaBullhorn className="text-purple-500" /> Recent Referrals (50 mới nhất)
        </h2>

        {recentReferrals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có dữ liệu.</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentReferrals.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 rounded-lg text-sm">
                <span className="font-mono text-xs text-blue-600 w-20 flex-shrink-0">{r.codeUsed}</span>
                <span className="flex-1 truncate">
                  <span className="text-slate-600">{r.referrerEmail}</span>
                  {' → '}
                  <span className="text-slate-900 font-medium">{r.referredEmail}</span>
                </span>
                {r.firstApplicationAt && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex-shrink-0">
                    Đã apply
                  </span>
                )}
                {r.rewarded && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs flex-shrink-0">
                    🎁 Rewarded
                  </span>
                )}
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(r.signupAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const RegenerateSalaryReportButton = () => {
  const [busy, setBusy] = React.useState(false);
  const trigger = async () => {
    if (!window.confirm('Tạo lại PDF Báo cáo lương 2026 + upload S3?')) return;
    setBusy(true);
    try {
      const r = await axiosInstance.post('/admin/marketing/regenerate-salary-report');
      toast.success(`Đã tạo & upload: ${r?.data?.publicUrl || 'OK'}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi regen');
    } finally { setBusy(false); }
  };
  return (
    <button onClick={trigger} disabled={busy}
      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
      {busy ? <FaSync className="animate-spin" /> : <FaFilePdf />}
      {busy ? 'Đang tạo...' : 'Regen Salary Report'}
    </button>
  );
};

const Kpi = ({ icon, label, value, subtitle, loading }) => (
  <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
      {icon} {label}
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-slate-900">
      {loading ? '...' : value}
    </div>
    {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
  </div>
);

const UtmList = ({ title, rows, loading }) => {
  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-500 mb-2">{title}</h3>
        <div className="text-slate-400 text-sm">Đang tải...</div>
      </div>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-500 mb-2">{title}</h3>
        <div className="text-slate-400 text-sm">Chưa có dữ liệu.</div>
      </div>
    );
  }
  const total = rows.reduce((sum, r) => sum + Number(r.count || 0), 0);
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 mb-3">{title}</h3>
      <div className="space-y-2">
        {rows.slice(0, 8).map((r) => {
          const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
          return (
            <div key={r.label} className="text-sm">
              <div className="flex justify-between mb-0.5">
                <span className="font-medium text-slate-700 truncate max-w-[60%]">{r.label}</span>
                <span className="text-slate-500 text-xs">{r.count} ({pct}%)</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMarketingPage;
