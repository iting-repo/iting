import { API_BASE_URL } from "../config";

export const slugify = (value = "") =>
  String(value)
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const getJobTitle = (job = {}) =>
  job?.title || job?.position || job?.jobTitle || "chi-tiet-viec-lam";

export const getJobPublicKey = (job = {}) =>
  job?.public_id ||
  job?.publicId ||
  job?.jobKey ||
  job?.publicKey ||
  job?.jobId ||
  job?.id ||
  "";

// ── ID Obfuscation ──────────────────────────────────────────────
// Biến ID số (38) thành chuỗi ngắn khó đoán (vd: "2Gf38m")
// Thuật toán: XOR + nhân hệ số (Knuth) + mã hóa Base62
// Hoàn toàn reversible phía client, không cần backend thay đổi
// Dùng BigInt để đảm bảo chính xác phép nhân mod 2^32
const _CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const _XOR_KEY = 0x5A3Cn;
const _MUL = 2654435761n; // Knuth multiplicative hash (golden ratio)
const _MUL_INV = 244002641n; // Modular inverse: _MUL * _MUL_INV ≡ 1 (mod 2^32)
const _MOD = 4294967296n; // 2^32

const encodeId = (id) => {
  const num = Number(id);
  if (!Number.isFinite(num) || num < 0) return String(id);
  // Obfuscate: XOR → multiply → mod
  const obf = (BigInt(num) ^ _XOR_KEY) * _MUL % _MOD;
  // Convert to Base62
  if (obf === 0n) return _CHARS[0];
  let result = "";
  let n = obf;
  while (n > 0n) {
    result = _CHARS[Number(n % 62n)] + result;
    n = n / 62n;
  }
  return result;
};

const decodeId = (encoded) => {
  if (!encoded) return "";
  // Backward compat: nếu đã là ID số thuần (URL cũ) → trả luôn
  if (/^\d+$/.test(encoded)) return encoded;
  // Decode Base62 → BigInt
  let n = 0n;
  for (const ch of encoded) {
    const idx = _CHARS.indexOf(ch);
    if (idx < 0) return encoded; // Invalid → trả nguyên
    n = n * 62n + BigInt(idx);
  }
  // Reverse: multiply by modular inverse → XOR
  const deobf = (n * _MUL_INV) % _MOD;
  const original = Number(deobf ^ _XOR_KEY);
  return String(original);
};

// Export để test nếu cần
export { encodeId, decodeId };

export const normalizeJobKey = (jobKey = "") => {
  const raw = String(jobKey).replace(/\.html$/i, "");
  return decodeId(raw);
};

export const buildJobDetailPath = (job = {}) => {
  const slug = slugify(getJobTitle(job)) || "chi-tiet-viec-lam";
  const jobKey = getJobPublicKey(job);
  const encoded = encodeId(jobKey);

  return `/viec-lam/${slug}/${encoded}.html`;
};

export const buildEmployerJobApplicationsPath = (job = {}) => {
  const slug = slugify(getJobTitle(job)) || "chi-tiet-viec-lam";
  const jobKey = getJobPublicKey(job);
  const encoded = encodeId(jobKey);

  return `/employer/job/${slug}/${encoded}/applications`;
};

export const getCompanyLogoUrl = (logoPath, companyName = "") => {
  // Use UI Avatars as a clean, dynamic fallback for missing logos
  const UI_AVATAR = companyName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=3AB4E6&color=fff&bold=true`
    : `https://ui-avatars.com/api/?name=Company&background=3AB4E6&color=fff&bold=true`;

  // Check for placeholder/default images - treat them as missing
  if (!logoPath || logoPath === 'null' || logoPath === 'undefined' || logoPath === '') {
    return UI_AVATAR;
  }

  const normalizedLogoPath = String(logoPath);

  // Check for known placeholder/default paths - these should use UI_AVATAR instead
  if (normalizedLogoPath.includes('default-company') || normalizedLogoPath.includes('placeholder')) {
    return UI_AVATAR;
  }
  
  if (normalizedLogoPath.startsWith("http")) {
    // Basic validation for common placeholders if they are considered "bad" now
    if (normalizedLogoPath.includes("via.placeholder.com") && companyName) {
        return UI_AVATAR;
    }

    // --- LOCAL LOGO MAP: Override broken/CORS-blocked external URLs ---
    const LOCAL_LOGO_MAP = {
      'https://fpt-software.com/logo.png': '/fsft.png',
      'https://vng.com.vn/logo.png': '/vng.png',
      'https://grab.com/logo.png': '/grab.jpg',
      'https://vinai.io/logo.png': '/vin-ai.jpg',
      'https://viettel.com.vn/logo.png': '/viettle.jpg',
    };

    const localOverride = LOCAL_LOGO_MAP[normalizedLogoPath];
    if (localOverride) return localOverride;

    return normalizedLogoPath;
  }
  
  // Handle relative paths
  const baseUrl = API_BASE_URL.replace("/api", "");
  const result = `${baseUrl}${normalizedLogoPath.startsWith("/") ? "" : "/"}${normalizedLogoPath}`;
  return result;
};

