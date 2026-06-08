import React from 'react';
import { FaFilePdf, FaFileWord, FaFileAlt, FaDownload } from 'react-icons/fa';

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const isUrl = (s) => /^https?:\/\/[^\s]+$/.test(s);

const isImage = (ct) => typeof ct === 'string' && ct.toLowerCase().startsWith('image/');

const fmtSize = (n) => {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const fileIcon = (ct) => {
  if (ct?.includes('pdf')) return <FaFilePdf className="text-red-500" />;
  if (ct?.includes('word') || ct?.includes('document')) return <FaFileWord className="text-blue-600" />;
  return <FaFileAlt className="text-slate-500" />;
};

/** Linkify: tách URL trong text thành <a> click được. */
const renderText = (text, mine) => {
  if (!text) return null;
  const parts = String(text).split(URL_SPLIT_REGEX);
  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {parts.map((part, i) =>
        isUrl(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline break-all ${mine ? 'text-white' : 'text-sky-600'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </p>
  );
};

/**
 * Render nội dung 1 tin nhắn (KHÔNG bao gồm sticker — sticker render riêng ngoài bubble).
 * Gồm: text (linkify) + ảnh/tệp đính kèm + thẻ link preview.
 */
const MessageContent = ({ msg, mine }) => {
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];
  const images = attachments.filter((a) => isImage(a.contentType));
  const files = attachments.filter((a) => !isImage(a.contentType));
  const preview = msg.linkPreview;

  return (
    <div className="space-y-2">
      {renderText(msg.content, mine)}

      {/* Ảnh đính kèm */}
      {images.length > 0 && (
        <div className={`grid gap-1.5 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {images.map((img, i) => {
            const src = img.viewUrl || img.url;
            return (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <img
                  src={src}
                  alt={img.name || 'image'}
                  className="rounded-xl max-h-60 w-full object-cover border border-black/5"
                  loading="lazy"
                />
              </a>
            );
          })}
        </div>
      )}

      {/* Tệp đính kèm (PDF/DOCX) */}
      {files.map((f, i) => (
        <a
          key={i}
          href={f.viewUrl || f.url}
          target="_blank"
          rel="noopener noreferrer"
          download={f.name}
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 border transition-colors ${
            mine ? 'bg-white/15 border-white/20 hover:bg-white/25' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-2xl flex-shrink-0">{fileIcon(f.contentType)}</span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-semibold truncate ${mine ? 'text-white' : 'text-slate-800'}`}>
              {f.name || 'Tệp đính kèm'}
            </span>
            <span className={`block text-xs ${mine ? 'text-white/70' : 'text-slate-400'}`}>{fmtSize(f.size)}</span>
          </span>
          <FaDownload className={`flex-shrink-0 ${mine ? 'text-white/80' : 'text-slate-400'}`} />
        </a>
      ))}

      {/* Link preview (YouTube / bài viết...) */}
      {preview && (preview.title || preview.image) && (
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`block overflow-hidden rounded-xl border ${
            mine ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-white'
          }`}
        >
          {preview.image && (
            <img src={preview.image} alt="" className="w-full max-h-40 object-cover" loading="lazy" />
          )}
          <div className="p-2.5">
            {preview.siteName && (
              <div className={`text-[11px] uppercase tracking-wide truncate ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                {preview.siteName}
              </div>
            )}
            {preview.title && (
              <div className={`text-sm font-semibold line-clamp-2 ${mine ? 'text-white' : 'text-slate-800'}`}>
                {preview.title}
              </div>
            )}
            {preview.description && (
              <div className={`text-xs line-clamp-2 mt-0.5 ${mine ? 'text-white/80' : 'text-slate-500'}`}>
                {preview.description}
              </div>
            )}
          </div>
        </a>
      )}

      {msg.isEdited && (
        <span className={`text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'} block`}>(đã sửa)</span>
      )}
    </div>
  );
};

export default MessageContent;
