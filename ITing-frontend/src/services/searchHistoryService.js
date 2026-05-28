import axios from '../utils/axiosInstance';
import storage from '../utils/storage';

/**
 * Server-backed search history (per account).
 * Backend tự lưu khi /api/jobs/search được gọi có keyword/location;
 * service này chỉ lo GET + DELETE.
 *
 * Guest (chưa đăng nhập) → fallback localStorage.
 */

const LOCAL_KEY = 'iting_search_history';
const MAX_LOCAL = 10;

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocal = (list) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, MAX_LOCAL)));

const isLoggedIn = () => !!storage.getToken();

const searchHistoryService = {
  /**
   * Trả về list keyword string (đã dedupe, newest first).
   * - Logged in: gọi server, map keyword field.
   * - Guest: đọc localStorage.
   */
  list: async ({ limit = 10 } = {}) => {
    if (!isLoggedIn()) return loadLocal();
    try {
      const res = await axios.get('/me/search-history', { params: { limit } });
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      // Dedupe theo keyword (giữ bản mới nhất)
      const seen = new Set();
      const items = [];
      for (const row of rows) {
        const kw = (row.keyword || '').trim();
        if (!kw || seen.has(kw)) continue;
        seen.add(kw);
        items.push({ id: row.id, keyword: kw, createdAt: row.createdAt });
      }
      return items;
    } catch {
      return loadLocal().map((kw) => ({ id: null, keyword: kw, createdAt: null }));
    }
  },

  /**
   * Local-only "save". Server đã tự lưu khi user thực sự search;
   * call này chỉ duy trì localStorage cho guest hoặc khi BE chưa kịp.
   */
  saveLocal: (keyword) => {
    if (!keyword || !keyword.trim()) return;
    const trimmed = keyword.trim();
    const existing = loadLocal();
    const next = [trimmed, ...existing.filter((k) => k !== trimmed)].slice(0, MAX_LOCAL);
    saveLocal(next);
  },

  /**
   * Xoá 1 item. Nếu có id → DELETE server. Nếu không → chỉ xoá local.
   */
  removeOne: async ({ id, keyword } = {}) => {
    // remove from local always
    if (keyword) {
      const next = loadLocal().filter((k) => k !== keyword);
      saveLocal(next);
    }
    if (isLoggedIn() && id) {
      try {
        await axios.delete(`/me/search-history/${id}`);
      } catch {
        // ignore — local already cleaned
      }
    }
  },

  /**
   * Xoá toàn bộ. Server + local.
   */
  clear: async () => {
    localStorage.removeItem(LOCAL_KEY);
    if (isLoggedIn()) {
      try {
        await axios.delete('/me/search-history');
      } catch {
        // ignore
      }
    }
  },
};

export default searchHistoryService;
