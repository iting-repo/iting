import { useEffect, useState } from "react";
import adminJobService from "../services/adminJobService";

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
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "ACTIVE" } : job
        )
      );
    } catch (err) {
      console.error("Approve job error", err);
    }
  };

  // =========================
  // REJECT JOB
  // =========================

  const rejectJob = async (jobId, reason) => {
    try {
      await adminJobService.rejectJob(jobId, reason);

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "REJECTED" } : job
        )
      );
    } catch (err) {
      console.error("Reject job error", err);
    }
  };

  // =========================
  // REQUEST REVISION
  // =========================

  const requestRevision = async (jobId, note) => {
    try {
      await adminJobService.requestRevision(jobId, note);

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "NEEDS_REVISION" } : job
        )
      );
    } catch (err) {
      console.error("Revision error", err);
    }
  };

  // =========================
  // CLOSE JOB
  // =========================

  const closeJob = async (jobId) => {
    try {
      await adminJobService.closeJob(jobId);

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "CLOSED" } : job
        )
      );
    } catch (err) {
      console.error("Close job error", err);
    }
  };

  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (jobId) => {
    try {
      await adminJobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Delete job error", err);
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
    deleteJob
  };
};