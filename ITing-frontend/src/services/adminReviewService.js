import axios from "../utils/axiosInstance";

const adminReviewService = {
  list: (status = 'PENDING', page = 0, size = 20) =>
    axios.get(`/admin/reviews?status=${status}&page=${page}&size=${size}`).then(r => r.data),

  counts: () => axios.get('/admin/reviews/counts').then(r => r.data),

  approve: (id) => axios.post(`/admin/reviews/${id}/approve`).then(r => r.data),

  reject: (id, note) =>
    axios.post(`/admin/reviews/${id}/reject${note ? `?note=${encodeURIComponent(note)}` : ''}`)
      .then(r => r.data),
};

export default adminReviewService;
