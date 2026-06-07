import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, Button, Textarea } from "../common";

const ACTION_CONFIG = {
  approve:    { title: "Duyệt công việc",          needsNote: false, noteLabel: "Ghi chú (tuỳ chọn)",       variant: "default"     },
  reject:     { title: "Từ chối công việc",        needsNote: true,  noteLabel: "Lý do từ chối *",           variant: "destructive" },
  revision:   { title: "Yêu cầu chỉnh sửa",       needsNote: true,  noteLabel: "Nội dung cần chỉnh sửa *",  variant: "destructive" },
  suspend:    { title: "Đình chỉ công việc",       needsNote: true,  noteLabel: "Lý do đình chỉ *",          variant: "destructive" },
  unsuspend:  { title: "Bỏ đình chỉ công việc",   needsNote: false, noteLabel: "Ghi chú (tuỳ chọn)",       variant: "default"     },
  close:      { title: "Đóng công việc",           needsNote: false, noteLabel: "Ghi chú (tuỳ chọn)",       variant: "default"     },
  delete:     { title: "Xóa công việc",            needsNote: false, noteLabel: "Ghi chú (tuỳ chọn)",       variant: "destructive" },

  // Company actions
  "approve-info":      { title: "Duyệt thông tin công ty",   needsNote: false, noteLabel: "Ghi chú", variant: "default"     },
  "approve-documents": { title: "Duyệt giấy tờ pháp lý",    needsNote: false, noteLabel: "Ghi chú", variant: "default"     },
  "reject-info":       { title: "Từ chối thông tin công ty", needsNote: true,  noteLabel: "Lý do *", variant: "destructive" },
  "reject-documents":  { title: "Từ chối giấy tờ pháp lý",  needsNote: true,  noteLabel: "Lý do *", variant: "destructive" },
  resubmit:            { title: "Yêu cầu nộp lại",           needsNote: true,  noteLabel: "Lý do *", variant: "destructive" },

  // Affiliation actions (Phase 5/6) — duyệt hồ sơ HR submit qua affiliation snapshot
  "approve-submission":  { title: "Duyệt hồ sơ xác thực",          needsNote: false, noteLabel: "Ghi chú (tuỳ chọn)", variant: "default"     },
  "reject-submission":   { title: "Từ chối hồ sơ xác thực",        needsNote: true,  noteLabel: "Lý do từ chối *",   variant: "destructive" },
  "approve-affiliation": { title: "Duyệt đơn xác thực thuộc công ty", needsNote: false, noteLabel: "Ghi chú (tuỳ chọn)", variant: "default"     },
  "reject-affiliation":  { title: "Từ chối đơn xác thực",           needsNote: true,  noteLabel: "Lý do từ chối *",   variant: "destructive" },
  "revoke-affiliation":  { title: "Thu hồi xác thực",              needsNote: true,  noteLabel: "Lý do thu hồi *",   variant: "destructive" },
};

export const ActionDialog = ({ actionDialog, actionNote, setActionNote, onClose, onConfirm }) => {
  if (!actionDialog) return null;

  const item = actionDialog.company || actionDialog.job;
  const isJob = !!actionDialog.job;
  const cfg = ACTION_CONFIG[actionDialog.action] || { title: "Xử lý", needsNote: false, noteLabel: "Ghi chú", variant: "default" };

  return (
    <Dialog open={!!actionDialog} onClose={onClose} title={cfg.title}>
      <div className="space-y-4">
        {/* Item info */}
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">
            {isJob ? (item.title || item.position) : item.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ID: {item.id}{item.taxCode ? ` · MST: ${item.taxCode}` : ""}
          </p>
        </div>

        {/* Company approve checklist */}
        {!isJob && actionDialog.action === "approve" && (
          <div className="space-y-2 rounded-xl border border-slate-200 p-4">
            {[
              { label: "Có mã số thuế", ok: !!item.taxCode && item.taxCode !== "0000000000" },
              { label: "Có giấy phép kinh doanh", ok: !!item.businessLicenseFileUrl },
              { label: "Tài khoản active", ok: item.active },
              { label: "Trạng thái hợp lệ", ok: item.companyInfoUpdateStatus === "PENDING_REVIEW" || item.companyInfoUpdateStatus === "UNDER_REVIEW" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                {row.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                {row.label}
              </div>
            ))}
          </div>
        )}

        {/* Note/reason textarea */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {cfg.noteLabel}
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
            variant={cfg.variant}
            onClick={onConfirm}
            disabled={cfg.needsNote && !actionNote.trim()}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
