import React from "react";

/* Card KPI dùng chung cho các trang quản trị (Job / Company / User...).
   Mỗi accent là một sắc thái màu nhạt để phân biệt loại số liệu. */
const ACCENTS = {
  blue: { bar: "bg-blue-500", iconWrap: "bg-blue-100 text-blue-600", value: "text-blue-600" },
  amber: { bar: "bg-amber-500", iconWrap: "bg-amber-100 text-amber-600", value: "text-amber-600" },
  emerald: { bar: "bg-emerald-500", iconWrap: "bg-emerald-100 text-emerald-600", value: "text-emerald-600" },
  red: { bar: "bg-red-400", iconWrap: "bg-red-100 text-red-500", value: "text-red-500" },
  violet: { bar: "bg-violet-500", iconWrap: "bg-violet-100 text-violet-600", value: "text-violet-600" },
  sky: { bar: "bg-sky-500", iconWrap: "bg-sky-100 text-sky-600", value: "text-sky-600" },
  slate: { bar: "bg-slate-400", iconWrap: "bg-slate-100 text-slate-500", value: "text-slate-600" },
};

export const StatCard = ({ label, value, sub, icon, accent = "blue" }) => {
  const c = ACCENTS[accent] || ACCENTS.blue;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Dải màu nhận diện bên trái */}
      <span className={`absolute inset-y-0 left-0 w-1 ${c.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className={`mt-2 text-3xl font-bold leading-none ${c.value}`}>{value}</div>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.iconWrap}`}>
          {icon}
        </div>
      </div>

      {sub && <p className="mt-3 text-xs text-slate-400">{sub}</p>}
    </div>
  );
};

export default StatCard;
