import axios from "../utils/axiosInstance";

/** Endpoints under /api/me/* — candidate self-service. */
const meService = {
  /** Profile completeness score (0-100) + missing items list. */
  getProfileCompleteness: () =>
    axios.get('/me/profile/completeness').then(r => r.data),

  /** GDPR data export — triggers JSON download. */
  downloadDataExport: async () => {
    // axiosInstance interceptor đã unwrap `response.data` rồi → trả về Blob trực tiếp.
    const data = await axios.get('/me/data-export', { responseType: 'blob' });
    const blob = data instanceof Blob ? data : new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iting-data-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export default meService;
