import React, { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Search,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Calendar,
    Hash,
} from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
    Button,
    Input,
    Textarea,
    Badge,
    Card,
    Dialog,
    Select,
    Switch,
    Pagination,
} from "../../../components";
import adminFaqService from "../../../services/adminFaqService";

// Số câu hỏi hiển thị mỗi trang
const PAGE_SIZE = 8;

// Giới hạn tối đa số FAQ được tạo (đồng bộ với backend AdminFaqController.MAX_FAQ)
// nhằm tránh trang FAQ ngoài trang chủ bị tràn.
const MAX_FAQ = 15;

const quillModules = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link"],
        ["clean"],
    ],
};

const emptyForm = {
    title: "",
    slug: "",
    content: "",
    sortOrder: 0,
    published: true,
};

const formatDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d.getTime())
        ? v
        : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const FaqManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(1);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFaq, setPreviewFaq] = useState(null);

    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchFaqs = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: 0, size: 200 };
            if (search.trim()) params.keyword = search.trim();
            if (filterStatus === "published") params.published = true;
            else if (filterStatus === "draft") params.published = false;
            const res = await adminFaqService.getFaqs(params);
            setFaqs(res?.content || []);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải danh sách FAQ");
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    // Quay về trang 1 khi đổi từ khóa tìm kiếm / bộ lọc trạng thái
    useEffect(() => {
        setPage(1);
    }, [search, filterStatus]);

    // Kẹp trang hiện tại trong khoảng hợp lệ khi danh sách thay đổi (vd sau khi xóa)
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(faqs.length / PAGE_SIZE));
        if (page > totalPages) setPage(totalPages);
    }, [faqs, page]);

    const openCreate = () => {
        if (faqs.length >= MAX_FAQ) {
            toast.error(`Đã đạt giới hạn tối đa ${MAX_FAQ} câu hỏi FAQ. Vui lòng xóa bớt trước khi tạo mới.`);
            return;
        }
        setEditingFaq(null);
        setForm(emptyForm);
        setFormErrors({});
        setDialogOpen(true);
    };

    const openEdit = (faq) => {
        setEditingFaq(faq);
        setForm({
            title: faq.title || "",
            slug: faq.slug || "",
            content: faq.content || "",
            sortOrder: faq.sortOrder ?? 0,
            published: faq.published ?? true,
        });
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleSave = async () => {
        // Chốt chặn phía client: không cho tạo vượt giới hạn (chỉ áp dụng khi tạo mới)
        if (!editingFaq && faqs.length >= MAX_FAQ) {
            toast.error(`Đã đạt giới hạn tối đa ${MAX_FAQ} câu hỏi FAQ. Vui lòng xóa bớt trước khi tạo mới.`);
            return;
        }

        const errors = {};
        if (!form.title.trim()) errors.title = "* Vui lòng nhập câu hỏi";
        if (!form.content || !form.content.replace(/<[^>]*>/g, "").trim()) errors.content = "* Vui lòng nhập câu trả lời";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setSaving(true);
        try {
            const payload = {
                ...form,
                title: form.title.trim(),
                sortOrder: Number(form.sortOrder) || 0,
            };
            if (editingFaq) {
                await adminFaqService.updateFaq(editingFaq.id, payload);
                toast.success("Đã cập nhật FAQ");
            } else {
                await adminFaqService.createFaq(payload);
                toast.success("Đã tạo FAQ mới");
            }
            setDialogOpen(false);
            fetchFaqs();
        } catch (e) {
            toast.error(e?.response?.data?.error || e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await adminFaqService.deleteFaq(deleteConfirm.id);
            toast.success("Đã xóa FAQ");
            setDeleteConfirm(null);
            fetchFaqs();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Xóa FAQ thất bại");
        }
    };

    const handleTogglePublish = async (faq) => {
        try {
            await adminFaqService.togglePublished(faq.id);
            toast.success(
                faq.published ? "Đã chuyển về bản nháp" : "Đã xuất bản FAQ",
            );
            fetchFaqs();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể đổi trạng thái");
        }
    };

    const stats = {
        total: faqs.length,
        published: faqs.filter((f) => f.published).length,
        draft: faqs.filter((f) => !f.published).length,
    };

    // Cắt danh sách theo trang hiện tại (phân trang phía client)
    const pagedFaqs = faqs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-[#3AB4E6]" />
                        Quản lý FAQ
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        <span className={stats.total >= MAX_FAQ ? "font-semibold text-amber-600" : ""}>
                            {stats.total}/{MAX_FAQ} câu hỏi
                        </span>{" "}
                        · {stats.published} đã xuất bản · {stats.draft} bản nháp
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {stats.total >= MAX_FAQ ? (
                            <span className="text-amber-600">Đã đạt giới hạn {MAX_FAQ} câu hỏi — xóa bớt để tạo mới.</span>
                        ) : (
                            <>Sắp xếp theo <span className="font-semibold">Thứ tự</span> tăng dần, sau đó theo ngày tạo mới nhất.</>
                        )}
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    disabled={stats.total >= MAX_FAQ}
                    title={stats.total >= MAX_FAQ ? `Đã đạt giới hạn tối đa ${MAX_FAQ} câu hỏi` : "Thêm câu hỏi mới"}
                    className="flex items-center gap-2 bg-[#1967D2] hover:bg-[#1452A8] text-white shadow-lg shadow-blue-100 self-start sm:self-auto shrink-0"
                >
                    <Plus className="h-4 w-4" /> Thêm câu hỏi
                </Button>
            </div>

            {/* Filters */}
            <Card className="border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 p-4">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm câu hỏi theo tiêu đề..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full sm:w-44"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Bản nháp</option>
                    </Select>
                </div>
            </Card>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                </div>
            ) : faqs.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-slate-400 border border-slate-100">
                    <HelpCircle className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-medium">Chưa có câu hỏi nào</p>
                    <Button
                        onClick={openCreate}
                        className="mt-4 bg-[#1967D2] hover:bg-[#1452A8] text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Tạo câu hỏi đầu tiên
                    </Button>
                </Card>
            ) : (
                <>
                <div className="space-y-3">
                    {pagedFaqs.map((faq) => {
                        const isExpanded = expandedId === faq.id;
                        return (
                            <Card
                                key={faq.id}
                                className="transition-all border border-slate-100 shadow-sm hover:shadow-md"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-lg bg-[#E6F6FD] text-[#3AB4E6] flex items-center justify-center shrink-0 font-bold text-sm">
                                            #{faq.sortOrder ?? 0}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                                                className="text-left w-full"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-800 break-words line-clamp-2">
                                                        {faq.title}
                                                    </h3>
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 shrink-0">
                                                        <Hash className="h-3 w-3 shrink-0" />
                                                        /{faq.slug}
                                                    </span>
                                                    <span className="shrink-0 text-slate-300">·</span>
                                                    <span className="inline-flex items-center gap-1 shrink-0">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        {formatDate(faq.createdAt)}
                                                    </span>
                                                </div>
                                            </button>

                                            {isExpanded && faq.content && (
                                                <div
                                                    className="prose prose-sm max-w-none text-slate-600 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 overflow-x-auto break-words"
                                                    dangerouslySetInnerHTML={{ __html: faq.content }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 sm:border-l sm:pl-4 mt-2 sm:mt-0 shrink-0">
                                        <button
                                            onClick={() => handleTogglePublish(faq)}
                                            title={faq.published ? "Đổi sang nháp" : "Xuất bản"}
                                            className="flex items-center shrink-0"
                                        >
                                            <Badge variant={faq.published ? "success" : "warning"}>
                                                {faq.published ? "Đã xuất bản" : "Bản nháp"}
                                            </Badge>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setPreviewFaq(faq);
                                                    setPreviewOpen(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-[#3AB4E6] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Xem"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEdit(faq)}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(faq)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {faqs.length > PAGE_SIZE && (
                    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                        <Pagination
                            currentPage={page}
                            totalItems={faqs.length}
                            itemsPerPage={PAGE_SIZE}
                            onPageChange={setPage}
                        />
                    </div>
                )}
                </>
            )}

            {/* Create / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editingFaq ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Câu hỏi *
                        </label>
                        <Textarea
                            value={form.title}
                            onChange={(e) => {
                                setForm({ ...form, title: e.target.value });
                                if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                            }}
                            rows={2}
                            placeholder="VD: Làm sao để đăng tin tuyển dụng trên ITing?"
                            className={formErrors.title ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
                        />
                        {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Slug (tự sinh nếu để trống)
                            </label>
                            <Input
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                placeholder="vd: dang-tin-tuyen-dung"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Thứ tự sắp xếp
                            </label>
                            <Input
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Câu trả lời *
                        </label>
                        <div className={`border rounded-lg overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[180px] ${formErrors.content ? "border-red-300" : "border-slate-200"}`}>
                            <ReactQuill
                                theme="snow"
                                value={form.content}
                                onChange={(v) => {
                                    setForm({ ...form, content: v });
                                    if (formErrors.content) setFormErrors({ ...formErrors, content: null });
                                }}
                                modules={quillModules}
                                placeholder="Nhập nội dung câu trả lời..."
                            />
                        </div>
                        {formErrors.content && <p className="text-xs text-red-500">{formErrors.content}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Switch
                            checked={form.published}
                            onCheckedChange={(checked) => setForm({ ...form, published: checked })}
                        />
                        <label
                            className="text-sm font-medium text-slate-700 cursor-pointer"
                            onClick={() => setForm({ ...form, published: !form.published })}
                        >
                            Xuất bản (hiển thị công khai trên trang FAQ)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            className="bg-[#1967D2] hover:bg-[#1452A8] text-white min-w-[140px]"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Đang lưu..." : editingFaq ? "Cập nhật" : "Tạo câu hỏi"}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                title="Xem trước câu hỏi"
            >
                {previewFaq && (
                    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 break-words">{previewFaq.title}</h2>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <Badge variant={previewFaq.published ? "success" : "warning"} className="shrink-0">
                                    {previewFaq.published ? "Đã xuất bản" : "Bản nháp"}
                                </Badge>
                                <span className="text-xs text-slate-500 shrink-0">
                                    #{previewFaq.sortOrder ?? 0}
                                </span>
                                <span className="text-xs text-slate-500 shrink-0">
                                    {formatDate(previewFaq.createdAt)}
                                </span>
                            </div>
                        </div>

                        {previewFaq.content && (
                            <div
                                className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-xl border border-slate-100 overflow-x-auto break-words"
                                dangerouslySetInnerHTML={{ __html: previewFaq.content }}
                            />
                        )}

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Thông tin chi tiết
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-start sm:items-center gap-2 text-slate-600">
                                    <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                                    <span className="font-medium shrink-0">Slug:</span> <span className="break-all">/{previewFaq.slug}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="font-medium shrink-0">Tạo:</span>{" "}
                                    <span>{formatDate(previewFaq.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPreviewOpen(false);
                                    openEdit(previewFaq);
                                }}
                            >
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
                            </Button>
                            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Xác nhận xóa câu hỏi"
            >
                {deleteConfirm && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Bạn có chắc chắn muốn xóa câu hỏi{" "}
                            <span className="font-bold text-slate-800">
                                &quot;{deleteConfirm.title}&quot;
                            </span>
                            ? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                                Hủy
                            </Button>
                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleDelete}
                            >
                                Xóa câu hỏi
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default FaqManagement;
