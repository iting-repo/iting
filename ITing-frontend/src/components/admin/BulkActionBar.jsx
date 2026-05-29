import React from "react";
import { FaCheckSquare } from "react-icons/fa";

/**
 * Sticky bottom bar hiện khi user chọn ≥1 item trong table.
 *
 * @param {object} props
 * @param {number} props.selectedCount
 * @param {()=>void} props.onClear
 * @param {Array<{
 *   key:string,
 *   label:string,
 *   icon?:React.ReactNode,
 *   variant?: 'success'|'warning'|'slate'|'danger',  // default 'slate'
 *   onClick:()=>void,
 *   disabled?:boolean,
 * }>} props.actions
 */
const VARIANT_CLS = {
    success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
    slate:   "bg-slate-700 hover:bg-slate-800 shadow-slate-100",
    danger:  "bg-red-500 hover:bg-red-600 shadow-red-100",
};

const BulkActionBar = ({ selectedCount = 0, onClear, actions = [] }) => {
    if (selectedCount <= 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-sky-100 bg-white px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <FaCheckSquare className="h-5 w-5" />
                </div>
                <div>
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

            <div className="flex items-center gap-2">
                {actions.map((a) => (
                    <button
                        key={a.key}
                        type="button"
                        onClick={a.onClick}
                        disabled={a.disabled}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${VARIANT_CLS[a.variant] || VARIANT_CLS.slate}`}
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
