import React, { useEffect, useMemo, useState } from "react";
import adminCompanyService from '../../../services/adminCompanyService';
import {
  Button, Badge, PageHeader, GlobalLoading
} from "../../../components";
import { StatCard } from "../../../components/admin/StatCard";
import {
  AdminFilterBar, AdminSearchInput, adminSelectClass, AdminResetButton
} from "../../../components/admin/AdminFilterBar";
import { RowActionMenu } from "../../../components/admin/RowActionMenu";
import { CompanyDetailDialog } from "../../../components/admin/CompanyDetailDialog";
import { ActionDialog } from "../../../components/admin/ActionDialog";
import DataTable from "../../../components/admin/DataTable";
import BulkActionBar from "../../../components/admin/BulkActionBar";
import {
  FaBuilding,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaShieldAlt,
  FaDownload,
  FaUpload,
  FaTrashAlt,
  FaBan,
  FaTimesCircle,
  FaCheckCircle
} from "react-icons/fa";
import ImportExcelModal from "../../../components/admin/ImportExcelModal";
import { ConfirmModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";
import { toast } from "sonner";

const STATUS_COLOR = {
  PENDING_REVIEW: "warning",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  REJECTED: "danger",
  NEEDS_RESUBMISSION: "amber",
  SUSPENDED: "danger",
  MISSING: "slate",
  UPLOADED: "info",
};

const VERIFICATION_COLOR = {
  BASIC: "slate",
  ADVANCED: "emerald",
  VERIFIED: "success",
};

const STATUS_LABEL = {
  PENDING_REVIEW: "CHỜ DUYỆT",
  APPROVED: "ĐÃ DUYỆT",
  REJECTED: "BỊ TỪ CHỐI",
  SUSPENDED: "BỊ ĐÌNH CHỈ",
};

const DOC_LABEL = {
  MISSING: "THIẾU",
  UPLOADED: "ĐÃ TẢI LÊN",
  PENDING_REVIEW: "CHỜ DUYỆT",
  APPROVED: "ĐÃ DUYỆT",
  REJECTED: "BỊ TỪ CHỐI",
};

const VERIFICATION_LABEL = {
  BASIC: "CƠ BẢN",
  ADVANCED: "NÂNG CAO",
  VERIFIED: "XÁC THỰC",
};

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [detailCompany, setDetailCompany] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmBulk, askBulkConfirm, resetBulkConfirm] = useConfirm();

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
      const res = await adminCompanyService.exportCompanies();
      downloadBlob(res, "companies_list.xlsx");
      toast.success("Xuất danh sách công ty thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toast.error("Không thể xuất file Excel.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await adminCompanyService.downloadTemplate();
      downloadBlob(res, "company_import_template.xlsx");
    } catch (error) {
      console.error("Lỗi tải template:", error);
      toast.error("Không thể tải file mẫu.");
    }
  };

  const handleImportExcel = async (file) => {
    await adminCompanyService.importCompanies(file);
    fetchCompanies();
  };
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, search, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size,
        keyword: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      };
      const data = await adminCompanyService.getCompanies(params);
      setCompanies(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách công ty:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        company.name.toLowerCase().includes(q) ||
        String(company.id).toLowerCase().includes(q) ||
        (company.taxCode || "").toLowerCase().includes(q) ||
        (company.companyEmail || "").toLowerCase().includes(q);
      const currentStatus = company.companyInfoUpdateStatus || company.status;
      const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const stats = useMemo(() => ({
    total: totalPages * size || companies.length,
    pending: companies.filter((c) =>
      (c.companyInfoUpdateStatus || c.status) === "PENDING_REVIEW" ||
      (c.companyInfoUpdateStatus || c.status) === "PENDING"
    ).length,
    approved: companies.filter((c) =>
      (c.companyInfoUpdateStatus || c.status) === "APPROVED"
    ).length,
    suspended: companies.filter((c) =>
      (c.companyInfoUpdateStatus || c.status) === "SUSPENDED"
    ).length,
  }), [companies, totalPages, size]);

  const handleAction = (company, action) => {
    setActionDialog({ company, action });
    setActionNote("");
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const confirmAction = async () => {
    if (!actionDialog) return;
    const { company, action } = actionDialog;
    setIsProcessing(true);
    try {
      if (action === "approve") {
        await adminCompanyService.approveCompany(
          company.id,
          company.businessLicenseFileUrl ? "ADVANCED" : "BASIC",
          actionNote
        );
      } else if (action === "approve-info") {
        await adminCompanyService.approveCompanyInfo(company.id, actionNote);
      } else if (action === "approve-documents") {
        await adminCompanyService.approveCompanyDocuments(company.id, actionNote);
      } else if (action === "reject") {
        await adminCompanyService.rejectCompany(company.id, actionNote);
      } else if (action === "reject-info") {
        await adminCompanyService.rejectCompanyInfo(company.id, actionNote);
      } else if (action === "reject-documents") {
        await adminCompanyService.rejectCompanyDocuments(company.id, actionNote);
      } else if (action === "resubmit") {
        await adminCompanyService.requestResubmission(company.id, actionNote);
      } else if (action === "suspend") {
        await adminCompanyService.suspendCompany(company.id, actionNote);
      } else if (action === "unsuspend") {
        await adminCompanyService.unsuspendCompany(company.id);
      } else if (action === "delete") {
        await adminCompanyService.deleteCompany(company.id);
      }
      setActionDialog(null);
      setActionNote("");
      await fetchCompanies();
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi xử lý action công ty:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;
    const actionLabels = { approve: 'duyệt', reject: 'từ chối', suspend: 'đình chỉ', delete: 'xóa' };
    const actionVariants = { approve: 'info', reject: 'warning', suspend: 'warning', delete: 'danger' };
    askBulkConfirm({
      title: `${actionLabels[action]?.charAt(0).toUpperCase() + actionLabels[action]?.slice(1)} hàng loạt`,
      message: `Bạn có chắc muốn ${actionLabels[action]} ${selectedIds.length} công ty đã chọn?`,
      warning: action === 'delete' ? 'Hành động này không thể hoàn tác.' : undefined,
      confirmText: actionLabels[action]?.charAt(0).toUpperCase() + actionLabels[action]?.slice(1),
      variant: actionVariants[action],
      onConfirm: async () => {
        resetBulkConfirm();
        try {
          setLoading(true);
          if (action === 'approve') await adminCompanyService.bulkApprove(selectedIds, "BASIC", "Duyệt hàng loạt");
          else if (action === 'reject') await adminCompanyService.bulkReject(selectedIds, "Từ chối hàng loạt");
          else if (action === 'suspend') await adminCompanyService.bulkSuspend(selectedIds, "Đình chỉ hàng loạt");
          else if (action === 'delete') await adminCompanyService.bulkDelete(selectedIds);
          toast.success(`Đã thực hiện ${actionLabels[action]} cho ${selectedIds.length} mục`);
          setSelectedIds([]);
          fetchCompanies();
        } catch (error) {
          console.error("Bulk action error:", error);
          toast.error("Thao tác hàng loạt thất bại");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // ── Cấu hình columns cho DataTable ──
  const columns = [
    { key: "id", label: "Mã công ty", render: (c) => <span className="font-medium text-slate-500">{c.id}</span> },
    {
      key: "logo", label: "Logo", className: "w-20",
      render: (c) => (
        <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <FaBuilding className="h-5 w-5" />
            </div>
          )}
        </div>
      ),
    },
    { key: "name", label: "Tên công ty", render: (c) => <span className="font-bold text-slate-700">{c.name || "N/A"}</span> },
    {
      key: "verification", label: "Xác thực",
      render: (c) => (
        <Badge variant={VERIFICATION_COLOR[c.verificationLevel || c.verificationStatus] || "default"}>
          {VERIFICATION_LABEL[c.verificationLevel] || c.verificationLevel || "CƠ BẢN"}
        </Badge>
      ),
    },
    {
      key: "infoStatus", label: "T.Thái Thông Tin", className: "whitespace-nowrap", cellClassName: "whitespace-nowrap",
      render: (c) => (
        <Badge variant={STATUS_COLOR[c.companyInfoUpdateStatus] || "default"}>
          {STATUS_LABEL[c.companyInfoUpdateStatus] || c.companyInfoUpdateStatus || "CHƯA XÁC ĐỊNH"}
        </Badge>
      ),
    },
    {
      key: "docStatus", label: "T.Thái Giấy Tờ", className: "whitespace-nowrap", cellClassName: "whitespace-nowrap",
      render: (c) => (
        <Badge variant={STATUS_COLOR[c.documentReviewStatus] || "default"}>
          {DOC_LABEL[c.documentReviewStatus] || c.documentReviewStatus || "THIẾU"}
        </Badge>
      ),
    },
    {
      key: "active", label: "Hoạt động", className: "w-32 whitespace-nowrap", cellClassName: "whitespace-nowrap",
      render: (c) => c.active
        ? <Badge variant="success">Hoạt động</Badge>
        : <Badge variant="danger">Khóa</Badge>,
    },
    {
      key: "lastUpdate", label: "Ngày cập nhật",
      render: (c) => <span className="text-slate-500 text-xs whitespace-nowrap">{c.lastUpdateRequestDate || "---"}</span>,
    },
    {
      key: "actions", label: "Trạng thái", className: "text-right", cellClassName: "text-right",
      render: (c) => (
        <RowActionMenu
          company={c}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onViewDetail={async (company) => {
            try {
              const [detail, logs] = await Promise.all([
                adminCompanyService.getCompanyDetail(company.id),
                adminCompanyService.getCompanyAuditLogs(company.id),
              ]);
              detail.reviewHistory = logs || [];
              setDetailCompany(detail);
            } catch (error) {
              console.error("Lỗi lấy chi tiết công ty:", error);
            }
          }}
          onAction={handleAction}
        />
      ),
    },
  ];

  const bulkActions = [
    { key: "approve", label: "Duyệt",   icon: <FaCheckCircle className="h-4 w-4" />, variant: "success", onClick: () => handleBulkAction("approve") },
    { key: "reject",  label: "Từ chối", icon: <FaTimesCircle className="h-4 w-4" />, variant: "warning", onClick: () => handleBulkAction("reject")  },
    { key: "suspend", label: "Đình chỉ", icon: <FaBan className="h-4 w-4" />,         variant: "slate",   onClick: () => handleBulkAction("suspend") },
    { key: "delete",  label: "Xóa",     icon: <FaTrashAlt className="h-4 w-4" />,    variant: "danger",  onClick: () => handleBulkAction("delete")  },
  ];

  return (
    <div className="space-y-6 pb-60">
      {isProcessing && <GlobalLoading fullScreen={true} message="Đang xử lý tác vụ..." />}

      <PageHeader
        title="Quản lý Công ty"
        description="Duyệt hồ sơ đăng ký doanh nghiệp và quản lý trạng thái hoạt động."
      >
        <Button
          variant="outline"
          className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
          onClick={() => setShowImportModal(true)}
        >
          <FaUpload className="h-4 w-4 text-slate-500" /> Nhập Excel
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-[#1967D2] text-[#1967D2] hover:bg-blue-50"
          onClick={handleExportExcel}
        >
          <FaDownload className="h-4 w-4" /> Xuất Excel
        </Button>
        <Button className="bg-[#1967D2] hover:bg-[#1452A8]">
          <FaShieldAlt className="mr-2 h-4 w-4" /> Duyệt nhanh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng công ty" value={stats.total} accent="blue" icon={<FaBuilding className="h-5 w-5" />} />
        <StatCard label="Chờ duyệt" value={stats.pending} accent="amber" icon={<FaUsers className="h-5 w-5" />} />
        <StatCard label="Đã duyệt" value={stats.approved} accent="emerald" icon={<FaUserCheck className="h-5 w-5" />} />
        <StatCard label="Bị khóa" value={stats.suspended} accent="red" icon={<FaUserTimes className="h-5 w-5" />} />
      </div>

      <AdminFilterBar>
        <AdminSearchInput
          placeholder="Tìm theo tên công ty, MST, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={adminSelectClass}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING_REVIEW">Chờ duyệt</option>
            <option value="UNDER_REVIEW">Đang review</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="NEEDS_RESUBMISSION">Yêu cầu nộp lại</option>
            <option value="SUSPENDED">Bị đình chỉ</option>
          </select>
          {(search || statusFilter !== "ALL") && (
            <AdminResetButton
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            />
          )}
        </div>
      </AdminFilterBar>

      <DataTable
        columns={columns}
        data={filteredCompanies}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectedChange={setSelectedIds}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <CompanyDetailDialog
        company={detailCompany}
        open={!!detailCompany}
        onClose={() => setDetailCompany(null)}
        onAction={handleAction}
      />

      <ActionDialog
        actionDialog={actionDialog}
        actionNote={actionNote}
        setActionNote={setActionNote}
        onClose={() => setActionDialog(null)}
        onConfirm={confirmAction}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={bulkActions}
      />

      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Nhập công ty từ Excel"
        resourceName="công ty"
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImportExcel}
      />

      <ConfirmModal
        isOpen={confirmBulk.isOpen}
        onClose={resetBulkConfirm}
        onConfirm={confirmBulk.onConfirm}
        title={confirmBulk.title}
        message={confirmBulk.message}
        warning={confirmBulk.warning}
        confirmText={confirmBulk.confirmText}
        variant={confirmBulk.variant}
      />
    </div>
  );
};

export default CompanyManagement;
