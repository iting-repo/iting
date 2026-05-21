import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaClock,
  FaRegBookmark, FaBookmark, FaTimes, FaUserTie,
} from 'react-icons/fa';
import { toast } from 'sonner';
import jobService from '../services/jobService';
import { storage } from '../utils/storage';
import { buildJobDetailPath } from '../utils/jobUrl';
import { jobTypeLabel, experienceLevelLabel } from '../utils/enumLabels';
import { CompanyLogo } from './common';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  const t = (n) => Number(n).toLocaleString('vi-VN');
  if (min && max) return `${t(min)} - ${t(max)} VND`;
  if (min) return `Từ ${t(min)} VND`;
  return `Đến ${t(max)} VND`;
};

const formatDate = (d) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return null; }
};

const daysLeft = (dueDate) => {
  if (!dueDate) return null;
  const ms = new Date(dueDate).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
};

const renderBullets = (text) => {
  if (!text) return null;
  const lines = String(text)
    .split(/\r?\n/)
    .map((s) => s.replace(/^[-•*•]\s*/, '').trim())
    .filter(Boolean);
  if (lines.length <= 1) return <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{text}</p>;
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ul>
  );
};

const JobPreviewPane = ({ job, onClose, variant = 'inline' }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.auth);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = Boolean(storage.getToken());

  useEffect(() => {
    if (!job?.id) { setDetail(null); return; }
    let active = true;
    setLoading(true);
    jobService.getJobDetail(job.id)
      .then((data) => { if (active) setDetail(data); })
      .catch(() => { if (active) setDetail(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [job?.id]);

  useEffect(() => {
    if (!canSave || !job?.id) { setIsSaved(false); return; }
    let active = true;
    import('../utils/axiosInstance').then(({ default: axios }) =>
      axios.get(`/candidates/saved-jobs/${job.id}/check`)
        .then((r) => { if (active) setIsSaved(Boolean(r?.saved)); })
        .catch(() => { if (active) setIsSaved(false); })
    );
    return () => { active = false; };
  }, [canSave, job?.id]);

  if (!job) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5">
        <FaBriefcase size={36} className="mx-auto mb-3 text-gray-200" />
        <p className="font-semibold text-gray-500 mb-1">Chọn một công việc để xem chi tiết</p>
        <p className="text-xs">Nhấn vào thẻ công việc bên trái để xem trước nội dung.</p>
      </div>
    );
  }

  const data = detail || job;
  const title = data.title || data.position || job.title || 'Vị trí tuyển dụng';
  const company = data.companyName || data.company || job.company || job.companyName || 'Công ty';
  const salary = formatSalary(data.minSalary, data.maxSalary);
  const location = data.location || data.province || job.location || 'Việt Nam';
  const type = data.jobType || job.type || 'FULL_TIME';
  const exp = data.experienceLevel || job.experienceLevel;
  const due = formatDate(data.dueDate);
  const daysRemain = daysLeft(data.dueDate);

  const skills = Array.isArray(data.skills)
    ? data.skills
    : (data.skills ? String(data.skills).split(',').map((s) => s.trim()) : []);

  const handleViewFull = () => navigate(buildJobDetailPath(data));

  const handleApply = () => {
    if (!currentUser?.token) { navigate('/login'); return; }
    navigate(buildJobDetailPath(data) + '#apply');
  };

  const handleToggleSave = async () => {
    if (!canSave) { toast.error('Vui lòng đăng nhập để lưu công việc.'); return; }
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await jobService.unsaveJob(job.id);
        setIsSaved(false);
        toast.success('Đã bỏ lưu công việc.');
      } else {
        await jobService.saveJob(job.id);
        setIsSaved(true);
        toast.success('Đã lưu công việc.');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể lưu công việc.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="px-6 pt-6 pb-5 border-b border-gray-100 relative">
        {variant === 'fixed' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
            aria-label="Đóng"
          >
            <FaTimes size={12} />
          </button>
        )}

        <div className="flex gap-4 items-start">
          <div className="w-16 h-16 rounded-xl border border-gray-100 p-2 bg-white flex items-center justify-center shrink-0">
            <CompanyLogo
              logoUrl={data.companyLogo || data.logoUrl || data.logo}
              companyId={data.companyId}
              companyName={company}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1 line-clamp-2">{title}</h2>
            <p className="text-sm text-gray-600 font-medium mb-2">{company}</p>
            <p className="text-base font-bold text-[#3AB4E6]">{salary}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-600">
          <Meta icon={<FaMapMarkerAlt className="text-gray-400" />} value={location} />
          <Meta icon={<FaUserTie className="text-gray-400" />} value={exp ? experienceLevelLabel(exp) : jobTypeLabel(type)} />
          <Meta icon={<FaClock className="text-gray-400" />}
                value={daysRemain !== null ? `Còn ${daysRemain} ngày` : (due ? `Hạn ${due}` : '—')} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">Đang tải…</div>
        )}

        {skills.length > 0 && (
          <Section title="Kỹ năng">
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={`${s}-${i}`} className="px-3 py-1 bg-blue-50 text-[#3AB4E6] text-xs font-medium rounded-full">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {data.description && (
          <Section title="Mô tả công việc">{renderBullets(data.description)}</Section>
        )}
        {data.requirements && (
          <Section title="Yêu cầu ứng viên">{renderBullets(data.requirements)}</Section>
        )}
        {data.benefits && (
          <Section title="Quyền lợi">{renderBullets(data.benefits)}</Section>
        )}

        {!loading && !data.description && !data.requirements && !data.benefits && skills.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            Chưa có nội dung chi tiết. Bấm "Xem chi tiết" để mở trang đầy đủ.
          </p>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <button
          onClick={handleToggleSave}
          disabled={isSaving}
          title={isSaved ? 'Bỏ lưu' : 'Lưu công việc'}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
            isSaved
              ? 'bg-[#3AB4E6] text-white border-[#3AB4E6]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#3AB4E6] hover:text-[#3AB4E6]'
          } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isSaved ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-[#3AB4E6] bg-white border border-[#3AB4E6] hover:bg-[#3AB4E6]/5 transition"
        >
          Ứng tuyển
        </button>
        <button
          onClick={handleViewFull}
          className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#3AB4E6] hover:bg-[#2C9ACD] shadow-md shadow-blue-200 transition"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

const Meta = ({ icon, value }) => (
  <div className="flex items-center gap-1.5 truncate">
    {icon}<span className="truncate">{value}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
    {children}
  </div>
);

export default JobPreviewPane;
