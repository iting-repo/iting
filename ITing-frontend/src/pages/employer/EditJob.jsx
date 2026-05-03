import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import jobService from '../../services/jobService';
import PostJob from './PostJob';

const EditJob = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jobService.getJobDetail(id);
        setJobData(data);
      } catch (err) {
        console.error('Failed to fetch job detail:', err);
        setError(err?.message || 'Không thể tải thông tin công việc');
        toast.error('Không thể tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AB4E6] mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">
          {t('editJob.loading', 'Đang tải dữ liệu công việc...')}
        </p>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy công việc</h3>
        <p className="text-gray-500 mb-6">{error || 'Công việc không tồn tại hoặc bạn không có quyền chỉnh sửa.'}</p>
        <button
          onClick={() => navigate('/employer/manage-jobs')}
          className="px-6 py-3 bg-[#3AB4E6] text-white rounded-xl font-bold hover:bg-[#2d9dcb] transition-colors"
        >
          Quay về danh sách
        </button>
      </div>
    );
  }

  console.log("PostJob component:", PostJob);
  if (!PostJob) {
    return <div className="p-10 text-red-500">Error: PostJob component is undefined. This might be an import issue.</div>;
  }

  return (
    <PostJob
      initialData={jobData}
      isEdit={true}
      onClose={() => navigate('/employer/manage-jobs')}
      onSubmitSuccess={() => {
        // PostJob calls handleClose() after this, which triggers onClose → navigate
      }}
    />
  );
};

export default EditJob;