import React, { useState } from "react";
import { PageHeader } from "../../../components/common/PageHeader";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import { 
  FaDownload, 
  FaUpload, 
  FaCheckSquare, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBan, 
  FaTrashAlt, 
  FaClock,
} from "react-icons/fa";
import ImportExcelModal from "../../../components/admin/ImportExcelModal";
import adminJobService from "../../../services/adminJobService";
import { toast } from "sonner";

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
    suspendJob,
    unsuspendJob,
    deleteJob,
  } = useAdminJobs();

  const [previewJob, setPreviewJob] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn thực hiện hành động này cho ${selectedIds.length} mục đã chọn?`)) return;

    try {
      if (action === 'approve') {
        await adminJobService.bulkApprove(selectedIds);
      } else if (action === 'reject') {
        const reason = window.prompt("Nhập lý do từ chối hàng loạt:");
        if (reason === null) return;
        await adminJobService.bulkReject(selectedIds, reason || "Không đạt yêu cầu");
      } else if (action === 'suspend') {
        const reason = window.prompt("Nhập lý do đình chỉ hàng loạt:");
        if (reason === null) return;
        await adminJobService.bulkSuspend(selectedIds, reason || "Vi phạm quy định");
      } else if (action === 'close') {
        await adminJobService.bulkClose(selectedIds);
      } else if (action === 'delete') {
        await adminJobService.bulkDelete(selectedIds);
      }
      
      toast.success(`Thành công cho ${selectedIds.length} mục`);
      setSelectedIds([]);
      window.location.reload(); // Or use a refresh function from useAdminJobs
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Thao tác hàng loạt thất bại");
    }
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

  const pendingCount = jobs.filter((j) => j.status === "PENDING").length;

  return (
    <>

      <div className="space-y-6 pb-60">
      <PageHeader
        title="Quản lý Công việc"
        description={`${pendingCount} công việc đang chờ duyệt`}
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => setShowImportModal(true)}
          >
            <FaUpload className="h-4 w-4" />
            Nhập công việc (Excel)
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-[#1967D2] text-[#1967D2] hover:bg-blue-50"
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
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        isAllSelected={isAllSelected}
      />

      <Pagination
        page={page}
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-sky-100 bg-white px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <FaCheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Đã chọn {selectedIds.length} mục</p>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-sky-600 hover:underline"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
               onClick={() => handleBulkAction('approve')}
               className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            >
              <FaCheckCircle className="h-4 w-4" />
              Duyệt
            </button>
            
            <button
               onClick={() => handleBulkAction('reject')}
               className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-100 transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
            >
              <FaTimesCircle className="h-4 w-4" />
              Từ chối
            </button>

            <button
               onClick={() => handleBulkAction('suspend')}
               className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 hover:scale-105 active:scale-95"
            >
              <FaBan className="h-4 w-4" />
              Đình chỉ
            </button>

            <button
               onClick={() => handleBulkAction('close')}
               className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-100 transition-all hover:bg-slate-800 hover:scale-105 active:scale-95"
            >
              <FaClock className="h-4 w-4" />
              Đóng
            </button>

            <button
               onClick={() => handleBulkAction('delete')}
               className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
            >
              <FaTrashAlt className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminJobPage;
