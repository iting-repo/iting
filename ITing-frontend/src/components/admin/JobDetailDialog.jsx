import React from "react";
import { Dialog, Badge } from "../common";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Target, 
  Users, 
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  Layout,
  Layers
} from "lucide-react";

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
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/30 p-5 lg:p-6">
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

export const JobDetailDialog = ({ job, open, onClose, onAction }) => {
  if (!job) return null;

  const techList = Array.isArray(job.techRequired) 
    ? job.techRequired 
    : (typeof job.techRequired === 'string' ? job.techRequired.split(',').map(t => t.trim()) : []);

  const formatSalary = () => {
    if (job.salaryType === "NEGOTIABLE" || (!job.minSalary && !job.maxSalary)) return "Thỏa thuận";
    const min = job.minSalary ? `${job.minSalary.toLocaleString()}đ` : "?";
    const max = job.maxSalary ? `${job.maxSalary.toLocaleString()}đ` : "?";
    return `${min} - ${max}`;
  };

  return (
    <Dialog open={open} onClose={onClose} title="Chi tiết tuyển dụng" maxWidth="3xl">
      <div className="space-y-8 py-2">
        {/* Header Section */}
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PENDING" ? "warning" : "danger"} className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                  {job.status}
                </Badge>
                {job.featured && (
                  <Badge variant="sky" className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    FEATURED
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">{job.position}</h3>
              <p className="flex items-center gap-2 text-sm font-semibold text-sky-600">
                <Briefcase className="h-3.5 w-3.5" />
                {job.companyName || job.company}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0 sm:text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ngày đăng</div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 sm:justify-end">
                <Calendar className="h-4 w-4 text-sky-500" />
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : "---"}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={DollarSign} label="Mức lương" value={formatSalary()} color="emerald" />
          <InfoItem icon={Target} label="Cấp bậc" value={job.experienceLevel} color="indigo" />
          <InfoItem icon={Briefcase} label="Hình thức" value={job.jobType} color="orange" />
          <InfoItem icon={MapPin} label="Địa điểm" value={job.location} color="sky" />
          <InfoItem icon={Calendar} label="Hạn nộp" value={job.dueDate ? new Date(job.dueDate).toLocaleDateString('vi-VN') : "Không giới hạn"} color="rose" />
          <InfoItem icon={Users} label="Số lượng" value={job.maxAccept ? `${job.currentAccepted || 0} / ${job.maxAccept}` : "Không giới hạn"} color="slate" />
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tech Stack & Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {techList.length > 0 ? (
              techList.map((tech, index) => (
                <Badge key={index} variant="sky" className="rounded-lg bg-sky-50/50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors">
                  {tech}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Không có yêu cầu kỹ thuật cụ thể</span>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 gap-6">
          <ContentSection icon={Layout} title="Mô tả công việc" content={job.description} />
          <ContentSection icon={ClipboardList} title="Trách nhiệm chính" content={job.responsibilities} />
          <ContentSection icon={ArrowRight} title="Yêu cầu ứng viên" content={job.requirements} />
          <ContentSection icon={Gift} title="Quyền lợi & Phúc lợi" content={job.benefits} />
        </div>

        {/* Statistics info */}
        <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4 border-r border-white/10 pr-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sky-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ứng tuyển</p>
              <p className="text-xl font-black">{job.applicationCount || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-rose-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Lượt xem</p>
              <p className="text-xl font-black">{job.viewCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {job.status === "PENDING" && onAction && (
          <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 bg-white/80 p-6 backdrop-blur-md border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onAction(job, "approve");
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="h-5 w-5" />
              Phê duyệt ngay
            </button>
            <button
              onClick={() => {
                onClose();
                onAction(job, "reject");
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition-all hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]"
            >
              <XCircle className="h-5 w-5" />
              Từ chối Job
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};