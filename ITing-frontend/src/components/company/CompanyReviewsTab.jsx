import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  FaStar, FaThumbsUp, FaFlag, FaPen, FaUserShield, FaBriefcase, FaTrash
} from 'react-icons/fa';
import companyReviewService from '../../services/companyReviewService';
import { ConfirmModal } from '../../components/common';
import useConfirm from '../../hooks/useConfirm';
import WriteReviewModal from './WriteReviewModal';

/**
 * Glassdoor-style reviews tab for a company detail page.
 *
 * Props: { companyId, companyName }
 */
const CompanyReviewsTab = ({ companyId, companyName }) => {
  const { currentUser } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [confirm, askConfirm, resetConfirm] = useConfirm();

  const load = () => {
    setLoading(true);
    companyReviewService.list(companyId)
      .then(setData)
      .catch(() => toast.error('Không tải được đánh giá'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (companyId) load(); }, [companyId]);

  const handleHelpful = async (reviewId) => {
    if (!currentUser) { toast.info('Đăng nhập để vote'); return; }
    try {
      const r = await companyReviewService.toggleHelpful(reviewId);
      // Update local state without reload
      setData((d) => ({
        ...d,
        reviews: d.reviews.map((x) =>
          x.id === reviewId ? { ...x, helpfulCount: r.helpfulCount } : x),
      }));
    } catch { toast.error('Lỗi vote'); }
  };

  const handleReport = (reviewId) => {
    if (!currentUser) { toast.info('Đăng nhập để báo cáo'); return; }
    askConfirm({
      title: "Báo cáo đánh giá",
      message: "Bạn chắc chắn muốn báo cáo đánh giá này là không phù hợp?",
      confirmText: "Báo cáo",
      variant: "warning",
      onConfirm: async () => {
        resetConfirm();
        try {
          await companyReviewService.report(reviewId);
          toast.success('Cảm ơn bạn đã báo cáo');
        } catch { toast.error('Lỗi báo cáo'); }
      }
    });
  };

  const handleDelete = (reviewId) => {
    if (!currentUser) return;
    askConfirm({
      title: "Xóa đánh giá",
      message: "Bạn chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
      variant: "danger",
      onConfirm: async () => {
        resetConfirm();
        try {
          await companyReviewService.delete(reviewId);
          toast.success('Đã xóa đánh giá');
          load();
        } catch { toast.error('Lỗi khi xóa đánh giá'); }
      }
    });
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Đang tải đánh giá...</div>;

  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6">
      {/* Header: summary + write button */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FaStar className="text-amber-400 text-2xl" />
            <span className="text-3xl font-bold text-slate-900">
              {data?.averageRating ?? 0}
            </span>
            <span className="text-slate-500">/5</span>
          </div>
          <div className="text-sm text-slate-600">
            {data?.totalReviews ?? 0} đánh giá ·{' '}
            <strong className="text-green-700">{data?.recommendPercent ?? 0}%</strong> giới thiệu công ty này
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWriteModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
        >
          <FaPen /> Viết đánh giá
        </button>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl">
          <FaPen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-1">Chưa có đánh giá nào cho công ty này</p>
          <p className="text-sm text-slate-400">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id} review={r}
              currentUserId={currentUser?.id}
              onHelpful={() => handleHelpful(r.id)}
              onReport={() => handleReport(r.id)}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}

      <WriteReviewModal
        open={showWriteModal}
        companyId={companyId}
        companyName={companyName}
        onClose={() => setShowWriteModal(false)}
        onSuccess={load}
      />

      <ConfirmModal isOpen={confirm.isOpen} onClose={resetConfirm} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} warning={confirm.warning} confirmText={confirm.confirmText} variant={confirm.variant} />
    </div>
  );
};

const ReviewCard = ({ review, currentUserId, onHelpful, onReport, onDelete }) => {
  const isAuthor = currentUserId && review.accountId && currentUserId === review.accountId;
  const workTypeLabel = {
    CURRENT_EMPLOYEE: 'Đang làm việc',
    FORMER_EMPLOYEE: 'Cựu nhân viên',
    INTERN: 'Thực tập sinh',
    CONTRACTOR: 'Freelancer',
  }[review.workType] || 'Người dùng';

  return (
    <article className="bg-white p-5 rounded-xl ring-1 ring-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stars value={review.rating} />
            {review.wouldRecommend && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Giới thiệu
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900">{review.title}</h3>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><FaUserShield />{review.authorName}</span>
            <span className="flex items-center gap-1"><FaBriefcase />{workTypeLabel}</span>
            {review.jobTitle && <span>· {review.jobTitle}</span>}
            <span>· {new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {review.content && (
        <p className="text-sm text-slate-700 leading-relaxed mb-3">{review.content}</p>
      )}

      {/* Pros / Cons */}
      {(review.pros || review.cons) && (
        <div className="grid sm:grid-cols-2 gap-3 my-3">
          {review.pros && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-700 mb-1">👍 Điểm tốt</div>
              <p className="text-sm text-slate-700">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-red-700 mb-1">👎 Điểm chưa tốt</div>
              <p className="text-sm text-slate-700">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Sub-ratings (compact horizontal) */}
      {(review.cultureRating || review.workLifeBalanceRating) && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3 pb-3 border-b border-slate-100">
          {[
            ['Văn hóa', review.cultureRating],
            ['WLB', review.workLifeBalanceRating],
            ['Thăng tiến', review.careerGrowthRating],
            ['Lương', review.salaryBenefitsRating],
            ['Quản lý', review.managementRating],
          ].map(([label, val]) => val ? (
            <div key={label} className="text-xs">
              <div className="text-slate-500">{label}</div>
              <div className="flex items-center gap-0.5"><Stars value={val} compact /></div>
            </div>
          ) : null)}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
        <button onClick={onHelpful} className="flex items-center gap-1 hover:text-blue-600">
          <FaThumbsUp /> Hữu ích ({review.helpfulCount})
        </button>
        <button onClick={onReport} className="flex items-center gap-1 hover:text-red-600">
          <FaFlag /> Báo cáo
        </button>
        {isAuthor && (
          <button onClick={onDelete} className="flex items-center gap-1 hover:text-red-600 ml-auto">
            <FaTrash /> Xóa
          </button>
        )}
      </div>
    </article>
  );
};

const Stars = ({ value, compact }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} size={compact ? 12 : 16}
        className={n <= (value || 0) ? 'text-amber-400' : 'text-slate-200'} />
    ))}
  </div>
);

export default CompanyReviewsTab;
