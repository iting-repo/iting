import React from "react";
import { Dialog, Badge } from "../common";

export const JobDetailDialog = ({ job, open, onClose, onAction }) => {
  if (!job) return null;

  const techList = Array.isArray(job.techRequired) 
    ? job.techRequired 
    : (typeof job.techRequired === 'string' ? job.techRequired.split(',').map(t => t.trim()) : []);

  return (
    <Dialog open={open} onClose={onClose} title="Chi tiết công việc">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{job.position}</h3>
          <p className="text-sm text-slate-500">{job.companyName || job.company}</p>
        </div>

        <div className="flex gap-2">
          <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PENDING" ? "warning" : "danger"}>
            {job.status}
          </Badge>
          <Badge variant="info">{job.location}</Badge>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Mô tả công việc</h4>
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{job.description}</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">Yêu cầu kỹ năng</h4>
          <div className="flex flex-wrap gap-2">
            {techList.length > 0 ? (
              techList.map((tech, index) => (
                <Badge key={index} variant="purple">{tech}</Badge>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Không có yêu cầu kỹ thuật cụ thể</span>
            )}
          </div>
        </div>

        {job.status === "PENDING" && onAction && (
          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                onClose();
                onAction(job, "approve");
              }}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => {
                onClose();
                onAction(job, "reject");
              }}
              className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};