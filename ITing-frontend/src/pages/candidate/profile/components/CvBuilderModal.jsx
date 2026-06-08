import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaDownload, FaCheck, FaFileAlt, FaEye, FaEyeSlash, FaPlus, FaTrash, FaGripVertical, FaUndo, FaChevronDown } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import html2pdfBundle from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import axiosInstance from '../../../../utils/axiosInstance';

// Interop CJS/ESM (webpack): lấy đúng hàm html2pdf dù được wrap dạng nào.
const html2pdf = typeof html2pdfBundle === 'function' ? html2pdfBundle : (html2pdfBundle?.default || html2pdfBundle);
import { CV_TEMPLATES, CV_FONTS, ACCENT_PRESETS, getFont, SECTION_DEFS, DEFAULT_ORDER, normalizeCvData, buildCvHtml } from '../../../../utils/cvTemplates';

const SECTION_LABEL = Object.fromEntries(SECTION_DEFS.map((s) => [s.id, s.label]));
const LIST_SECTIONS = {
  experience: { key: 'experiences', fields: [['title', 'Chức danh / Vị trí'], ['sub', 'Công ty'], ['date', 'Thời gian'], ['desc', 'Mô tả', 'rich']] },
  education: { key: 'educations', fields: [['title', 'Trường / Cơ sở'], ['sub', 'Ngành · Bằng cấp'], ['date', 'Thời gian'], ['desc', 'Mô tả', 'rich']] },
  certificates: { key: 'certificates', fields: [['title', 'Tên chứng chỉ'], ['sub', 'Tổ chức cấp'], ['date', 'Thời gian']] },
  portfolio: { key: 'portfolios', fields: [['title', 'Tên dự án'], ['sub', 'Link (URL)'], ['desc', 'Mô tả', 'rich']] },
};
const inputCls = 'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-[#1967D2] focus:ring-1 focus:ring-[#1967D2]/20';
const RICH_MODULES = { toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']] };

// Tải ảnh về dạng dataURL để nhúng vào CV khi xuất PDF. Trả null nếu không lấy được
// (ảnh không cho CORS, vd i.pravatar.cc) → khi đó dùng avatar chữ viết tắt để export khỏi vỡ.
const toDataUrl = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const RichText = ({ value, onChange, placeholder }) => (
  <div className="rounded-lg border border-slate-200 overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-toolbar]:py-1 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[70px] [&_.ql-editor]:text-sm [&_.ql-editor]:py-2">
    <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={RICH_MODULES} placeholder={placeholder} />
  </div>
);

const CvBuilderModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [baseCv, setBaseCv] = useState(null);
  const [cv, setCv] = useState(null);
  const [templateId, setTemplateId] = useState('modern');
  const [accent, setAccent] = useState('');     // '' = dùng màu mặc định của mẫu
  const [fontId, setFontId] = useState('sans');
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [hidden, setHidden] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const dragFrom = useRef(null);
  const dragOver = useRef(null);
  const previewRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const [personal, professional, skills, experiences, educations, certificates, portfolios, socialLinks] =
          await Promise.all([
            axiosInstance.get('/user/profile'),
            axiosInstance.get('/user/professional-profile'),
            axiosInstance.get('/user/professional-profile/skills'),
            axiosInstance.get('/user/professional-profile/experience'),
            axiosInstance.get('/user/professional-profile/education'),
            axiosInstance.get('/user/professional-profile/certificates'),
            axiosInstance.get('/user/professional-profile/portfolios'),
            axiosInstance.get('/user/professional-profile/social-links'),
          ]);
        if (cancelled) return;
        const normalized = normalizeCvData({
          personal: personal || {}, professional: professional || {},
          skills: skills || [], experiences: experiences || [], educations: educations || [],
          certificates: certificates || [], portfolios: portfolios || [], socialLinks: socialLinks || [],
        });
        setBaseCv(normalized);
        setCv(JSON.parse(JSON.stringify(normalized)));
        setOrder(DEFAULT_ORDER);
        setHidden([]);
      } catch (e) {
        if (!cancelled) setError('Không tải được dữ liệu hồ sơ để tạo CV.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Scale iframe A4 (794px) vừa bề ngang khung preview → khỏi cuộn ngang.
  useEffect(() => {
    if (!isOpen) return;
    const el = previewRef.current;
    if (!el) return;
    const compute = () => setScale(Math.min(1, (el.clientWidth - 32) / 794));
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, loading]);

  const font = useMemo(() => getFont(fontId), [fontId]);
  const previewHtml = useMemo(
    () => (cv ? buildCvHtml(cv, templateId, { print: false, order, hidden, accent: accent || undefined, font }) : ''),
    [cv, templateId, order, hidden, accent, font]
  );

  // ── Mutations cục bộ (KHÔNG lưu DB) ──
  const setHeader = (f, v) => setCv((p) => ({ ...p, [f]: v }));
  const updateItem = (key, idx, f, v) => setCv((p) => ({ ...p, [key]: p[key].map((it, i) => (i === idx ? { ...it, [f]: v } : it)) }));
  const removeItem = (key, idx) => setCv((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  const addItem = (key) => setCv((p) => ({ ...p, [key]: [...p[key], { title: '', sub: '', date: '', desc: '' }] }));
  const setSkill = (idx, v) => setCv((p) => ({ ...p, skills: p.skills.map((s, i) => (i === idx ? v : s)) }));
  const removeSkill = (idx) => setCv((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }));
  const addSkill = () => setCv((p) => ({ ...p, skills: [...p.skills, 'Kỹ năng mới'] }));
  const updateSocial = (idx, f, v) => setCv((p) => ({ ...p, social: p.social.map((s, i) => (i === idx ? { ...s, [f]: v } : s)) }));
  const removeSocial = (idx) => setCv((p) => ({ ...p, social: p.social.filter((_, i) => i !== idx) }));
  const addSocial = () => setCv((p) => ({ ...p, social: [...p.social, { label: '', url: '' }] }));
  const updateCustom = (id, f, v) => setCv((p) => ({ ...p, customSections: p.customSections.map((c) => (c.id === id ? { ...c, [f]: v } : c)) }));
  const removeCustom = (id) => {
    setCv((p) => ({ ...p, customSections: p.customSections.filter((c) => c.id !== id) }));
    setOrder((o) => o.filter((x) => x !== id));
    setHidden((h) => h.filter((x) => x !== id));
  };
  const addCustom = () => {
    const id = `custom-${Date.now()}`;
    setCv((p) => ({ ...p, customSections: [...(p.customSections || []), { id, label: 'Phần mới', content: '' }] }));
    setOrder((o) => [...o, id]);
    setExpanded(id);
  };
  const toggleHidden = (id) => setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  const handleReset = () => {
    if (!baseCv) return;
    setCv(JSON.parse(JSON.stringify(baseCv)));
    setOrder(DEFAULT_ORDER); setHidden([]); setExpanded(null);
    toast.success('Đã đặt lại nội dung về hồ sơ gốc.');
  };

  const onDrop = () => {
    const from = dragFrom.current, to = dragOver.current;
    dragFrom.current = null; dragOver.current = null;
    if (from == null || to == null || from === to) return;
    setOrder((prev) => { const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
  };

  const handleDownload = async () => {
    if (!cv || downloading) return;
    setDownloading(true);
    let frame;
    try {
      // Nhúng avatar dạng dataURL để ảnh không bị trắng khi vẽ canvas (CORS).
      // Nếu ảnh không cho CORS → bỏ avatar (CV tự dùng chữ viết tắt), tránh export lỗi.
      let exportCv = cv;
      if (cv.avatarUrl) {
        const dataUrl = await toDataUrl(cv.avatarUrl);
        exportCv = { ...cv, avatarUrl: dataUrl || '' };
      }
      const html = buildCvHtml(exportCv, templateId, { order, hidden, accent: accent || undefined, font });

      // iframe ẩn để cô lập CSS của CV khỏi app.
      frame = document.createElement('iframe');
      frame.style.cssText = 'position:fixed;left:-99999px;top:0;width:794px;height:1123px;border:0;visibility:hidden';
      document.body.appendChild(frame);
      await new Promise((res) => { frame.onload = res; frame.srcdoc = html; });

      const doc = frame.contentDocument;
      try { await doc.fonts.ready; } catch { /* ignore */ }
      await Promise.all([...doc.images].map((im) => (im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; }))));

      const el = doc.querySelector('.page');
      const safeName = (cv.name || 'CV').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '_') || 'CV';
      await html2pdf().set({
        margin: 0,
        filename: `CV-${safeName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 794 },
        jsPDF: { unit: 'px', format: [794, Math.max(1123, el.scrollHeight)], orientation: 'portrait' },
      }).from(el).save();
      toast.success('Đã tải CV về máy.');
    } catch (e) {
      console.error('Export PDF failed', e);
      toast.error('Không tạo được PDF. Vui lòng thử lại.');
    } finally {
      if (frame) document.body.removeChild(frame);
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  const renderSectionEditor = (id) => {
    const custom = cv.customSections?.find((c) => c.id === id);
    if (custom) {
      return (
        <div className="space-y-2">
          <input value={custom.label} onChange={(e) => updateCustom(id, 'label', e.target.value)} placeholder="Tên phần" className={inputCls} />
          <RichText value={custom.content} onChange={(v) => updateCustom(id, 'content', v)} placeholder="Nội dung phần này..." />
          <button onClick={() => removeCustom(id)} className="text-[11px] font-semibold text-red-500 hover:underline flex items-center gap-1"><FaTrash size={9} /> Xóa phần này</button>
        </div>
      );
    }
    if (id === 'summary') {
      return <RichText value={cv.summary} onChange={(v) => setHeader('summary', v)} placeholder="Giới thiệu bản thân, mục tiêu nghề nghiệp..." />;
    }
    if (id === 'skills') {
      return (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-slate-100 rounded-full pl-2 pr-1 py-0.5">
                <input value={s} onChange={(e) => setSkill(i, e.target.value)} className="bg-transparent text-xs w-[90px] outline-none" />
                <button onClick={() => removeSkill(i)} className="text-slate-400 hover:text-red-500"><FaTimes size={9} /></button>
              </span>
            ))}
          </div>
          <button onClick={addSkill} className="text-[11px] font-semibold text-[#1967D2] hover:underline flex items-center gap-1"><FaPlus size={9} /> Thêm kỹ năng</button>
        </div>
      );
    }
    if (id === 'social') {
      return (
        <div className="space-y-2">
          {cv.social.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input value={s.label} onChange={(e) => updateSocial(i, 'label', e.target.value)} placeholder="Tên" className={`${inputCls} w-1/3`} />
              <input value={s.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} placeholder="https://..." className={inputCls} />
              <button onClick={() => removeSocial(i)} className="text-slate-400 hover:text-red-500 p-1"><FaTrash size={11} /></button>
            </div>
          ))}
          <button onClick={addSocial} className="text-[11px] font-semibold text-[#1967D2] hover:underline flex items-center gap-1"><FaPlus size={9} /> Thêm liên kết</button>
        </div>
      );
    }
    const cfg = LIST_SECTIONS[id];
    if (!cfg) return null;
    return (
      <div className="space-y-2.5">
        {cv[cfg.key].map((it, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 space-y-1.5">
            {cfg.fields.map(([f, ph, kind]) =>
              kind === 'rich' ? (
                <RichText key={f} value={it[f]} onChange={(v) => updateItem(cfg.key, i, f, v)} placeholder={ph} />
              ) : (
                <input key={f} value={it[f]} onChange={(e) => updateItem(cfg.key, i, f, e.target.value)} placeholder={ph} className={inputCls} />
              )
            )}
            <button onClick={() => removeItem(cfg.key, i)} className="text-[11px] font-semibold text-red-500 hover:underline flex items-center gap-1"><FaTrash size={9} /> Xóa mục</button>
          </div>
        ))}
        <button onClick={() => addItem(cfg.key)} className="text-[11px] font-semibold text-[#1967D2] hover:underline flex items-center gap-1"><FaPlus size={9} /> Thêm mục</button>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[94vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-[#1967D2]"><FaFileAlt size={18} /></div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">Tạo CV từ hồ sơ</h3>
              <p className="text-xs text-slate-500">Chọn mẫu/màu/font, kéo-thả & sửa nội dung (không đổi hồ sơ gốc).</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"><FaUndo size={11} /> Đặt lại</button>
            <button onClick={handleDownload} disabled={!cv || loading || downloading} className="px-4 py-2 rounded-xl bg-[#1967D2] text-white text-xs font-bold hover:bg-[#1452A8] flex items-center gap-1.5 disabled:opacity-50">
              {downloading ? <><Loader2 size={12} className="animate-spin" /> Đang tạo...</> : <><FaDownload size={12} /> Tải PDF</>}
            </button>
            <button onClick={onClose} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><FaTimes size={16} /></button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="md:w-[400px] shrink-0 border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-10 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải hồ sơ...</div>
            ) : error ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
            ) : cv && (
              <>
                {/* Mẫu */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Mẫu CV</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CV_TEMPLATES.map((t) => {
                      const active = t.id === templateId;
                      return (
                        <button key={t.id} onClick={() => setTemplateId(t.id)} className={`p-2 rounded-xl border-2 text-left transition-all ${active ? 'border-[#1967D2] bg-blue-50/60' : 'border-slate-100 hover:border-slate-300'}`}>
                          <span className="block w-full h-6 rounded mb-1" style={{ background: accent || t.accent }} />
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">{t.name}{active && <FaCheck size={9} className="text-[#1967D2]" />}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Màu & Font */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Màu nhấn</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ACCENT_PRESETS.map((c) => (
                        <button key={c} onClick={() => setAccent(c)} title={c} className="w-6 h-6 rounded-full border-2" style={{ background: c, borderColor: accent === c ? '#1967D2' : 'transparent' }} />
                      ))}
                      <input type="color" value={accent || '#0e7490'} onChange={(e) => setAccent(e.target.value)} title="Màu tùy chỉnh" className="w-6 h-6 rounded cursor-pointer border border-slate-200 p-0 bg-white" />
                      {accent && <button onClick={() => setAccent('')} className="text-[11px] text-slate-400 hover:underline">Mặc định</button>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Font chữ</p>
                    <select value={fontId} onChange={(e) => setFontId(e.target.value)} className={inputCls}>
                      {CV_FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Thông tin chung */}
                <div className="rounded-xl border border-slate-100 p-3 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Thông tin chung</p>
                  <input value={cv.name} onChange={(e) => setHeader('name', e.target.value)} placeholder="Họ và tên" className={inputCls} />
                  <input value={cv.headline} onChange={(e) => setHeader('headline', e.target.value)} placeholder="Chức danh" className={inputCls} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={cv.phone} onChange={(e) => setHeader('phone', e.target.value)} placeholder="Điện thoại" className={inputCls} />
                    <input value={cv.email} onChange={(e) => setHeader('email', e.target.value)} placeholder="Email" className={inputCls} />
                  </div>
                  <input value={cv.location} onChange={(e) => setHeader('location', e.target.value)} placeholder="Địa điểm" className={inputCls} />
                  {!cv.avatarUrl && <p className="text-[11px] text-amber-600">Chưa có ảnh đại diện — tải lên ở mục CV/Resume để hiện avatar.</p>}
                </div>

                {/* Bố cục & nội dung */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Bố cục & nội dung <span className="font-normal normal-case text-slate-400">(kéo ⠿ để sắp xếp)</span></p>
                  <div className="space-y-1.5">
                    {order.map((id, idx) => {
                      const custom = cv.customSections?.find((c) => c.id === id);
                      const label = custom ? (custom.label || 'Phần mới') : SECTION_LABEL[id];
                      const isHidden = hidden.includes(id);
                      const isOpen = expanded === id;
                      return (
                        <div key={id} className="rounded-xl border border-slate-100"
                          onDragEnter={() => { dragOver.current = idx; }}
                          onDragOver={(e) => e.preventDefault()}>
                          <div className="flex items-center gap-2 px-2.5 py-2" draggable onDragStart={() => { dragFrom.current = idx; }} onDragEnd={onDrop}>
                            <FaGripVertical className="text-slate-300 cursor-grab active:cursor-grabbing shrink-0" size={12} />
                            <button onClick={() => setExpanded(isOpen ? null : id)} className={`flex-1 text-left text-[13px] font-semibold truncate ${isHidden ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                              {label}{custom && <span className="ml-1 text-[9px] font-bold text-[#1967D2] uppercase">Tùy biến</span>}
                            </button>
                            <button onClick={() => toggleHidden(id)} title={isHidden ? 'Hiện' : 'Ẩn'} className="p-1 text-slate-400 hover:text-slate-700">{isHidden ? <FaEyeSlash size={12} /> : <FaEye size={12} />}</button>
                            <button onClick={() => setExpanded(isOpen ? null : id)} className="p-1 text-slate-400 hover:text-slate-700"><FaChevronDown size={11} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>
                          </div>
                          {isOpen && <div className="px-2.5 pb-2.5 pt-0.5 border-t border-slate-50">{renderSectionEditor(id)}</div>}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={addCustom} className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-500 hover:border-[#1967D2] hover:text-[#1967D2] flex items-center justify-center gap-1.5"><FaPlus size={10} /> Thêm phần mới</button>
                </div>
              </>
            )}
          </div>

          <div ref={previewRef} className="flex-1 bg-[#525659] overflow-auto p-4 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-white/80 py-20"><Loader2 className="w-5 h-5 animate-spin" /> Đang tải...</div>
            ) : !error && cv ? (
              <div className="mx-auto" style={{ width: 794 * scale, height: 1123 * scale }}>
                <iframe
                  title="Xem trước CV"
                  srcDoc={previewHtml}
                  className="bg-white shadow-2xl rounded"
                  style={{ width: 794, height: 1123, border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CvBuilderModal;
