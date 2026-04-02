import React, { useEffect, useMemo, useState } from "react";
import adminCompanyService from '../../../services/adminCompanyService';
import {
  Button, Badge, Input, PageHeader, Card, Table, Td, StatsCard, Pagination
} from "../../../components";
import { RowActionMenu } from "../../../components/admin/RowActionMenu";
import { CompanyDetailDialog } from "../../../components/admin/CompanyDetailDialog";
import { ActionDialog } from "../../../components/admin/ActionDialog";
import {
  Building2,
  Users,
  UserCheck,
  UserX,
  FileText,
  ShieldCheck,
  Search
} from "lucide-react";

const AdminCompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [detailCompany, setDetailCompany] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
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
    SUSPENDED: "danger"
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
        company.id.toLowerCase().includes(q) ||
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



  const confirmAction = async () => {
    if (!actionDialog) return;

    const { company, action } = actionDialog;

    try {
      if (action === "approve") {
        await adminCompanyService.approveCompany(
          company.id,
          company.businessLicenseFileUrl ? "ADVANCED" : "BASIC",
          actionNote
        );
      } else if (action === "reject") {
        await adminCompanyService.rejectCompany(company.id, actionNote);
      } else if (action === "resubmit") {
        await adminCompanyService.requestResubmission(company.id, actionNote);
      } else if (action === "suspend") {
        await adminCompanyService.suspendCompany(company.id, actionNote);
      } else if (action === "unsuspend") {
        await adminCompanyService.unsuspendCompany(company.id);
      }

      setActionDialog(null);
      setActionNote("");
      fetchCompanies();
    } catch (error) {
      console.error("Lỗi xử lý action công ty:", error);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Công ty"
        description="Duyệt hồ sơ đăng ký doanh nghiệp và quản lý trạng thái hoạt động."
      >
        <Button variant="outline">Xuất báo cáo</Button>
        <Button>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Duyệt nhanh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng công ty"
          value={stats.total}
          icon={<Building2 />}
          percentage="12"
          isIncrease={true}
        />
        <StatsCard
          title="Chờ duyệt"
          value={stats.pending}
          icon={<Users />}
          percentage="5"
          isIncrease={true}
        />
        <StatsCard
          title="Đã duyệt"
          value={stats.approved}
          icon={<UserCheck />}
          percentage="8"
          isIncrease={true}
        />
        <StatsCard
          title="Bị khóa"
          value={stats.suspended}
          icon={<UserX />}
          percentage="2"
          isIncrease={false}
        />
      </div>

      <Card className="!p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            <option value="SUSPENDED">Đã suspend</option>
          </select>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden shadow-sm">
        <Table
          headers={[
            { label: "Mã công ty" },
            { label: "Tên công ty" },
            { label: "Mã số thuế" },
            { label: "Người đại diện" },
            { label: "Xác thực" },
            { label: "Trạng thái" },
            { label: "Active" },
            { label: "Ngày cập nhật" },
            { label: "Thao tác", className: "text-right" }
          ]}
        >
          {loading ? (
            <tr>
              <Td colSpan={9} className="text-center py-10">
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                </div>
              </Td>
            </tr>
          ) : filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                <Td className="font-medium text-slate-500">{company.id}</Td>
                <Td className="font-bold text-slate-700">{company.name || "N/A"}</Td>
                <Td>{company.taxCode || company.tax_code || "---"}</Td>
                <Td>{company.representativeName || company.contactName || "---"}</Td>
                <Td>
                  <Badge variant={verificationColorMap[company.verificationLevel || company.verificationStatus] || "default"}>
                    {company.verificationLevel || company.verificationStatus || "BASIC"}
                  </Badge>
                </Td>
                <Td>
                  <Badge variant={statusColorMap[company.companyInfoUpdateStatus || company.status] || "default"}>
                    {company.companyInfoUpdateStatus || company.status || "UNKNOWN"}
                  </Badge>
                </Td>
                <Td>
                  {company.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="danger">Inactive</Badge>
                  )}
                </Td>
                <Td className="text-slate-500 text-xs">{company.lastUpdateRequestDate || "---"}</Td>
                <Td className="text-right">
                  <RowActionMenu
                    company={company}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onViewDetail={async (company) => {
                      try {
                        const detail = await adminCompanyService.getCompanyDetail(company.id);
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
    </div>
  );
};

export default AdminCompanyManagement;
