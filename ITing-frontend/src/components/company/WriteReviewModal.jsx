import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { FaTimes, FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import companyReviewService from '../../services/companyReviewService';

/**
 * Glassdoor-style review form modal.
 * Props: { open, onClose, companyId, companyName, onSuccess }
 */
const WriteReviewModal = ({ open, onClose, companyId, companyName, onSuccess }) => {
  const { currentUser } = useSelector((s) => s.auth);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm());

  if (!open) return null;

  const update = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: val }));
  };
  const setRating = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  const submit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để viết đánh giá');
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      toast.error('Vui lòng chọn rating từ 1-5');
      return;
    }
    if (!form.title?.trim() || !form.content?.trim()) {
      toast.error('Vui lòng điền tiêu đề + nội dung');
      return;
    }

    setSubmitting(true);
    try {
      await companyReviewService.submit(companyId, form);
      toast.success('Đã gửi! Đánh giá sẽ hiển thị sau khi admin duyệt.');
      setForm(initialForm());
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full my-8 p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3 right-3 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
        ><FaTimes /></button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Đánh giá {companyName}</h2>
        <p className="text-sm text-slate-500 mb-6">
          Đánh giá ẩn danh, chân thực. Sẽ được admin duyệt trước khi hiển thị.
        </p>

        <form onSubmit={submit} className="space-y-5">
          {/* Overall rating */}
          <div>
            <Label>Đánh giá tổng quan</Label>
            <StarRating value={form.rating} onChange={(v) => setRating('rating', v)} size={32} />
          </div>

          {/* Title + content */}
          <Field label="Tiêu đề ngắn">
            <input
              required maxLength={200}
              value={form.title} onChange={update('title')}
              placeholder="Ví dụ: Văn hóa tốt, lương cạnh tranh"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </Field>

          <Field label="Đánh giá chi tiết">
            <textarea
              required rows={3}
              value={form.content} onChange={update('content')}
              placeholder="Chia sẻ trải nghiệm chung của bạn..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
            />
          </Field>

          {/* Pros / Cons */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={<><FaThumbsUp className="inline text-green-500 mr-1" /> Điểm tốt</>}>
              <textarea rows={3} value={form.pros} onChange={update('pros')}
                placeholder="Văn hóa, đồng nghiệp, lương, OT..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" />
            </Field>
            <Field label={<><FaThumbsDown className="inline text-red-500 mr-1" /> Điểm chưa tốt</>}>
              <textarea rows={3} value={form.cons} onChange={update('cons')}
                placeholder="Quy trình, môi trường, cơ hội phát triển..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none" />
            </Field>
          </div>

          {/* Work info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tình trạng">
              <select value={form.workType} onChange={update('workType')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                <option value="CURRENT_EMPLOYEE">Đang làm</option>
                <option value="FORMER_EMPLOYEE">Đã nghỉ</option>
                <option value="INTERN">Thực tập sinh</option>
                <option value="CONTRACTOR">Freelancer/Contractor</option>
              </select>
            </Field>
            <Field label="Vị trí">
              <input value={form.jobTitle} onChange={update('jobTitle')}
                placeholder="VD: Senior Java Developer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </Field>
          </div>

          {/* Sub-ratings (Glassdoor-style 5 dimensions) */}
          <div className="bg-slate-50 rounded-lg p-4">
            <Label>Đánh giá chi tiết theo từng khía cạnh</Label>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <SubRating label="Văn hóa công ty"
                value={form.cultureRating} onChange={(v) => setRating('cultureRating', v)} />
              <SubRating label="Work-life balance"
                value={form.workLifeBalanceRating} onChange={(v) => setRating('workLifeBalanceRating', v)} />
              <SubRating label="Cơ hội thăng tiến"
                value={form.careerGrowthRating} onChange={(v) => setRating('careerGrowthRating', v)} />
              <SubRating label="Lương & phúc lợi"
                value={form.salaryBenefitsRating} onChange={(v) => setRating('salaryBenefitsRating', v)} />
              <SubRating label="Quản lý"
                value={form.managementRating} onChange={(v) => setRating('managementRating', v)} />
            </div>
          </div>

          <Field label="Bạn có giới thiệu công ty này cho bạn bè?">
            <div className="flex gap-3">
              <RadioBtn checked={form.wouldRecommend === true}
                onClick={() => setRating('wouldRecommend', true)} label="Có" />
              <RadioBtn checked={form.wouldRecommend === false}
                onClick={() => setRating('wouldRecommend', false)} label="Không" />
            </div>
          </Field>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="anon"
              checked={form.isAnonymous}
              onChange={(e) => setRating('isAnonymous', e.target.checked)} />
            <label htmlFor="anon" className="text-sm text-slate-700">
              Đăng ẩn danh (khuyến khích — bảo vệ bạn khỏi rủi ro công việc)
            </label>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">
              Hủy
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60">
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const initialForm = () => ({
  rating: 0, title: '', content: '',
  pros: '', cons: '',
  workType: 'FORMER_EMPLOYEE', jobTitle: '',
  cultureRating: 0, workLifeBalanceRating: 0,
  careerGrowthRating: 0, salaryBenefitsRating: 0,
  managementRating: 0,
  wouldRecommend: null, isAnonymous: true,
});

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-slate-700 mb-1.5">{children}</label>
);

const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

const StarRating = ({ value, onChange, size = 24 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n} type="button" onClick={() => onChange(n)}
        className="hover:scale-110 transition-transform"
        aria-label={`${n} sao`}
      >
        <FaStar size={size} className={n <= value ? 'text-amber-400' : 'text-slate-200'} />
      </button>
    ))}
  </div>
);

const SubRating = ({ label, value, onChange }) => (
  <div>
    <div className="text-xs text-slate-600 mb-1">{label}</div>
    <StarRating value={value || 0} onChange={onChange} size={20} />
  </div>
);

const RadioBtn = ({ checked, onClick, label }) => (
  <button type="button" onClick={onClick}
    className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
      checked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'
    }`}>
    {label}
  </button>
);

export default WriteReviewModal;
