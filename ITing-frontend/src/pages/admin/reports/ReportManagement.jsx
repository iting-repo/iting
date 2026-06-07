import React, { useState, useMemo, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Button, Table, Td, Textarea, Dialog, Pagination, PageHeader
} from "../../../components/common";
import { StatCard } from "../../../components/admin/StatCard";
import {
  AdminFilterBar, AdminSearchInput, adminSelectClass, AdminResetButton
} from "../../../components/admin/AdminFilterBar";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  AlertTriangle, Ban, Building2, CircleCheck, Clock, Download, Eye,
  FileText, Flag, MessageSquare, Shield, ThumbsDown, TrendingDown,
  TrendingUp, UserX, Users, CircleX, Filter, Calendar, BarChart3, PieChart as PieChartIcon,
  MoreVertical
} from "lucide-react";
import { ActionMenuPortal } from "../../../components/admin/ActionMenuPortal";
import { UserDetailDialog } from "../../../components/admin/UserDetailDialog";
import { CompanyDetailDialog } from "../../../components/admin/CompanyDetailDialog";
import { JobDetailDialog } from "../../../components/admin/JobDetailDialog";
import BulkActionBar from "../../../components/admin/BulkActionBar";
import { ConfirmModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";
import adminReportService from "../../../services/adminReportService";
import adminUserService from "../../../services/adminUserService";
import adminCompanyService from "../../../services/adminCompanyService";
import adminJobService from "../../../services/adminJobService";
import { toast } from "sonner";

// ========== CONFIG & MAPS ==========

const CATEGORY_MAP = {
  SPAM: { label: "Spam", icon: Ban, color: "slate" },
  SCAM: { label: "Lừa đảo", icon: AlertTriangle, color: "red" },
  INAPPROPRIATE: { label: "Nội dung không phù hợp", icon: ThumbsDown, color: "orange" },
  FAKE_INFO: { label: "Thông tin giả", icon: CircleX, color: "amber" },
  HARASSMENT: { label: "Quấy rối", icon: UserX, color: "rose" },
  COPYRIGHT: { label: "Vi phạm bản quyền", icon: Shield, color: "blue" },
  OTHER: { label: "Khác", icon: Flag, color: "slate" },
};

const TARGET_MAP = {
  JOB: { label: "Tin tuyển dụng", color: "info" },
  COMPANY: { label: "Công ty", color: "success" },
  USER: { label: "Người dùng", color: "warning" },
  REVIEW: { label: "Đánh giá", color: "default" },
};

const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  REVIEWING: { label: "Đang xem xét", color: "info" },
  RESOLVED: { label: "Đã xử lý", color: "success" },
  DISMISSED: { label: "Bác bỏ", color: "danger" },
};

const PRIORITY_MAP = {
  LOW: { label: "Thấp", color: "default" },
  MEDIUM: { label: "Trung bình", color: "info" },
  HIGH: { label: "Cao", color: "warning" },
  CRITICAL: { label: "Nghiêm trọng", color: "danger" },
};

// ========== SUB-COMPONENTS ==========

