import React from "react";
import { Table, Badge, Td } from "../../../../components";
import { RowActionMenu } from "../../../../components/admin/RowActionMenu";
export const JobTable = ({ jobs, loading, onPreview, onDetail, onAction, openMenuId, setOpenMenuId }) => {
  return (
    <Table
      headers={[
        { label: "Job ID" },
        { label: "Position" },
        { label: "Company" },
        { label: "Location" },
        { label: "Status" },
        { label: "Actions", className: "text-right" }
      ]}
    >
      {jobs.map((job) => (
        <tr key={job.id} className="hover:bg-gray-50/80 transition-colors group">
          <Td>{job.id}</Td>

          <Td>
            <button
              className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => onPreview(job)}
            >
              {job.position}
            </button>
          </Td>

          <Td>{job.company || job.companyName}</Td>

          <Td>{job.location}</Td>

          <Td>
            <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PENDING" ? "warning" : "danger"}>
              {job.status}
            </Badge>
          </Td>

          <Td className="text-right">
            <RowActionMenu
              company={job}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onViewDetail={onDetail}
              onAction={onAction}
            />
          </Td>
        </tr>
      ))}
    </Table>
  );
};