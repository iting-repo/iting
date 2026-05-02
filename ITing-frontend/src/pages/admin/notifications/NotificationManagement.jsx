import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Select,
  Dialog,
  Input,
  Textarea,
} from "../../../components/common";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Building2,
  CheckCircle,
  Clock,
  Filter,
  Flag,
  Mail,
  MailOpen,
  Plus,
  Send,
  Settings,
  Shield,
  Trash2,
  Users,
  Briefcase,
} from "lucide-react";
import notificationService from "../../../services/notificationService";

// ========== TYPES & MAPS ==========

const TYPE_MAP = {
  SYSTEM: { label: "Hệ thống", icon: Settings, color: "text-blue-600", bg: "bg-blue-50" },
  COMPANY_UPDATE: { label: "Công ty", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
  ACCOUNT_UPDATE: { label: "Người dùng", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
  JOB_NEW: { label: "Tuyển dụng", icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
  SYSTEM_ANNOUNCEMENT: { label: "Thông báo", icon: Flag, color: "text-red-600", bg: "bg-red-50" },
  ADMIN_COMPANY_REGISTERED: { label: "Công ty mới", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  ADMIN_JOB_CREATED: { label: "Việc làm mới", icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
  ADMIN_REPORT_RECEIVED: { label: "Báo cáo", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
};

const getNotiTypeInfo = (type) => {
  if (TYPE_MAP[type]) return TYPE_MAP[type];
  return { label: "Hệ thống", icon: Bell, color: "text-slate-600", bg: "bg-slate-50" };
};

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Selection & Actions
  const [selected, setSelected] = useState(new Set());
  const [detailOpen, setDetailOpen] = useState(null);
  
  // Compose
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeType, setComposeType] = useState("SYSTEM_ANNOUNCEMENT");
  const [recipientId, setRecipientId] = useState("");
  const [recipientType, setRecipientType] = useState("USER");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread" && n.isRead) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    if (search && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Giả sử API hỗ trợ phân trang, ở đây ta lấy trang đầu tiên với size lớn
      const res = await notificationService.getNotifications({
        recipientType: "ADMIN",
        page: 0,
        size: 100,
      });
      if (res && res.content) {
        setNotifications(res.content);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
      toast.error("Không thể lấy danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((n) => n.id)));
    }
  };

  const markAsRead = async (ids) => {
    try {
      for (const id of ids) {
        await notificationService.markAsRead(id, "ADMIN");
      }
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
      setSelected(new Set());
      toast.success(`Đã đánh dấu ${ids.length} thông báo là đã đọc`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông báo");
    }
  };

  const deleteNotifications = async (ids) => {
    try {
      for (const id of ids) {
        await notificationService.deleteNotification(id, "ADMIN");
      }
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      setSelected(new Set());
      toast.success(`Đã xóa ${ids.length} thông báo`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa thông báo");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead("ADMIN");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const openDetail = async (n) => {
    setDetailOpen(n);
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n.id, "ADMIN");
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCompose = async () => {
    if (!composeMessage.trim() || !recipientId) {
      toast.error("Vui lòng điền đầy đủ nội dung và ID người nhận");
      return;
    }
    
    try {
      await notificationService.createNotification({
        recipientId: parseInt(recipientId),
        recipientType: recipientType,
        type: composeType,
        content: composeTitle ? `[${composeTitle}] ${composeMessage}` : composeMessage,
      });

      toast.success("Đã gửi thông báo thành công");
      setComposeOpen(false);
      setComposeTitle("");
      setComposeMessage("");
      setRecipientId("");
    } catch (error) {
      toast.error("Lỗi khi gửi thông báo.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông báo hệ thống và gửi thông báo mới
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={markAllRead}>
            <MailOpen className="w-4 h-4" /> Đọc tất cả
          </Button>
          <Button className="gap-2 bg-[#3AB4E6] hover:bg-[#2C9ACD]" onClick={() => setComposeOpen(true)}>
            <Plus className="w-4 h-4" /> Tạo thông báo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm border-y-0 border-r-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{notifications.length}</p>
              <p className="text-xs text-slate-500">Tổng thông báo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 shadow-sm border-y-0 border-r-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-50">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{unreadCount}</p>
              <p className="text-xs text-slate-500">Chưa đọc</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm border-y-0 border-r-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{notifications.length - unreadCount}</p>
              <p className="text-xs text-slate-500">Đã đọc</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400 shadow-sm border-y-0 border-r-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">Hệ thống</p>
              <p className="text-xs text-slate-500">Trạng thái ổn định</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-200/50 w-fit rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bell className="w-4 h-4" /> Tất cả
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "unread" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Mail className="w-4 h-4" /> Chưa đọc
          {unreadCount > 0 && (
            <Badge variant="danger" className="ml-1 px-1.5 py-0 h-4 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </button>
      </div>

      <Card className="shadow-sm border border-slate-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm thông báo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-[180px] h-10"
            >
              <option value="all">Tất cả loại</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <span className="text-sm font-medium text-slate-700">
            Đã chọn {selected.size} thông báo
          </span>
          <Button
            className="gap-2 h-8 border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            variant="outline"
            onClick={() => markAsRead(Array.from(selected))}
          >
            <MailOpen className="w-3.5 h-3.5" /> Đánh dấu đã đọc
          </Button>
          <Button
            className="gap-2 h-8 border-red-200 text-red-600 bg-white hover:bg-red-50 hover:text-red-700"
            variant="outline"
            onClick={() => deleteNotifications(Array.from(selected))}
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa
          </Button>
        </div>
      )}

      {/* Notification List */}
      <Card className="shadow-sm border border-slate-100 !p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={selectAll}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Chọn tất cả ({filtered.length})
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <BellOff className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const typeInfo = getNotiTypeInfo(n.type);
              const TypeIcon = typeInfo.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-4 py-4 cursor-pointer transition-colors hover:bg-slate-50/80 ${
                    !n.isRead ? "bg-sky-50/40" : "bg-white"
                  }`}
                  onClick={() => openDetail(n)}
                >
                  <div
                    className="pt-1 select-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(n.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(n.id)}
                      onChange={() => {}} // dummy onChange to suppress React warning
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                  </div>

                  <div className={`p-2.5 rounded-xl ${typeInfo.bg} shrink-0`}>
                    <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 pr-6">
                        <div className="flex items-center gap-2">
                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <p
                            className={`text-sm truncate ${
                              !n.isRead ? "font-bold text-slate-800" : "font-medium text-slate-600"
                            }`}
                          >
                            {n.content?.split('] ')[0]?.replace('[', '') || "Thông báo hệ thống"}
                          </p>
                        </div>
                        <p className={`text-sm text-slate-500 line-clamp-1 ${!n.isRead ? "font-medium" : ""}`}>
                          {n.content?.split('] ')[1] || n.content}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0 whitespace-nowrap">
                        {n.time ? new Date(n.time).toLocaleString() : "---"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex flex-col items-end gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!n.isRead && (
                      <button
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        title="Đánh dấu đã đọc"
                        onClick={() => markAsRead([n.id])}
                      >
                        <MailOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Xóa"
                      onClick={() => deleteNotifications([n.id])}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={!!detailOpen} onClose={() => setDetailOpen(null)} title="Chi tiết thông báo">
        {detailOpen && (() => {
          const typeInfo = getNotiTypeInfo(detailOpen.type);
          const TypeIcon = typeInfo.icon;
          return (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${typeInfo.bg} shrink-0`}>
                  <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                </div>
                <div>
                  <Badge variant="outline" className={`${typeInfo.bg} ${typeInfo.color} border-0`}>
                    {typeInfo.label}
                  </Badge>
                  <span className="ml-3 text-xs text-slate-500 font-medium flex items-center gap-1 mt-1.5">
                    <Clock className="w-3.5 h-3.5" /> Thống báo vào lúc: {detailOpen.time ? new Date(detailOpen.time).toLocaleString() : "---"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {detailOpen.content}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { deleteNotifications([detailOpen.id]); setDetailOpen(null); }}>
                  Xóa thông báo
                </Button>
                <Button variant="outline" onClick={() => setDetailOpen(null)}>Đóng</Button>
              </div>
            </div>
          );
        })()}
      </Dialog>

      {/* COMPOSE DIALOG */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} title="Tạo thông báo mới">
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Loại đối tượng nhận</label>
              <Select value={recipientType} onChange={(e) => setRecipientType(e.target.value)} className="h-11">
                <option value="USER">Ứng viên / Cá nhân</option>
                <option value="COMPANY">Công ty / Tổ chức</option>
                <option value="ADMIN">Ban quản trị</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">ID người nhận *</label>
              <Input
                type="number"
                placeholder="Ví dụ: 12"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Loại thông báo</label>
            <Select value={composeType} onChange={(e) => setComposeType(e.target.value)} className="h-11">
              {Object.entries(TYPE_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tiêu đề (Không bắt buộc)</label>
            <Input
              placeholder="Nhập tiêu đề..."
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              className="h-11"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nội dung *</label>
            <Textarea
              placeholder="Nhập nội dung thông báo..."
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Hủy</Button>
            <Button
              className="bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white"
              disabled={!composeMessage.trim() || !recipientId}
              onClick={handleCompose}
            >
              Gửi thiết lập
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default NotificationManagement;
