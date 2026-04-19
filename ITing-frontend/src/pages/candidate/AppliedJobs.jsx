import React, { useState, useEffect } from 'react';
import { FaCheck, FaArrowLeft, FaArrowRight, FaClock, FaTimes, FaEye, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import messageService from '../../services/messageService';
import { toast } from 'sonner';

const AppliedJobs = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/candidates/applications/my-applications', {
          params: { page: currentPage - 1, size: itemsPerPage }
        });
        const content = response?.content || response?.data?.content || [];
        setApplications(content);
        setTotalPages(response?.totalPages || response?.data?.totalPages || 0);
        setTotalElements(response?.totalElements || response?.data?.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'ACCEPTED':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'REJECTED':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'VIEWED':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return <FaCheck size={10} />;
      case 'REJECTED': return <FaTimes size={10} />;
      case 'VIEWED': return <FaEye size={10} />;
      default: return <FaClock size={10} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'ACCEPTED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'VIEWED': return 'Đã xem';
      default: return status || 'Không rõ';
    }
  };

  const handleStartChatWithEmployer = async (app) => {
    if (!app?.companyId) {
      toast.error('Khong tim thay thong tin nha tuyen dung de nhan tin.');
      return;
    }

    try {
      setChatLoadingId(app.id);
      const sent = await messageService.sendMessage({
        receiverId: app.companyId,
        receiverType: 'COMPANY',
        senderType: 'USER',
        content: `Chao ${app.companyName || 'nha tuyen dung'}, toi muon theo doi trang thai ho so ung tuyen ${app.jobTitle || ''}.`,
      });
      toast.success('Da mo cuoc tro chuyen voi nha tuyen dung.');
      navigate(`/messages?conversationId=${sent.conversationId}`);
    } catch (error) {
      toast.error(error?.message || 'Khong the mo chat luc nay.');
    } finally {
      setChatLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Công việc đã ứng tuyển <span className="text-gray-400 font-normal text-lg">({totalElements})</span>
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-100 mb-8">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 rounded-tl-lg">Công việc</th>
              <th className="p-4">Ngày ứng tuyển</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 rounded-tr-lg text-right">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">Đang tải...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">Bạn chưa ứng tuyển công việc nào.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 bg-white">
                        <img src={app.avatarUrl || "https://via.placeholder.com/50"} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800 text-base">{app.applicantName || "Ứng viên"}</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          {app.jobTitle || "Không rõ vị trí"}
                          {app.education && <span className="ml-2">🎓 {app.education}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-gray-500">
                    {app.timeSent ? new Date(app.timeSent).toLocaleDateString('vi-VN') : ''}
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-full border ${getStatusStyle(app.status)}`}>
                      {getStatusIcon(app.status)} {getStatusLabel(app.status)}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartChatWithEmployer(app)}
                        disabled={chatLoadingId === app.id}
                        className="bg-[#EAF6FF] hover:bg-[#3AB4E6] hover:text-white text-[#3AB4E6] text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm inline-flex items-center gap-2 disabled:opacity-60"
                      >
                        <FaEnvelope size={11} /> {chatLoadingId === app.id ? 'Dang mo...' : 'Nhan tin NTD'}
                      </button>
                      <button
                        onClick={() => navigate(`/candidate/applied-jobs/${app.jobId}`)}
                        className="bg-gray-100 hover:bg-[#3AB4E6] hover:text-white text-gray-500 text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#3AB4E6] hover:bg-blue-50'}`}
            >
                <FaArrowLeft size={10} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        currentPage === page
                        ? 'bg-[#1967D2] text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {page < 10 ? `0${page}` : page}
                </button>
            ))}

            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#3AB4E6] hover:bg-blue-50'}`}
            >
                <FaArrowRight size={10} />
            </button>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
