import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, Button, Textarea } from "../common";

export const ActionDialog = ({ actionDialog, actionNote, setActionNote, onClose, onConfirm }) => {
  if (!actionDialog) return null;

  const item = actionDialog.company || actionDialog.job;
  const isJob = !!actionDialog.job;

  const actionTitle = {
    approve: `Duyệt ${isJob ? 'công việc' : 'công ty'}`,
    reject: `Từ chối ${isJob ? 'công việc' : 'công ty'}`,
    resubmit: `Yêu cầu nộp lại`,
    suspend: `Đình chỉ ${isJob ? 'công việc' : 'công ty'}`,
    unsuspend: `Kích hoạt lại`,
  };
  
  return (
    <Dialog open={!!actionDialog} onClose={onClose} title={actionTitle[actionDialog?.action] || "Xử lý hồ sơ"}>
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">{isJob ? item.position : item.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Mã: {item.id} {item.taxCode ? `· MST: ${item.taxCode}` : ""}
          </p>
        </div>

        {!isJob && actionDialog.action === "approve" && (
          <div className="space-y-2 rounded-xl border border-slate-200 p-4">
            {[
              { label: "Có mã số thuế", ok: !!item.taxCode && item.taxCode !== "0000000000" },
              { label: "Có giấy phép kinh doanh", ok: !!item.businessLicenseFileUrl },
              { label: "Tài khoản active", ok: item.active },
              { label: "Trạng thái hợp lệ", ok: item.companyInfoUpdateStatus === "PENDING_REVIEW" || item.companyInfoUpdateStatus === "UNDER_REVIEW" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                {item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                {item.label}
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {actionDialog.action === "reject" ? "Lý do từ chối *" : "Ghi chú"}
          </label>
          <Textarea
            placeholder="Nhập lý do / ghi chú..."
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            variant={actionDialog.action === "reject" || actionDialog.action === "suspend" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={actionDialog.action === "reject" && !actionNote.trim()}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
