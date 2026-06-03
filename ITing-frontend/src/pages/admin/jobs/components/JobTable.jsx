import React, { useState } from "react";
import { Table, Td } from "../../../../components/common/Table";
import Badge from "../../../../components/common/Badge";
import { RowActionMenu } from "../../../../components/admin/RowActionMenu";
import {
  getAiReview,
  getAiReviewLabel,
  getAiReviewVariant,
} from "../../../../utils/jobModeration";
import adminJobService from "../../../../services/adminJobService";
import { toast } from "sonner";
import { FaRobot, FaSpinner } from "react-icons/fa";
import { Users } from "lucide-react";

const getJobStatusLabel = (status) => {
  const map = {
    ACTIVE: "Đang hoạt động",
    PENDING: "Chờ duyệt",
    REJECTED: "Bị từ chối",
    CLOSED: "Đã đóng",
    EXPIRED: "Hết hạn",
    NEEDS_REVISION: "Cần chỉnh sửa",
    SUSPENDED: "Bị đình chỉ",
  };

  return map[status] || status || "Chưa cập nhật";
};

export const JobTable = ({
  jobs,
  loading,
  onPreview,
  onDetail,
  onAction,
  onViewApplicants,
  openMenuId,
  setOpenMenuId,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  isAllSelected,
  onJobUpdated,
}) => {
  const [runningAiIds, setRunningAiIds] = useState(new Set());
  const [localAiResults, setLocalAiResults] = useState({});

  const handleRunAi = async (jobId) => {
    setRunningAiIds((prev) => new Set([...prev, jobId]));
    try {
      const result = await adminJobService.runAiReview(jobId);
      // Store result locally for immediate display
      setLocalAiResults((prev) => ({ ...prev, [jobId]: result }));
      if (onJobUpdated) onJobUpdated(jobId, result);

      const status = result?.status || result?.aiReviewStatus || "NOT_REVIEWED";
      if (status === "APPROVED") {
        toast.success(`✅ AI kiểm tra xong: Tin #${jobId} đạt tiêu chuẩn`);
      } else if (status === "REJECTED") {
        toast.error(`🚫 AI phát hiện vi phạm: Tin #${jobId} cần xem xét ngay!`);
      } else if (status === "NEEDS_REVIEW") {
        toast.warning(`⚠️ AI cần admin kiểm tra thêm: Tin #${jobId}`);
      } else if (status === "CLEANED") {
        toast.info(`🧹 AI đã làm sạch nội dung: Tin #${jobId}`);
      } else {
        toast.success(`AI đã kiểm tra xong tin #${jobId}`);
      }
    } catch (err) {
      console.error("AI review failed:", err);
      toast.error(`Không thể chạy AI kiểm tra tin #${jobId}. Vui lòng thử lại.`);
    } finally {
      setRunningAiIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  return (
    <Table
      className="overflow-x-auto custom-scrollbar sm:!overflow-visible"
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
          className: "w-10",
        },
        { label: "Mã công việc", className: "whitespace-nowrap" },
        { label: "Tiêu đề công việc", className: "whitespace-nowrap min-w-[200px]" },
        { label: "Tên công ty", className: "whitespace-nowrap min-w-[150px]" },
        { label: "Địa điểm", className: "w-48 min-w-[150px]" },
        { label: "Trạng thái", className: "w-40 whitespace-nowrap" },
        { label: "Ứng viên", className: "w-28 whitespace-nowrap text-center" },
        { label: "AI kiểm duyệt", className: "w-56 min-w-[200px]" },
        { label: "Thao tác", className: "text-right whitespace-nowrap" },
      ]}
    >
      {loading ? (
        <tr>
          <Td colSpan="9" className="text-center py-10 text-gray-500 italic">
            Đang tải danh sách công việc...
          </Td>
        </tr>
      ) : jobs.length === 0 ? (
        <tr>
          <Td colSpan="9" className="text-center py-10 text-gray-500 italic">
            Không tìm thấy công việc nào.
          </Td>
        </tr>
      ) : (
        jobs.map((job) => {
          const isRunning = runningAiIds.has(job.id);
          // Merge local AI result if available
          const mergedJob = localAiResults[job.id]
            ? { ...job, ...localAiResults[job.id] }
            : job;
          const aiReview = getAiReview(mergedJob);
          const hasBeenReviewed = aiReview.status && aiReview.status !== "NOT_REVIEWED";

          return (
            <tr
              key={job.id}
              className={`hover:bg-gray-50/80 transition-colors group ${selectedIds.includes(job.id) ? "bg-sky-50/50" : ""}`}
            >
              <Td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(job.id)}
                  onChange={() => onSelectOne(job.id)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
              </Td>
              <Td className="whitespace-nowrap">{job.id}</Td>

              <Td>
                <button
                  className="font-bold text-blue-600 hover:text-blue-800 transition-colors text-left line-clamp-2"
                  onClick={() => onPreview(job)}
                  title={job.title || job.position}
                >
                  {job.title || job.position}
                </button>
              </Td>

              <Td>
                <div className="font-medium text-slate-700 whitespace-nowrap">
                  {job.company || job.companyName}
                </div>
              </Td>

              <Td className="max-w-[200px] truncate">{job.location}</Td>

              <Td className="whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PENDING" ? "warning" : "danger"}>
                    {getJobStatusLabel(job.status)}
                  </Badge>
                  {job.status === "PENDING" && job.dueDate && new Date(job.dueDate) < new Date().setHours(0, 0, 0, 0) && (
                    <Badge variant="danger" className="text-[10px] py-0 px-1">
                      Quá hạn
                    </Badge>
                  )}
                </div>
              </Td>

              <Td className="text-center whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onViewApplicants && onViewApplicants(job)}
                  title="Xem danh sách ứng viên đã ứng tuyển"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-sm border border-sky-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  {job.applicationCount ?? 0}
                </button>
              </Td>

              <Td className="whitespace-nowrap">
                <div className="flex flex-col items-start gap-1.5">
                  <Badge variant={getAiReviewVariant(aiReview.status)}>
                    {getAiReviewLabel(aiReview.status)}
                  </Badge>

                  {typeof aiReview.score === "number" && (
                    <span className={`text-[11px] font-bold ${aiReview.score > 0.7 ? "text-red-500" : aiReview.score > 0.4 ? "text-amber-500" : "text-emerald-500"}`}>
                      Rủi ro: {Math.round(aiReview.score * 100)}%
                    </span>
                  )}

                  {aiReview.reason && (
                    <span className="text-[10px] text-slate-500 leading-tight max-w-[180px] line-clamp-2" title={aiReview.reason}>
                      {aiReview.reason}
                    </span>
                  )}

                  <button
                    onClick={() => handleRunAi(job.id)}
                    disabled={isRunning}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all
                      ${isRunning
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : hasBeenReviewed
                          ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    title={hasBeenReviewed ? "Chạy lại AI kiểm tra" : "Chạy AI kiểm tra ngay"}
                  >
                    {isRunning ? (
                      <FaSpinner className="animate-spin w-3 h-3" />
                    ) : (
                      <FaRobot className="w-3 h-3" />
                    )}
                    {isRunning ? "Đang kiểm tra..." : hasBeenReviewed ? "Chạy lại AI" : "Chạy AI kiểm tra"}
                  </button>
                </div>
              </Td>

              <Td className="text-right">
                <RowActionMenu
                  company={job}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onViewDetail={onDetail}
                  onAction={onAction}
                  onViewApplicants={onViewApplicants}
                />
              </Td>
            </tr>
          );
        })
      )}
    </Table>
  );
};
