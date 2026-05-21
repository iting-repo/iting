import React from "react";
import Dialog from "../../../../components/common/Dialog";
import Badge from "../../../../components/common/Badge";
import Button from "../../../../components/common/Button";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Target, 
  Users, 
  ArrowRight,
  ClipboardList,
  Gift,
  CheckCircle2,
  XCircle,
  Layout,
  Layers
} from "lucide-react";
import {
  getAiReview,
  getAiReviewLabel,
  getAiReviewSummary,
  getAiReviewVariant,
} from "../../../../utils/jobModeration";

const InfoItem = ({ icon: Icon, label, value, color = "sky" }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-all hover:border-sky-100 hover:shadow-sm">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value || "N/A"}</p>
    </div>
  </div>
);

const ContentSection = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Icon className="h-4 w-4 text-sky-500" />
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">{title}</h4>
      </div>
      <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};

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

export const JobPreviewDialog = ({ job, open, onClose, onAction }) => {
  if (!job) return null;

  const techList = Array.isArray(job.skills) 
    ? job.skills 
    : (typeof job.skills === 'string' ? job.skills.split(',').map(t => t.trim()) : []);

  const formatSalary = () => {
    if (job.salaryType === "NEGOTIABLE" || (!job.minSalary && !job.maxSalary)) return "Thỏa thuận";
    const min = job.minSalary ? `${job.minSalary.toLocaleString()}đ` : "?";
    const max = job.maxSalary ? `${job.maxSalary.toLocaleString()}đ` : "?";
    return `${min} - ${max}`;
  };
  const aiReview = getAiReview(job);

  return (
    <Dialog open={open} onClose={onClose} title="Xem trước Job" maxWidth="3xl">
      <div className="space-y-6 py-2">
        {/* Basic Info */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PENDING" ? "warning" : "danger"} className="px-2 py-0.5 text-[10px] uppercase tracking-tighter">
                {getJobStatusLabel(job.status)}
              </Badge>
              {job.featured && <Badge variant="sky" className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] uppercase tracking-tighter">FEATURED</Badge>}
            </div>
            <h3 className="text-xl font-black text-slate-900">{job.position}</h3>
            <p className="text-sm font-semibold text-sky-600">{job.companyName || job.company}</p>
          </div>
          <div className="text-right shrink-0">
             <div className="text-[10px] font-bold uppercase text-slate-400">Hạn nộp</div>
             <div className="text-sm font-bold text-slate-700">{job.dueDate ? new Date(job.dueDate).toLocaleDateString('vi-VN') : "---"}</div>
          </div>
        </div>

        <div className="rounded-2xl border bg-slate-50/60 p-4" style={{
          borderColor: aiReview.status === 'APPROVED' ? '#d1fae5' : aiReview.status === 'REJECTED' ? '#fee2e2' : aiReview.status === 'NEEDS_REVIEW' ? '#fef3c7' : '#e0f2fe'
        }}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={getAiReviewVariant(aiReview.status)}>
              {getAiReviewLabel(aiReview.status)}
            </Badge>
            {typeof aiReview.score === "number" && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                aiReview.score > 0.7 ? 'bg-red-100 text-red-600' :
                aiReview.score > 0.4 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                Điểm rủi ro: {Math.round(aiReview.score * 100)}%
              </span>
            )}
            {aiReview._isFake && (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Demo — chưa chạy AI thật
              </span>
            )}
          </div>

          {/* AI Reason Box */}
          <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">📋 Lý do AI</p>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {aiReview.reason || getAiReviewSummary(job)}
            </p>
          </div>

          {aiReview.sensitiveTerms.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">🔴 Từ khóa bị gắn cờ</p>
              <div className="flex flex-wrap gap-2">
                {aiReview.sensitiveTerms.map((term) => (
                  <Badge key={term} variant="danger" className="rounded-md">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {(aiReview.cleanedTitle || aiReview.cleanedDescription) && (
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600 border border-emerald-100">
              <p className="mb-1 font-bold text-emerald-800">🧹 Bản AI đề xuất sau khi làm sạch</p>
              {aiReview.cleanedTitle && <p>{aiReview.cleanedTitle}</p>}
              {aiReview.cleanedDescription && (
                <p className="mt-2 whitespace-pre-line">{aiReview.cleanedDescription}</p>
              )}
            </div>
          )}
        </div>


        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={DollarSign} label="Lương" value={formatSalary()} color="emerald" />
          <InfoItem icon={Target} label="Cấp bậc" value={job.experienceLevel} color="indigo" />
          <InfoItem icon={Briefcase} label="Hình thức" value={job.jobType} color="orange" />
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {techList.map((tech, index) => (
            <Badge key={index} variant="sky" className="bg-slate-100 text-slate-600 border-transparent text-xs font-bold">{tech}</Badge>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
           <ContentSection icon={Layout} title="Mô tả" content={job.description} />
           <ContentSection icon={ClipboardList} title="Yêu cầu" content={job.requirements} />
           <ContentSection icon={Gift} title="Quyền lợi" content={job.benefits} />
        </div>

        {/* Actions */}
        {job.status === "PENDING" && onAction && (
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => onAction(job, "approve")}
              className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-black uppercase text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600"
            >
              Phê duyệt
            </button>
            <button
              onClick={() => onAction(job, "reject")}
              className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-black uppercase text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600"
            >
              Từ chối
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
