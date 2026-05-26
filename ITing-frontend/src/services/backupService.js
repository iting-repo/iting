import axiosInstance from "../utils/axiosInstance";

const backupService = {
  // Tạo backup mới
  createBackup: async () => {
    const response = await axiosInstance.post("/admin/backup/create");
    return response;
  },

  // Lấy lịch sử backup
  getBackupHistory: async () => {
    const response = await axiosInstance.get("/admin/backup/history");
    return response;
  },

  // Xóa backup
  deleteBackup: async (backupName) => {
    const response = await axiosInstance.delete(`/admin/backup/${encodeURIComponent(backupName)}`);
    return response;
  }
};

export default backupService;