const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-400 italic">Chưa có dữ liệu</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={8}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const TargetBreakdown = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-400 italic">Chưa có dữ liệu</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {data.map((t) => (
          <div key={t.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-500">{t.name}</span>
              <span className="text-slate-900">{t.count} ({t.percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${t.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-center border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-800">Hiệu suất xử lý</p>
          <p className="text-2xl font-black text-blue-600">Ổn định</p>
          <p className="text-xs text-slate-400 font-medium">Hệ thống hoạt động bình thường</p>
        </div>
      </div>
    </div>
  );
};

const ReportRowActionMenu = ({ report, openMenuId, setOpenMenuId, onViewDetail, onAction }) => {
  const actions = [
    {
      label: "Xem chi tiết",
      icon: Eye,
      onClick: () => onViewDetail(report),
      className: "font-bold text-slate-700"
    },
    {
      label: "Duyệt báo cáo",
      icon: CircleCheck,
      onClick: () => onAction(report, "RESOLVED"),
      className: "font-bold text-green-600",
      hidden: !(report.status === "PENDING" || report.status === "REVIEWING")
    },
    {
      label: "Bác bỏ",
      icon: CircleX,
      onClick: () => onAction(report, "DISMISSED"),
      className: "font-bold text-red-600",
      hidden: !(report.status === "PENDING" || report.status === "REVIEWING")
    }
  ];

  return (
    <ActionMenuPortal
      id={report.id}
      openMenuId={openMenuId}
      setOpenMenuId={setOpenMenuId}
      actions={actions}
    />
  );
};

// ========== MAIN COMPONENT ==========

const ReportManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedReport, setSelectedReport] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmBulk, askBulkConfirm, resetBulkConfirm] = useConfirm();
  const isAllSelected = reports.length > 0 && selectedIds.length === reports.length;
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(reports.map((r) => r.id));
    else setSelectedIds([]);
  };
  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;
    const label = action === "RESOLVED" ? "duyệt" : "bác bỏ";
    askBulkConfirm({
      title: `Xác nhận ${label} hàng loạt`,
      message: `Bạn có chắc muốn ${label} ${selectedIds.length} báo cáo đã chọn?`,
      confirmText: label.charAt(0).toUpperCase() + label.slice(1),
      variant: action === "RESOLVED" ? "info" : "danger",
      onConfirm: async () => {
        resetBulkConfirm();
        try {
          // BE chưa có bulk endpoint — gọi handleReport song song cho từng id.
          const note = `Admin xử lý hàng loạt (${label}).`;
          const results = await Promise.allSettled(
            selectedIds.map((id) => adminReportService.handleReport(id, action, note))
          );
          const failed = results.filter((r) => r.status === "rejected").length;
          const ok = results.length - failed;
          if (failed === 0) toast.success(`Đã ${label} ${ok} báo cáo`);
          else toast.warning(`Thành công ${ok}, thất bại ${failed}`);
          setSelectedIds([]);
          fetchReports();
          fetchStats();
        } catch (e) {
          console.error("Bulk handleReport error:", e);
          toast.error("Thao tác hàng loạt thất bại");
        }
      },
    });
  };

  // States for target detail
  const [detailTarget, setDetailTarget] = useState({ type: null, data: null });

  const handleOpenTargetDetail = async (targetType, targetId) => {
    try {
      let data = null;
      if (targetType === "USER") {
        data = await adminUserService.getUserDetail(targetId);
      } else if (targetType === "COMPANY") {
        data = await adminCompanyService.getCompanyDetail(targetId);
      } else if (targetType === "JOB") {
        data = await adminJobService.getJobDetail(targetId);
      }

      if (data) {
        setDetailTarget({ type: targetType, data });
      } else {
        toast.error("Không tìm thấy thông tin chi tiết!");
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết đối tượng:", error);
      toast.error("Không thể lấy dữ liệu chi tiết!");
    }
  };
  const [actionDialog, setActionDialog] = useState({ open: false, report: null, action: "" });
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    fetchReports();
  }, [page, keyword, statusFilter, categoryFilter, targetFilter, priorityFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: page - 1,
        size: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: categoryFilter === "all" ? undefined : categoryFilter,
        targetType: targetFilter === "all" ? undefined : targetFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        search: keyword,
      };
      const res = await adminReportService.getReports(params);
      if (res.success) {
        setReports(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách báo cáo:", error);
      toast.error("Không thể tải danh sách báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminReportService.getReportStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
    }
  };

  const handleAction = (report, action) => {
    setActionDialog({ open: true, report, action });
    setActionNote("");
  };

  const confirmAction = async () => {
    if (!actionDialog.report || !actionDialog.action) return;
    try {
      const res = await adminReportService.handleReport(
        actionDialog.report.id,
        actionDialog.action,
        actionNote.trim() || "Admin đã xử lý báo cáo này."
      );
      if (res.success) {
        toast.success("Đã xử lý báo cáo thành công!");
        setActionDialog({ open: false, report: null, action: "" });
        fetchReports();
        fetchStats();
        if (selectedReport && selectedReport.id === actionDialog.report.id) {
          setSelectedReport(null);
        }
      }
    } catch (error) {
      console.error("Lỗi xử lý báo cáo:", error);
      toast.error("Thao tác thất bại.");
    }
  };

  const categoryStatsArr = useMemo(() => {
    if (!stats?.reportsByCategory) return [];
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b", "#ec4899"];
    return Object.entries(stats.reportsByCategory).map(([key, val], i) => ({
      name: CATEGORY_MAP[key]?.label || key,
      value: val,
      color: colors[i % colors.length]
    }));
  }, [stats]);

  const targetStatsArr = useMemo(() => {
    if (!stats?.reportsByTargetType) return [];
    const total = Object.values(stats.reportsByTargetType).reduce((a, b) => a + b, 0);
    return Object.entries(stats.reportsByTargetType).map(([key, val]) => ({
      name: TARGET_MAP[key]?.label || key,
      count: val,
      percentage: total > 0 ? Math.round((val / total) * 100) : 0
    }));
  }, [stats]);

  return (
    <div className="space-y-6 pb-60">
      {/* Header */}
      <PageHeader
        title="Báo cáo vi phạm"
        description="Quản lý và xử lý các báo cáo vi phạm từ người dùng."
      >
        <Button
          variant="outline"
          className="flex items-center gap-2 border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
          onClick={fetchReports}
        >
          <Calendar className="h-4 w-4" /> Làm mới dữ liệu
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chờ xử lý"
          value={stats?.pendingReports || 0}
          accent="amber"
          icon={<Clock className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Nghiêm trọng"
          value={stats?.criticalReports || 0}
          accent="red"
          icon={<AlertTriangle className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Đã xử lý tuần này"
          value={stats?.resolvedThisWeek || 0}
          accent="emerald"
          icon={<CircleCheck className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Tổng báo cáo"
          value={stats?.totalReports || 0}
          accent="blue"
          icon={<FileText className="h-5 w-5" strokeWidth={2} />}
        />
      </div>

      {/* Custom Tabs List */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-200/50 w-full sm:w-fit rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
        >
          <FileText className="w-4 h-4" /> Danh sách
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "analytics" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
        >
          <BarChart3 className="w-4 h-4" /> Phân tích
        </button>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-4">
          {/* Filters */}
          <AdminFilterBar>
            <AdminSearchInput
              placeholder="Tìm theo ID, tên đối tượng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setKeyword(search)}
            />

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className={adminSelectClass}
              >
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>

              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className={adminSelectClass}
              >
                <option value="all">Tất cả loại vi phạm</option>
                {Object.entries(CATEGORY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>

              <select
                value={targetFilter}
                onChange={e => { setTargetFilter(e.target.value); setPage(1); }}
                className={adminSelectClass}
              >
                <option value="all">Tất cả đối tượng</option>
                {Object.entries(TARGET_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>

              <Button className="h-10 rounded-full bg-[#3AB4E6] px-5 hover:bg-[#2C9ACD]" onClick={() => setKeyword(search)}>
                Tìm kiếm
              </Button>

              <AdminResetButton
                onClick={() => {
                  setSearch("");
                  setKeyword("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setTargetFilter("all");
                  setPriorityFilter("all");
                  setPage(1);
                }}
              />
            </div>
          </AdminFilterBar>

          {/* Table Container */}
          <Card className="border border-slate-100 shadow-sm !p-0 overflow-hidden bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-4 sm:px-6 py-4 bg-white">
              <div className="flex items-center gap-2">
                <FileText className="text-[#3AB4E6] w-5 h-5 shrink-0" />
                <span className="font-semibold text-slate-800">Danh sách báo cáo vi phạm ({totalElements})</span>
              </div>
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />}
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <Table
                headers={[
                  {
                    label: (
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    ),
                    className: "w-10",
                  },
                  { label: "ID", className: "w-[80px] whitespace-nowrap" },
                  { label: "Đối tượng", className: "min-w-[200px]" },
                  { label: "Loại vi phạm", className: "whitespace-nowrap min-w-[150px]" },
                  { label: "Mức độ", className: "w-32 whitespace-nowrap" },
                  { label: "Trạng thái", className: "w-36 whitespace-nowrap" },
                  { label: "Ngày tạo", className: "whitespace-nowrap" },
                  { label: "Thao tác", className: "text-right whitespace-nowrap" }
                ]}
              >
              {reports.length === 0 && !loading ? (
                <tr><Td colSpan={8} className="text-center py-12 text-slate-400 italic">Không tìm thấy báo cáo nào</Td></tr>
              ) : reports.map((r) => {
                const cat = CATEGORY_MAP[r.type] || CATEGORY_MAP.OTHER;
                const CatIcon = cat.icon;
                return (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedIds.includes(r.id) ? 'bg-sky-50/50' : ''}`} onClick={() => setSelectedReport(r)}>
                    <Td>
                      <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={() => handleSelectOne(r.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </span>
                    </Td>
                    <Td className="font-mono text-xs text-slate-400">#{r.id}</Td>
                    <Td>
                      <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={TARGET_MAP[r.targetType]?.color || "default"}>{TARGET_MAP[r.targetType]?.label || r.targetType}</Badge>
                        <button
                          onClick={() => handleOpenTargetDetail(r.targetType, r.targetId)}
                          className="text-sm font-bold text-slate-700 line-clamp-2 hover:text-blue-600 hover:underline transition-all text-left"
                          title={r.targetName || `ID: ${r.targetId}`}
                        >
                          {r.targetName || `ID: ${r.targetId}`}
                        </button>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CatIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-600">{cat.label}</span>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap"><Badge variant={PRIORITY_MAP[r.priority]?.color || "default"}>{PRIORITY_MAP[r.priority]?.label || r.priority}</Badge></Td>
                    <Td className="whitespace-nowrap"><Badge variant={STATUS_MAP[r.status]?.color || "default"}>{STATUS_MAP[r.status]?.label || r.status}</Badge></Td>
                    <Td className="text-xs text-slate-400 font-medium whitespace-nowrap">{new Date(r.createdAt).toLocaleString("vi-VN")}</Td>
                    <Td className="text-right">
                      <ReportRowActionMenu
                        report={r}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        onViewDetail={setSelectedReport}
                        onAction={handleAction}
                      />
                    </Td>
                  </tr>
                );
              })}
              </Table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Summary */}
          <Card className="border border-slate-100 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Phân tích tổng quan theo trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats?.reportsByStatus || {}).map(([key, val]) => (
                    <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase">{STATUS_MAP[key]?.label || key}</p>
                        <p className="text-2xl font-black text-slate-800">{val}</p>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          {/* Category Pie */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="w-5 h-5 text-purple-500" /> Phân phối theo loại vi phạm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryStatsArr} />
            </CardContent>
          </Card>

           {/* Target breakdown */}
           <Card className="border border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Báo cáo theo đối tượng</CardTitle>
            </CardHeader>
            <CardContent>
              <TargetBreakdown data={targetStatsArr} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onClose={() => setSelectedReport(null)} title="Chi tiết báo cáo">
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Loại vi phạm</p>
                <div className="flex items-center gap-2">
                  <Badge variant={CATEGORY_MAP[selectedReport.type]?.color || "default"}>
                    {CATEGORY_MAP[selectedReport.type]?.label || selectedReport.type}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Độ ưu tiên</p>
                <Badge variant={PRIORITY_MAP[selectedReport.priority]?.color || "default"}>
                  {PRIORITY_MAP[selectedReport.priority]?.label || selectedReport.priority}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Đối tượng bị báo cáo</p>
                <button
                  onClick={() => handleOpenTargetDetail(selectedReport.targetType, selectedReport.targetId)}
                  className="font-bold text-slate-800 hover:text-blue-600 hover:underline transition-all text-left block"
                >
                  {selectedReport.targetName || `ID: ${selectedReport.targetId}`}
                </button>
                <p className="text-xs text-slate-500">Loại: {TARGET_MAP[selectedReport.targetType]?.label}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Lý do báo cáo</p>
                <p className="text-sm font-medium text-slate-700">{selectedReport.reason}</p>
              </div>
               {selectedReport.description && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Mô tả chi tiết</p>
                  <p className="text-sm text-slate-600 line-height-relaxed">{selectedReport.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
               <p className="text-xs font-bold text-slate-400 uppercase">Thông tin người báo cáo</p>
               <p className="text-sm font-bold text-slate-800">ID người dùng: #{selectedReport.reporterId}</p>
            </div>

            {selectedReport.adminNote && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase mb-1">Ghi chú của Admin</p>
                <p className="text-sm text-blue-700">{selectedReport.adminNote}</p>
                {selectedReport.handledAt && (
                   <p className="text-[10px] text-blue-400 mt-2 italic">Xử lý vào: {new Date(selectedReport.handledAt).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>Đóng</Button>
              {(selectedReport.status === "PENDING" || selectedReport.status === "REVIEWING") && (
                 <>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(selectedReport, "RESOLVED")}>Duyệt báo cáo</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAction(selectedReport, "DISMISSED")}>Bác bỏ</Button>
                 </>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, report: null, action: "" })}
        title={actionDialog.action === "RESOLVED" ? "Xác nhận duyệt báo cáo" : "Xác nhận bác bỏ báo cáo"}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn đang thực hiện {actionDialog.action === "RESOLVED" ? "duyệt" : "bác bỏ"} báo cáo cho đối tượng:
            <span className="font-bold text-slate-900 ml-1">{actionDialog.report?.targetName}</span>
          </p>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Ghi chú xử lý (không bắt buộc)</label>
            <Textarea
              placeholder="Nhập lý do hoặc phương án xử lý..."
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setActionDialog({ open: false, report: null, action: "" })}>Hủy</Button>
            <Button
              className={actionDialog.action === "RESOLVED" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={confirmAction}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Target Detail Dialogs */}
      <UserDetailDialog
        open={detailTarget.type === "USER"}
        user={detailTarget.data}
        onClose={() => setDetailTarget({ type: null, data: null })}
      />
      <CompanyDetailDialog
        open={detailTarget.type === "COMPANY"}
        company={detailTarget.data}
        onClose={() => setDetailTarget({ type: null, data: null })}
      />
      <JobDetailDialog
        open={detailTarget.type === "JOB"}
        job={detailTarget.data}
        onClose={() => setDetailTarget({ type: null, data: null })}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { key: 'resolve', label: 'Duyệt báo cáo', icon: <CircleCheck className="h-4 w-4" />, variant: 'success', onClick: () => handleBulkAction('RESOLVED') },
          { key: 'dismiss', label: 'Bác bỏ',       icon: <CircleX className="h-4 w-4" />,     variant: 'danger',  onClick: () => handleBulkAction('DISMISSED') },
        ]}
      />

      <ConfirmModal
        isOpen={confirmBulk.isOpen}
        onClose={resetBulkConfirm}
        onConfirm={confirmBulk.onConfirm}
        title={confirmBulk.title}
        message={confirmBulk.message}
        warning={confirmBulk.warning}
        confirmText={confirmBulk.confirmText}
        variant={confirmBulk.variant}
      />
    </div>
  );
};

export default ReportManagement;
