import React, { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { Button, Badge, Input, Switch, Dialog, Select, Card, CardContent } from "../../../components";
import { ConfirmModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";
import { toast } from "sonner";
import axiosInstance from "../../../utils/axiosInstance";
import { resolveAssetUrl } from "../../../utils/assetUrl";

// Loại banner — phân biệt mục đích sử dụng.
const BANNER_TYPES = [
  { value: "ADVERTISEMENT", label: "Banner quảng cáo", short: "Quảng cáo", variant: "warning" },
  { value: "BRANDING", label: "Banner nhận diện thương hiệu ITing", short: "Thương hiệu ITing", variant: "sky" },
];
const typeMeta = (v) => BANNER_TYPES.find((t) => t.value === v) || BANNER_TYPES[0];

// Vị trí hiển thị banner.
const BANNER_POSITIONS = [
  { value: "homepage_main", label: "Trang chủ" },
  { value: "jobs_list", label: "Trang danh sách việc làm" },
  { value: "blog", label: "Trang blog" },
];
const positionLabel = (v) => BANNER_POSITIONS.find((p) => p.value === v)?.label || v;

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, askConfirm, resetConfirm] = useConfirm();
  const [adLimit, setAdLimit] = useState(5);
  const [limitInput, setLimitInput] = useState(5);
  const [savingLimit, setSavingLimit] = useState(false);

  const fetchAdLimit = async () => {
    try {
      const res = await axiosInstance.get("/admin/banners/ad-limit");
      if (res?.limit) { setAdLimit(res.limit); setLimitInput(res.limit); }
    } catch { /* dùng mặc định */ }
  };

  const handleSaveLimit = async () => {
    const v = parseInt(limitInput, 10);
    if (!v || v < 1 || v > 50) { toast.error("Giới hạn phải trong khoảng 1–50"); return; }
    try {
      setSavingLimit(true);
      const res = await axiosInstance.put(`/admin/banners/ad-limit?limit=${v}`);
      setAdLimit(res?.limit || v);
      toast.success("Đã cập nhật giới hạn banner quảng cáo");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Lỗi khi lưu giới hạn");
    } finally {
      setSavingLimit(false);
    }
  };

  // Số banner quảng cáo đang bật (cho chỉ báo x/limit).
  const adActiveCount = banners.filter(
    (b) => (b.bannerType || "ADVERTISEMENT") === "ADVERTISEMENT" && b.status === "ACTIVE"
  ).length;
  
  const [form, setForm] = useState({
    title: "",
    position: "homepage_main",
    imageDesktop: "",
    imageMobile: "",
    link: "",
    priority: 0,
    status: "ACTIVE",
    bannerType: "ADVERTISEMENT"
  });

  // Upload ảnh banner trực tiếp lên S3 (field = "imageDesktop" | "imageMobile").
  const [uploading, setUploading] = useState({ imageDesktop: false, imageMobile: false });
  const fileInputs = { imageDesktop: useRef(null), imageMobile: useRef(null) };

  const handleUploadImage = async (field, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh (jpg, png, webp, gif)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }
    try {
      setUploading((u) => ({ ...u, [field]: true }));
      const fd = new FormData();
      fd.append("file", file);
      const res = await axiosInstance.post("/admin/banners/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error("No url");
      setForm((f) => ({ ...f, [field]: url }));
      toast.success("Đã tải ảnh lên S3");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Lỗi khi tải ảnh lên");
    } finally {
      setUploading((u) => ({ ...u, [field]: false }));
      if (fileInputs[field].current) fileInputs[field].current.value = "";
    }
  };

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
    fetchAdLimit();
  }, []);

  const filtered = banners.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchPos = positionFilter === "ALL" || b.position === positionFilter;
    const matchType = typeFilter === "ALL" || (b.bannerType || "ADVERTISEMENT") === typeFilter;
    return matchSearch && matchPos && matchType;
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
      status: "ACTIVE",
      bannerType: "ADVERTISEMENT"
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
      status: item.status || "ACTIVE",
      bannerType: item.bannerType || "ADVERTISEMENT"
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Tiêu đề không được trống");
      return;
    }
    // Chặn vượt giới hạn banner QUẢNG CÁO đang bật (cấu hình được).
    if (form.bannerType === "ADVERTISEMENT" && form.status === "ACTIVE") {
      const othersActive = banners.filter(
        (b) => (b.bannerType || "ADVERTISEMENT") === "ADVERTISEMENT" && b.status === "ACTIVE" && b.id !== editing?.id
      ).length;
      if (othersActive >= adLimit) {
        toast.error(`Tối đa ${adLimit} banner Quảng cáo đang bật. Hãy tắt bớt banner khác hoặc tăng giới hạn.`);
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
    // Khi bật banner Quảng cáo, kiểm tra giới hạn.
    if (newStatus === "ACTIVE") {
      const banner = banners.find((b) => b.id === id);
      if ((banner?.bannerType || "ADVERTISEMENT") === "ADVERTISEMENT") {
        const othersActive = banners.filter(
          (b) => (b.bannerType || "ADVERTISEMENT") === "ADVERTISEMENT" && b.status === "ACTIVE" && b.id !== id
        ).length;
        if (othersActive >= adLimit) {
          toast.error(`Tối đa ${adLimit} banner Quảng cáo đang bật. Hãy tắt bớt banner khác hoặc tăng giới hạn.`);
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
            const full = adActiveCount >= adLimit;
            return (
              <p className={`text-xs mt-0.5 ${full ? "font-semibold text-amber-600" : "text-slate-400"}`}>
                Banner Quảng cáo: {adActiveCount}/{adLimit} đang bật
                {full && " — đã đạt giới hạn"}
              </p>
            );
          })()}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Giới hạn banner QC</span>
            <Input
              type="number"
              min={1}
              max={50}
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-16 h-8 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveLimit}
              disabled={savingLimit || String(limitInput) === String(adLimit)}
            >
              {savingLimit ? "..." : "Lưu"}
            </Button>
          </div>
          <Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Thêm Banner</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Tìm tiêu đề banner..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="w-[200px]">
          <option value="ALL">Tất cả vị trí</option>
          {BANNER_POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-[200px]">
          <option value="ALL">Tất cả loại</option>
          {BANNER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
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
                    <img src={resolveAssetUrl(item.imageDesktop)} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-base truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="info">{positionLabel(item.position)}</Badge>
                    <Badge variant={typeMeta(item.bannerType).variant}>{typeMeta(item.bannerType).short}</Badge>
                    <Badge variant="default">Ưu tiên: {item.priority}</Badge>
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
              {BANNER_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Thứ tự ưu tiên (Số càng lớn xếp càng cao)</label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Loại banner</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BANNER_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                    form.bannerType === t.value
                      ? "border-[#3AB4E6] bg-sky-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="bannerType"
                    value={t.value}
                    checked={form.bannerType === t.value}
                    onChange={(e) => setForm({ ...form, bannerType: e.target.value })}
                    className="mt-1 accent-[#3AB4E6]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">{t.label}</span>
                    <span className="block text-xs text-gray-500">
                      {t.value === "ADVERTISEMENT"
                        ? "Khuyến mãi, chiến dịch tuyển dụng, quảng bá tính năng"
                        : "Slogan, giới thiệu nền tảng, giá trị thương hiệu ITing"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {[
            { field: "imageDesktop", label: "Ảnh Desktop" },
            { field: "imageMobile", label: "Ảnh Mobile" },
          ].map(({ field, label }) => (
            <div key={field} className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <div className="flex items-start gap-3">
                {/* Preview / dropzone */}
                <div className="relative h-20 w-32 shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {form[field] ? (
                    <>
                      <img src={resolveAssetUrl(form[field])} alt={label} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, [field]: "" }))}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        title="Xóa ảnh"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputs[field]}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleUploadImage(field, e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputs[field].current?.click()}
                    disabled={uploading[field]}
                  >
                    {uploading[field] ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang tải lên...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />Tải ảnh lên S3</>
                    )}
                  </Button>
                  <Input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    placeholder="hoặc dán URL ảnh..."
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
          
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
