/**
 * Sinh HTML CV (khổ A4) từ dữ liệu hồ sơ.
 * Hỗ trợ: chọn mẫu, đổi màu nhấn, đổi font, rich text (đậm/nghiêng/gạch chân/list),
 * sắp xếp + ẩn/hiện + thêm phần tùy biến. Dùng cho preview (iframe) và in PDF.
 */

export const CV_TEMPLATES = [
  { id: 'modern', name: 'Hiện đại', desc: 'Header màu + avatar', accent: '#0e7490' },
  { id: 'minimal', name: 'Tối giản', desc: 'Căn giữa, sạch sẽ', accent: '#111827' },
  { id: 'professional', name: 'Chuyên nghiệp', desc: 'Dải tiêu đề màu', accent: '#1d4ed8' },
];

const TEMPLATE_DEFAULT_ACCENT = { modern: '#0e7490', minimal: '#111827', professional: '#1d4ed8' };

export const ACCENT_PRESETS = ['#0e7490', '#1d4ed8', '#7c3aed', '#db2777', '#ea580c', '#059669', '#111827'];

export const CV_FONTS = [
  { id: 'sans', name: 'Sans (mặc định)', stack: `'Segoe UI',Roboto,Arial,sans-serif` },
  { id: 'serif', name: 'Serif (Georgia)', stack: `Georgia,'Times New Roman',serif` },
  { id: 'roboto', name: 'Roboto', stack: `Roboto,sans-serif`, url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { id: 'montserrat', name: 'Montserrat', stack: `Montserrat,sans-serif`, url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap' },
  { id: 'lora', name: 'Lora (serif)', stack: `Lora,serif`, url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap' },
  { id: 'mono', name: 'Mono', stack: `'Courier New',monospace` },
];
export const getFont = (id) => CV_FONTS.find((f) => f.id === id) || CV_FONTS[0];

// Các phần cố định (vẫn có thể kéo-thả / ẩn). Người dùng có thể thêm phần tùy biến.
export const SECTION_DEFS = [
  { id: 'summary', label: 'Giới thiệu' },
  { id: 'experience', label: 'Kinh nghiệm làm việc' },
  { id: 'education', label: 'Học vấn' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'certificates', label: 'Chứng chỉ' },
  { id: 'portfolio', label: 'Dự án & Portfolio' },
  { id: 'social', label: 'Liên kết' },
];
export const DEFAULT_ORDER = SECTION_DEFS.map((s) => s.id);
const FIXED_IDS = new Set(DEFAULT_ORDER);

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nl2br = (s) => esc(s).replace(/\n/g, '<br/>');

// Render rich text: nếu đã là HTML (từ trình soạn thảo) → giữ nguyên; nếu plain → nl2br.
const hasTags = (s) => /<[a-z][\s\S]*>/i.test(s || '');
const richHtml = (s) => {
  const plain = String(s ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (!plain) return '';
  return hasTags(s) ? s : nl2br(s);
};

const fmtMonth = (d) => {
  if (!d) return '';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '';
  return `${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`;
};
const dateRange = (start, end) => {
  const s = fmtMonth(start);
  const e = end ? fmtMonth(end) : 'Hiện tại';
  if (!s && !end) return '';
  return `${s}${s ? ' - ' : ''}${e}`;
};
const initials = (name) =>
  (name || 'CV').trim().split(/\s+/).slice(-2).map((w) => w[0] || '').join('').toUpperCase();

export const normalizeCvData = (raw = {}) => {
  const p = raw.personal || {};
  const pro = raw.professional || {};
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  return {
    avatarUrl: p.avatarUrl || '',
    name: p.fullName || 'Họ và tên',
    headline: pro.headline || '',
    email: p.email || '',
    phone: p.phoneNum || '',
    location: pro.location || '',
    summary: pro.shortBio || '',
    skills: uniq((raw.skills || []).map((s) => s.name)),
    social: (raw.socialLinks || []).filter((l) => l.url).map((l) => ({ label: l.platform || l.url, url: l.url })),
    experiences: (raw.experiences || []).map((e) => ({
      title: e.position || '', sub: e.companyName || '', date: dateRange(e.startDate, e.endDate), desc: e.description || '',
    })),
    educations: (raw.educations || []).map((e) => ({
      title: e.schoolName || '', sub: [e.major || e.fieldOfStudy, e.degree].filter(Boolean).join(' · '), date: dateRange(e.startDate, e.endDate), desc: e.description || '',
    })),
    certificates: (raw.certificates || []).map((c) => ({
      title: c.title || c.name || '', sub: c.issuingOrganization || c.organization || '', date: c.issueDate ? fmtMonth(c.issueDate) : '',
    })),
    portfolios: (raw.portfolios || []).map((pf) => ({ title: pf.title || '', sub: pf.url || '', desc: pf.description || '' })),
    customSections: [], // [{ id, label, content(html) }]
  };
};

const itemHtml = (it) => {
  const desc = richHtml(it.desc);
  return `
  <div class="item">
    <div class="item-head">
      <div>
        <div class="item-title">${esc(it.title)}</div>
        ${it.sub ? `<div class="item-sub">${esc(it.sub)}</div>` : ''}
      </div>
      ${it.date ? `<div class="item-date">${esc(it.date)}</div>` : ''}
    </div>
    ${desc ? `<div class="item-desc rich">${desc}</div>` : ''}
  </div>`;
};
const listHtml = (items) => ((items && items.length) ? items.map(itemHtml).join('') : '');
const skillsHtml = (skills) =>
  (skills && skills.length) ? `<div class="chips">${skills.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : '';
const socialHtml = (social) =>
  (social && social.length)
    ? `<div class="links">${social.map((l) => `<a class="link" href="${esc(l.url)}">${esc(l.label || l.url)}</a>`).join('')}</div>` : '';

const sectionInner = {
  summary: (d) => { const h = richHtml(d.summary); return h ? `<div class="rich">${h}</div>` : ''; },
  experience: (d) => listHtml(d.experiences),
  education: (d) => listHtml(d.educations),
  skills: (d) => skillsHtml(d.skills),
  certificates: (d) => listHtml(d.certificates),
  portfolio: (d) => listHtml(d.portfolios),
  social: (d) => socialHtml(d.social),
};
const sectionLabel = Object.fromEntries(SECTION_DEFS.map((s) => [s.id, s.label]));

const contactLine = (d) => [d.phone, d.email, d.location].filter(Boolean).map(esc).join(' &nbsp;•&nbsp; ');
const avatarHtml = (d) =>
  d.avatarUrl ? `<img class="avatar" src="${esc(d.avatarUrl)}" alt=""/>` : `<div class="avatar avatar-fb">${esc(initials(d.name))}</div>`;

const headerHtml = {
  modern: (d) => `<div class="head">${avatarHtml(d)}<div class="head-text"><div class="name">${esc(d.name)}</div>${d.headline ? `<div class="headline">${esc(d.headline)}</div>` : ''}<div class="contact">${contactLine(d)}</div></div></div>`,
  minimal: (d) => `<div class="head"><div class="name">${esc(d.name)}</div>${d.headline ? `<div class="headline">${esc(d.headline)}</div>` : ''}<div class="contact">${contactLine(d)}</div></div>`,
  professional: (d) => `<div class="head">${avatarHtml(d)}<div class="head-text"><div class="name">${esc(d.name)}</div>${d.headline ? `<div class="headline">${esc(d.headline)}</div>` : ''}<div class="contact">${contactLine(d)}</div></div></div>`,
};

const baseCss = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#e5e7eb;font-family:var(--font);color:#1f2937}
  .page{width:794px;min-height:1123px;margin:24px auto;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.15)}
  a{color:inherit;text-decoration:none}
  .body{padding:24px 40px 40px}
  .avatar{width:78px;height:78px;border-radius:50%;object-fit:cover;flex:0 0 auto}
  .avatar-fb{display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800}
  .name{font-size:24px;font-weight:800;line-height:1.15}
  .headline{font-size:13.5px;margin-top:3px}
  .contact{font-size:12px;margin-top:7px}
  .section{margin-bottom:16px}
  .section-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.4px;padding-bottom:4px;margin-bottom:9px;color:var(--accent);border-bottom:2px solid var(--accent)}
  .item{margin-bottom:11px}
  .item-head{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
  .item-title{font-weight:700;font-size:13.5px}
  .item-sub{font-size:12px;color:#4b5563}
  .item-date{font-size:11px;color:#6b7280;white-space:nowrap}
  .item-desc{font-size:12px;color:#374151;line-height:1.5;margin-top:4px}
  .chips{display:flex;flex-wrap:wrap;gap:6px}
  .chip{font-size:11px;padding:3px 9px;border-radius:999px;background:#f1f5f9;color:var(--accent)}
  .links{display:flex;flex-wrap:wrap;gap:14px}
  .link{font-size:12px;word-break:break-all;color:var(--accent)}
  .rich{font-size:12.5px;color:#374151;line-height:1.55}
  .rich p{margin:0 0 5px}.rich p:last-child{margin-bottom:0}
  .rich ul,.rich ol{margin:0 0 5px 18px}.rich li{margin-bottom:2px}
  .rich strong,.rich b{font-weight:700}.rich em,.rich i{font-style:italic}.rich u{text-decoration:underline}
  .summary.rich,.item-desc.rich{font-size:12px}
  @page{size:A4;margin:12mm}
  @media print{html,body{background:#fff}.page{width:auto;min-height:0;margin:0;box-shadow:none}}
`;

const themeCss = {
  modern: `
    .head{background:var(--accent);color:#fff;padding:28px 40px;display:flex;align-items:center;gap:22px}
    .avatar-fb{background:rgba(255,255,255,.2);color:#fff}
    .head .headline,.head .contact{color:#eafdff}
    .head .section-title{color:#fff}
  `,
  minimal: `
    .head{text-align:center;border-bottom:2px solid var(--accent);padding:36px 40px 18px}
    .head .name{font-size:28px;letter-spacing:.5px}
    .head .headline{color:#374151}.head .contact{color:#4b5563}
    .body{padding-top:8px}
    .links{justify-content:center}
  `,
  professional: `
    .head{background:var(--accent);color:#fff;padding:26px 40px;display:flex;align-items:center;gap:20px}
    .avatar-fb{background:rgba(255,255,255,.2);color:#fff}
    .head .headline,.head .contact{color:#eef4ff}
  `,
};

/**
 * @param {object} d - dữ liệu CV (đã chỉnh sửa cục bộ)
 * @param {string} templateId
 * @param {{print?:boolean, order?:string[], hidden?:string[], accent?:string, font?:{stack:string,url?:string}}} opts
 */
export const buildCvHtml = (d, templateId = 'modern', opts = {}) => {
  const tpl = themeCss[templateId] ? templateId : 'modern';
  const accent = opts.accent || TEMPLATE_DEFAULT_ACCENT[tpl];
  const font = opts.font || getFont('sans');
  const order = (opts.order && opts.order.length) ? opts.order : DEFAULT_ORDER;
  const hidden = new Set(opts.hidden || []);
  const customById = Object.fromEntries((d.customSections || []).map((c) => [c.id, c]));

  const sec = (title, inner) =>
    inner ? `<section class="section"><h2 class="section-title">${esc(title)}</h2><div class="section-body">${inner}</div></section>` : '';

  const body = order
    .filter((id) => !hidden.has(id))
    .map((id) => {
      if (FIXED_IDS.has(id)) return sec(sectionLabel[id], sectionInner[id](d));
      const c = customById[id];
      if (!c) return '';
      const inner = richHtml(c.content);
      return inner ? sec(c.label || 'Phần mới', `<div class="rich">${inner}</div>`) : '';
    })
    .join('');

  const html = `<div class="page">${headerHtml[tpl](d)}<div class="body">${body}</div></div>`;
  const fontLink = font.url ? `<link href="${font.url}" rel="stylesheet">` : '';
  const printScript = opts.print ? `<script>window.onload=function(){try{window.focus();window.print();}catch(e){}}</script>` : '';
  const rootVars = `:root{--accent:${accent};--font:${font.stack}}`;
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><title>CV - ${esc(d.name)}</title>
    ${fontLink}<style>${rootVars}${baseCss}${themeCss[tpl]}</style></head><body>${html}${printScript}</body></html>`;
};
