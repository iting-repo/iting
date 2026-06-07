import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  User,
  Building2,
  Briefcase,
  Settings,
  Shield,
  LayoutDashboard,
  Calendar,
  Globe,
  ArrowRight
} from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Card,
  Table,
  Td,
  Select,
  LoadingSpinner,
  Pagination,
  Dialog
} from "../../../components";
import { toast } from "sonner";
import adminAuditService from "../../../services/adminAuditService";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";

const CATEGORY_MAP = {
  company: { label: "Công ty", icon: <Building2 className="w-3 px-0 h-4" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
  user: { label: "Người dùng", icon: <User className="w-3 px-0 h-4" />, color: "bg-purple-100 text-purple-700 border-purple-200" },
  job: { label: "Công việc", icon: <Briefcase className="w-3 px-0 h-4" />, color: "bg-green-100 text-green-700 border-green-200" },
  system: { label: "Hệ thống", icon: <Settings className="w-3 px-0 h-4" />, color: "bg-orange-100 text-orange-700 border-orange-200" },
  role: { label: "Phân quyền", icon: <Shield className="w-3 px-0 h-4" />, color: "bg-amber-100 text-amber-700 border-amber-200" },
};

// Nhãn tiếng Việt cho loại đối tượng — tránh hiển thị "Config #null" khó hiểu.
const ENTITY_LABELS = {
  config: "Cấu hình hệ thống",
  system: "Cấu hình hệ thống",
  user: "Người dùng",
  company: "Công ty",
  job: "Tin tuyển dụng",
  role: "Phân quyền",
  permission: "Phân quyền",
  banner: "Banner",
  blog: "Bài viết",
  faq: "FAQ",
  report: "Báo cáo",
};

/**
 * Chuẩn hóa cột "Đối tượng": tách "Prefix #id", map prefix sang nhãn tiếng Việt,
 * và bỏ "#null"/"#undefined" (chỉ hiện tên loại khi không có ID).
 */
const formatTarget = (target) => {
  if (!target) return "—";
  const m = target.match(/^(.*?)\s*#(.*)$/);
  if (m) {
    const prefix = m[1].trim();
    const id = m[2].trim();
    const label = ENTITY_LABELS[prefix.toLowerCase()] || prefix;
    if (!id || id === "null" || id === "undefined") return label;
    return `${label} #${id}`;
  }
  return ENTITY_LABELS[target.toLowerCase()] || target;
};

// Suy ra mức độ rủi ro từ hành động/danh mục (heuristic phía client — backend
// chưa lưu trường riskLevel). Ưu tiên rule nghiêm trọng trước.
const deriveRiskLevel = (log) => {
  const t = `${log.action || ""} ${log.category || ""}`.toLowerCase();
  if (/role|permission|phân quyền|grant|assign|revoke|gán|thu hồi|cấp quyền|2fa/.test(t)) return "CRITICAL";
  if (/delete|xóa|remove|drop|purge/.test(t)) return "CRITICAL";
  if (/ban|lock|khóa|suspend|đình chỉ|reject|từ chối|block|override/.test(t)) return "HIGH";
  if (/approve|duyệt|update|cập nhật|config|cấu hình|edit|sửa|change|đổi|refund|hoàn tiền|payment|thanh toán/.test(t)) return "MEDIUM";
  return "LOW";
};

const RISK_STYLES = {
  LOW: { label: "Thấp", color: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: { label: "Trung bình", color: "bg-amber-100 text-amber-700 border-amber-200" },
  HIGH: { label: "Cao", color: "bg-orange-100 text-orange-700 border-orange-200" },
  CRITICAL: { label: "Nghiêm trọng", color: "bg-red-100 text-red-700 border-red-200" },
};

const InfoField = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-medium text-slate-700 break-words">{value}</p>
  </div>
);

// Parse cột changes (JSON) an toàn.
const parseChanges = (raw) => {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

// Hiển thị giá trị before/after thân thiện (boolean → Bật/Tắt, rỗng → —).
const fmtVal = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (v === true) return "Bật";
  if (v === false) return "Tắt";
  return String(v);
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [risk, setRisk] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const hasFilter =
    search || category !== "all" || risk !== "all" || dateFrom || dateTo;

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setRisk("all");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  // Danh mục động (entityType thực tế)
  const [categories, setCategories] = useState([]);

  // Modal chi tiết audit
  const [selectedLog, setSelectedLog] = useState(null);

  // Người thao tác nhiều nhất trong các bản ghi đang hiển thị
  const topPerformer = useMemo(() => {
    if (!logs.length) return null;
    const counts = {};
    logs.forEach((l) => {
      if (l.performer) counts[l.performer] = (counts[l.performer] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  }, [logs]);

  const now = new Date();
  const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: pageSize,
        category: category === "all" ? undefined : category,
        risk: risk === "all" ? undefined : risk,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const response = await adminAuditService.fetchLogs(params);
      setLogs(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      toast.error("Không thể tải nhật ký hoạt động");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, category, risk, search, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  // Lấy danh mục thực tế cho dropdown (1 lần khi mount)
  useEffect(() => {
    adminAuditService
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleExport = async () => {
    try {
      const params = {
        category: category === "all" ? undefined : category,
        risk: risk === "all" ? undefined : risk,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const blob = await adminAuditService.exportLogs(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit-logs.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Đã xuất CSV nhật ký");
    } catch (e) {
      toast.error("Không thể xuất dữ liệu");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "---";
    try {
      return format(new Date(timestamp), "dd/MM/yyyy HH:mm:ss", { locale: vi });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#3AB4E6]" /> Nhật ký kiểm tra
          </h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi và truy vết các thao tác quản trị, thay đổi dữ liệu và phân quyền.</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 border-slate-200 font-medium text-slate-600 hover:bg-slate-50 self-start sm:self-auto shrink-0" onClick={handleExport}>
          <Download className="w-4 h-4" /> Xuất dữ liệu
        </Button>
      </div>

      {/* Stats - Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-slate-900">{totalElements}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng bản ghi</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-indigo-600 truncate" title={topPerformer || "—"}>{topPerformer || "—"}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Người thao tác nhiều nhất</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-emerald-600">{monthLabel}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khoảng thời gian audit</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <Badge variant="sky" className="px-3 py-1 font-black">ACTIVE</Badge>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái audit</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10 h-10 border-slate-200 w-full"
              placeholder="Tìm theo hành động, đối tượng hoặc chi tiết..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <div className="w-full lg:w-52">
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} className="h-10">
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c} value={c}>{ENTITY_LABELS[c.toLowerCase()] || c}</option>
              ))}
            </Select>
          </div>
          <div className="w-full lg:w-44">
            <Select value={risk} onChange={(e) => { setRisk(e.target.value); setPage(0); }} className="h-10">
              <option value="all">Tất cả mức rủi ro</option>
              {Object.entries(RISK_STYLES).map(([key, item]) => (
                <option key={key} value={key}>{key} — {item.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="shrink-0">Từ</span>
            <Input type="date" className="h-10 border-slate-200" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} />
            <span className="shrink-0">đến</span>
            <Input type="date" className="h-10 border-slate-200" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} />
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 self-start"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-slate-100 shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
            <Table
              headers={[
                { label: "Thời gian", className: "w-40 min-w-[150px] whitespace-nowrap" },
                { label: "Danh mục", className: "w-32 min-w-[120px] whitespace-nowrap" },
                { label: "Hành động", className: "min-w-[200px]" },
                { label: "Rủi ro", className: "w-28 whitespace-nowrap" },
                { label: "Đối tượng", className: "w-48 min-w-[180px]" },
                { label: "Biến động", className: "w-40 text-center min-w-[150px]" },
                { label: "Người thực hiện", className: "w-40 min-w-[160px] whitespace-nowrap" }
              ]}
            >
              {logs.length > 0 ? logs.map((log) => {
                const cat = CATEGORY_MAP[log.category?.toLowerCase()] || { label: log.category, icon: <LayoutDashboard className="w-3 px-0 h-4 shrink-0" />, color: "bg-slate-100 text-slate-600" };
                const riskLevel = log.riskLevel || deriveRiskLevel(log);
                const risk = RISK_STYLES[riskLevel] || RISK_STYLES.LOW;
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Td>
                      <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="outline" className={`text-[10px] font-black uppercase flex items-center gap-1.5 border-transparent shrink-0 whitespace-nowrap w-fit ${cat.color}`}>
                        {cat.icon} {cat.label}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 break-words">{log.action}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all break-words" title={log.detail}>
                          {log.detail}
                        </p>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="outline" className={`text-[10px] font-black uppercase w-fit ${risk.color}`}>
                        {riskLevel}
                      </Badge>
                    </Td>
                    <Td className="font-bold text-sky-600 text-xs break-words">
                      {formatTarget(log.target)}
                    </Td>
                    <Td className="text-center">
                      {(() => {
                        const changeCount = parseChanges(log.changes).length;
                        if (changeCount > 0) {
                          return (
                            <Badge variant="outline" className="text-[10px] font-bold border-sky-200 bg-sky-50 text-sky-700 w-fit">
                              {changeCount} trường thay đổi
                            </Badge>
                          );
                        }
                        if (log.fromStatus && log.toStatus) {
                          return (
                            <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
                              <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400 shrink-0">{log.fromStatus}</Badge>
                              <span className="text-slate-300 text-xs shrink-0">→</span>
                              <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50 shrink-0">{log.toStatus}</Badge>
                            </div>
                          );
                        }
                        return <span className="text-slate-300">—</span>;
                      })()}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User className="w-4 h-4 shrink-0" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 whitespace-nowrap">{log.performer}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter whitespace-nowrap">{log.performerRole}</p>
                        </div>
                      </div>
                    </Td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm italic">
                    Không tìm thấy dữ liệu hoạt động nào phù hợp.
                  </td>
                </tr>
              )}
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination Footer */}
      {!loading && totalElements > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị {logs.length} bản ghi trên tổng số {totalElements}
          </p>
          <Pagination
            currentPage={page + 1}
            totalPages={Math.ceil(totalElements / pageSize)}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} title="Chi tiết nhật ký">
        {selectedLog && (() => {
          const cat = CATEGORY_MAP[selectedLog.category?.toLowerCase()] || { label: selectedLog.category };
          const level = selectedLog.riskLevel || deriveRiskLevel(selectedLog);
          const risk = RISK_STYLES[level] || RISK_STYLES.LOW;
          return (
            <div className="space-y-5">
              {/* Action + risk */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hành động</p>
                  <p className="text-lg font-bold text-slate-900 break-words">{selectedLog.action}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] font-black uppercase shrink-0 ${risk.color}`}>
                  {level}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <InfoField label="Danh mục" value={cat.label} />
                <InfoField label="Thời gian" value={formatTimestamp(selectedLog.timestamp)} />
                <InfoField label="Đối tượng" value={formatTarget(selectedLog.target)} />
                <InfoField
                  label="Người thực hiện"
                  value={`${selectedLog.performer || "—"}${selectedLog.performerRole ? " · " + selectedLog.performerRole : ""}`}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ IP</p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 break-words">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {selectedLog.ip || "—"}
                  </p>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trình duyệt (User-Agent)</p>
                  <p className="text-xs font-medium text-slate-600 break-words">{selectedLog.userAgent || "—"}</p>
                </div>
              </div>

              {/* Mô tả */}
              {selectedLog.detail && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả</p>
                  <p className="text-sm text-slate-700 bg-white border border-slate-100 rounded-xl p-3 whitespace-pre-wrap break-words">
                    {selectedLog.detail}
                  </p>
                </div>
              )}

              {/* Biến động: changeset nhiều trường (nếu có), fallback from→to */}
              {(() => {
                const changes = parseChanges(selectedLog.changes);
                if (changes.length > 0) {
                  return (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Biến động ({changes.length} trường)
                      </p>
                      <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                        {changes.map((c, i) => (
                          <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 text-xs">
                            <span className="font-semibold text-slate-700 break-words">{c.field}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="break-words">
                              <span className="text-slate-400 line-through">{fmtVal(c.from)}</span>
                              <span className="text-emerald-600 font-medium"> {fmtVal(c.to)}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (selectedLog.fromStatus && selectedLog.toStatus) {
                  return (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Biến động</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-200 text-slate-500">{selectedLog.fromStatus}</Badge>
                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                        <Badge variant="outline" className="border-emerald-100 text-emerald-600 bg-emerald-50">{selectedLog.toStatus}</Badge>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>Đóng</Button>
              </div>
            </div>
          );
        })()}
      </Dialog>

      {/* Spacing for bulk action bars if any */}
      <div className="h-10" />
    </div>
  );
};

export default AuditLogPage;
