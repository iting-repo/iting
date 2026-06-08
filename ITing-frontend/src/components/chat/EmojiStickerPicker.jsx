import React, { useState, useEffect, useRef } from 'react';
import { EMOJIS, STICKERS } from './chatAssets';

/**
 * Popover chọn emoji (chèn vào ô soạn) hoặc sticker (gửi ngay).
 * Đặt trong 1 div position:relative ở composer.
 */
const EmojiStickerPicker = ({ onPickEmoji, onPickSticker, onClose }) => {
  const [tab, setTab] = useState('emoji');
  const ref = useRef(null);

  // Click ngoài → đóng
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-12 left-0 z-30 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setTab('emoji')}
          className={`flex-1 py-2 text-sm font-semibold ${tab === 'emoji' ? 'text-sky-600 border-b-2 border-sky-500' : 'text-slate-500'}`}
        >
          Emoji
        </button>
        <button
          type="button"
          onClick={() => setTab('sticker')}
          className={`flex-1 py-2 text-sm font-semibold ${tab === 'sticker' ? 'text-sky-600 border-b-2 border-sky-500' : 'text-slate-500'}`}
        >
          Sticker
        </button>
      </div>

      <div className="p-2 max-h-56 overflow-y-auto custom-scrollbar">
        {tab === 'emoji' ? (
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onPickEmoji?.(e)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 text-xl leading-none"
              >
                {e}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {STICKERS.map((s) => (
              <button
                key={s.url}
                type="button"
                onClick={() => onPickSticker?.(s.url)}
                className="aspect-square rounded-lg hover:bg-slate-100 flex items-center justify-center p-1"
                title={s.alt}
              >
                <img src={s.url} alt={s.alt} className="w-12 h-12 object-contain" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiStickerPicker;
