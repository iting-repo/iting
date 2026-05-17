import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaGlobe, FaFileAlt, FaSearch, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';

const EMPTY_FORM = {
  slug: '',
  type: 'PAGE',
  title: '',
  content: '',
  metaDescription: '',
  metaKeywords: '',
  published: false,
};

const StaticContentManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(null); // null = list view, object = form
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/static-content', { params: { size: 100 } });
      setPages(res.data?.content || []);
    } catch {
      toast.error('Không thể tải danh sách trang.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleSave = async () => {
    if (!editing.slug || !editing.title) {
      toast.error('Slug và tiêu đề là bắt buộc.');
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await axiosInstance.put(`/admin/static-content/${editing.id}`, editing);
        toast.success('Đã cập nhật trang.');
      } else {
        await axiosInstance.post('/admin/static-content', editing);
        toast.success('Đã tạo trang mới.');
      }
      setEditing(null);
      fetchPages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa trang này?')) return;
    try {
      await axiosInstance.delete(`/admin/static-content/${id}`);
      toast.success('Đã xóa trang.');
      fetchPages();
    } catch {
      toast.error('Không thể xóa.');
    }
  };

  const togglePublish = async (item) => {
    try {
      const action = item.published ? 'unpublish' : 'publish';
      await axiosInstance.patch(`/admin/static-content/${item.id}/${action}`);
      toast.success(item.published ? 'Đã gỡ xuất bản.' : 'Đã xuất bản.');
      fetchPages();
    } catch {
      toast.error('Thao tác thất bại.');
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── FORM VIEW ────────────────────────────────────
  if (editing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {editing.id ? 'Chỉnh sửa trang' : 'Tạo trang mới'}
          </h1>
          <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800">
            <FaTimes /> Hủy
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Row 1: slug + type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="terms, privacy, about..."
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">URL: /{editing.slug || '...'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Loại</label>
              <select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="PAGE">Trang (PAGE)</option>
                <option value="FAQ">FAQ</option>
                <option value="BLOG">Blog</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Điều khoản sử dụng"
              className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung (HTML)</label>
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              rows={16}
              placeholder="<h2>1. Chấp nhận điều khoản</h2><p>Khi sử dụng ITing...</p>"
              className="w-full border rounded-lg px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-y"
            />
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
              <input
                type="text"
                value={editing.metaDescription || ''}
                onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })}
                placeholder="Mô tả SEO cho trang..."
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                value={editing.metaKeywords || ''}
                onChange={(e) => setEditing({ ...editing, metaKeywords: e.target.value })}
                placeholder="tuyển dụng, IT, việc làm"
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Preview */}
          {editing.content && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Xem trước</label>
              <div
                className="border rounded-lg p-6 bg-gray-50 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: editing.content }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 font-semibold"
            >
              <FaSave /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ─────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Trang tĩnh</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý nội dung Terms, Privacy, About và các trang tĩnh khác</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_FORM })}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-semibold shadow-sm"
        >
          <FaPlus /> Tạo trang mới
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tiêu đề hoặc slug..."
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaFileAlt className="mx-auto text-4xl mb-3" />
            <p className="font-medium">Chưa có trang tĩnh nào</p>
            <p className="text-sm">Nhấn "Tạo trang mới" để bắt đầu.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="text-left px-5 py-3">Tiêu đề</th>
                <th className="text-left px-5 py-3">Slug</th>
                <th className="text-center px-5 py-3">Loại</th>
                <th className="text-center px-5 py-3">Trạng thái</th>
                <th className="text-center px-5 py-3">Lượt xem</th>
                <th className="text-right px-5 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{item.title}</td>
                  <td className="px-5 py-3.5">
                    <code className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">/{item.slug}</code>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.type === 'PAGE' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'FAQ' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {item.published ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <FaGlobe /> Đã xuất bản
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Nháp</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-500">{item.viewCount || 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${item.published ? 'text-amber-500' : 'text-green-500'}`}
                        title={item.published ? 'Gỡ xuất bản' : 'Xuất bản'}
                      >
                        {item.published ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => setEditing({ ...item })}
                        className="p-2 rounded-lg hover:bg-gray-100 text-blue-500"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-red-500"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaticContentManagement;
