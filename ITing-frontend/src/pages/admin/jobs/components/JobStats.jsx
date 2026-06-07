import React from "react";
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";
import { StatCard } from "../../../../components/admin/StatCard";

export const JobStats = ({ jobs }) => {
  const total = jobs.length;
  const pending = jobs.filter((j) => j.status === "PENDING").length;
  const active = jobs.filter((j) => j.status === "ACTIVE").length;
  const rejected = jobs.filter((j) => j.status === "REJECTED").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Tổng tin tuyển dụng"
        value={total}
        sub={`${active} đang hiển thị · ${pending} chờ duyệt`}
        accent="blue"
        icon={<Briefcase className="h-6 w-6" strokeWidth={2} />}
      />
      <StatCard
        label="Chờ duyệt"
        value={pending}
        sub={pending > 0 ? "Cần admin xử lý" : "Đã xử lý hết"}
        accent="amber"
        icon={<Clock className="h-6 w-6" strokeWidth={2} />}
      />
      <StatCard
        label="Đang hiển thị"
        value={active}
        sub="Đang nhận ứng tuyển"
        accent="emerald"
        icon={<CheckCircle2 className="h-6 w-6" strokeWidth={2} />}
      />
      <StatCard
        label="Bị từ chối"
        value={rejected}
        sub={rejected > 0 ? "Đã ẩn khỏi hệ thống" : "Không có tin bị từ chối"}
        accent="red"
        icon={<XCircle className="h-6 w-6" strokeWidth={2} />}
      />
    </div>
  );
};
