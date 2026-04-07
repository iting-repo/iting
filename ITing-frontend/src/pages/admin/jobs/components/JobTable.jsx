import React from "react";
import { Table, Badge, Td } from "../../../../components";
import { RowActionMenu } from "../../../../components/admin/RowActionMenu";
export const JobTable = ({ 
  jobs, 
  loading, 
  onPreview, 
  onDetail, 
  onAction, 
  openMenuId, 
  setOpenMenuId,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  isAllSelected
}) => {
  return (
    <Table
      className="!overflow-visible"
      headers={[
        { 
          label: (
            <input 
              type="checkbox" 
              checked={isAllSelected}
              onChange={onSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
            />
          ),
          className: "w-10"
        },
        { label: "Job ID" },
        { label: "Job Details" },
        { label: "Location" },
        { label: "Status" },
        { label: "Actions", className: "text-right" }
      ]}
    >
      {loading ? (
        <tr>
          <Td colSpan="6" className="text-center py-10 text-gray-500 italic">
            Đang tải danh sách công việc...
          </Td>
        </tr>
      ) : jobs.length === 0 ? (
        <tr>
          <Td colSpan="6" className="text-center py-10 text-gray-500 italic">
            Không tìm thấy công việc nào.
          </Td>
        </tr>
      ) : (
        jobs.map((job) => (
          <tr 
            key={job.id} 
            className={`hover:bg-gray-50/80 transition-colors group ${selectedIds.includes(job.id) ? 'bg-sky-50/50' : ''}`}
          >
            <Td>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(job.id)}
                onChange={() => onSelectOne(job.id)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
              />
            </Td>
            <Td>{job.id}</Td>

            <Td>
              <button
                className="font-bold text-blue-600 hover:text-blue-800 transition-colors text-left"
                onClick={() => onPreview(job)}
              >
                {job.position}
              </button>
              <div className="text-xs text-gray-500 mt-1">{job.company || job.companyName}</div>
            </Td>

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
        ))
      )}
    </Table>
  );
};