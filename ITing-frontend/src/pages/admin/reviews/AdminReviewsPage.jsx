import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FaCheck, FaTimes, FaStar, FaFlag, FaClock, FaBuilding, FaThumbsUp, FaThumbsDown
} from 'react-icons/fa';
import SEO from '../../../components/common/SEO';
import adminReviewService from '../../../services/adminReviewService';

const TABS = [
  { code: 'PENDING', label: 'Chờ duyệt', color: 'amber' },
  { code: 'APPROVED', label: 'Đã duyệt', color: 'green' },
  { code: 'REJECTED', label: 'Đã từ chối', color: 'red' },
];

const AdminReviewsPage = () => {
  const [active, setActive] = useState('PENDING');
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      adminReviewService.list(active, 0, 50),
      adminReviewService.counts(),
    ])
      .then(([page, c]) => {
        setReviews(page.content || page || []);
        setCounts(c);
      })
      .catch(() => toast.error('Không tải được danh sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [active]); // eslint-disable-line

  const handleApprove = async (id) => {
    try {
      await adminReviewService.approve(id);
      toast.success('Đã duyệt');
      load();
    } catch { toast.error('Lỗi duyệt'); }
  };

  const handleReject = async () => {
    try {
      await adminReviewService.reject(rejectingId, rejectNote);
      toast.success('Đã từ chối');
      setRejectingId(null);
      setRejectNote('');
      load();
    } catch { toast.error('Lỗi từ chối'); }
  };

  return (
    <>
      <SEO title="Duyệt review công ty" noIndex />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Duyệt đánh giá công ty</h1>
        <p className="text-sm text-slate-500 mb-5">
          Review phải được duyệt trước khi hiển thị public
        </p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-5">
          {TABS.map((t) => (
            <button
              key={t.code}
              onClick={() => setActive(t.code)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                active === t.code
                  ? `border-${t.color}-500 text-${t.color}-700`
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-${t.color}-100 text-${t.color}-700`}>
                {counts[t.code]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl text-slate-400">
            Không có review nào ở trạng thái {active}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id} review={r}
                onApprove={() => handleApprove(r.id)}
                onReject={() => setRejectingId(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setRejectingId(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3">Từ chối review #{rejectingId}</h3>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
              placeholder="VD: Vi phạm chuẩn cộng đồng, spam, fake info..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejectingId(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-lg font-medium">Hủy</button>
              <button onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ReviewCard = ({ review, onApprove, onReject }) => {
  const workTypeLabel = {
    CURRENT_EMPLOYEE: 'Đang làm', FORMER_EMPLOYEE: 'Cựu nhân viên',
    INTERN: 'Thực tập', CONTRACTOR: 'Freelancer',
  }[review.workType] || 'Người dùng';
  const pending = review.moderationStatus === 'PENDING';

  return (
    <article className="bg-white p-5 rounded-xl ring-1 ring-slate-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Stars value={review.rating} />
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {workTypeLabel}
            </span>
            {review.reportCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                <FaFlag /> {review.reportCount} báo cáo
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900">{review.title}</h3>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><FaBuilding />{review.companyName} (#{review.companyId})</span>
            <span>· {review.authorEmail}</span>
            <span className="flex items-center gap-1"><FaClock />{new Date(review.createdAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {review.content && <p className="text-sm text-slate-700 mb-3">{review.content}</p>}

      {/* Pros/Cons */}
      {(review.pros || review.cons) && (
        <div className="grid sm:grid-cols-2 gap-2 my-3">
          {review.pros && (
            <div className="bg-green-50 rounded p-2">
              <div className="text-xs font-semibold text-green-700 mb-1"><FaThumbsUp className="inline" /> Pros</div>
              <p className="text-sm">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-red-50 rounded p-2">
              <div className="text-xs font-semibold text-red-700 mb-1"><FaThumbsDown className="inline" /> Cons</div>
              <p className="text-sm">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {pending && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button onClick={onApprove}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
            <FaCheck /> Duyệt
          </button>
          <button onClick={onReject}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
            <FaTimes /> Từ chối
          </button>
        </div>
      )}

      {!pending && review.moderatorNote && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          📝 Note moderator: {review.moderatorNote}
        </div>
      )}
    </article>
  );
};

const Stars = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} size={14}
        className={n <= (value || 0) ? 'text-amber-400' : 'text-slate-200'} />
    ))}
  </div>
);

export default AdminReviewsPage;
