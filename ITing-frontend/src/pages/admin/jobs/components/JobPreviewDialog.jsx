import React from "react";
import { Dialog, Badge, Button } from "../../../../components";

export const JobPreviewDialog = ({ job, open, onClose, onAction }) => {
  if (!job) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Preview Job">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{job.position}</h3>

        <p className="text-sm text-slate-500">
          {job.company} · {job.location}
        </p>

        <Badge>{job.status}</Badge>

        <p className="text-sm">{job.description}</p>

        {job.status === "PENDING" && (
          <div className="flex gap-2 pt-3">
            <Button onClick={() => onAction(job, "approve")}>
              Approve
            </Button>

            <Button
              variant="destructive"
              onClick={() => onAction(job, "reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};