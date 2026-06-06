import React from "react";
import { FaCheckSquare } from "react-icons/fa";

/**
 * Sticky bottom bar (full-width) hiện khi user chọn ≥1 item trong admin table.
 * Pattern dùng chung cho Quản lý Công ty / Công việc / Người dùng / Báo cáo.
 *
 * @param {object} props
 * @param {number} props.selectedCount
 * @param {()=>void} props.onClear
 * @param {Array<{
 *   key:string,
 *   label:string,
 *   icon?:React.ReactNode,
 *   variant?: 'success'|'warning'|'orange'|'slate'|'danger'|'info',  // default 'slate'
 *   onClick:()=>void,
 *   disabled?:boolean,
 * }>} props.actions
 */
const VARIANT_CLS = {
    success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
    orange:  "bg-orange-600 hover:bg-orange-700 shadow-orange-100",
    slate:   "bg-slate-700 hover:bg-slate-800 shadow-slate-100",
    danger:  "bg-red-500 hover:bg-red-600 shadow-red-100",
    info:    "bg-[#3AB4E6] hover:bg-[#2C9ACD] shadow-sky-100",
};

const BulkActionBar = ({ selectedCount = 0, onClear, actions = [] }) => {
    if (selectedCount <= 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-center gap-4 sm:gap-6 w-full overflow-x-auto custom-scrollbar border-t border-sky-100 bg-white px-4 sm:px-8 py-3 sm:py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 sm:gap-3 border-r border-slate-100 pr-4 sm:pr-6 shrink-0">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shrink-0">
                    <FaCheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="shrink-0">
                    <p className="text-sm font-bold text-slate-800">
                        Đã chọn {selectedCount} mục
                    </p>
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="text-xs font-medium text-sky-600 hover:underline"
                        >
                            Bỏ chọn tất cả
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {actions.map((a) => (
                    <button
                        key={a.key}
                        type="button"
                        onClick={a.onClick}
                        disabled={a.disabled}
                        className={`flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${VARIANT_CLS[a.variant] || VARIANT_CLS.slate}`}
                    >
                        {a.icon}
                        {a.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BulkActionBar;
