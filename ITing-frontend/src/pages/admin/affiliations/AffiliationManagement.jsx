import React, { useEffect, useMemo, useState } from "react";
import {
    FaBuilding,
    FaCheck,
    FaTimes,
    FaEye,
    FaUndoAlt,
    FaClock,
    FaCheckCircle,
    FaBan,
    FaExternalLinkAlt,
} from "react-icons/fa";
import {
    Building2, Mail, Phone, Globe, MapPin, Users as UsersIcon,
    FileText, ShieldCheck, CheckCircle2, XCircle, ExternalLink, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
    Pagination,
    Button,
    Card,
    Table,
    Td,
    Dialog,
    Badge,
    PageHeader,
} from "../../../components";
import { StatCard } from "../../../components/admin/StatCard";
import {
    AdminFilterBar, AdminSearchInput, adminSelectClass, AdminResetButton
} from "../../../components/admin/AdminFilterBar";
import { ActionMenuPortal } from "../../../components/admin/ActionMenuPortal";
import adminAffiliationService from "../../../services/adminAffiliationService";
import { getIndustryLabel } from "../../../constants/industries";

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => {
    const map = {
        PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
        INCOMPLETE: "bg-slate-50 text-slate-600 border border-slate-200",
        APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        REJECTED: "bg-red-50 text-red-700 border border-red-200",
        REVOKED: "bg-orange-50 text-orange-700 border border-orange-200",
    };
    const labelMap = {
        PENDING: "Chờ duyệt",
        INCOMPLETE: "Chưa hoàn tất",
        APPROVED: "Đã duyệt",
        REJECTED: "Từ chối",
        REVOKED: "Đã thu hồi",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
            {labelMap[status] || status || "—"}
        </span>
    );
};

const SubmissionBadge = ({ status }) => {
    const map = {
        PENDING_REVIEW: "bg-amber-50 text-amber-700 border border-amber-200",
        APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        REJECTED: "bg-red-50 text-red-700 border border-red-200",
        NOT_SUBMITTED: "bg-slate-50 text-slate-500 border border-slate-200",
    };
    const labelMap = {
        PENDING_REVIEW: "Chờ duyệt hồ sơ",
        APPROVED: "Hồ sơ đã duyệt",
        REJECTED: "Hồ sơ bị từ chối",
        NOT_SUBMITTED: "Chưa nộp",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
            {labelMap[status] || status || "—"}
        </span>
    );
};

const RowActionMenu = ({ aff, openMenuId, setOpenMenuId, onAction, onViewDetail }) => {
    const actions = [
        {
            label: "Xem chi tiết",
            icon: FaEye,
            onClick: () => onViewDetail(aff),
            className: "text-slate-700 font-medium",
        },
        {
            label: "Duyệt xác thực",
            icon: FaCheck,
            onClick: () => onAction(aff, "approve"),
            className: "text-emerald-600 font-medium",
            hidden: aff.status !== "PENDING",
        },
        {
            label: "Từ chối xác thực",
            icon: FaTimes,
            onClick: () => onAction(aff, "reject"),
            className: "text-red-600 font-medium",
            hidden: aff.status !== "PENDING",
        },
        {
            label: "Duyệt hồ sơ",
            icon: FaCheckCircle,
            onClick: () => onAction(aff, "approve-submission"),
            className: "text-blue-600 font-medium",
            hidden: aff.submissionStatus !== "PENDING_REVIEW",
        },
        {
            label: "Từ chối hồ sơ",
            icon: FaBan,
            onClick: () => onAction(aff, "reject-submission"),
            className: "text-orange-600 font-medium",
            hidden: aff.submissionStatus !== "PENDING_REVIEW",
        },
        {
            label: "Thu hồi xác thực",
            icon: FaUndoAlt,
            onClick: () => onAction(aff, "revoke"),
            className: "text-orange-600 font-medium border-t border-slate-50",
            hidden: aff.status !== "APPROVED",
        },
    ];

    return (
        <ActionMenuPortal
            id={aff.id}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            actions={actions}
        />
    );
};

