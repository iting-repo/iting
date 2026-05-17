import axios from "../utils/axiosInstance";

/** Endpoints under /api/me/* — candidate self-service. */
const meService = {
  /** Profile completeness score (0-100) + missing items list. */
  getProfileCompleteness: () =>
    axios.get('/me/profile/completeness').then(r => r.data),

  /** GDPR data export — triggers JSON download. */
  downloadDataExport: async () => {
    const res = await axios.get('/me/data-export', { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iting-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default meService;
