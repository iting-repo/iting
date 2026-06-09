import { API_ORIGIN } from "../config";

/**
 * Chuẩn hoá URL ảnh/tài nguyên để dùng trong <img src>.
 *
 * Backend trả về URL tương đối cho ảnh lưu trên S3 (bucket private) dạng
 * "/api/public/blog-image?key=..." (proxy presign-redirect) hoặc ảnh local "/uploads/...".
 * Các URL này phải được resolve theo origin của BACKEND (API_ORIGIN), không phải origin của
 * frontend — nếu để tương đối, trình duyệt sẽ tải từ origin frontend và lỗi 404.
 *
 * URL tuyệt đối (http/https), data: hoặc blob: được giữ nguyên.
 *
 * @param {string|null|undefined} raw
 * @returns {string|null}
 */
export const resolveAssetUrl = (raw) => {
  if (!raw) return null;
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  return `${API_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

export default resolveAssetUrl;
