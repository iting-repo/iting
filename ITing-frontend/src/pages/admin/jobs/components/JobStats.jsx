import React from "react";
import { StatsCard } from "../../../../components";
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";

export const JobStats = ({ jobs }) => {
  const total = jobs.length;
  const pending = jobs.filter((j) => j.status === "PENDING").length;
  const active = jobs.filter((j) => j.status === "ACTIVE").length;
  const rejected = jobs.filter((j) => j.status === "REJECTED").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard title="Tổng tin tuyển dụng" value={total} icon={<Briefcase />} />
      <StatsCard title="Chờ duyệt" value={pending} icon={<Clock />} />
      <StatsCard title="Đang hiển thị" value={active} icon={<CheckCircle2 />} />
      <StatsCard title="Bị từ chối" value={rejected} icon={<XCircle />} />
    </div>
  );
};