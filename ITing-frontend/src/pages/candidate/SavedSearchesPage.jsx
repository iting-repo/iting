import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FaBell, FaBellSlash, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import { ConfirmModal } from '../../components/common';
import savedSearchService from '../../services/savedSearchService';
import useConfirm from '../../hooks/useConfirm';

/**
 * Saved searches manager — list + create + edit + delete + toggle email alerts.
 *
 * Each saved-search has: name, keyword, location, jobType, experienceLevel,
 * min/maxSalary, emailAlertsEnabled, alertFrequency (DAILY | WEEKLY | NEVER).
 */
const SavedSearchesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirm, askConfirm, resetConfirm] = useConfirm();

  const load = () => {
    setLoading(true);
    savedSearchService.list()
      .then(setItems)
      .catch(() => toast.error('Không tải được saved searches'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    askConfirm({
      title: "Xóa tìm kiếm đã lưu",
      message: "Bạn có chắc chắn muốn xóa tìm kiếm này?",
      confirmText: "Xóa",
      onConfirm: async () => {
        resetConfirm();
        try {
          await savedSearchService.remove(id);
          toast.success('Đã xóa');
          load();
        } catch { toast.error('Lỗi xóa'); }
      }
    });
  };

  const handleToggleAlert = async (item) => {
    try {
      await savedSearchService.update(item.id, { emailAlertsEnabled: !item.emailAlertsEnabled });
      toast.success(item.emailAlertsEnabled ? 'Đã tắt alert' : 'Đã bật alert');
      load();
    } catch { toast.error('Lỗi cập nhật'); }
  };

  return (
    <>
      <SEO title="Tìm kiếm đã lưu" noIndex />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaSearch className="text-blue-500" /> Tìm kiếm đã lưu
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Nhận email thông báo khi có job mới phù hợp (tối đa 20 saved searches)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(emptyForm())}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium"
          >
            <FaPlus /> Tạo mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <FaSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-1">Bạn chưa lưu tìm kiếm nào</p>
            <p className="text-sm text-slate-400">
              Lưu tìm kiếm để nhận email khi có job mới phù hợp
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="bg-white rounded-xl p-5 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1">{s.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {s.keyword && <Tag>📝 {s.keyword}</Tag>}
                      {s.location && <Tag>📍 {s.location}</Tag>}
                      {s.jobType && <Tag>💼 {s.jobType}</Tag>}
                      {s.experienceLevel && <Tag>⭐ {s.experienceLevel}</Tag>}
                      {(s.minSalary || s.maxSalary) && (
                        <Tag>💰 {fmtSal(s.minSalary)} - {fmtSal(s.maxSalary)}</Tag>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Frequency: <strong>{s.alertFrequency}</strong>
                      {s.lastAlertSentAt && (
                        <> · Lần gửi cuối: {new Date(s.lastAlertSentAt).toLocaleDateString('vi-VN')}</>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleAlert(s)}
                      className={`p-2 rounded-lg ${s.emailAlertsEnabled
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      title={s.emailAlertsEnabled ? 'Đang nhận email' : 'Đã tắt'}
                    >
                      {s.emailAlertsEnabled ? <FaBell /> : <FaBellSlash />}
                    </button>
                    <button
                      onClick={() => setEditing(s)}
                      className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                    >Sửa</button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    ><FaTrash /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditDialog
          form={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmModal isOpen={confirm.isOpen} onClose={resetConfirm} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} warning={confirm.warning} confirmText={confirm.confirmText} variant={confirm.variant} />
    </>
  );
};

const Tag = ({ children }) => (
  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">{children}</span>
);

const emptyForm = () => ({
  name: '', keyword: '', location: '', jobType: '', experienceLevel: '',
  minSalary: '', maxSalary: '',
  emailAlertsEnabled: true, alertFrequency: 'DAILY',
});

const fmtSal = (v) => v ? `${Math.round(v / 1_000_000)}M` : '?';

const EditDialog = ({ form: initial, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const isEdit = !!form.id;

  const set = (field) => (e) => {
    const v = e?.target ? e.target.value : e;
    setForm((p) => ({ ...p, [field]: v }));
  };

  const submit = async () => {
    if (!form.name?.trim()) { toast.error('Tên không được để trống'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        minSalary: form.minSalary ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
      };
      if (isEdit) await savedSearchService.update(form.id, payload);
      else await savedSearchService.create(payload);
      toast.success(isEdit ? 'Đã cập nhật' : 'Đã tạo saved search');
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi lưu');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-slate-400"><FaTimes /></button>
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Sửa saved search' : 'Tạo saved search mới'}</h2>

        <div className="space-y-3">
          <F label="Tên *">
            <input value={form.name} onChange={set('name')}
              placeholder="VD: Backend Java HCM"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </F>
          <F label="Từ khóa">
            <input value={form.keyword || ''} onChange={set('keyword')}
              placeholder="VD: Java, Spring Boot"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </F>
          <F label="Địa điểm">
            <input value={form.location || ''} onChange={set('location')}
              placeholder="VD: TP HCM"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Loại hình">
              <select value={form.jobType || ''} onChange={set('jobType')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value="">-- Tất cả --</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </F>
            <F label="Kinh nghiệm">
              <select value={form.experienceLevel || ''} onChange={set('experienceLevel')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value="">-- Tất cả --</option>
                <option value="INTERN">Intern</option>
                <option value="FRESHER">Fresher</option>
                <option value="JUNIOR">Junior</option>
                <option value="MIDDLE">Middle</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Lương từ (VND)">
              <input type="number" value={form.minSalary || ''} onChange={set('minSalary')}
                placeholder="10000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </F>
            <F label="Lương đến (VND)">
              <input type="number" value={form.maxSalary || ''} onChange={set('maxSalary')}
                placeholder="30000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </F>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={form.emailAlertsEnabled}
                onChange={(e) => set('emailAlertsEnabled')(e.target.checked)} />
              <span className="text-sm font-medium">Nhận email khi có job mới</span>
            </label>
            {form.emailAlertsEnabled && (
              <select value={form.alertFrequency} onChange={set('alertFrequency')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="DAILY">Hàng ngày</option>
                <option value="WEEKLY">Hàng tuần</option>
                <option value="NEVER">Không gửi</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Hủy</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

const F = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {children}
  </div>
);

export default SavedSearchesPage;
