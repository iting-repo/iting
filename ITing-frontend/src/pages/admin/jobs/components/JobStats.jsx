import React from "react";
import StatsCard from "../../../../components/common/StatsCard";
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";

export const JobStats = ({ jobs }) => {
  const total = jobs.length;
  const pending = jobs.filter((j) => j.status === "PENDING").length;
  const active = jobs.filter((j) => j.status === "ACTIVE").length;
  const rejected = jobs.filter((j) => j.status === "REJECTED").length;

  const lastUpdate = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard 
        title="Tổng tin tuyển dụng" 
        value={total} 
        icon={<Briefcase />} 
        footerLabel={`Cập nhật: ${lastUpdate}`}
      />
      <StatsCard 
        title="Chờ duyệt" 
        value={pending} 
        icon={<Clock />} 
        footerLabel={`Cập nhật: ${lastUpdate}`}
      />
      <StatsCard 
        title="Đang hiển thị" 
        value={active} 
        icon={<CheckCircle2 />} 
        footerLabel={`Cập nhật: ${lastUpdate}`}
      />
      <StatsCard 
        title="Bị từ chối" 
        value={rejected} 
        icon={<XCircle />} 
        footerLabel={`Cập nhật: ${lastUpdate}`}
      />
    </div>
  );
};