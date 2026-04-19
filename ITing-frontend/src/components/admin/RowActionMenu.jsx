import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";

export const RowActionMenu = ({ company, onViewDetail, onAction, openMenuId, setOpenMenuId }) => {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const id = company.id;
  const status = company.status || company.companyInfoUpdateStatus;
  const isOpen = openMenuId === id;

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.right - 224, // 224 = w-56
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, setOpenMenuId]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isOpen ? null : id);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[299]"
            onClick={() => setOpenMenuId(null)}
          />
          <div
            ref={menuRef}
            className="fixed z-[300] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
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
                  onAction(company, "ai-review");
                });
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-blue-600 hover:bg-slate-50 transition-colors font-medium"
            >
              <Sparkles className="h-4 w-4" />
              Chạy AI kiểm duyệt
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
              Phê duyệt
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
              Từ chối
            </button>

            {/* Nút 'Yêu cầu nộp lại' đã được loại bỏ theo yêu cầu nghiệp vụ */}

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
                Kích hoạt lại
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
                Đình chỉ
              </button>
            )}

            <div className="h-px bg-slate-100 my-1" />
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(null);
                requestAnimationFrame(() => {
                  onAction(company, "delete");
                });
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