const ActionDialog = ({ actionDialog, actionNote, setActionNote, onClose, onConfirm }) => {
    if (!actionDialog?.aff || !actionDialog?.action) return null;

    const { aff, action } = actionDialog;

    const actionConfig = {
        approve: {
            title: "Duyệt xác thực",
            buttonText: "Xác nhận duyệt",
            buttonClass: "bg-emerald-500 hover:bg-emerald-600 text-white",
            description: `Xác thực HR "${aff.hrEmail}" thuộc công ty "${aff.companyName}". Sau khi duyệt, HR có quyền quản lý công ty.`,
            needReason: false,
        },
        reject: {
            title: "Từ chối xác thực",
            buttonText: "Xác nhận từ chối",
            buttonClass: "bg-red-500 hover:bg-red-600 text-white",
            description: `Từ chối đơn xác thực của HR "${aff.hrEmail}" với công ty "${aff.companyName}".`,
            needReason: true,
        },
        "approve-submission": {
            title: "Duyệt hồ sơ công ty",
            buttonText: "Duyệt hồ sơ",
            buttonClass: "bg-blue-500 hover:bg-blue-600 text-white",
            description: `Duyệt hồ sơ (thông tin + giấy tờ) của công ty "${aff.companyName}". Dữ liệu snapshot sẽ được áp lên Company.`,
            needReason: false,
        },
        "reject-submission": {
            title: "Từ chối hồ sơ",
            buttonText: "Từ chối hồ sơ",
            buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
            description: `Từ chối hồ sơ công ty "${aff.companyName}". HR sẽ cần chỉnh sửa và nộp lại.`,
            needReason: true,
        },
        revoke: {
            title: "Thu hồi xác thực",
            buttonText: "Thu hồi",
            buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
            description: `Thu hồi quyền xác thực của HR "${aff.hrEmail}" với công ty "${aff.companyName}".`,
            needReason: true,
        },
    };

    const config = actionConfig[action];

    return (
        <Dialog open={!!actionDialog} onClose={onClose} title={config.title}>
            <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <div>Công ty: <span className="font-semibold text-slate-800">{aff.companyName}</span></div>
                    <div className="mt-1 text-xs text-slate-500">HR: {aff.hrEmail}</div>
                </div>

                <div>
                    <p className="text-sm text-slate-600">{config.description}</p>
                </div>

                {config.needReason && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Lý do <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            placeholder="Nhập lý do..."
                            className="min-h-[110px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        className={config.buttonClass}
                        onClick={onConfirm}
                        disabled={config.needReason && !actionNote.trim()}
                    >
                        {config.buttonText}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

/* ─── Detail Dialog: 3 tầng thông tin ─── */
const AffiliationDetailDialog = ({ aff, open, onClose }) => {
    const [licenseUrl, setLicenseUrl] = useState(null);
    const [consentUrl, setConsentUrl] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!aff?.id || !open) return;
        let cancelled = false;
        const fetch = async () => {
            setLoading(true);
            try {
                const [lic, con, logo] = await Promise.allSettled([
                    adminAffiliationService.getLicenseViewUrl(aff.id).catch(() => null),
                    adminAffiliationService.getConsentViewUrl(aff.id).catch(() => null),
                    aff.logoPreviewUrl ? Promise.resolve({ url: aff.logoPreviewUrl }) : Promise.resolve(null),
                ]);
                if (!cancelled) {
                    setLicenseUrl(lic.value?.url || aff.licensePreviewUrl || null);
                    setConsentUrl(con.value?.url || aff.consentPreviewUrl || null);
                    setLogoUrl(logo.value?.url || aff.companyLogoUrl || null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetch();
        return () => { cancelled = true; };
    }, [aff?.id, open]);

    if (!aff) return null;

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-2 text-sm">
            <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-slate-500 shrink-0">{label}:</span>
            <span className="font-medium text-slate-800 break-all">{value || "—"}</span>
        </div>
    );

    const DocSection = ({ title, hasDoc, previewUrl, docLabel }) => (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#3AB4E6]" />
                    {title}
                </h5>
                {hasDoc ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Đã nộp
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Chưa nộp
                    </span>
                )}
            </div>
            {previewUrl ? (
                <div className="space-y-2">
                    {previewUrl.toLowerCase().includes('.pdf') || previewUrl.includes('pdf') ? (
                        <iframe src={previewUrl} className="w-full rounded-lg border border-slate-200" style={{ height: '280px' }} title={title} />
                    ) : previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp)/) ? (
                        <img src={previewUrl} alt={title} className="w-full rounded-lg border border-slate-200 max-h-[280px] object-contain bg-white" />
                    ) : (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-600">
                            <FileText className="h-4 w-4" />
                            <span>Tệp đã tải lên ({docLabel})</span>
                        </div>
                    )}
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3AB4E6] hover:underline">
                        <ExternalLink className="h-3 w-3" /> Mở trong tab mới
                    </a>
                </div>
            ) : !hasDoc ? (
                <p className="text-xs text-slate-400 italic">HR chưa tải lên tài liệu này.</p>
            ) : loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải preview...
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic">Không thể tải preview. Thử lại sau.</p>
            )}
        </div>
    );

    return (
        <Dialog open={open} onClose={onClose} title="Chi tiết đơn xác thực">
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
                {/* ─── Tầng 1: Thông tin công ty ─── */}
                <div>
                    <h4 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Thông tin công ty (Snapshot HR nộp)
                    </h4>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2.5">
                        <div className="flex items-center gap-3 mb-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt="" className="h-12 w-12 rounded-xl border border-slate-200 object-cover" />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-lg font-bold text-slate-400">
                                    {aff.submittedName?.charAt(0) || aff.companyName?.charAt(0) || "?"}
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-slate-800">{aff.submittedName || aff.companyName || "—"}</p>
                                <p className="text-xs text-slate-400">MST: {aff.companyTaxCode || "—"}</p>
                            </div>
                        </div>
                        <InfoRow icon={Mail} label="Email" value={aff.submittedCompanyEmail} />
                        <InfoRow icon={Phone} label="Điện thoại" value={aff.submittedPhone} />
                        <InfoRow icon={Globe} label="Website" value={aff.submittedWebsite} />
                        <InfoRow icon={MapPin} label="Địa chỉ" value={aff.submittedAddress} />
                        <InfoRow icon={UsersIcon} label="Quy mô" value={aff.submittedCompanySize} />
                        {aff.submittedIndustries?.length > 0 && (
                            <div className="flex items-start gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                <span className="text-slate-500 shrink-0">Ngành:</span>
                                <div className="flex flex-wrap gap-1">
                                    {aff.submittedIndustries.map((ind, i) => (
                                        <Badge key={i} variant="info" className="px-2 py-0.5 text-[10px] uppercase font-bold">
                                            {getIndustryLabel(ind)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {aff.submittedDescription && (
                            <div className="mt-2">
                                <p className="text-xs text-slate-500 font-medium mb-1">Mô tả:</p>
                                <p className="text-xs text-slate-600 bg-white rounded-lg border border-slate-100 p-2 leading-relaxed max-h-24 overflow-y-auto">
                                    {aff.submittedDescription}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Tầng 2: Giấy đăng ký doanh nghiệp ─── */}
                <div>
                    <h4 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Giấy đăng ký doanh nghiệp
                    </h4>
                    <DocSection
                        title="Giấy phép kinh doanh / ĐKDN"
                        hasDoc={aff.hasLicense}
                        previewUrl={licenseUrl}
                        docLabel="Giấy phép"
                    />
                </div>

                {/* ─── Tầng 3: Thỏa thuận xử lý DLCN ─── */}
                <div>
                    <h4 className="text-sm font-semibold text-violet-600 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Thỏa thuận xử lý Dữ liệu cá nhân
                    </h4>
                    <DocSection
                        title="Văn bản thỏa thuận DLCN (NĐ 13)"
                        hasDoc={aff.hasConsent}
                        previewUrl={consentUrl}
                        docLabel="Thỏa thuận"
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Cam đoan hợp lệ:</span>
                        {aff.submittedConsentConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Đã cam đoan
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                <XCircle className="h-3.5 w-3.5" /> Chưa cam đoan
                            </span>
                        )}
                    </div>
                </div>

                {/* ─── HR + Trạng thái ─── */}
                <div className="border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoRow icon={UsersIcon} label="HR" value={aff.hrFullName || aff.hrEmail} />
                        <InfoRow icon={Mail} label="Email HR" value={aff.hrEmail} />
                        <div className="flex items-center gap-2 text-sm">
                            <ShieldCheck className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-500">Xác thực:</span>
                            <StatusBadge status={aff.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-500">Hồ sơ:</span>
                            <SubmissionBadge status={aff.submissionStatus} />
                        </div>
                    </div>
                    {aff.rejectedReason && (
                        <div className="mt-3 text-xs text-red-500 italic bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            Lý do từ chối: {aff.rejectedReason}
                        </div>
                    )}
                    {aff.submissionRejectReason && (
                        <div className="mt-2 text-xs text-orange-500 italic bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                            Lý do từ chối hồ sơ: {aff.submissionRejectReason}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

const AffiliationManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [affiliations, setAffiliations] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [searchInput, setSearchInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [submissionFilter, setSubmissionFilter] = useState("all");

    const [actionDialog, setActionDialog] = useState(null);
    const [actionNote, setActionNote] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [detailAff, setDetailAff] = useState(null);

    const fetchData = async () => {
        try {
            const params = {
                page: currentPage - 1,
                size: PAGE_SIZE,
                sort: "id,desc",
            };
            if (keyword?.trim()) params.hrEmail = keyword.trim();
            if (statusFilter !== "all") params.status = statusFilter;
            if (submissionFilter !== "all") params.submissionStatus = submissionFilter;

            const res = await adminAffiliationService.list(params);
            setAffiliations(res?.content || []);
            setTotalElements(res?.totalElements || 0);
            setTotalPages(res?.totalPages || 1);
        } catch (error) {
            console.error("Error fetching affiliations:", error);
            setAffiliations([]);
            setTotalElements(0);
            setTotalPages(1);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, keyword, statusFilter, submissionFilter]);

    const handleSearch = () => {
        setCurrentPage(1);
        setKeyword(searchInput);
    };

    const handleResetFilter = () => {
        setSearchInput("");
        setKeyword("");
        setStatusFilter("all");
        setSubmissionFilter("all");
        setCurrentPage(1);
    };

    const handleAction = (aff, action) => {
        setActionDialog({ aff, action });
        setActionNote("");
    };

    const confirmAction = async () => {
        if (!actionDialog?.aff || !actionDialog?.action) return;
        try {
            const { aff, action } = actionDialog;

            if (action === "approve") {
                await adminAffiliationService.approve(aff.id);
            } else if (action === "reject") {
                await adminAffiliationService.reject(aff.id, actionNote.trim() || "Không đạt yêu cầu");
            } else if (action === "approve-submission") {
                await adminAffiliationService.approve(aff.id);
            } else if (action === "reject-submission") {
                await adminAffiliationService.reject(aff.id, actionNote.trim() || "Hồ sơ không đạt");
            } else if (action === "revoke") {
                await adminAffiliationService.revoke(aff.id, actionNote.trim() || "Vi phạm quy định");
            }

            setActionDialog(null);
            setActionNote("");
            fetchData();
            toast.success("Thao tác thành công!");
        } catch (error) {
            console.error("Error handling action:", error);
            toast.error("Thao tác thất bại!");
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const stats = useMemo(() => {
        return {
            pendingCount: affiliations.filter((a) => a.status === "PENDING").length,
            approvedCount: affiliations.filter((a) => a.status === "APPROVED").length,
            rejectedCount: affiliations.filter((a) => a.status === "REJECTED" || a.status === "REVOKED").length,
            pendingSubmission: affiliations.filter((a) => a.submissionStatus === "PENDING_REVIEW").length,
        };
    }, [affiliations]);

    return (
        <div className="space-y-6 pb-60">
            {/* Header */}
            <PageHeader
                title="Duyệt đơn xác thực công ty"
                description={`Tổng cộng ${totalElements} đơn · ${stats.pendingCount} chờ duyệt · ${stats.pendingSubmission} hồ sơ chờ`}
            />

            {/* KPI cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Tổng đơn" value={totalElements} accent="blue" icon={<FaBuilding className="h-5 w-5" />} />
                <StatCard label="Chờ duyệt" value={stats.pendingCount} accent="amber" icon={<FaClock className="h-5 w-5" />} />
                <StatCard label="Đã duyệt" value={stats.approvedCount} accent="emerald" icon={<FaCheckCircle className="h-5 w-5" />} />
                <StatCard label="Từ chối / Thu hồi" value={stats.rejectedCount} accent="red" icon={<FaBan className="h-5 w-5" />} />
            </div>

            {/* Filters */}
            <AdminFilterBar>
                <AdminSearchInput
                    placeholder="Tìm theo email HR..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        className={adminSelectClass}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                        <option value="REVOKED">Đã thu hồi</option>
                        <option value="INCOMPLETE">Chưa hoàn tất</option>
                    </select>

                    <select
                        className={adminSelectClass}
                        value={submissionFilter}
                        onChange={(e) => {
                            setSubmissionFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Tất cả hồ sơ</option>
                        <option value="PENDING_REVIEW">Hồ sơ chờ duyệt</option>
                        <option value="APPROVED">Hồ sơ đã duyệt</option>
                        <option value="REJECTED">Hồ sơ từ chối</option>
                    </select>

                    <Button className="h-10 rounded-full bg-[#3AB4E6] hover:bg-[#2C9ACD]" onClick={handleSearch}>
                        Tìm kiếm
                    </Button>

                    <AdminResetButton onClick={handleResetFilter} />
                </div>
            </AdminFilterBar>

            {/* Table */}
            <Card className="border border-slate-100 shadow-sm !p-0">
                <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                    <FaBuilding className="text-[#3AB4E6]" />
                    <span className="font-semibold text-slate-800">Danh sách đơn xác thực</span>
                </div>

                <Table
                    headers={[
                        { label: "Mã", className: "w-16" },
                        { label: "HR" },
                        { label: "Công ty" },
                        { label: "Trạng thái", className: "w-36 whitespace-nowrap" },
                        { label: "Hồ sơ", className: "w-40 whitespace-nowrap" },
                        { label: "Ngày yêu cầu", className: "w-44 whitespace-nowrap" },
                        { label: "Thao tác", className: "text-right w-36" },
                    ]}
                >
                    {affiliations.length === 0 ? (
                        <tr>
                            <Td colSpan={7} className="py-10 text-center text-slate-500">
                                Không tìm thấy đơn xác thực nào
                            </Td>
                        </tr>
                    ) : (
                        affiliations.map((aff) => (
                            <tr
                                key={aff.id}
                                className="transition-colors hover:bg-slate-50/60"
                            >
                                <Td className="font-mono text-xs text-slate-500">#{aff.id}</Td>

                                <Td>
                                    <div>
                                        <p className="font-semibold text-slate-800">{aff.hrFullName || "—"}</p>
                                        <p className="text-xs text-slate-500">{aff.hrEmail}</p>
                                    </div>
                                </Td>

                                <Td>
                                    <div className="flex items-center gap-2">
                                        {aff.companyLogoUrl ? (
                                            <img
                                                src={aff.companyLogoUrl}
                                                alt={aff.companyName}
                                                className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400">
                                                {aff.companyName?.charAt(0) || "?"}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{aff.companyName || "—"}</p>
                                            {aff.companyTaxCode && (
                                                <p className="text-[10px] text-slate-400">MST: {aff.companyTaxCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </Td>

                                <Td className="whitespace-nowrap">
                                    <StatusBadge status={aff.status} />
                                </Td>

                                <Td className="whitespace-nowrap">
                                    <SubmissionBadge status={aff.submissionStatus} />
                                </Td>

                                <Td className="text-sm text-slate-500 whitespace-nowrap">
                                    {formatDateTime(aff.requestedAt)}
                                </Td>

                                <Td className="text-right">
                                    <RowActionMenu
                                        aff={aff}
                                        openMenuId={openMenuId}
                                        setOpenMenuId={setOpenMenuId}
                                        onAction={handleAction}
                                        onViewDetail={(a) => setDetailAff(a)}
                                    />
                                </Td>
                            </tr>
                        ))
                    )}
                </Table>

                <Pagination
                    totalItems={totalElements}
                    itemsPerPage={PAGE_SIZE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <ActionDialog
                actionDialog={actionDialog}
                actionNote={actionNote}
                setActionNote={setActionNote}
                onClose={() => {
                    setActionDialog(null);
                    setActionNote("");
                }}
                onConfirm={confirmAction}
            />

            <AffiliationDetailDialog
                aff={detailAff}
                open={!!detailAff}
                onClose={() => setDetailAff(null)}
            />
        </div>
    );
};

export default AffiliationManagement;
