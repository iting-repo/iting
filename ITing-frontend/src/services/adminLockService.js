import axios from "../utils/axiosInstance";

const adminLockService = {
  listLocked: () => axios.get('/admin/locked-accounts'),
  unlock: (userId) => axios.post(`/admin/users/${userId}/unlock`),
};

export default adminLockService;
