import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    FaFileAlt, FaUserCheck, FaMagic, FaSearch, FaBolt, FaDownload,
    FaCoins, FaChartLine, FaSpinner,
} from "react-icons/fa";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Breadcrumb } from "../../components/common";
import hrReportService from "../../services/hrReportService";

const STAGE_META = {
    SCREENING:    { label: "Đang sàng lọc",   color: "#94a3b8" },
    PHONE_SCREEN: { label: "Đã liên hệ",       color: "#0ea5e9" },
    INTERVIEW:    { label: "Hẹn phỏng vấn",    color: "#3b82f6" },
    OFFER:        { label: "Gửi đề nghị",      color: "#f59e0b" },
    HIRED:        { label: "Đã nhận việc",     color: "#10b981" },
    REJECTED:     { label: "Từ chối",          color: "#ef4444" },
};

const fmtVnd = (n) => (n || 0).toLocaleString("vi-VN") + " ₫";
const fmtNum = (n) => (n || 0).toLocaleString("vi-VN");
const toIso = (d) => d.toISOString().slice(0, 10);

const HrReportPage = () => {
    const today = useMemo(() => new Date(), []);
    const defaultFrom = useMemo(() => {
        const d = new Date(today);
        // Default 365 ngày — đa số HR seed thưa, 30 ngày dễ ra rỗng. User
        // có thể chỉnh date picker để zoom lại nếu cần.
        d.setDate(d.getDate() - 364);
        return d;
    }, [today]);

    const [from, setFrom] = useState(toIso(defaultFrom));
    const [to, setTo] = useState(toIso(today));
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const load = (params = {}) => {
        setLoading(true);
        hrReportService.getOverview({ from: params.from ?? from, to: params.to ?? to })
            .then(setData)
            .catch((e) => toast.error(e?.error || "Không tải được báo cáo"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

    const handleExport = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `iting-hr-report_${from}_to_${to}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Đã xuất báo cáo (JSON)");
    };

    const stages = data?.applicationsByStage || {};
    // Bar % tính trên TỔNG hồ sơ tiếp nhận (totalApplications) thay vì sum stages.
    // 2 giá trị này thường bằng nhau, nhưng dùng totalApplications cho chính xác về ngữ nghĩa.
    const totalForBar = Math.max(1, data?.totalApplications || 0);

    return (
        <div className="space-y-6 pb-20">
            <Breadcrumb
                rootLabel="Tổng quan"
                rootLink="/employer/dashboard"
                items={[{ label: "Báo cáo tuyển dụng" }]}
            />

            {/* Header + actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Báo cáo hoạt động tuyển dụng</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tổng quan trạng thái hồ sơ, chi phí, hiệu quả tuyển dụng theo thời gian.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                    />
                    <span className="text-gray-400">→</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                    />
                    <button
                        onClick={() => load()}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-[#3AB4E6] text-white text-sm font-semibold hover:bg-[#2A9DCB] disabled:opacity-50"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : "Áp dụng"}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!data}
                        className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaDownload /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex justify-center py-20 text-gray-400">
                    <FaSpinner className="text-4xl animate-spin" />
                </div>
            ) : !data ? (
                <div className="text-center py-20 text-gray-400">Chưa có dữ liệu</div>
            ) : (
                <>
                    {/* Metric cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <MetricCard icon={<FaFileAlt />} color="text-slate-700" label="Hồ sơ tiếp nhận" value={fmtNum(data.totalApplications)} />
                        <MetricCard icon={<FaUserCheck />} color="text-emerald-600" label="Ứng tuyển (HIRED)" value={fmtNum(stages.HIRED || 0)} />
                        <MetricCard icon={<FaMagic />} color="text-indigo-600" label="AI Match đã chạy" value={fmtNum(data.aiMatchCount)} />
                        <MetricCard icon={<FaSearch />} color="text-amber-600" label="Tin đăng" value={`${fmtNum(data.activeJobs)} / ${fmtNum(data.totalJobs)}`} sub="đang active / tổng" />
                        <MetricCard icon={<FaBolt />} color="text-rose-600" label="Tin đang boost" value={fmtNum(data.boostedJobs)} />
                    </div>

                    {/* Credits + spend overview */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <FaCoins className="text-amber-500" /> Credit
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <Bar label="Đã nhận" value={data.creditsGranted} color="bg-emerald-500" />
                                <Bar label="Đã dùng" value={data.creditsSpent} color="bg-rose-500" />
                                <Bar label="Số dư" value={data.creditsBalance} color="bg-sky-500" highlight />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <FaChartLine className="text-blue-500" /> Chi phí thực tế (đã thanh toán)
                            </h3>
                            <div className="text-3xl font-black text-gray-900 mb-1 tabular-nums">{fmtVnd(data.totalSpentVnd)}</div>
                            <p className="text-xs text-gray-500">Sum payment_order PAID trong khoảng thời gian.</p>
                        </div>
                    </div>

                    {/* Trạng thái hồ sơ + Chi phí chuyển đổi */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Trạng thái hồ sơ</h3>
                            <ul className="space-y-3">
                                {/* Hàng tổng — baseline 100% */}
                                <li>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                                            <span className="font-bold text-gray-800">Tổng hồ sơ tiếp nhận</span>
                                            <span className="text-gray-500 font-bold ml-1">{fmtNum(data.totalApplications)}</span>
                                        </div>
                                        <span className="text-gray-500 font-semibold">100%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-slate-800" style={{ width: `100%` }} />
                                    </div>
                                </li>
                                {Object.entries(STAGE_META).map(([code, meta]) => {
                                    const count = stages[code] || 0;
                                    const pct = (count / totalForBar) * 100;
                                    return (
                                        <li key={code}>
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                                                    <span className="font-medium text-gray-700">{meta.label}</span>
                                                    <span className="text-gray-400 font-bold ml-1">{fmtNum(count)}</span>
                                                </div>
                                                <span className="text-gray-400">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Chi phí chuyển đổi (VND / CV)</h3>
                            <p className="text-[11px] text-gray-400 mb-3">
                                Tổng chi phí đã thanh toán ÷ số CV ở mỗi trạng thái.
                            </p>
                            <ul className="divide-y divide-gray-100">
                                {Object.entries(STAGE_META).map(([code, meta]) => {
                                    const cost = data.costPerStageVnd?.[code] || 0;
                                    return (
                                        <li key={code} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                                                <span className="text-sm font-medium text-gray-700">{meta.label}</span>
                                            </div>
                                            <span className="text-sm font-bold tabular-nums" style={{ color: meta.color }}>
                                                {fmtVnd(Math.round(cost))}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Time series chart */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Hiệu quả tuyển dụng theo thời gian</h3>
                        {data.timeSeries?.length > 0 ? (
                            <div style={{ width: "100%", height: 320 }}>
                                <ResponsiveContainer>
                                    <LineChart data={data.timeSeries} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Line type="monotone" dataKey="applications" name="Hồ sơ tiếp nhận" stroke="#94a3b8" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="interviews" name="Phỏng vấn" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="offers" name="Gửi đề nghị" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="hired" name="Nhận việc" stroke="#10b981" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="rejected" name="Từ chối" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 py-8 text-center">Chưa có dữ liệu trong khoảng thời gian này.</p>
                        )}
                    </div>

                    {/* Top jobs table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Top tin tuyển dụng (theo hồ sơ tiếp nhận)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-[11px] uppercase text-gray-400">
                                        <th className="px-6 py-3 font-bold">Tin tuyển dụng</th>
                                        <th className="px-3 py-3 font-bold text-right">Tổng</th>
                                        <th className="px-3 py-3 font-bold text-right">Hồ sơ mới</th>
                                        <th className="px-3 py-3 font-bold text-right">Phỏng vấn</th>
                                        <th className="px-3 py-3 font-bold text-right">Đề nghị</th>
                                        <th className="px-3 py-3 font-bold text-right text-emerald-600">Nhận việc</th>
                                        <th className="px-3 py-3 font-bold text-right text-red-500">Từ chối</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.topJobs?.length > 0 ? data.topJobs.map((j) => (
                                        <tr key={j.jobId} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-semibold text-gray-800 truncate max-w-xs" title={j.title}>{j.title}</td>
                                            <td className="px-3 py-3 text-right font-bold text-gray-900 tabular-nums">{fmtNum(j.totalApplications)}</td>
                                            <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{fmtNum(j.screening)}</td>
                                            <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{fmtNum(j.interview)}</td>
                                            <td className="px-3 py-3 text-right text-gray-600 tabular-nums">{fmtNum(j.offer)}</td>
                                            <td className="px-3 py-3 text-right text-emerald-600 font-bold tabular-nums">{fmtNum(j.hired)}</td>
                                            <td className="px-3 py-3 text-right text-red-500 tabular-nums">{fmtNum(j.rejected)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="text-center py-10 text-gray-400">Chưa có tin tuyển dụng nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const MetricCard = ({ icon, label, value, sub, color }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
            <span className={color}>{icon}</span>
        </div>
        <div className="text-2xl font-black text-gray-900 tabular-nums">{value}</div>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

const Bar = ({ label, value, color, highlight }) => (
    <div className={`rounded-lg p-3 ${highlight ? "bg-sky-50 ring-1 ring-sky-200" : "bg-gray-50"}`}>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</p>
        <div className="text-xl font-black text-gray-900 tabular-nums">{(value || 0).toLocaleString("vi-VN")}</div>
        <div className="h-1 mt-2 bg-white rounded">
            <div className={`h-full rounded ${color}`} style={{ width: `${Math.min(100, (value / 1000) * 100)}%` }} />
        </div>
    </div>
);

export default HrReportPage;
