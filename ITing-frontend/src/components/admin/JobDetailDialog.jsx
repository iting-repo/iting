import React from "react";
import Dialog from "../common/Dialog";
import Badge from "../common/Badge";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Target,
  Users,
  ShieldCheck,
  ClipboardList,
  Gift,
  CheckCircle2,
  XCircle,
  Layout,
  Layers,
  Eye,
  Sparkles,
  AlertTriangle,
  Ban,
  CircleHelp,
} from "lucide-react";
import {
  getAiReview,
  getAiReviewLabel,
  getAiReviewSummary,
  getAiReviewVariant,
  getAiReviewIconName,
} from "../../utils/jobModeration";

const AI_ICON_MAP = {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Ban,
  CircleHelp,
};

const BRAND = "#3AB4E6";

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 transition-all hover:border-[#3AB4E6]/40 hover:shadow-sm">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3AB4E6]/10 text-[#3AB4E6]">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">{label}</p>
      <p className="text-[13px] font-semibold text-slate-700 truncate">{value || "—"}</p>
    </div>
  </div>
);

const ContentSection = ({ icon: Icon, title, content }) => {
  if (!content) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-[#3AB4E6]" />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{title}</h4>
      </div>
      <div className="text-[13px] leading-relaxed text-slate-600 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};

const STATUS_META = {
  ACTIVE: { label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  REJECTED: { label: "Bị từ chối", cls: "bg-red-50 text-red-700 border-red-200" },
  CLOSED: { label: "Đã đóng", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  EXPIRED: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  NEEDS_REVISION: { label: "Cần chỉnh sửa", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  SUSPENDED: { label: "Bị đình chỉ", cls: "bg-red-50 text-red-700 border-red-200" },
};

export const JobDetailDialog = ({ job, open, onClose, onAction }) => {
  if (!job) return null;

  const techList = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === "string"
      ? job.skills.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  const formatSalary = () => {
    if (job.salaryType === "NEGOTIABLE" || (!job.minSalary && !job.maxSalary)) return "Thỏa thuận";
    const min = job.minSalary ? `${job.minSalary.toLocaleString()}đ` : "?";
    const max = job.maxSalary ? `${job.maxSalary.toLocaleString()}đ` : "?";
    return `${min} - ${max}`;
  };

  const aiReview = getAiReview(job);
  const statusMeta = STATUS_META[job.status] || { label: job.status || "Chưa cập nhật", cls: "bg-slate-100 text-slate-600 border-slate-200" };

  // Risk color
  const riskClass =
    typeof aiReview.score === "number"
      ? aiReview.score > 0.7
        ? "bg-red-50 text-red-600 border-red-200"
        : aiReview.score > 0.4
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <Dialog open={open} onClose={onClose} title="Chi tiết tuyển dụng">
      <div className="space-y-4">
        {/* Header — compact, brand-aligned */}
        <div className="relative overflow-hidden rounded-2xl border border-[#3AB4E6]/20 bg-gradient-to-br from-[#3AB4E6]/5 via-white to-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusMeta.cls}`}>
                  {statusMeta.label}
                </span>
                {job.featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                    Nổi bật
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {job.position || job.title}
              </h3>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-[#3AB4E6]">
                <Briefcase className="h-3.5 w-3.5" />
                {job.companyName || job.company || "—"}
              </p>
            </div>

            <div className="flex flex-row sm:flex-col gap-3 sm:gap-1 sm:text-right shrink-0">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày đăng</div>
                <div className="text-sm font-bold text-slate-700">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString("vi-VN") : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Review — compact card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const AiIcon = AI_ICON_MAP[getAiReviewIconName(aiReview.status)] || CircleHelp;
                return (
                  <Badge variant={getAiReviewVariant(aiReview.status)}>
                    <span className="inline-flex items-center gap-1">
                      <AiIcon className="w-3 h-3" />
                      {getAiReviewLabel(aiReview.status)}
                    </span>
                  </Badge>
                );
              })()}
              {typeof aiReview.score === "number" && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${riskClass}`}>
                  Rủi ro: {Math.round(aiReview.score * 100)}%
                </span>
              )}
              {aiReview._isFake && (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Demo
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-[#3AB4E6]" />
              Kết quả AI
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-100">
            <p className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-line">
              {getAiReviewSummary(job)}
            </p>
          </div>

          {aiReview.sensitiveTerms?.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Từ khóa bị gắn cờ</p>
              <div className="flex flex-wrap gap-1.5">
                {aiReview.sensitiveTerms.map((term) => (
                  <span key={term} className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 text-[11px] font-semibold">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(aiReview.cleanedTitle || aiReview.cleanedDescription) && (
            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Bản AI đề xuất
              </p>
              {aiReview.cleanedTitle && <p className="text-[13px] font-semibold text-slate-700">{aiReview.cleanedTitle}</p>}
              {aiReview.cleanedDescription && (
                <p className="text-[12px] text-slate-600 italic mt-1 whitespace-pre-line">"{aiReview.cleanedDescription}"</p>
              )}
            </div>
          )}
        </div>

        {/* Info Grid — compact, brand-uniform */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <InfoItem icon={DollarSign} label="Mức lương" value={formatSalary()} />
          <InfoItem icon={Target} label="Cấp bậc" value={job.experienceLevel} />
          <InfoItem icon={Briefcase} label="Hình thức" value={job.jobType} />
          <InfoItem icon={MapPin} label="Địa điểm" value={job.location} />
          <InfoItem icon={Calendar} label="Hạn nộp" value={job.dueDate ? new Date(job.dueDate).toLocaleDateString("vi-VN") : "Không giới hạn"} />
          <InfoItem icon={Users} label="Số lượng" value={job.maxAccept ? `${job.currentAccepted || 0} / ${job.maxAccept}` : "Không giới hạn"} />
        </div>

        {/* Tech Stack */}
        {techList.length > 0 && (
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-[#3AB4E6]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Tech Stack & Kỹ năng</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techList.map((tech, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-md bg-[#3AB4E6]/10 text-[#3AB4E6] border border-[#3AB4E6]/20 text-[11px] font-bold hover:bg-[#3AB4E6]/20 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content sections */}
        <div className="space-y-3">
          <ContentSection icon={Layout} title="Mô tả công việc" content={job.description} />
          <ContentSection icon={ClipboardList} title="Trách nhiệm chính" content={job.responsibilities} />
          <ContentSection icon={Target} title="Yêu cầu ứng viên" content={job.requirements} />
          <ContentSection icon={Gift} title="Quyền lợi & Phúc lợi" content={job.benefits} />
        </div>

        {/* Statistics — brand color, compact */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#3AB4E6] to-[#1F8FC9] px-4 py-3 text-white shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Ứng tuyển</p>
              <p className="text-lg font-black leading-tight">{job.applicationCount || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 px-4 py-3 text-white shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Lượt xem</p>
              <p className="text-lg font-black leading-tight">{job.viewCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {job.status === "PENDING" && onAction && (
          <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-2 bg-white/95 px-6 py-4 backdrop-blur-md border-t border-slate-100">
            <button
              onClick={() => { onClose(); onAction(job, "approve"); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600"
            >
              <CheckCircle2 className="h-4 w-4" />
              Phê duyệt
            </button>
            <button
              onClick={() => { onClose(); onAction(job, "reject"); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-600"
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
