import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FaPlus, FaEdit, FaEnvelope, FaTimes, FaStar } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import hrPipelineService from '../../services/hrPipelineService';

const TEMPLATE_TYPES = [
  { code: 'INTERVIEW_INVITE', label: 'Mời phỏng vấn' },
  { code: 'OFFER', label: 'Thư mời nhận việc' },
  { code: 'REJECT', label: 'Từ chối' },
  { code: 'THANK_YOU', label: 'Cảm ơn' },
  { code: 'CUSTOM', label: 'Tùy chỉnh' },
];

const PLACEHOLDERS = [
  '{{candidate_name}}', '{{job_title}}', '{{company_name}}', '{{hr_name}}',
];

const HrEmailTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    hrPipelineService.listTemplates()
      .then(setTemplates)
      .catch(() => toast.error('Không tải được templates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Group by type
  const grouped = templates.reduce((acc, t) => {
    (acc[t.templateType] ||= []).push(t);
    return acc;
  }, {});

  return (
    <>
      <SEO title="Email Templates" noIndex />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaEnvelope className="text-blue-500" /> Email Templates
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Templates được dùng trong Pipeline khi chuyển stage ứng viên
            </p>
          </div>
          <button
            onClick={() => setEditing(emptyTemplate())}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium"
          >
            <FaPlus /> Tạo template
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải...</div>
        ) : (
          <div className="space-y-6">
            {TEMPLATE_TYPES.map((type) => {
              const items = grouped[type.code] || [];
              return (
                <div key={type.code}>
                  <h2 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    {type.label}
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">{items.length}</span>
                  </h2>
                  {items.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-400">
                      Chưa có template loại này.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {items.map((t) => (
                        <div key={t.id} className="bg-white p-4 rounded-lg ring-1 ring-slate-200 hover:shadow-md">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900">{t.name}</h3>
                                {t.isDefault && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                                    <FaStar className="text-[10px]" /> Mặc định
                                  </span>
                                )}
                                {!t.companyId && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    System
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 truncate">{t.subject}</p>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.body}</p>
                            </div>
                            <button
                              onClick={() => setEditing(t)}
                              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 flex-shrink-0"
                            >
                              <FaEdit /> Xem
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <EditTemplateDialog
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </>
  );
};

const emptyTemplate = () => ({
  name: '', templateType: 'CUSTOM', subject: '', body: '',
});

const EditTemplateDialog = ({ template, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...template });
  const [saving, setSaving] = useState(false);
  const isSystem = !template.id || !template.companyId === false;
  const readOnly = template.id && !template.companyId;  // system defaults are read-only

  const submit = async () => {
    if (!form.name?.trim() || !form.subject?.trim() || !form.body?.trim()) {
      toast.error('Vui lòng điền đủ tên + subject + body'); return;
    }
    setSaving(true);
    try {
      await hrPipelineService.createTemplate(form);
      toast.success('Đã lưu template');
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi lưu');
    } finally { setSaving(false); }
  };

  const insertPlaceholder = (ph, field) => {
    setForm((p) => ({ ...p, [field]: (p[field] || '') + ph }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-6 top-6 p-2 text-slate-400"><FaTimes /></button>
        <h2 className="text-xl font-bold mb-1">
          {template.id ? (readOnly ? 'Xem template hệ thống' : 'Sửa template') : 'Tạo template mới'}
        </h2>
        {readOnly && (
          <p className="text-xs text-amber-600 mb-4">
            Đây là template hệ thống — không thể chỉnh sửa. Tạo bản copy thay vì sửa.
          </p>
        )}

        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Tên template *">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={readOnly}
                placeholder="VD: Mời phỏng vấn vòng 2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50" />
            </F>
            <F label="Loại *">
              <select value={form.templateType}
                onChange={(e) => setForm({ ...form, templateType: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-50">
                {TEMPLATE_TYPES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </F>
          </div>

          <F label="Subject *">
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              disabled={readOnly}
              placeholder="[{{company_name}}] Mời phỏng vấn vị trí {{job_title}}"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50" />
          </F>

          <F label="Nội dung email *">
            <textarea rows={10} value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              disabled={readOnly}
              placeholder="Chào {{candidate_name}}..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm disabled:bg-slate-50" />
          </F>

          {!readOnly && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-2">Click để chèn placeholder:</p>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDERS.map((ph) => (
                  <button key={ph} type="button"
                    onClick={() => insertPlaceholder(ph, 'body')}
                    className="px-2 py-1 bg-white rounded text-xs font-mono text-blue-700 hover:bg-blue-100"
                  >{ph}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-lg font-medium">Đóng</button>
          {!readOnly && (
            <button onClick={submit} disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60">
              {saving ? 'Đang lưu...' : (form.id ? 'Cập nhật' : 'Tạo')}
            </button>
          )}
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

export default HrEmailTemplatesPage;
