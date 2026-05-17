/**
 * Shared formatting utilities — single source of truth for
 * salary formatting, job type styling/labels, and date formatting.
 */

// ── Salary ──

const formatNum = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};

/**
 * Format salary range from a job object that has minSalary / maxSalary.
 * Also accepts explicit (min, max) for public pages.
 */
export const formatJobSalary = (minOrJob, max) => {
  // Called with a job object: formatJobSalary(job)
  if (minOrJob && typeof minOrJob === 'object') {
    const job = minOrJob;
    if (job.minSalary && job.maxSalary) {
      return `${formatNum(job.minSalary)} - ${formatNum(job.maxSalary)}`;
    }
    return 'Thỏa thuận';
  }
  // Called with two numbers: formatJobSalary(min, max)
  if (minOrJob && max) {
    return `${formatNum(minOrJob)} - ${formatNum(max)}`;
  }
  return 'Thỏa thuận';
};

// ── Job Type ──

export const getTypeStyle = (type) => {
  switch (type) {
    case 'FULL_TIME': return 'bg-blue-50 text-blue-600';
    case 'INTERN': return 'bg-sky-50 text-sky-600';
    case 'REMOTE': return 'bg-green-50 text-green-600';
    case 'PART_TIME': return 'bg-purple-50 text-purple-600';
    case 'CONTRACT': return 'bg-orange-50 text-orange-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const formatType = (type) => {
  switch (type) {
    case 'FULL_TIME': return 'Full Time';
    case 'PART_TIME': return 'Part Time';
    case 'REMOTE': return 'Remote';
    case 'INTERN': return 'Internship';
    case 'CONTRACT': return 'Contract';
    default: return type || '';
  }
};

// ── Date ──

export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Vừa xong';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return '1 ngày trước';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const getDaysRemaining = (dueDate) => {
  if (!dueDate) return '';
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Đã hết hạn';
  if (diff === 1) return '1 ngày còn lại';
  return `${diff} ngày còn lại`;
};
