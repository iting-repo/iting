/**
 * idCodec — mã hoá id số (tuần tự) thành token ngắn, đục (vd 13 → "qF3a9b") để KHÔNG
 * lộ id thật trên URL (vd /companies/13). Giải ngược được hoàn toàn.
 *
 * ⚠️ Đây là OBFUSCATION (làm khó đoán), KHÔNG phải mã hoá bảo mật thật — logic chạy
 *    client nên về lý thuyết có thể đảo. Bảo mật thực sự vẫn phải nằm ở phân quyền backend.
 *    Mục đích: ẩn id tuần tự khỏi thanh địa chỉ, tránh dò tuần tự /companies/1,2,3...
 *
 * Cơ chế: nhân id với 1 số lẻ lớn (khả nghịch mod 2^32) rồi đổi sang base62 (bảng xáo).
 * Vì là song ánh trên không gian 32-bit nên không trùng, không mất id.
 */

// Bảng base62 (xoay để token bớt giống base62 chuẩn). Đủ 62 ký tự duy nhất.
const STD = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ALPHABET = STD.slice(29) + STD.slice(0, 29);
const BASE = 62n;
const MOD = 1n << 32n; // 2^32
const MUL = 2654435761n; // 0x9E3779B1 — số lẻ ⇒ khả nghịch mod 2^32

function modInverse(a, m) {
  let oldR = ((a % m) + m) % m;
  let r = m;
  let oldS = 1n;
  let s = 0n;
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % m) + m) % m;
}

const INV = modInverse(MUL, MOD);

function toBase62(n) {
  if (n === 0n) return ALPHABET[0];
  let out = "";
  let x = n;
  while (x > 0n) {
    out = ALPHABET[Number(x % BASE)] + out;
    x /= BASE;
  }
  return out;
}

function fromBase62(str) {
  let n = 0n;
  for (const ch of str) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) return null; // ký tự lạ → token không hợp lệ
    n = n * BASE + BigInt(i);
  }
  return n;
}

/**
 * Mã hoá id số → token đục dùng trên URL.
 * @param {number|string} id
 * @returns {string} token (vd "qF3a9b"); trả nguyên id nếu không hợp lệ.
 */
export function encodeId(id) {
  try {
    const n = BigInt(id);
    if (n < 0n) return String(id);
    return toBase62((n * MUL) % MOD);
  } catch {
    return String(id);
  }
}

/**
 * Giải token → id số. Hỗ trợ fallback: nếu param là số thuần (link cũ) thì trả luôn.
 * @param {string} token
 * @returns {number|null} id số, hoặc null nếu token không hợp lệ.
 */
export function decodeId(token) {
  if (token == null) return null;
  const t = String(token).trim();
  if (t === "") return null;
  if (/^\d+$/.test(t)) return Number(t); // link cũ dạng số → vẫn mở được
  const y = fromBase62(t);
  if (y === null) return null;
  return Number((y * INV) % MOD);
}

export default { encodeId, decodeId };
