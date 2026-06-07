import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from "lucide-react";
import { Button, Badge, Input, Switch, Dialog, Select, Card, CardContent } from "../../../components";
import { ConfirmModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";
import { toast } from "sonner";
import axiosInstance from "../../../utils/axiosInstance";

// Giới hạn banner đang bật ở carousel trang chủ (đồng bộ với backend
// AdminBannerController.MAX_HOMEPAGE_ACTIVE).
const MAX_HOMEPAGE_BANNERS = 5;
const HOMEPAGE_POSITION = "homepage_main";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, askConfirm, resetConfirm] = useConfirm();
  
  const [form, setForm] = useState({
    title: "",
    position: "homepage_main",
    imageDesktop: "",
    imageMobile: "",
    link: "",
    priority: 0,
    status: "ACTIVE"
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/banners");
      setBanners(res || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filtered = banners.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchPos = positionFilter === "ALL" || b.position === positionFilter;
    return matchSearch && matchPos;
  }).sort((a, b) => b.priority - a.priority);

  const openCreate = () => { 
    setEditing(null); 
    setForm({ 
      title: "", 
      position: "homepage_main", 
      imageDesktop: "", 
      imageMobile: "", 
      link: "", 
      priority: 0, 
      status: "ACTIVE" 
    }); 
    setDialogOpen(true); 
  };

  const openEdit = (item) => { 
    setEditing(item); 
    setForm({ 
      title: item.title, 
      position: item.position, 
      imageDesktop: item.imageDesktop || "", 
      imageMobile: item.imageMobile || "", 
      link: item.link || "", 
      priority: item.priority || 0, 
      status: item.status || "ACTIVE" 
    }); 
    setDialogOpen(true); 
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Tiêu đề không được trống");
      return;
    }
    // Chặn vượt giới hạn banner đang bật ở carousel trang chủ (homepage_main + ACTIVE).
    if (form.position === HOMEPAGE_POSITION && form.status === "ACTIVE") {
      const othersActive = banners.filter(
        (b) => b.position === HOMEPAGE_POSITION && b.status === "ACTIVE" && b.id !== editing?.id
      ).length;
      if (othersActive >= MAX_HOMEPAGE_BANNERS) {
        toast.error(`Tối đa ${MAX_HOMEPAGE_BANNERS} banner đang bật ở Trang chủ (Main). Hãy tắt bớt banner khác trước.`);
        return;
      }
    }
    try {
      if (editing) {
        await axiosInstance.put(`/admin/banners/${editing.id}`, form);
        toast.success("Đã cập nhật banner");
      } else {
        await axiosInstance.post("/admin/banners", form);
        toast.success("Đã thêm banner mới");
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Lỗi khi lưu banner");
    }
  };

  const handleDelete = (id) => { 
    askConfirm({
      title: "Xóa banner",
      message: "Bạn có chắc muốn xóa banner này?",
      warning: "Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
      onConfirm: async () => {
        resetConfirm();
        try {
          await axiosInstance.delete(`/admin/banners/${id}`);
          toast.success("Đã xóa banner");
          fetchBanners();
        } catch (error) {
          toast.error("Lỗi khi xóa");
        }
      }
    });
  };

  const toggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    // Khi bật một banner trang chủ, kiểm tra giới hạn carousel.
    if (newStatus === "ACTIVE") {
      const banner = banners.find((b) => b.id === id);
      if (banner?.position === HOMEPAGE_POSITION) {
        const othersActive = banners.filter(
          (b) => b.position === HOMEPAGE_POSITION && b.status === "ACTIVE" && b.id !== id
        ).length;
        if (othersActive >= MAX_HOMEPAGE_BANNERS) {
          toast.error(`Tối đa ${MAX_HOMEPAGE_BANNERS} banner đang bật ở Trang chủ (Main). Hãy tắt bớt banner khác trước.`);
          return;
        }
      }
    }
    try {
      await axiosInstance.patch(`/admin/banners/${id}/status?status=${newStatus}`);
      fetchBanners();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Lỗi khi cập nhật trạng thái");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Banner</h1>
          <p className="text-slate-500 text-sm mt-1">Hệ thống phân phối nội dung quảng cáo CMS</p>
          {(() => {
            const activeHomepage = banners.filter(
              (b) => b.position === HOMEPAGE_POSITION && b.status === "ACTIVE"
            ).length;
            const full = activeHomepage >= MAX_HOMEPAGE_BANNERS;
            return (
              <p className={`text-xs mt-0.5 ${full ? "font-semibold text-amber-600" : "text-slate-400"}`}>
                Carousel Trang chủ: {activeHomepage}/{MAX_HOMEPAGE_BANNERS} banner đang bật
                {full && " — đã đạt giới hạn"}
              </p>
            );
          })()}
        </div>
        <Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Thêm Banner</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Tìm tiêu đề banner..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="w-[180px]">
          <option value="ALL">Tất cả vị trí</option>
          <option value="homepage_main">Trang chủ (Main)</option>
          <option value="job_detail">Chi tiết việc làm</option>
          <option value="company_list">Danh sách công ty</option>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">Không tìm thấy banner nào.</p>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="h-16 w-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                  {item.imageDesktop ? (
                    <img src={item.imageDesktop} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-base truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="blue">{item.position}</Badge>
                    <Badge variant="gray">Ưu tiên: {item.priority}</Badge>
                    {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate max-w-[200px]">{item.link}</a>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{item.status === 'ACTIVE' ? 'Đang bật' : 'Đã tắt'}</span>
                    <Switch checked={item.status === 'ACTIVE'} onCheckedChange={() => toggleActive(item.id, item.status)} />
                  </div>
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        title={editing ? `Sửa Banner` : `Thêm Banner Mới`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Tiêu đề *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Khuyến mãi mùa hè" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Vị trí hiển thị</label>
            <Select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full">
              <option value="homepage_main">Trang chủ (Main)</option>
              <option value="job_detail">Chi tiết việc làm</option>
              <option value="company_list">Danh sách công ty</option>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Thứ tự ưu tiên (Số càng lớn xếp càng cao)</label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Ảnh Desktop (URL)</label>
            <Input value={form.imageDesktop} onChange={(e) => setForm({ ...form, imageDesktop: e.target.value })} placeholder="https://..." />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Ảnh Mobile (URL)</label>
            <Input value={form.imageMobile} onChange={(e) => setForm({ ...form, imageMobile: e.target.value })} placeholder="https://..." />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Link khi click</label>
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          </div>
          
          <div className="space-y-2 flex items-center justify-between border rounded-xl p-4 md:col-span-2">
            <div>
              <label className="text-base font-medium text-gray-800">Trạng thái Kích hoạt</label>
              <p className="text-sm text-gray-500">Banner sẽ được hiển thị trên hệ thống nếu đang bật</p>
            </div>
            <Switch checked={form.status === "ACTIVE"} onCheckedChange={(c) => setForm({ ...form, status: c ? "ACTIVE" : "INACTIVE" })} />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSave}>{editing ? "Cập nhật" : "Tạo mới"}</Button>
        </div>
      </Dialog>

      <ConfirmModal isOpen={confirm.isOpen} onClose={resetConfirm} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} warning={confirm.warning} confirmText={confirm.confirmText} variant={confirm.variant} />
    </div>
  );
};

export default BannerManagement;
