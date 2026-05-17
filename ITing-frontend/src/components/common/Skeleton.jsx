import React from 'react';

/**
 * Skeleton loader — hiệu ứng shimmer thay thế nội dung đang tải.
 *
 * Variants:
 *   - text     : một dòng chữ (mặc định)
 *   - title    : tiêu đề lớn hơn
 *   - avatar   : hình tròn
 *   - thumbnail: hình chữ nhật lớn
 *   - card     : một card hoàn chỉnh (avatar + 3 dòng text)
 *   - table-row: một hàng bảng (4 ô)
 *   - custom   : tự set width / height qua props
 *
 * @param {string}  variant   - Kiểu skeleton
 * @param {string}  className - Class bổ sung
 * @param {number}  count     - Số lượng skeleton lặp lại
 * @param {string}  width     - Chiều rộng tuỳ ý (chỉ dùng với variant="custom")
 * @param {string}  height    - Chiều cao tuỳ ý
 */
const Skeleton = ({ variant = 'text', className = '', count = 1, width, height }) => {
  // Base shimmer animation class
  const shimmer = 'animate-pulse bg-gray-200 rounded';

  const renderSingle = (key) => {
    switch (variant) {
      case 'title':
        return <div key={key} className={`${shimmer} h-6 w-3/4 ${className}`} />;

      case 'avatar':
        return <div key={key} className={`${shimmer} w-12 h-12 rounded-full ${className}`} />;

      case 'thumbnail':
        return <div key={key} className={`${shimmer} w-full h-40 rounded-xl ${className}`} />;

      case 'card':
        return (
          <div key={key} className={`bg-white rounded-xl border border-gray-100 p-5 space-y-4 ${className}`}>
            <div className="flex items-center gap-3">
              <div className={`${shimmer} w-12 h-12 rounded-xl shrink-0`} />
              <div className="flex-1 space-y-2">
                <div className={`${shimmer} h-4 w-2/3`} />
                <div className={`${shimmer} h-3 w-1/2`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className={`${shimmer} h-3 w-full`} />
              <div className={`${shimmer} h-3 w-5/6`} />
            </div>
            <div className="flex gap-2">
              <div className={`${shimmer} h-6 w-16 rounded-full`} />
              <div className={`${shimmer} h-6 w-20 rounded-full`} />
            </div>
          </div>
        );

      case 'table-row':
        return (
          <div key={key} className={`flex items-center gap-4 py-3 px-4 ${className}`}>
            <div className={`${shimmer} h-4 w-1/4`} />
            <div className={`${shimmer} h-4 w-1/4`} />
            <div className={`${shimmer} h-4 w-1/6`} />
            <div className={`${shimmer} h-4 w-1/5`} />
          </div>
        );

      case 'custom':
        return (
          <div
            key={key}
            className={`${shimmer} ${className}`}
            style={{ width: width || '100%', height: height || '1rem' }}
          />
        );

      // text (mặc định)
      default:
        return <div key={key} className={`${shimmer} h-4 w-full ${className}`} />;
    }
  };

  if (count === 1) return renderSingle(0);

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => renderSingle(i))}
    </div>
  );
};

/* ─── Preset combo tiện dùng ─── */

/** Skeleton cho một trang danh sách (nhiều card) */
Skeleton.List = ({ count = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} variant="card" />
    ))}
  </div>
);

/** Skeleton cho một bảng (header + rows) */
Skeleton.Table = ({ rows = 5, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 border-b border-gray-100">
      <div className="animate-pulse bg-gray-300 h-4 w-1/4 rounded" />
      <div className="animate-pulse bg-gray-300 h-4 w-1/4 rounded" />
      <div className="animate-pulse bg-gray-300 h-4 w-1/6 rounded" />
      <div className="animate-pulse bg-gray-300 h-4 w-1/5 rounded" />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} variant="table-row" />
    ))}
  </div>
);

/** Skeleton cho trang chi tiết (header lớn + nội dung) */
Skeleton.Detail = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    <div className="flex items-start gap-4">
      <Skeleton variant="avatar" className="w-16 h-16" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton className="w-1/3" />
      </div>
    </div>
    <Skeleton variant="thumbnail" className="h-48" />
    <div className="space-y-2">
      <Skeleton count={4} />
    </div>
  </div>
);

export default Skeleton;
