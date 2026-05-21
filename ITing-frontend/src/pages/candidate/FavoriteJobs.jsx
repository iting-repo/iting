import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaMapMarkerAlt, FaTrashAlt,
  FaArrowRight, FaClock, FaBan, FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConfirmDialog, Table, Td, Pagination, FilterBar } from "../../components/common";
import { toast } from 'sonner';
import { buildJobDetailPath } from '../../utils/jobUrl';
import jobService from '../../services/jobService';
import { jobTypeLabel } from '../../utils/enumLabels';

const PAGE_SIZE = 10;

const TYPE_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'REMOTE', label: 'Làm việc từ xa' },
  { value: 'INTERN', label: 'Thực tập' },
  { value: 'CONTRACT', label: 'Hợp đồng' },
];

const FavoriteJobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

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
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getSavedJobs({
          page: currentPage - 1,
          size: PAGE_SIZE,
        });
        const payload = response?.data ?? response;
        setSavedJobs(payload?.content || []);
        setTotalPages(payload?.totalPages || 0);
        setTotalElements(payload?.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch saved jobs:", error);
        setSavedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [currentPage]);

  // Frontend filter on current page (backend chưa support jobType filter cho saved-jobs).
  const visibleJobs = useMemo(() => {
    if (!typeFilter) return savedJobs;
    return savedJobs.filter((j) => j.jobType === typeFilter);
  }, [savedJobs, typeFilter]);

  const getTypeStyle = (type) => {
    if (type === 'FULL_TIME') return 'bg-blue-50 text-blue-600';
    if (type === 'INTERN') return 'bg-sky-50 text-sky-600';
    if (type === 'REMOTE') return 'bg-green-50 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatSalary = (job) => {
    if (job.minSalary && job.maxSalary) {
      const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
      };
      return `${formatNum(job.minSalary)} - ${formatNum(job.maxSalary)}`;
    }
    return 'Thỏa thuận';
  };

  const handleRemove = (jobId) => {
    setConfirmModal({ isOpen: true, id: jobId });
  };

  const confirmRemove = async () => {
    const jobId = confirmModal.id;
    try {
      await jobService.unsaveJob(jobId);
      toast.success("Đã bỏ lưu công việc thành công!");
      setSavedJobs(prev => prev.filter(j => j.jobId !== jobId));
      setTotalElements(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Không thể bỏ lưu công việc");
    }
    setConfirmModal({ isOpen: false, id: null });
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Công việc đã lưu <span className="text-gray-400 font-normal text-lg">({totalElements})</span>
        </h2>
      </div>

      <FilterBar
        filters={[{ key: 'jobType', label: 'Loại công việc', options: TYPE_FILTERS }]}
        values={{ jobType: typeFilter }}
        onChange={updateParam}
        onReset={() => setSearchParams({}, { replace: true })}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : visibleJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {typeFilter ? 'Không có công việc nào ở loại đã chọn (trong trang hiện tại).' : 'Bạn chưa lưu công việc nào.'}
        </div>
      ) : (
        <>
          <Table
            headers={[
              { label: "Công việc" },
              { label: "Mức lương" },
              { label: "Thời gian" },
              { label: "Hành động", className: "text-right" }
            ]}
          >
            {visibleJobs.map((job) => {
              const isUnavailable = job.companyActive === false;
              return (
              <tr
                key={job.jobId}
                className={`transition-all group ${isUnavailable ? 'opacity-60 bg-gray-50/50' : 'hover:bg-gray-50/60'}`}
              >
                <Td>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 bg-white rounded-lg border p-2 flex items-center justify-center ${isUnavailable ? 'border-gray-200 grayscale' : 'border-gray-100'}`}>
                      <img src={job.companyLogo || "https://via.placeholder.com/50"} alt={job.companyName} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          onClick={() => !isUnavailable && navigate(buildJobDetailPath({ ...job, title: job.jobTitle, id: job.jobId }))}
                          className={`font-bold text-sm transition-colors ${isUnavailable ? 'text-gray-400 cursor-default line-through' : 'text-gray-800 group-hover:text-[#3AB4E6] cursor-pointer'}`}
                        >
                          {job.jobTitle}
                        </h3>
                        {isUnavailable && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-50 text-red-500 border border-red-100 flex items-center gap-1">
                            <FaBan size={8} /> Không khả dụng
                          </span>
                        )}
                        {!isUnavailable && job.jobType && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getTypeStyle(job.jobType)}`}>
                            {jobTypeLabel(job.jobType)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} className="text-gray-400" /> {job.location || 'Không rõ'}</span>
                        <span className="font-medium">{job.companyName}</span>
                      </div>
                    </div>
                  </div>
                </Td>

                <Td>
                  <span className={`font-bold ${isUnavailable ? 'text-gray-400' : 'text-gray-700'}`}>{formatSalary(job)}</span>
                </Td>

                <Td>
                  {isUnavailable ? (
                    <span className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-2.5 py-1 rounded-full w-fit border border-red-100">
                      <FaExclamationTriangle size={10} /> Ngừng hoạt động
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                      <FaClock size={10} /> Đã lưu
                    </span>
                  )}
                </Td>

                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3 transition-opacity">
                    <button
                      onClick={() => handleRemove(job.jobId)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Bỏ lưu"
                    >
                      <FaTrashAlt size={16} />
                    </button>

                    {isUnavailable ? (
                      <span className="bg-gray-100 text-gray-400 font-bold py-2 px-4 rounded-lg text-xs whitespace-nowrap border border-gray-200 cursor-not-allowed inline-flex items-center gap-2">
                        <FaBan size={10} /> Đã khóa
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(buildJobDetailPath({ ...job, title: job.jobTitle, id: job.jobId }))}
                        className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-xs whitespace-nowrap shadow-sm border border-transparent"
                      >
                        Chi Tiết <FaArrowRight size={10} />
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
              );
            })}
          </Table>

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

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmRemove}
        title="Bỏ lưu công việc"
        message="Bạn có chắc muốn bỏ lưu công việc này?"
        type="warning"
      />
    </div>
  );
};

export default FavoriteJobs;
