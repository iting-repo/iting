import { useEffect, useState } from "react";
import adminJobService from "../services/adminJobService";
import { toast } from "sonner";

export const useAdminJobs = () => {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    keyword: "",
    status: "all",
  });

  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params = {
        page: page - 1,
        size,
        keyword: filters.keyword || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
      };

      const res = await adminJobService.fetchJobs(params);

      setJobs(res.content);
      setTotalPages(res.totalPages);

    } catch (err) {
      console.error("Fetch jobs error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  // =========================
  // APPROVE JOB
  // =========================

  const approveJob = async (jobId, note) => {
    try {
      await adminJobService.approveJob(jobId, note);
      setJobs((prev) =>
        prev.map((job) => job.id === jobId ? { ...job, status: "ACTIVE" } : job)
      );
      toast.success("Duyệt công việc thành công!");
    } catch (err) {
      console.error("Approve job error", err);
      toast.error(err?.response?.data?.error || "Duyệt thất bại");
      throw err;
    }
  };

  // =========================
  // REJECT JOB
  // =========================

  const rejectJob = async (jobId, reason) => {
    try {
      await adminJobService.rejectJob(jobId, reason);
      setJobs((prev) =>
        prev.map((job) => job.id === jobId ? { ...job, status: "REJECTED" } : job)
      );
      toast.success("Từ chối công việc thành công!");
    } catch (err) {
      console.error("Reject job error", err);
      toast.error(err?.response?.data?.error || "Từ chối thất bại");
      throw err;
    }
  };

  // =========================
  // REQUEST REVISION
  // =========================

  const requestRevision = async (jobId, note) => {
    try {
      await adminJobService.requestRevision(jobId, note);
      setJobs((prev) =>
        prev.map((job) => job.id === jobId ? { ...job, status: "REJECTED" } : job)
      );
      toast.success("Yêu cầu chỉnh sửa đã gửi!");
    } catch (err) {
      console.error("Revision error", err);
      toast.error(err?.response?.data?.error || "Yêu cầu thất bại");
      throw err;
    }
  };

  // =========================
  // CLOSE JOB
  // =========================

  const closeJob = async (jobId) => {
    try {
      await adminJobService.closeJob(jobId);
      setJobs((prev) =>
        prev.map((job) => job.id === jobId ? { ...job, status: "CLOSED" } : job)
      );
      toast.success("Đã đóng công việc!");
    } catch (err) {
      console.error("Close job error", err);
      toast.error(err?.response?.data?.error || "Đóng thất bại");
      throw err;
    }
  };

  // =========================
  // SUSPEND JOB
  // =========================

  const suspendJob = async (jobId, reason) => {
    try {
      await adminJobService.suspendJob(jobId, reason);
      setJobs((prev) =>
        prev.map((job) => job.id === jobId ? { ...job, status: "SUSPENDED" } : job)
      );
      toast.success("Đã đình chỉ công việc!");
    } catch (err) {
      console.error("Suspend job error", err);
      toast.error(err?.response?.data?.error || "Đình chỉ thất bại");
      throw err;
    }
  };

  // =========================
  // UNSUSPEND JOB
  // =========================

  const unsuspendJob = async (jobId) => {
    try {
      await adminJobService.unsuspendJob(jobId);
      setJobs((prev) =>
        prev.map((job) => job.id === jobId ? { ...job, status: "ACTIVE" } : job)
      );
      toast.success("Đã bỏ đình chỉ, công việc được kích hoạt lại!");
    } catch (err) {
      console.error("Unsuspend job error", err);
      toast.error(err?.response?.data?.error || "Bỏ đình chỉ thất bại");
      throw err;
    }
  };

  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (jobId) => {
    try {
      await adminJobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast.success("Đã xóa công việc!");
    } catch (err) {
      console.error("Delete job error", err);
      toast.error(err?.response?.data?.error || "Xóa thất bại");
      throw err;
    }
  };

  return {
    jobs,
    loading,
    page,
    setPage,
    totalPages,
    filters,
    setFilters,
    fetchJobs,
    approveJob,
    rejectJob,
    requestRevision,
    closeJob,
    suspendJob,
    unsuspendJob,
    deleteJob,
  };
};