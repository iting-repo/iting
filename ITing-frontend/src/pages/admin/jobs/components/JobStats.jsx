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
      <StatsCard title="Total Jobs" value={total} icon={<Briefcase />} />
      <StatsCard title="Pending Review" value={pending} icon={<Clock />} />
      <StatsCard title="Active Jobs" value={active} icon={<CheckCircle2 />} />
      <StatsCard title="Rejected Jobs" value={rejected} icon={<XCircle />} />
    </div>
  );
};