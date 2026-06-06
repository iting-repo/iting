import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBullhorn } from "react-icons/fa";
import { toast } from "sonner";
import announcementService from "../../../services/announcementService";
import { ConfirmModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";

const DISPLAY_MODES = [
  { value: "MODAL_BLOCKING", label: "Modal — Buộc đọc & accept" },
  { value: "MODAL_DISMISSIBLE", label: "Modal — Có thể đóng" },
  { value: "BANNER", label: "Banner thanh trên cùng" },
];

const ROLE_OPTIONS = ["ALL", "CANDIDATE", "EMPLOYER", "ADMIN"];

const EMPTY_FORM = {
  title: "",
  bodyHtml: "",
  imageUrl: "",
  displayMode: "MODAL_DISMISSIBLE",
  requireAcknowledge: false,
  targetRoles: ["ALL"],
  triggerRoutes: ["/"],
  startAt: "",
  endAt: "",
  priority: 0,
  active: true,
};

const AnnouncementManagement = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [saving, setSaving] = useState(false);
  const [confirmDel, askConfirmDel, resetConfirmDel] = useConfirm();

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await announcementService.adminList({ page, size: 20 });
      setItems(res?.content || []);
      setTotalPages(res?.totalPages || 0);
    } catch (e) {
      toast.error("Không tải được danh sách announcement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [page]);

  const openCreate = () => setEditing({ ...EMPTY_FORM });
  const openEdit = (item) => setEditing({
    ...EMPTY_FORM,
    ...item,
    startAt: item.startAt || "",
    endAt: item.endAt || "",
    targetRoles: item.targetRoles || ["ALL"],
    triggerRoutes: item.triggerRoutes || ["/"],
  });
  const closeForm = () => setEditing(null);

  const handleDelete = (id) => {
    askConfirmDel({
      title: "Xoá announcement",
      message: "Bạn có chắc muốn xoá announcement này không?",
      warning: "Hành động này không thể hoàn tác.",
      confirmText: "Xoá",
      variant: "danger",
      onConfirm: async () => {
        resetConfirmDel();
        try {
          await announcementService.adminDelete(id);
          toast.success("Đã xoá");
          fetchList();
        } catch {
          toast.error("Xoá thất bại");
        }
      },
    });
  };

  const handleSave = async () => {
    if (!editing.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        startAt: editing.startAt || null,
        endAt: editing.endAt || null,
        targetRoles: editing.targetRoles?.length ? editing.targetRoles : ["ALL"],
        triggerRoutes: editing.triggerRoutes?.length ? editing.triggerRoutes : ["/"],
      };
      if (editing.id) {
        await announcementService.adminUpdate(editing.id, payload);
        toast.success("Đã cập nhật");
      } else {
        await announcementService.adminCreate(payload);
        toast.success("Đã tạo announcement");
      }
      closeForm();
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role) => {
    setEditing((prev) => {
      const cur = new Set(prev.targetRoles || []);
      if (role === "ALL") return { ...prev, targetRoles: ["ALL"] };
      cur.delete("ALL");
      if (cur.has(role)) cur.delete(role); else cur.add(role);
      return { ...prev, targetRoles: cur.size ? Array.from(cur) : ["ALL"] };
    });
  };

  const updateRoute = (idx, value) => {
    setEditing((prev) => {
      const arr = [...(prev.triggerRoutes || [])];
      arr[idx] = value;
      return { ...prev, triggerRoutes: arr };
    });
  };

  const addRoute = () => setEditing((prev) => ({
    ...prev,
    triggerRoutes: [...(prev.triggerRoutes || []), "/"],
  }));

  const removeRoute = (idx) => setEditing((prev) => ({
    ...prev,
    triggerRoutes: (prev.triggerRoutes || []).filter((_, i) => i !== idx),
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3AB4E6]/10 text-[#3AB4E6] flex items-center justify-center">
              <FaBullhorn />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Thông báo hệ thống</h1>
              <p className="text-xs text-gray-500">Modal/banner hiện khi user vào ứng dụng hoặc các route cụ thể</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white font-bold rounded-lg shadow flex items-center gap-2"
          >
            <FaPlus /> Tạo mới
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-4 text-left">Tiêu đề</th>
                <th className="p-4 text-left">Chế độ</th>
                <th className="p-4 text-left">Roles</th>
                <th className="p-4 text-left">Routes</th>
                <th className="p-4 text-center">Priority</th>
                <th className="p-4 text-center">Active</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có announcement nào</td></tr>
              ) : items.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50/30 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{a.title}</div>
                    {a.requireAcknowledge && (
                      <span className="text-[10px] text-orange-600 font-bold">⚠ Bắt buộc accept</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {DISPLAY_MODES.find((m) => m.value === a.displayMode)?.label || a.displayMode}
                  </td>
                  <td className="p-4 text-xs">
                    {(a.targetRoles || []).map((r) => (
                      <span key={r} className="inline-block mr-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{r}</span>
                    ))}
                  </td>
                  <td className="p-4 text-xs text-gray-500 max-w-xs">
                    <code className="text-[11px]">{(a.triggerRoutes || []).join(", ")}</code>
                  </td>
                  <td className="p-4 text-center font-bold">{a.priority}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${a.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {a.active ? "ON" : "OFF"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(a)} className="p-2 text-gray-500 hover:text-[#3AB4E6]" title="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-500 hover:text-red-500" title="Xoá"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 rounded text-sm ${page === i ? "bg-[#3AB4E6] text-white font-bold" : "bg-white border"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold">{editing.id ? "Sửa announcement" : "Tạo announcement"}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tiêu đề *</label>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="VD: Cập nhật điều khoản dịch vụ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nội dung (HTML hỗ trợ)</label>
                <textarea
                  rows={5}
                  value={editing.bodyHtml || ""}
                  onChange={(e) => setEditing({ ...editing, bodyHtml: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="<p>Chính sách...</p>"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">URL hình ảnh (tuỳ chọn)</label>
                <input
                  value={editing.imageUrl || ""}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Chế độ hiển thị</label>
                  <select
                    value={editing.displayMode}
                    onChange={(e) => setEditing({ ...editing, displayMode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {DISPLAY_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Priority (cao = ưu tiên)</label>
                  <input
                    type="number"
                    value={editing.priority || 0}
                    onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.requireAcknowledge || false}
                  onChange={(e) => setEditing({ ...editing, requireAcknowledge: e.target.checked })}
                />
                Buộc user tick checkbox đồng ý trước khi đóng
              </label>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Target Roles</label>
                <div className="flex gap-2 flex-wrap">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${(editing.targetRoles || []).includes(r) ? "bg-[#3AB4E6] text-white border-[#3AB4E6]" : "bg-white text-gray-600"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Trigger Routes (glob: <code>/jobs/*</code>, đặc biệt <code>LOGIN</code>)</label>
                {(editing.triggerRoutes || []).map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={r}
                      onChange={(e) => updateRoute(i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                      placeholder="/jobs/*"
                    />
                    <button
                      type="button"
                      onClick={() => removeRoute(i)}
                      className="px-3 text-red-500 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addRoute} className="text-xs text-[#3AB4E6] font-bold">+ Thêm route</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={editing.startAt || ""}
                    onChange={(e) => setEditing({ ...editing, startAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={editing.endAt || ""}
                    onChange={(e) => setEditing({ ...editing, endAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active !== false}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Active (đang bật)
              </label>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
              <button onClick={closeForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Huỷ</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-[#3AB4E6] text-white font-bold rounded shadow disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : editing.id ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDel.isOpen}
        onClose={resetConfirmDel}
        onConfirm={confirmDel.onConfirm}
        title={confirmDel.title}
        message={confirmDel.message}
        warning={confirmDel.warning}
        confirmText={confirmDel.confirmText}
        variant={confirmDel.variant}
      />
    </div>
  );
};

export default AnnouncementManagement;
