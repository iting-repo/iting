import React, { useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  ShieldCheck,
} from "lucide-react";

export const RowActionMenu = ({ company, onViewDetail, onAction, openMenuId, setOpenMenuId }) => {
  const menuRef = useRef(null);
  
  // 'company' here can be either a company or a job object
  const id = company.id;
  const status = company.status || company.companyInfoUpdateStatus;
  const isOpen = openMenuId === id;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, setOpenMenuId]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isOpen ? null : id);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[200] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
              requestAnimationFrame(() => {
                onViewDetail(company);
              });
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Xem chi tiết
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
              requestAnimationFrame(() => {
                onAction(company, "approve");
              });
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-emerald-600 hover:bg-slate-50 transition-colors font-medium"
          >
            <CheckCircle2 className="h-4 w-4" />
            Phê duyệt (Approve)
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
              requestAnimationFrame(() => {
                onAction(company, "reject");
              });
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500 hover:bg-slate-50 transition-colors font-medium"
          >
            <XCircle className="h-4 w-4" />
            Từ chối (Reject)
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
              requestAnimationFrame(() => {
                onAction(company, "resubmit");
              });
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-blue-500 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Yêu cầu nộp lại / Chỉnh sửa
          </button>

          {status === "SUSPENDED" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(null);
                requestAnimationFrame(() => {
                  onAction(company, "unsuspend");
                });
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Kích hoạt lại (Unsuspend)
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(null);
                requestAnimationFrame(() => {
                  onAction(company, "suspend");
                });
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-orange-600 hover:bg-slate-50 transition-colors"
            >
              <Ban className="h-4 w-4" />
              Đình chỉ (Suspend)
            </button>
          )}
        </div>
      )}
    </div>
  );
};
