import React, { useEffect, useMemo, useState } from "react";
import adminCompanyService from '../../../services/adminCompanyService';
import {
  Button, Badge, Input, PageHeader, Card, Table, Td, StatsCard, Pagination, GlobalLoading
} from "../../../components";
import { RowActionMenu } from "../../../components/admin/RowActionMenu";
import { CompanyDetailDialog } from "../../../components/admin/CompanyDetailDialog";
import { ActionDialog } from "../../../components/admin/ActionDialog";
import {
  FaBuilding,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaFileAlt,
  FaShieldAlt,
  FaSearch,
  FaDownload,
  FaUpload,
  FaCheckSquare,
  FaTrashAlt,
  FaBan,
  FaTimesCircle,
  FaCheckCircle
} from "react-icons/fa";
import ImportExcelModal from "../../../components/admin/ImportExcelModal";
import { toast } from "sonner";

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

  const isAllSelected = companies.length > 0 && selectedIds.length === companies.length;

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

  const statusColorMap = {
    PENDING_REVIEW: "warning",
    UNDER_REVIEW: "info",
    APPROVED: "success",
    REJECTED: "danger",
    NEEDS_RESUBMISSION: "amber",
    SUSPENDED: "danger",
    MISSING: "slate",
    UPLOADED: "info"
  };

  const verificationColorMap = {
    BASIC: "slate",
    ADVANCED: "emerald",
    VERIFIED: "success"
  };

  useEffect(() => {
    fetchCompanies();
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

      console.log("API response:", data);

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

  const stats = useMemo(() => {
    return {
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
    };
  }, [companies, totalPages, size]);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(companies.map(c => c.id));
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
      setLoading(true);
      if (action === 'approve') {
        await adminCompanyService.bulkApprove(selectedIds, "BASIC", "Duyệt hàng loạt");
      } else if (action === 'reject') {
        await adminCompanyService.bulkReject(selectedIds, "Từ chối hàng loạt");
      } else if (action === 'suspend') {
        await adminCompanyService.bulkSuspend(selectedIds, "Đình chỉ hàng loạt");
      } else if (action === 'delete') {
        await adminCompanyService.bulkDelete(selectedIds);
      }

      toast.success(`Đã thực hiện ${action} cho ${selectedIds.length} mục`);
      setSelectedIds([]);
      fetchCompanies();
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Thao tác hàng loạt thất bại");
    } finally {
      setLoading(false);
    }
  };
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
          <FaUpload className="h-4 w-4 text-slate-500" />
          Nhập Excel
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-[#1967D2] text-[#1967D2] hover:bg-blue-50"
          onClick={handleExportExcel}
        >
          <FaDownload className="h-4 w-4" />
          Xuất Excel
        </Button>
        <Button className="bg-[#1967D2] hover:bg-[#1452A8]">
          <FaShieldAlt className="mr-2 h-4 w-4" />
          Duyệt nhanh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng công ty"
          value={stats.total}
          icon={<FaBuilding />}
          percentage="12"
          isIncrease={true}
        />
        <StatsCard
          title="Chờ duyệt"
          value={stats.pending}
          icon={<FaUsers />}
          percentage="5"
          isIncrease={true}
        />
        <StatsCard
          title="Đã duyệt"
          value={stats.approved}
          icon={<FaUserCheck />}
          percentage="8"
          isIncrease={true}
        />
        <StatsCard
          title="Bị khóa"
          value={stats.suspended}
          icon={<FaUserTimes />}
          percentage="2"
          isIncrease={false}
        />
      </div>

      <Card className="!p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo tên công ty, MST, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING_REVIEW">Chờ duyệt</option>
            <option value="UNDER_REVIEW">Đang review</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="NEEDS_RESUBMISSION">Yêu cầu nộp lại</option>
            <option value="SUSPENDED">Bị đình chỉ</option>
          </select>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden shadow-sm">
        <Table
          headers={[
            {
              label: (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
              ),
              className: "w-10"
            },
            { label: "Mã công ty" },
            { label: "Logo", className: "w-20" },
            { label: "Tên công ty" },
            { label: "Xác thực" },
            { label: "T.Thái Thông Tin", className: "whitespace-nowrap" },
            { label: "T.Thái Giấy Tờ", className: "whitespace-nowrap" },
            { label: "Hoạt động", className: "w-32 whitespace-nowrap" },
            { label: "Ngày cập nhật" },
            { label: "Trạng thái", className: "text-right" }
          ]}
        >
          {loading ? (
            <tr>
              <Td colSpan={10}>
                <GlobalLoading fullScreen={false} message="Đang nạp dữ liệu..." />
              </Td>
            </tr>
          ) : filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <tr
                key={company.id}
                className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(company.id) ? 'bg-sky-50/50' : ''}`}
              >
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(company.id)}
                    onChange={() => handleSelectOne(company.id)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </Td>
                <Td className="font-medium text-slate-500">{company.id}</Td>
                <Td>
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <FaBuilding className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </Td>
                <Td className="font-bold text-slate-700">{company.name || "N/A"}</Td>
                <Td>
                  <Badge variant={verificationColorMap[company.verificationLevel || company.verificationStatus] || "default"}>
                    {company.verificationLevel === "BASIC" ? "CƠ BẢN" : company.verificationLevel === "ADVANCED" ? "NÂNG CAO" : company.verificationLevel || "CƠ BẢN"}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  <Badge variant={statusColorMap[company.companyInfoUpdateStatus] || "default"}>
                    {company.companyInfoUpdateStatus === "PENDING_REVIEW" ? "CHỜ DUYỆT" : 
                     company.companyInfoUpdateStatus === "APPROVED" ? "ĐÃ DUYỆT" :
                     company.companyInfoUpdateStatus === "REJECTED" ? "BỊ TỪ CHỐI" :
                     company.companyInfoUpdateStatus === "SUSPENDED" ? "BỊ ĐÌNH CHỈ" :
                     company.companyInfoUpdateStatus || "CHƯA XÁC ĐỊNH"}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  <Badge variant={statusColorMap[company.documentReviewStatus] || "default"}>
                    {company.documentReviewStatus === "MISSING" ? "THIẾU" :
                     company.documentReviewStatus === "UPLOADED" ? "ĐÃ TẢI LÊN" :
                     company.documentReviewStatus === "PENDING_REVIEW" ? "CHỜ DUYỆT" :
                     company.documentReviewStatus === "APPROVED" ? "ĐÃ DUYỆT" :
                     company.documentReviewStatus === "REJECTED" ? "BỊ TỪ CHỐI" :
                     company.documentReviewStatus || "THIẾU"}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  {company.active ? (
                    <Badge variant="success">Hoạt động</Badge>
                  ) : (
                    <Badge variant="danger">Khóa</Badge>
                  )}
                </Td>
                <Td className="text-slate-500 text-xs whitespace-nowrap">{company.lastUpdateRequestDate || "---"}</Td>
                <Td className="text-right">
                  <RowActionMenu
                    company={company}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onViewDetail={async (company) => {
                      try {
                        const [detail, logs] = await Promise.all([
                          adminCompanyService.getCompanyDetail(company.id),
                          adminCompanyService.getCompanyAuditLogs(company.id)
                        ]);
                        detail.reviewHistory = logs || [];
                        setDetailCompany(detail);
                      } catch (error) {
                        console.error("Lỗi lấy chi tiết công ty:", error);
                      }
                    }}
                    onAction={(company, action) => handleAction(company, action)}
                  />
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan={9} className="text-center py-10 text-slate-400 italic">
                Không tìm thấy dữ liệu phù hợp
              </Td>
            </tr>
          )}
        </Table>

        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />
      </Card>

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
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            >
              <FaCheckCircle className="h-4 w-4" />
              Duyệt
            </button>

            <button
              onClick={() => handleBulkAction('reject')}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-100 transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
            >
              <FaTimesCircle className="h-4 w-4" />
              Từ chối
            </button>

            <button
              onClick={() => handleBulkAction('suspend')}
              className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-100 transition-all hover:bg-slate-800 hover:scale-105 active:scale-95"
            >
              <FaBan className="h-4 w-4" />
              Đình chỉ
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
            >
              <FaTrashAlt className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </div>
      )}

      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Nhập công ty từ Excel"
        resourceName="công ty"
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImportExcel}
      />
    </div>
  );
};

export default CompanyManagement;
