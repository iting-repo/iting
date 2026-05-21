import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaRegBookmark, FaBookmark,
  FaArrowRight, FaClock, FaBell
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Pagination, FilterBar } from '../../components/common';
import jobAlertService from '../../services/jobAlertService';
import { buildJobDetailPath } from '../../utils/jobUrl';

const PAGE_SIZE = 10;

const TYPE_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
];

const JobAlerts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const currentPage = Number(searchParams.get('page')) || 1;
  const typeFilter = searchParams.get('jobType') || '';

  const updateParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== '') next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchJobAlerts = async () => {
      try {
        setLoading(true);
        const response = await jobAlertService.list({
          page: currentPage - 1,
          size: PAGE_SIZE,
        });
        const payload = response?.data ?? response;
        setAlerts(payload?.content || []);
        setTotalPages(payload?.totalPages || 0);
        setTotalElements(payload?.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch job alerts:", error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAlerts();
  }, [currentPage]);

  // Frontend filter trên page hiện tại (backend chưa support jobType cho job-alerts).
  const visibleAlerts = useMemo(() => {
    if (!typeFilter) return alerts;
    return alerts.filter((a) => a.jobType === typeFilter);
  }, [alerts, typeFilter]);

  const getTypeStyle = (type) => {
    if (type === 'FULL_TIME') return 'bg-blue-50 text-blue-600';
    if (type === 'INTERN') return 'bg-sky-50 text-sky-600';
    if (type === 'REMOTE') return 'bg-green-50 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatType = (type) => {
    switch (type) {
      case 'FULL_TIME': return 'Full Time';
      case 'PART_TIME': return 'Part Time';
      case 'REMOTE': return 'Remote';
      case 'INTERN': return 'Internship';
      case 'CONTRACT': return 'Contract';
      default: return type || '';
    }
  };

  const formatSalary = (job) => {
    if (job.minSalary && job.maxSalary) {
      const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
      };
      return `${formatNum(job.minSalary)}-${formatNum(job.maxSalary)}`;
    }
    return 'Thỏa thuận';
  };

  const formatDate = (dateStr) => {
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

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return '';
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'Đã hết hạn';
    if (diff === 1) return '1 ngày còn lại';
    return `${diff} ngày còn lại`;
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBell className="text-[#3AB4E6]" />
          Thông báo việc làm
          {totalElements > 0 && (
            <span className="bg-blue-100 text-[#3AB4E6] text-sm px-2 py-1 rounded-full ml-2">{totalElements}</span>
          )}
        </h2>
        <div className="text-sm text-gray-500 hidden md:block">
          Hiển thị các công việc từ công ty bạn theo dõi
        </div>
      </div>

      <FilterBar
        filters={[{ key: 'jobType', label: 'Loại công việc', options: TYPE_FILTERS }]}
        values={{ jobType: typeFilter }}
        onChange={updateParam}
        onReset={() => setSearchParams({}, { replace: true })}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : visibleAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg mb-2">
            {typeFilter ? 'Không có công việc nào ở loại đã chọn (trong trang hiện tại).' : 'Chưa có thông báo việc làm'}
          </p>
          {!typeFilter && (
            <p className="text-sm">Hãy theo dõi các công ty để nhận thông báo việc làm mới.</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {visibleAlerts.map((job) => (
              <div
                key={job.jobId}
                className="group relative border border-gray-100 rounded-xl p-5 hover:border-[#3AB4E6] hover:shadow-lg transition-all bg-white flex flex-col md:flex-row items-center gap-6"
              >
                <div className="w-14 h-14 shrink-0 bg-white rounded-lg border border-gray-100 p-2 flex items-center justify-center">
                  <img src={job.companyLogo || "https://via.placeholder.com/50"} alt={job.companyName} className="w-full h-full object-contain" />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3
                      onClick={() => navigate(buildJobDetailPath({ ...job, id: job.jobId }))}
                      className="font-bold text-gray-800 text-lg group-hover:text-[#3AB4E6] transition-colors cursor-pointer"
                    >
                      {job.title}
                    </h3>
                    {job.jobType && (
                      <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeStyle(job.jobType)}`}>
                        {formatType(job.jobType)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-gray-400" /> {job.location || 'Không rõ'}</span>
                    <span className="flex items-center gap-1.5"><FaDollarSign className="text-gray-400" /> {formatSalary(job)}</span>
                    {job.dueDate && (
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-gray-400" /> {getDaysRemaining(job.dueDate)}</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <FaClock /> Đăng tải: {formatDate(job.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <button className="text-gray-400 hover:text-[#3AB4E6] text-xl transition-colors">
                    {job.isSaved ? <FaBookmark className="text-[#3AB4E6]" /> : <FaRegBookmark />}
                  </button>

                  <button
                    onClick={() => navigate(buildJobDetailPath({ ...job, id: job.jobId }))}
                    className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    Ứng Tuyển <FaArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={PAGE_SIZE}
              onPageChange={(p) => updateParam('page', String(p))}
            />
          )}
        </>
      )}
    </div>
  );
};

export default JobAlerts;
