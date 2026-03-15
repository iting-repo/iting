import React, { useState } from "react";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { PageHeader, Pagination } from "../../../components";

import { JobStats } from "./components/JobStats";
import { JobFilters } from "./components/JobFilters";
import { JobTable } from "./components/JobTable";
import { JobPreviewDialog } from "./components/JobPreviewDialog";
import { JobDetailDialog } from "../../../components/admin/JobDetailDialog";
import { ActionDialog } from "../../../components/admin/ActionDialog";

import { useAdminJobs } from "../../../hooks/useAdminJobs";

const AdminJobPage = () => {
  const {
    jobs,
    loading,
    page,
    setPage,
    totalPages,
    filters,
    setFilters,
    approveJob,
    rejectJob,
    closeJob,
    requestRevision,
  } = useAdminJobs();

  const [previewJob, setPreviewJob] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleAction = (job, action) => {
    setActionDialog({ job, action });
  };

  const confirmAction = async () => {
    if (!actionDialog) return;

    const { job, action } = actionDialog;

    try {
      if (action === "approve") {
        await approveJob(job.id, actionNote);
      }

      if (action === "reject") {
        await rejectJob(job.id, actionNote);
      }

      if (action === "revision") {
        await requestRevision(job.id, actionNote);
      }

      if (action === "close") {
        await closeJob(job.id);
      }

      setActionDialog(null);
      setActionNote("");
      setPreviewJob(null);
      setDetailJob(null);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const pendingCount = jobs.filter((j) => j.status === "PENDING").length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex flex-1 flex-col">
        <AdminHeader />

        <main className="space-y-6 p-6">
          <PageHeader
            title="Quản lý Job"
            description={`${pendingCount} job đang chờ duyệt`}
          />

          <JobStats jobs={jobs} />

          <JobFilters
            search={filters.keyword || ""}
            setSearch={(value) =>
              setFilters((prev) => ({ ...prev, keyword: value }))
            }
            statusFilter={filters.status || "all"}
            setStatusFilter={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          />

          <JobTable
            jobs={jobs}
            loading={loading}
            onPreview={setPreviewJob}
            onDetail={setDetailJob}
            onAction={handleAction}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </main>
      </div>

      <JobPreviewDialog
        job={previewJob}
        open={!!previewJob}
        onClose={() => setPreviewJob(null)}
        onAction={handleAction}
      />

      <JobDetailDialog
        job={detailJob}
        open={!!detailJob}
        onClose={() => setDetailJob(null)}
        onAction={handleAction}
      />

      <ActionDialog
        actionDialog={actionDialog}
        actionNote={actionNote}
        setActionNote={setActionNote}
        onClose={() => setActionDialog(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
};

export default AdminJobPage;