import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye, Search, Image as ImageIcon, Star, Calendar, User, Globe, Tag, FileText } from "lucide-react";
import { Button, Input, Textarea, Badge, Card, Dialog, Select, Switch } from "../../../components";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import adminBlogService from "../../../services/adminBlogService";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ align: [] }],
    ["clean"],
  ],
};

const emptyForm = {
  title: "", slug: "", summary: "", content: "", category: "",
  status: "DRAFT", thumbnailUrl: "", author: "Admin",
  isFeatured: false, seoMetaTitle: "", seoMetaDescription: "",
};

const statusColor = (s) => {
  const upper = (s || "").toUpperCase();
  return upper === "PUBLISHED" ? "success" : upper === "DRAFT" ? "warning" : "default";
};
const statusLabel = (s) => {
  const upper = (s || "").toUpperCase();
  return upper === "PUBLISHED" ? "Xuất bản" : upper === "DRAFT" ? "Nháp" : s;
};

const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: 0, size: 200 };
      if (search.trim()) params.keyword = search.trim();
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await adminBlogService.getBlogs(params);
      setBlogs(res?.content || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  // CRUD
  const openCreate = () => { setEditingBlog(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || "", slug: blog.slug || "", summary: blog.summary || "",
      content: blog.content || "", category: blog.category || "",
      status: blog.status || "DRAFT", thumbnailUrl: blog.thumbnailUrl || "",
      author: blog.author || "Admin", isFeatured: blog.isFeatured || false,
      seoMetaTitle: blog.seoMetaTitle || "", seoMetaDescription: blog.seoMetaDescription || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Tiêu đề không được để trống"); return; }
    setSaving(true);
    try {
      if (editingBlog) {
        await adminBlogService.updateBlog(editingBlog.id, form);
        toast.success("Đã cập nhật bài viết");
      } else {
        await adminBlogService.createBlog(form);
        toast.success("Đã tạo bài viết mới");
      }
      setDialogOpen(false);
      fetchBlogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminBlogService.deleteBlog(deleteConfirm.id);
      toast.success("Đã xóa bài viết");
      setDeleteConfirm(null);
      fetchBlogs();
    } catch (e) {
      toast.error("Xóa bài viết thất bại");
    }
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.status === "PUBLISHED").length,
    draft: blogs.filter((b) => b.status === "DRAFT").length,
    featured: blogs.filter((b) => b.isFeatured).length,
  };

  return (
    <div className="space-y-6 p-6 pb-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Blog</h1>
          <p className="text-slate-500 text-sm mt-1">
            {stats.total} bài viết · {stats.published} xuất bản · {stats.draft} nháp · {stats.featured} nổi bật
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Sắp xếp tự động: Bài nổi bật ⭐ luôn lên đầu, mới nhất hiển thị trước
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 bg-[#1967D2] hover:bg-[#1452A8] text-white shadow-lg shadow-blue-100">
          <Plus className="h-4 w-4" /> Tạo bài viết
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-slate-100 shadow-sm">
        <div className="flex gap-3 p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm bài viết theo tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-44">
            <option value="all">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
          </Select>
        </div>
      </Card>

      {/* Blog List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-slate-400 border border-slate-100">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">Chưa có bài viết nào</p>
          <Button onClick={openCreate} className="mt-4 bg-[#1967D2] hover:bg-[#1452A8] text-white">
            <Plus className="h-4 w-4 mr-2" /> Tạo bài viết đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="transition-all p-4 border border-slate-100 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                  {blog.thumbnailUrl ? (
                    <img src={blog.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 truncate">{blog.title}</h3>
                    {blog.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        <Star className="h-2.5 w-2.5 fill-amber-400" /> Nổi bật
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />/{blog.slug}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{blog.category || "Chưa phân loại"}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{blog.author}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(blog.createdAt)}</span>
                  </p>
                </div>

                <Badge variant={statusColor(blog.status)}>{statusLabel(blog.status)}</Badge>

                <div className="flex items-center gap-1 ml-2 border-l pl-4 border-slate-100">
                  <button onClick={() => { setPreviewBlog(blog); setPreviewOpen(true); }} className="p-2 text-slate-400 hover:text-[#3AB4E6] hover:bg-blue-50 rounded-lg transition-colors" title="Xem">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(blog)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Sửa">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(blog)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingBlog ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nhập tiêu đề bài viết..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slug (tự động nếu trống)</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="vd: xu-huong-tuyen-dung-2024" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Tin tức, Hướng dẫn..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tác giả</label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tóm tắt</label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} placeholder="Mô tả ngắn gọn nội dung bài viết..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung bài viết</label>
            <div className="border border-slate-200 rounded-lg overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[180px]">
              <ReactQuill theme="snow" value={form.content} onChange={(v) => setForm({ ...form, content: v })} modules={quillModules} placeholder="Viết nội dung bài viết tại đây..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL Ảnh đại diện</label>
            <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://..." />
            {form.thumbnailUrl && (
              <div className="mt-2 h-32 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img src={form.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tối ưu SEO</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Meta Title</label>
                <Input value={form.seoMetaTitle} onChange={(e) => setForm({ ...form, seoMetaTitle: e.target.value })} placeholder="Tiêu đề hiển thị trên Google..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Meta Description</label>
                <Textarea value={form.seoMetaDescription} onChange={(e) => setForm({ ...form, seoMetaDescription: e.target.value })} rows={2} placeholder="Mô tả hiển thị trên Google..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch checked={form.isFeatured} onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })} />
            <label className="text-sm font-medium text-slate-700 cursor-pointer" onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}>
              Đánh dấu là bài viết nổi bật
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button className="bg-[#1967D2] hover:bg-[#1452A8] text-white min-w-[140px]" onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editingBlog ? "Cập nhật bài viết" : "Tạo bài viết"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ── Preview Dialog ── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} title="Xem trước bài viết">
        {previewBlog && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {previewBlog.thumbnailUrl && (
              <div className="w-full h-52 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img src={previewBlog.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-slate-900">{previewBlog.title}</h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant="info">{previewBlog.category || "Chưa phân loại"}</Badge>
                <Badge variant={statusColor(previewBlog.status)}>{statusLabel(previewBlog.status)}</Badge>
                {previewBlog.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400" /> Nổi bật
                  </span>
                )}
                <span className="text-xs text-slate-500">{formatDate(previewBlog.createdAt)}</span>
              </div>
            </div>

            {previewBlog.summary && (
              <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed">
                {previewBlog.summary}
              </p>
            )}

            {previewBlog.content && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nội dung</h4>
                <div className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-xl border border-slate-100" dangerouslySetInnerHTML={{ __html: previewBlog.content }} />
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Thông tin chi tiết</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Globe className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium">Slug:</span> /{previewBlog.slug}</div>
                <div className="flex items-center gap-2 text-slate-600"><User className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium">Tác giả:</span> {previewBlog.author}</div>
                <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium">Tạo:</span> {formatDate(previewBlog.createdAt)}</div>
                <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium">Cập nhật:</span> {formatDate(previewBlog.updatedAt)}</div>
              </div>
            </div>

            {(previewBlog.seoMetaTitle || previewBlog.seoMetaDescription) && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">SEO Meta</h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-blue-700 font-medium">{previewBlog.seoMetaTitle || previewBlog.title}</p>
                  <p className="text-xs text-green-700">iting.com/blog/{previewBlog.slug}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{previewBlog.seoMetaDescription || "—"}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => { setPreviewOpen(false); openEdit(previewBlog); }}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
              </Button>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>Đóng</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Xác nhận xóa bài viết">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa bài viết <span className="font-bold text-slate-800">"{deleteConfirm.title}"</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>Xóa bài viết</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default BlogManagement;
