import React, { useState } from "react";
import { Table, Td } from "../../../../components/common/Table";
import Badge from "../../../../components/common/Badge";
import { RowActionMenu } from "../../../../components/admin/RowActionMenu";
import {
  getAiReview,
  getAiReviewLabel,
  getAiReviewVariant,
  getAiReviewIconName,
  getAiReviewShortText,
} from "../../../../utils/jobModeration";
import adminJobService from "../../../../services/adminJobService";
import { toast } from "sonner";
import {
  Users,
  Sparkles,
  Loader2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CircleHelp,
} from "lucide-react";

// Resolver: tên icon (string) → component lucide. Giữ ở đây để tránh thêm
// dependency "JSX trong util file".
const AI_ICON_MAP = {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Ban,
  CircleHelp,
};

const JOB_STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", variant: "success" },
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  REJECTED: { label: "Bị từ chối", variant: "danger" },
  CLOSED: { label: "Đã đóng", variant: "default" },
  EXPIRED: { label: "Hết hạn", variant: "danger" },
  NEEDS_REVISION: { label: "Cần chỉnh sửa", variant: "warning" },
  SUSPENDED: { label: "Bị đình chỉ", variant: "warning" },
};

const getJobStatusMeta = (status) =>
  JOB_STATUS_META[status] || { label: status || "Chưa cập nhật", variant: "default" };

const JOB_TYPE_LABELS = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  INTERNSHIP: "Thực tập",
  CONTRACT: "Hợp đồng",
  FREELANCE: "Freelance",
  REMOTE: "Remote",
};

// "Đăng x ngày trước" từ ngày tạo (nếu API trả về). An toàn nếu thiếu field.
const formatPostedAgo = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays <= 0) return "Đăng hôm nay";
  if (diffDays === 1) return "Đăng hôm qua";
  if (diffDays < 30) return `Đăng ${diffDays} ngày trước`;
  return `Đăng ${d.toLocaleDateString("vi-VN")}`;
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
      className="overflow-x-auto custom-scrollbar"
      tableClassName="[&_th]:!px-4 [&_th]:!py-3.5 [&_td]:!px-4 [&_td]:!py-4 text-[13px] [&_tbody_tr:nth-child(even)]:bg-slate-50/40"
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
                  className="text-left font-semibold text-[15px] leading-snug text-blue-600 transition-colors hover:text-blue-800 line-clamp-2"
                  onClick={() => onPreview(job)}
                  title={job.title || job.position}
                >
                  {job.title || job.position}
                </button>
                {(() => {
                  // Dòng metadata phụ: hình thức • cấp bậc • ngày đăng (chỉ hiện phần có dữ liệu)
                  const jobType = JOB_TYPE_LABELS[job.jobType] || job.jobType;
                  const level = job.experienceLevel;
                  const postedAgo = formatPostedAgo(job.createdAt || job.postedAt || job.createdDate);
                  const parts = [jobType, level, postedAgo].filter(Boolean);
                  return parts.length > 0 ? (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {parts.join(" • ")}
                    </p>
                  ) : null;
                })()}
              </Td>

              <Td>
                <div className="font-medium text-slate-700 whitespace-nowrap">
                  {job.company || job.companyName}
                </div>
              </Td>

              <Td className="max-w-[200px]">
                <span className="block text-slate-600 line-clamp-2" title={job.location}>
                  {job.location || "—"}
                </span>
              </Td>

              <Td className="whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  {(() => {
                    const meta = getJobStatusMeta(job.status);
                    return <Badge variant={meta.variant}>{meta.label}</Badge>;
                  })()}
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
                  {/* Dòng 1: badge trạng thái + % rủi ro */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconCmp = AI_ICON_MAP[getAiReviewIconName(aiReview.status)] || CircleHelp;
                      return (
                        <Badge variant={getAiReviewVariant(aiReview.status)}>
                          <span className="inline-flex items-center gap-1">
                            <IconCmp className="w-3 h-3" />
                            {getAiReviewLabel(aiReview.status)}
                          </span>
                        </Badge>
                      );
                    })()}
                    {typeof aiReview.score === "number" && (
                      <span className={`text-[11px] font-bold ${aiReview.score > 0.7 ? "text-red-500" : aiReview.score > 0.4 ? "text-amber-500" : "text-emerald-500"}`}>
                        {Math.round(aiReview.score * 100)}% rủi ro
                      </span>
                    )}
                  </div>

                  {/* Dòng 2: mô tả ngắn thân thiện — log kỹ thuật để trong "Xem chi tiết" */}
                  <span
                    className="text-[11px] text-slate-500 leading-snug max-w-[200px] line-clamp-1"
                    title={aiReview.reason || undefined}
                  >
                    {getAiReviewShortText(aiReview.status)}
                  </span>

                  {/* Dòng 3: action — Chạy/Chạy lại AI • Xem chi tiết */}
                  <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold">
                    <button
                      onClick={() => handleRunAi(job.id)}
                      disabled={isRunning}
                      className={`inline-flex items-center gap-1 transition-colors ${
                        isRunning
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-sky-600 hover:text-sky-700 hover:underline"
                      }`}
                      title={hasBeenReviewed ? "Chạy lại AI kiểm tra" : "Chạy AI kiểm tra ngay"}
                    >
                      {isRunning ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : hasBeenReviewed ? (
                        <RefreshCw className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {isRunning ? "Đang kiểm tra..." : hasBeenReviewed ? "Chạy lại AI" : "Chạy AI"}
                    </button>

                    {!isRunning && (
                      <>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => onDetail(job)}
                          className="text-slate-500 transition-colors hover:text-slate-700 hover:underline"
                          title="Xem chi tiết kiểm duyệt"
                        >
                          Xem chi tiết
                        </button>
                      </>
                    )}
                  </div>
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
