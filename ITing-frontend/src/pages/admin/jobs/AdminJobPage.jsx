import React, { useState } from "react";
import { PageHeader } from "../../../components/common/PageHeader";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import {
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaTrashAlt,
  FaClock,
  FaRobot,
  FaSpinner,
} from "react-icons/fa";
import ImportExcelModal from "../../../components/admin/ImportExcelModal";
import { ConfirmModal, PromptModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";
import usePrompt from "../../../hooks/usePrompt";
import adminJobService from "../../../services/adminJobService";
import { toast } from "sonner";

import { JobStats } from "./components/JobStats";
import { JobFilters } from "./components/JobFilters";
import { JobTable } from "./components/JobTable";
import { JobPreviewDialog } from "./components/JobPreviewDialog";
import { JobDetailDialog } from "../../../components/admin/JobDetailDialog";
import { ActionDialog } from "../../../components/admin/ActionDialog";
import { JobApplicantsDialog } from "../../../components/admin/JobApplicantsDialog";
import BulkActionBar from "../../../components/admin/BulkActionBar";

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
    suspendJob,
    unsuspendJob,
    deleteJob,
  } = useAdminJobs();

  const [previewJob, setPreviewJob] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [applicantsJob, setApplicantsJob] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmBulk, askBulkConfirm, resetBulkConfirm] = useConfirm();
  const [promptState, askPrompt, resetPrompt] = usePrompt();
  const [bulkAiRunning, setBulkAiRunning] = useState(false);
  const [bulkAiProgress, setBulkAiProgress] = useState({ done: 0, total: 0 });

  const isAllSelected = jobs.length > 0 && selectedIds.length === jobs.length;

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleRunAiAll = async () => {
    if (bulkAiRunning) return;
    const toReview = jobs.filter(j => {
      const status = j.aiReviewStatus || j.aiReview?.status || j.aiModeration?.status;
      return !status || status === 'NOT_REVIEWED';
    });
    const targets = toReview.length > 0 ? toReview : jobs;
    setBulkAiRunning(true);
    setBulkAiProgress({ done: 0, total: targets.length });
    let successCount = 0;
    let failCount = 0;
    for (const job of targets) {
      try {
        await adminJobService.runAiReview(job.id);
        successCount++;
      } catch {
        failCount++;
      }
      setBulkAiProgress(prev => ({ ...prev, done: prev.done + 1 }));
    }
    setBulkAiRunning(false);
    setBulkAiProgress({ done: 0, total: 0 });
    if (failCount === 0) {
      toast.success(`✅ AI đã kiểm tra xong ${successCount} công việc!`);
    } else {
      toast.warning(`AI kiểm tra xong ${successCount} thành công, ${failCount} thất bại.`);
    }
    window.location.reload();
  };

  const handleExportExcel = async () => {
    try {
      const res = await adminJobService.exportJobs();
      downloadBlob(res, "jobs_list.xlsx");
      toast.success("Xuất danh sách công việc thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toast.error("Không thể xuất file Excel.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await adminJobService.downloadTemplate();
      downloadBlob(res, "job_import_template.xlsx");
    } catch (error) {
      console.error("Lỗi tải template:", error);
      toast.error("Không thể tải file mẫu.");
    }
  };

  const handleImportExcel = async (file) => {
    await adminJobService.importJobs(file);
    // Refresh jobs if possible
    window.location.reload(); // Quick way to refresh since useAdminJobs might not expose a refresh
  };

  const handleAction = (job, action) => {
    setActionDialog({ job, action });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(jobs.map(j => j.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;
    const actionLabels = { approve: 'duyệt', reject: 'từ chối', suspend: 'đình chỉ', close: 'đóng', delete: 'xóa' };
    const actionVariants = { approve: 'info', reject: 'warning', suspend: 'warning', close: 'warning', delete: 'danger' };

    // Helper thực thi action sau khi đã có reason (nếu cần).
    const execute = async (reason) => {
      try {
        if (action === 'approve') {
          await adminJobService.bulkApprove(selectedIds);
        } else if (action === 'reject') {
          await adminJobService.bulkReject(selectedIds, reason || "Không đạt yêu cầu");
        } else if (action === 'suspend') {
          await adminJobService.bulkSuspend(selectedIds, reason || "Vi phạm quy định");
        } else if (action === 'close') {
          await adminJobService.bulkClose(selectedIds);
        } else if (action === 'delete') {
          await adminJobService.bulkDelete(selectedIds);
        }
        toast.success(`Thành công cho ${selectedIds.length} mục`);
        setSelectedIds([]);
        window.location.reload();
      } catch (error) {
        console.error("Bulk action error:", error);
        toast.error("Thao tác hàng loạt thất bại");
      }
    };

    askBulkConfirm({
      title: `${actionLabels[action]?.charAt(0).toUpperCase() + actionLabels[action]?.slice(1)} hàng loạt`,
      message: `Bạn có chắc muốn ${actionLabels[action]} ${selectedIds.length} mục đã chọn?`,
      warning: action === 'delete' ? 'Hành động này không thể hoàn tác.' : undefined,
      confirmText: actionLabels[action]?.charAt(0).toUpperCase() + actionLabels[action]?.slice(1),
      variant: actionVariants[action],
      onConfirm: () => {
        resetBulkConfirm();
        // Reject / Suspend cần thêm lý do — mở PromptModal trước khi gọi execute.
        if (action === 'reject' || action === 'suspend') {
          askPrompt({
            title: action === 'reject' ? 'Lý do từ chối hàng loạt' : 'Lý do đình chỉ hàng loạt',
            label: 'Lý do',
            placeholder: action === 'reject' ? 'Không đạt yêu cầu...' : 'Vi phạm quy định...',
            multiline: true,
            variant: 'warning',
            onSubmit: (reason) => {
              resetPrompt();
              execute(reason);
            },
          });
        } else {
          execute();
        }
      }
    });
  };

  const confirmAction = async () => {
    if (!actionDialog) return;
    const { job, action } = actionDialog;
    try {
      if (action === "approve") {
        await approveJob(job.id, actionNote);
      } else if (action === "reject") {
        if (!actionNote.trim()) { toast.error("Vui lòng nhập lý do từ chối!"); return; }
        await rejectJob(job.id, actionNote);
      } else if (action === "revision") {
        if (!actionNote.trim()) { toast.error("Vui lòng nhập lý do yêu cầu chỉnh sửa!"); return; }
        await requestRevision(job.id, actionNote);

      } else if (action === "suspend") {
        if (!actionNote.trim()) { toast.error("Vui lòng nhập lý do đình chỉ!"); return; }
        await suspendJob(job.id, actionNote);
      } else if (action === "unsuspend") {
        await unsuspendJob(job.id);
      } else if (action === "close") {
        await closeJob(job.id);
      } else if (action === "delete") {
        await deleteJob(job.id);
      }
      setActionDialog(null);
      setActionNote("");
      setPreviewJob(null);
      setDetailJob(null);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <>

      <div className="space-y-6 pb-60">
      <PageHeader
        title="Quản lý Công việc"
        description="Theo dõi, duyệt và quản lý toàn bộ tin tuyển dụng trong hệ thống."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary CTA — hành động quan trọng nhất, nền nổi bật */}
          <Button
            variant="primary"
            className={`flex items-center gap-2 bg-gradient-to-r from-[#7C5CFC] to-[#5B7CFA] font-semibold text-white shadow-sm transition-all hover:opacity-90 ${
              bulkAiRunning ? "cursor-not-allowed opacity-70" : ""
            }`}
            onClick={handleRunAiAll}
            disabled={bulkAiRunning}
          >
            {bulkAiRunning ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                Đang kiểm tra ({bulkAiProgress.done}/{bulkAiProgress.total})...
              </>
            ) : (
              <>
                <FaRobot className="h-4 w-4" />
                Kiểm tra AI tất cả
              </>
            )}
          </Button>

          {/* Secondary — nền trắng, viền nhẹ */}
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => setShowImportModal(true)}
          >
            <FaUpload className="h-4 w-4" />
            Nhập Excel
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
            onClick={handleExportExcel}
          >
            <FaDownload className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </PageHeader>

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
        onViewApplicants={setApplicantsJob}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        isAllSelected={isAllSelected}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
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

      <JobApplicantsDialog
        job={applicantsJob}
        open={!!applicantsJob}
        onClose={() => setApplicantsJob(null)}
      />

      <ActionDialog
        actionDialog={actionDialog}
        actionNote={actionNote}
        setActionNote={setActionNote}
        onClose={() => setActionDialog(null)}
        onConfirm={confirmAction}
      />

      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Nhập công việc từ Excel"
        resourceName="việc làm"
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImportExcel}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { key: 'approve', label: 'Duyệt',   icon: <FaCheckCircle className="h-4 w-4" />, variant: 'success', onClick: () => handleBulkAction('approve') },
          { key: 'reject',  label: 'Từ chối', icon: <FaTimesCircle className="h-4 w-4" />, variant: 'warning', onClick: () => handleBulkAction('reject') },
          { key: 'suspend', label: 'Đình chỉ', icon: <FaBan className="h-4 w-4" />,         variant: 'orange',  onClick: () => handleBulkAction('suspend') },
          { key: 'close',   label: 'Đóng',    icon: <FaClock className="h-4 w-4" />,       variant: 'slate',   onClick: () => handleBulkAction('close') },
          { key: 'delete',  label: 'Xóa',     icon: <FaTrashAlt className="h-4 w-4" />,    variant: 'danger',  onClick: () => handleBulkAction('delete') },
        ]}
      />

      <ConfirmModal isOpen={confirmBulk.isOpen} onClose={resetBulkConfirm} onConfirm={confirmBulk.onConfirm} title={confirmBulk.title} message={confirmBulk.message} warning={confirmBulk.warning} confirmText={confirmBulk.confirmText} variant={confirmBulk.variant} />
      <PromptModal
        isOpen={promptState.isOpen}
        onClose={resetPrompt}
        onSubmit={promptState.onSubmit}
        title={promptState.title}
        message={promptState.message}
        label={promptState.label}
        placeholder={promptState.placeholder}
        defaultValue={promptState.defaultValue}
        confirmText={promptState.confirmText}
        cancelText={promptState.cancelText}
        required={promptState.required}
        multiline={promptState.multiline}
        variant={promptState.variant}
      />
    </>
  );
};

export default AdminJobPage;
