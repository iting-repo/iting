import React from "react";
import { Search, RotateCcw } from "lucide-react";

/* Thanh filter dùng chung cho các trang quản trị — đồng bộ với trang
   Quản lý Công việc: card bo tròn, ô search pill có icon, select/tab bo tròn. */

export const AdminFilterBar = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-100 bg-white p-3 shadow-sm ${className}`}>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {children}
    </div>
  </div>
);

export const AdminSearchInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Tìm kiếm...",
  className = "",
}) => (
  <div className={`relative w-full lg:max-w-md ${className}`}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="h-10 w-full rounded-full border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#3AB4E6] focus:bg-white focus:ring-2 focus:ring-[#3AB4E6]/20"
    />
  </div>
);

/* Class dùng chung cho <select> trong thanh filter (pill bo tròn). */
export const adminSelectClass =
  "h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/20";

/* Nút "Đặt lại" filter đồng bộ kiểu dáng. */
export const AdminResetButton = ({ onClick, label = "Đặt lại" }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
  >
    <RotateCcw className="h-3.5 w-3.5" />
    {label}
  </button>
);

export default AdminFilterBar;
