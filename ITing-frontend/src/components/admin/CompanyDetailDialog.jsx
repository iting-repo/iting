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
} from "lucide-react";
import { Dialog, Badge, Button } from "../common";
import { getIndustryLabel } from "../../constants/industries";

export const CompanyDetailDialog = ({ company, open, onClose, onAction }) => {
  if (!company) return null;

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
            {company.representativePhone}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            {company.representativeName}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-slate-400" />
            MST: {company.taxCode}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Mô tả</h4>
          <p className="text-sm text-slate-500">{company.description || "Chưa có mô tả"}</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Checklist duyệt</h4>
          <div className="space-y-2">
            {[
              { label: "Tên công ty", ok: !!company.name },
              { label: "Email công ty", ok: !!company.companyEmail },
              { label: "Số điện thoại", ok: !!company.representativePhone },
              { label: "Người đại diện", ok: !!company.representativeName },
              { label: "Mã số thuế", ok: !!company.taxCode && company.taxCode !== "0000000000" },
              { label: "Giấy phép kinh doanh", ok: !!company.businessLicenseFileUrl },
              { label: "Tài khoản active", ok: company.active },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={item.ok ? "text-slate-700" : "text-red-500"}>{item.label}</span>
              </div>
            ))}
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
              Approve
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
              Reject
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
              Resubmit
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
