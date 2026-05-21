import React from "react";
import {
  Building2,
  Mail,
  Phone,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Dialog, Badge, Button } from "../common";
import { getIndustryLabel } from "../../constants/industries";
import adminCompanyService from "../../services/adminCompanyService";
import { toast } from "sonner";

export const CompanyDetailDialog = ({ company, open, onClose, onAction }) => {
  const [showLicensePreview, setShowLicensePreview] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [previewTitle, setPreviewTitle] = React.useState("");
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  if (!company) return null;

  const SAMPLE_URLS = {
    license: "/doanhnghieptunhan (1).pdf",
    consent: "/[EXIMBANK] Thoa thuan bao mat và XLDL theo ND13.pdf",
  };

  const handleViewDoc = async (type) => {
    setPreviewTitle(type === "license" ? "Giấy phép kinh doanh" : "Văn bản thỏa thuận dữ liệu");

    // Try real presigned URL first if company has uploaded
    const hasUploaded = type === "license"
      ? !!company.businessLicenseFileUrl
      : !!company.consentDocumentFileUrl;

    if (hasUploaded) {
      try {
        setLoadingPreview(true);
        const res = type === "license"
          ? await adminCompanyService.getBusinessLicenseViewUrl(company.id)
          : await adminCompanyService.getConsentDocumentViewUrl(company.id);
        setPreviewUrl(res?.url || SAMPLE_URLS[type]);
        setShowLicensePreview(true);
        return;
      } catch {
        // Fall through to sample
      } finally {
        setLoadingPreview(false);
      }
    }

    // Fallback: show sample template PDF
    setPreviewUrl(SAMPLE_URLS[type]);
    setShowLicensePreview(true);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Chi tiết công ty">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-semibold">
              <Building2 className="h-5 w-5 text-blue-600" />
              {company.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {(company.industries || []).map((industry, index) => (
                <Badge key={index} variant="info" className="px-2 py-0.5 text-[10px] uppercase font-bold">
                  {getIndustryLabel(industry)}
                </Badge>
              ))}
              <span className="text-sm text-slate-500 ml-1">· {company.companySize}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge>{company.companyInfoUpdateStatus}</Badge>
            <Badge>{company.verificationLevel}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            {company.companyEmail}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-slate-400" />
            {company.representativePhone || company.phone || "---"}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            {company.representativeName || "---"}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-slate-400" />
            MST: {company.taxCode || "---"}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Mô tả</h4>
          <p className="text-sm text-slate-500">{company.description || "Chưa có mô tả"}</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-blue-600">Checklist duyệt thông tin</h4>
          <div className="space-y-2">
            {[
              { label: "Tên công ty", ok: !!company.name },
              { label: "Email công ty", ok: !!company.companyEmail },
              { label: "Số điện thoại", ok: !!(company.representativePhone || company.phone) },
              { label: "Người đại diện", ok: !!company.representativeName },
              { label: "Mã số thuế", ok: !!company.taxCode && company.taxCode !== "0000000000" },
              { label: "Tài khoản đang hoạt động", ok: company.active },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                <span className={item.ok ? "text-slate-700" : "text-red-500"}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
             <Button
                className="h-8 text-xs"
                onClick={() => onAction(company, "approve-info")}
                disabled={company.companyInfoUpdateStatus === "APPROVED"}
              >
                Duyệt thông tin
              </Button>
              <Button
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => onAction(company, "reject-info")}
                disabled={company.companyInfoUpdateStatus === "REJECTED"}
              >
                Từ chối thông tin
              </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-sm font-semibold text-emerald-600">Checklist duyệt giấy tờ</h4>

          {/* License Row */}
          <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm">
                {company.businessLicenseFileUrl
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                <span className={company.businessLicenseFileUrl ? "font-medium text-slate-700" : "text-red-500"}>
                  Giấy phép kinh doanh
                </span>
                {!company.businessLicenseFileUrl && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">Chưa nộp</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Sample template button - always visible */}
                <button
                  type="button"
                  onClick={() => handleViewDoc("license")}
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-50 border border-violet-200 px-2.5 py-1 text-[11px] font-bold text-violet-600 transition-colors hover:bg-violet-100"
                >
                  <Eye className="h-3 w-3" />
                  Xem mẫu
                </button>
                {/* Uploaded doc button - only when company has uploaded */}
                {company.businessLicenseFileUrl && (
                  <button
                    type="button"
                    onClick={() => handleViewDoc("license")}
                    disabled={loadingPreview}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                  >
                    {loadingPreview ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                    Xem đã nộp
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Consent Row */}
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm">
                {company.consentDocumentFileUrl
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                <span className={company.consentDocumentFileUrl ? "font-medium text-slate-700" : "text-red-500"}>
                  Giấy thỏa thuận dữ liệu (NĐ 13)
                </span>
                {!company.consentDocumentFileUrl && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">Chưa nộp</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Sample template button - always visible */}
                <button
                  type="button"
                  onClick={() => handleViewDoc("consent")}
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-50 border border-violet-200 px-2.5 py-1 text-[11px] font-bold text-violet-600 transition-colors hover:bg-violet-100"
                >
                  <Eye className="h-3 w-3" />
                  Xem mẫu
                </button>
                {/* Uploaded doc button */}
                {company.consentDocumentFileUrl && (
                  <button
                    type="button"
                    onClick={() => handleViewDoc("consent")}
                    disabled={loadingPreview}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                  >
                    {loadingPreview ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                    Xem đã nộp
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 flex gap-2">
             <Button
                className="h-8 text-xs"
                onClick={() => onAction(company, "approve-documents")}
                disabled={company.documentReviewStatus === "APPROVED"}
              >
                Duyệt giấy tờ
              </Button>
              <Button
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => onAction(company, "reject-documents")}
                disabled={company.documentReviewStatus === "REJECTED"}
              >
                Từ chối giấy tờ
              </Button>
          </div>
        </div>


        {(company.companyInfoUpdateStatus === "PENDING_REVIEW" || company.companyInfoUpdateStatus === "UNDER_REVIEW") && (
          <div className="flex gap-2 border-t border-slate-200 pt-3">
            <Button
              className="flex-1"
              onClick={() => {
                onClose();
                onAction(company, "approve");
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Duyệt
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                onClose();
                onAction(company, "reject");
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClose();
                onAction(company, "resubmit");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Yêu cầu nộp lại
            </Button>
          </div>
        )}

        {/* Lịch sử duyệt */}
        {company.reviewHistory && company.reviewHistory.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold mb-4 text-slate-800">Lịch sử duyệt</h4>
            <div className="space-y-6 border-l-2 border-slate-100 ml-3 pl-6">
              {company.reviewHistory.map((entry, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">{entry.action}</p>
                    <time className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      {new Date(entry.time).toLocaleString('vi-VN')}
                    </time>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thực hiện bởi: <span className="font-medium text-slate-700">{entry.actor || "Hệ thống"}</span>
                  </p>
                  {(entry.note || entry.reason) && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl italic">
                      {entry.note || entry.reason}
                    </div>
                  )}
                  {entry.fromStatus && entry.toStatus && (
                    <p className="text-[10px] mt-2 text-slate-400">
                       Thay đổi trạng thái: <span className="text-slate-500 font-medium">{entry.fromStatus}</span> → <span className="text-slate-600 font-bold">{entry.toStatus}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <Dialog
        open={showLicensePreview}
        onClose={() => { setShowLicensePreview(false); setPreviewUrl(null); }}
        title={previewTitle}
      >
        <div className="flex flex-col items-center">
          {previewUrl ? (
            <div className="w-full">
              {previewUrl.includes('.pdf') || previewUrl.includes('pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full rounded-lg border border-slate-200"
                  style={{ height: '70vh' }}
                  title={previewTitle}
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={previewTitle}
                  className="w-full rounded-lg shadow-lg border border-slate-200"
                />
              )}
              <div className="mt-4 flex justify-center gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mở tab mới
                </a>
                <Button variant="outline" onClick={() => { setShowLicensePreview(false); setPreviewUrl(null); }}>
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <XCircle className="mx-auto h-12 w-12 text-slate-200 mb-4" />
              <p className="text-slate-500">Tài liệu không tìm thấy hoặc chưa được tải lên.</p>
            </div>
          )}
        </div>
      </Dialog>
    </Dialog>
  );
};
