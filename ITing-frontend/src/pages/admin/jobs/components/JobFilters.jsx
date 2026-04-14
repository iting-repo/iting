import React from "react";
import { Input, Select } from "../../../../components";

export const JobFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Tìm kiếm công việc..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="PENDING">Chờ duyệt</option>
        <option value="ACTIVE">Đang hoạt động</option>
        <option value="REJECTED">Bị từ chối</option>
      </Select>
    </div>
  );
};