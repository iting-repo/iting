import axios from "../utils/axiosInstance";

const savedSearchService = {
  list: () => axios.get('/me/saved-searches').then(r => r.data),
  create: (payload) => axios.post('/me/saved-searches', payload).then(r => r.data),
  update: (id, payload) => axios.put(`/me/saved-searches/${id}`, payload).then(r => r.data),
  remove: (id) => axios.delete(`/me/saved-searches/${id}`).then(r => r.data),
};

export default savedSearchService;
