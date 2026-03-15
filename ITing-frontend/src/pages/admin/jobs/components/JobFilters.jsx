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
        placeholder="Search job..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="ACTIVE">Active</option>
        <option value="REJECTED">Rejected</option>
      </Select>
    </div>
  );
};