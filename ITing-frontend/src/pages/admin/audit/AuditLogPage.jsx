import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Clock,
  User,
  Building2,
  Briefcase,
  Settings,
  Shield,
  LayoutDashboard,
  Calendar
} from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Card,
  CardContent,
  Table,
  Td,
  Select,
  LoadingSpinner,
  Pagination
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

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: pageSize,
        category: category === "all" ? "" : category,
        search: search
      };
      const response = await adminAuditService.fetchLogs(params);
      setLogs(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      toast.error("Không thể tải nhật ký hoạt động");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, category, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const handleExport = async () => {
    toast.promise(adminAuditService.exportLogs({ category, search }), {
      loading: 'Đang chuẩn bị dữ liệu...',
      success: 'Tính năng xuất CSV đang được triển khai!',
      error: 'Có lỗi xảy ra khi xuất dữ liệu'
    });
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Nhật ký kiểm tra</h1>
            <p className="text-sm text-slate-500 font-medium">Lịch sử mọi hành động thay đổi trên hệ thống</p>
          </div>
        </div>
        <Button variant="outline" className="h-10 border-slate-200 text-xs font-bold uppercase tracking-widest self-start md:self-auto shrink-0" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Xuất dữ liệu
        </Button>
      </div>

      {/* Stats - Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-slate-900">{totalElements}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng bản ghi</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-indigo-600">Quản trị viên</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Người thực hiện</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-2xl font-black text-emerald-600">Tháng {new Date().getMonth() + 1}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center space-y-1">
          <Badge variant="sky" className="px-3 py-1 font-black">ACTIVE</Badge>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái audit</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-10 h-11 border-slate-200 w-full"
            placeholder="Tìm theo hành động, đối tượng hoặc chi tiết..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
            <option value="all">Tất cả danh mục</option>
            {Object.entries(CATEGORY_MAP).map(([key, item]) => (
              <option key={key} value={key}>{item.label}</option>
            ))}
          </Select>
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
                { label: "Đối tượng", className: "w-48 min-w-[180px]" },
                { label: "Biến động", className: "w-40 text-center min-w-[150px]" },
                { label: "Người thực hiện", className: "w-40 min-w-[160px] whitespace-nowrap" }
              ]}
            >
              {logs.length > 0 ? logs.map((log) => {
                const cat = CATEGORY_MAP[log.category?.toLowerCase()] || { label: log.category, icon: <LayoutDashboard className="w-3 px-0 h-4 shrink-0" />, color: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
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
                    <Td className="font-bold text-sky-600 text-xs break-all">
                      {log.target}
                    </Td>
                    <Td className="text-center">
                      {log.fromStatus && log.toStatus ? (
                        <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
                          <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400 shrink-0">{log.fromStatus}</Badge>
                          <span className="text-slate-300 text-xs shrink-0">→</span>
                          <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50 shrink-0">{log.toStatus}</Badge>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
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
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm italic">
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

      {/* Spacing for bulk action bars if any */}
      <div className="h-10" />
    </div>
  );
};

export default AuditLogPage;
