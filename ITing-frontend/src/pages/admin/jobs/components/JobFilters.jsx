import React from "react";
import {
  AdminFilterBar,
  AdminSearchInput,
  AdminResetButton,
} from "../../../../components/admin/AdminFilterBar";

/* Tab trạng thái nhanh — value khớp với enum status gửi lên server
   (xem useAdminJobs.fetchJobs). "all" = không lọc. */
const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Đang hiển thị" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "REJECTED", label: "Bị từ chối" },
];

export const JobFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}) => {
  const isDirty = (search && search.length > 0) || (statusFilter && statusFilter !== "all");

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <AdminFilterBar>
      <AdminSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tiêu đề, công ty, địa điểm..."
      />

      <div className="flex items-center gap-2">
        {/* Tab trạng thái */}
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-slate-100 p-1.5">
          {STATUS_TABS.map((tab) => {
            const isActive = (statusFilter || "all") === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
                  isActive
                    ? "bg-white text-[#1A8FBF] shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {isDirty && <AdminResetButton onClick={handleReset} />}
      </div>
    </AdminFilterBar>
  );
};
