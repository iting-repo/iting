import React, { useEffect, useState } from "react";
import {
   X,
   Users,
   CheckCircle2,
   XCircle,
   Clock,
   Eye,
   FileDown,
   MessageSquare,
   Loader2,
} from "lucide-react";
import { toast } from "sonner";
import adminApplicationService from "../../services/adminApplicationService";

const STATUS_META = {
   PENDING:   { label: "Chờ xử lý",     color: "text-amber-700 bg-amber-50 border-amber-200" },
   VIEWED:    { label: "Đã xem",        color: "text-sky-700 bg-sky-50 border-sky-200" },
   ACCEPTED:  { label: "Được nhận",     color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
   REJECTED:  { label: "Bị từ chối",    color: "text-red-700 bg-red-50 border-red-200" },
   WITHDRAWN: { label: "Đã rút đơn",    color: "text-slate-700 bg-slate-50 border-slate-200" },
};

const formatDateTime = (v) => {
   if (!v) return "—";
   const d = new Date(v);
   return isNaN(d.getTime())
      ? v
      : d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const JobApplicantsDialog = ({ job, open, onClose }) => {
   const [stats, setStats] = useState(null);
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(0);
   const [totalPages, setTotalPages] = useState(0);
   const PAGE_SIZE = 10;

   useEffect(() => {
      if (!open || !job?.id) return;
      let cancelled = false;
      const load = async () => {
         try {
            setLoading(true);
            const [statsRes, appsRes] = await Promise.all([
               adminApplicationService.getApplicationStatsByJob(job.id),
               adminApplicationService.getApplicationsByJob(job.id, { page, size: PAGE_SIZE }),
            ]);
            if (cancelled) return;
            setStats(statsRes?.data || statsRes);
            const appsData = appsRes?.data || appsRes;
            setApplications(appsData?.content || []);
            setTotalPages(appsData?.totalPages || 0);
         } catch (err) {
            console.error("Load applications error:", err);
            if (!cancelled) toast.error("Không tải được danh sách ứng viên.");
         } finally {
            if (!cancelled) setLoading(false);
         }
      };
      load();
      return () => { cancelled = true; };
   }, [open, job?.id, page]);

   // Reset page khi đổi job
   useEffect(() => {
      if (open) setPage(0);
   }, [job?.id, open]);

   if (!open) return null;

   return (
      <div
         className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
         <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
               <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <Users className="h-5 w-5 text-[#1967D2]" />
                     Ứng viên đã ứng tuyển
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                     #{job?.id} · {job?.title || job?.position}
                  </p>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
               >
                  <X className="h-5 w-5" />
               </button>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
               {loading && !stats ? (
                  <div className="flex items-center gap-2 text-slate-400 py-4">
                     <Loader2 className="h-4 w-4 animate-spin" /> Đang tải thống kê...
                  </div>
               ) : stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                     <StatCard
                        icon={<Users className="h-4 w-4 text-[#1967D2]" />}
                        label="Tổng đơn"
                        value={stats.total}
                        color="text-[#1967D2]"
                     />
                     <StatCard
                        icon={<Clock className="h-4 w-4 text-amber-600" />}
                        label="Chờ xử lý"
                        value={stats.pending}
                        color="text-amber-700"
                     />
                     <StatCard
                        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        label="Được nhận"
                        value={stats.accepted}
                        color="text-emerald-700"
                        suffix={stats.successRate > 0 ? `(${stats.successRate}%)` : ""}
                     />
                     <StatCard
                        icon={<XCircle className="h-4 w-4 text-red-600" />}
                        label="Từ chối"
                        value={stats.rejected}
                        color="text-red-700"
                        suffix={stats.rejectionRate > 0 ? `(${stats.rejectionRate}%)` : ""}
                     />
                     <StatCard
                        icon={<MessageSquare className="h-4 w-4 text-sky-600" />}
                        label="NTD đã phản hồi"
                        value={stats.employerResponded}
                        color="text-sky-700"
                        suffix={stats.responseRate > 0 ? `(${stats.responseRate}%)` : ""}
                     />
                  </div>
               ) : null}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
               {loading ? (
                  <div className="flex items-center justify-center py-16 text-slate-400">
                     <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách ứng viên...
                  </div>
               ) : applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                     <Users className="h-12 w-12 mb-3 opacity-30" />
                     <p className="text-sm font-medium">Chưa có ứng viên nào ứng tuyển job này.</p>
                  </div>
               ) : (
                  <table className="w-full text-sm">
                     <thead className="bg-slate-50 sticky top-0">
                        <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                           <th className="px-6 py-3 text-left">Ứng viên</th>
                           <th className="px-4 py-3 text-left">Trạng thái</th>
                           <th className="px-4 py-3 text-left">CV</th>
                           <th className="px-4 py-3 text-left">Thời gian ứng tuyển</th>
                           <th className="px-4 py-3 text-left">NTD phản hồi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {applications.map((app) => {
                           const meta = STATUS_META[app.status] || STATUS_META.PENDING;
                           const responded = app.status && app.status !== "PENDING";
                           return (
                              <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                       <img
                                          src={app.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName || "UV")}&background=random`}
                                          alt={app.applicantName}
                                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                       />
                                       <div className="min-w-0">
                                          <div className="font-bold text-slate-800 truncate">
                                             {app.applicantName || "—"}
                                          </div>
                                          <div className="text-xs text-slate-400 truncate">
                                             {app.email || "—"}
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
                                       {meta.label}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3">
                                    {app.cvUrl ? (
                                       <a
                                          href={app.cvUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-[#1967D2] hover:underline font-medium"
                                       >
                                          <FileDown className="h-3.5 w-3.5" />
                                          {app.cvFileName || "Tải CV"}
                                          {app.cvFileType && (
                                             <span className="text-[10px] text-slate-400 uppercase ml-0.5">
                                                .{app.cvFileType}
                                             </span>
                                          )}
                                       </a>
                                    ) : (
                                       <span className="text-slate-400 text-xs italic">Không có CV</span>
                                    )}
                                 </td>
                                 <td className="px-4 py-3 text-slate-600">
                                    {formatDateTime(app.timeSent)}
                                 </td>
                                 <td className="px-4 py-3">
                                    {responded ? (
                                       <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                          <Eye className="h-3.5 w-3.5" /> Đã phản hồi
                                       </span>
                                    ) : (
                                       <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                          <Clock className="h-3.5 w-3.5" /> Chưa phản hồi
                                       </span>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               )}
            </div>

            {/* Footer (pagination) */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white">
                  <span className="text-xs text-slate-500">
                     Trang {page + 1} / {totalPages}
                  </span>
                  <div className="flex gap-2">
                     <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        ‹ Trước
                     </button>
                     <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Sau ›
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

const StatCard = ({ icon, label, value, color, suffix }) => (
   <div className="bg-white rounded-xl border border-slate-100 px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
         {icon}
         {label}
      </div>
      <div className={`mt-1 text-xl font-black ${color}`}>
         {value ?? 0}
         {suffix && <span className="text-xs font-medium text-slate-400 ml-1.5">{suffix}</span>}
      </div>
   </div>
);

export default JobApplicantsDialog;
