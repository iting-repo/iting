// Emoji (chèn vào ô soạn) + sticker (gửi như ảnh) cho khung chat.
// Sticker dùng ảnh Twemoji (CDN jsdelivr) để không phải bundle file ảnh.

export const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😗', '😎', '🤩',
  '🤔', '🤗', '😐', '😴', '😪', '😭', '😢', '😅', '😤', '😡',
  '👍', '👎', '👌', '🙏', '👏', '🙌', '💪', '🤝', '✌️', '🤞',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🔥', '⭐', '✨', '🎉',
  '🎊', '💯', '✅', '❌', '⚡', '🚀', '💡', '📌', '📎', '📄',
];

const TWEMOJI = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/';

const STICKER_CODES = [
  ['1f604', '😄'], ['1f602', '😂'], ['1f60d', '😍'], ['1f618', '😘'],
  ['1f60e', '😎'], ['1f973', '🥳'], ['1f622', '😢'], ['1f62d', '😭'],
  ['1f44d', '👍'], ['1f44f', '👏'], ['1f64f', '🙏'], ['2764', '❤️'],
  ['1f389', '🎉'], ['1f525', '🔥'], ['1f4af', '💯'], ['1f680', '🚀'],
];

export const STICKERS = STICKER_CODES.map(([code, alt]) => ({
  alt,
  url: `${TWEMOJI}${code}.png`,
}));
