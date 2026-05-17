import axios from "../utils/axiosInstance";

const adminLockService = {
  listLocked: () => axios.get('/admin/locked-accounts').then(r => r.data),
  unlock: (userId) => axios.post(`/admin/users/${userId}/unlock`).then(r => r.data),
};

export default adminLockService;
