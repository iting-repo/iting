import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaTrophy } from 'react-icons/fa';
import meService from '../../services/meService';

/**
 * Compact profile completeness widget for CandidateDashboard.
 * Shows score (0-100), level label, top 3 missing items + link to profile editor.
 */
const ProfileCompletenessWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meService.getProfileCompleteness()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-white p-5 rounded-xl ring-1 ring-slate-200 animate-pulse h-32" />;
  }
  if (!data) return null;

  const pct = data.percentage || 0;
  const missing = (data.missingItems || []).slice(0, 3);
  const ringColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white p-5 rounded-xl ring-1 ring-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <FaTrophy className="text-amber-500" /> Hoàn thiện hồ sơ
        </h3>
        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
          {data.level}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {/* SVG circular progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={ringColor} strokeWidth="3"
                    strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900">{pct}%</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">
            Đã hoàn thành <strong className="text-slate-900">{data.completedItems?.length || 0}</strong>/{(data.completedItems?.length || 0) + missing.length + (data.missingItems?.length || 0) - missing.length}
            {' '}phần
          </p>
          {pct < 100 && (
            <p className="text-xs text-slate-500">
              💡 Hồ sơ ≥ 80% có cơ hội apply gấp 3x
            </p>
          )}
        </div>
      </div>

      {/* Top missing items */}
      {missing.length > 0 ? (
        <>
          <div className="space-y-2 mb-3">
            {missing.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">⭕ {item.label}</span>
                <span className="text-xs text-slate-400">+{item.weight} điểm</span>
              </div>
            ))}
          </div>
          <Link
            to="/candidate/profile"
            className="block text-center text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Hoàn thiện ngay <FaArrowRight className="inline ml-1 text-xs" />
          </Link>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <FaCheck /> Tuyệt vời! Hồ sơ đã đầy đủ.
        </div>
      )}
    </div>
  );
};

export default ProfileCompletenessWidget;
