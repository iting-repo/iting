import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaClock, FaTimes, FaEye, FaEnvelope, FaBan, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { buildJobDetailPath } from '../../utils/jobUrl';
import applicationService from '../../services/applicationService';
import messageService from '../../services/messageService';
import { toast } from 'sonner';
import { Pagination, FilterBar } from '../../components/common';

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'VIEWED', label: 'Đã xem' },
  { value: 'ACCEPTED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'WITHDRAWN', label: 'Đã rút' },
];

// Cooldown 10s giữa các lần bấm rút (chống misclick) — backend cũng giới hạn 5 req / 5 phút.
const WITHDRAW_COOLDOWN_MS = 10_000;

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [withdrawLoadingId, setWithdrawLoadingId] = useState(null);
  const [lastWithdrawAt, setLastWithdrawAt] = useState(0);
  const [confirmWithdraw, setConfirmWithdraw] = useState(null); // { id, jobTitle, companyName }

  const currentPage = Number(searchParams.get('page')) || 1;
  const statusFilter = searchParams.get('status') || '';

  const updateParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== '') next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getMyApplications({
          page: currentPage - 1,
          size: PAGE_SIZE,
          ...(statusFilter ? { status: statusFilter } : {}),
        });
        const payload = response?.data ?? response;
        setApplications(payload?.content || []);
        setTotalPages(payload?.totalPages || 0);
        setTotalElements(payload?.totalElements || 0);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage, statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'ACCEPTED': return 'bg-green-50 text-green-600 border-green-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      case 'VIEWED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return <FaCheck size={10} />;
      case 'REJECTED': return <FaTimes size={10} />;
      case 'VIEWED': return <FaEye size={10} />;
      case 'WITHDRAWN': return <FaUndo size={10} />;
      default: return <FaClock size={10} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'ACCEPTED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'VIEWED': return 'Đã xem';
      case 'WITHDRAWN': return 'Đã rút';
      default: return status || 'Không rõ';
    }
  };

  // Chỉ cho rút khi đơn ở trạng thái PENDING/VIEWED (HR chưa quyết định).
  const canWithdraw = (status) => status === 'PENDING' || status === 'VIEWED';

  const handleWithdraw = async (app) => {
    if (!canWithdraw(app.status)) return;

    const now = Date.now();
    const sinceLast = now - lastWithdrawAt;
    if (sinceLast < WITHDRAW_COOLDOWN_MS) {
      const remain = Math.ceil((WITHDRAW_COOLDOWN_MS - sinceLast) / 1000);
      toast.warning(`Vui lòng đợi ${remain}s trước khi rút đơn tiếp theo.`);
      return;
    }

    setConfirmWithdraw(app);
  };

  const doWithdraw = async (app) => {
    try {
      setWithdrawLoadingId(app.id);
      setLastWithdrawAt(Date.now());
      await applicationService.withdrawApplication(app.id);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'WITHDRAWN' } : a))
      );
      toast.success('Đã rút đơn ứng tuyển thành công.');
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message;
      if (status === 409) {
        toast.error(msg || 'Không thể rút đơn ở trạng thái hiện tại.');
      } else if (status === 429) {
        toast.error('Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.');
      } else if (status === 403) {
        toast.error('Bạn không có quyền rút đơn này.');
      } else if (status === 404) {
        toast.error('Đơn ứng tuyển không còn tồn tại.');
      } else {
        toast.error(msg || 'Rút đơn thất bại, vui lòng thử lại.');
      }
      if (status !== 429) setLastWithdrawAt(0);
    } finally {
      setWithdrawLoadingId(null);
      setConfirmWithdraw(null);
    }
  };

  const executeWithdraw = async () => {
    if (!confirmWithdraw) return;
    await doWithdraw(confirmWithdraw);
  };

  const handleStartChatWithEmployer = async (app) => {
    if (!app?.companyId) {
      toast.error('Không tìm thấy thông tin nhà tuyển dụng để nhắn tin.');
      return;
    }

    try {
      setChatLoadingId(app.id);
      const sent = await messageService.sendMessage({
        receiverId: app.companyId,
        receiverType: 'COMPANY',
        senderType: 'USER',
        content: `Chào ${app.companyName || 'nhà tuyển dụng'}, tôi muốn theo dõi trạng thái hồ sơ ứng tuyển ${app.jobTitle || ''}.`,
      });
      toast.success('Đã mở cuộc trò chuyện với nhà tuyển dụng.');
      navigate(`/messages?conversationId=${sent.conversationId}`);
    } catch (error) {
      toast.error(error?.message || 'Không thể mở chat lúc này.');
    } finally {
      setChatLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 min-h-screen shadow-sm border border-gray-100 flex flex-col w-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Công việc đã ứng tuyển <span className="text-gray-400 font-normal text-lg">({totalElements})</span>
      </h2>

      <FilterBar
        filters={[{ key: 'status', label: 'Trạng thái', options: STATUS_FILTERS }]}
        values={{ status: statusFilter }}
        onChange={updateParam}
        onReset={() => setSearchParams({}, { replace: true })}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-100 mb-6">
        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
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
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">
                {statusFilter ? `Không có đơn ứng tuyển nào ở trạng thái "${getStatusLabel(statusFilter)}".` : 'Bạn chưa ứng tuyển công việc nào.'}
              </td></tr>
            ) : (
              applications.map((app) => {
                const isUnavailable = app.companyActive === false;
                return (
                <tr key={app.id} className={`transition-colors group ${isUnavailable ? 'bg-gray-50/40' : 'hover:bg-blue-50/30'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border bg-white ${isUnavailable ? 'border-gray-200 grayscale' : 'border-gray-100'}`}>
                        <img src={app.companyLogo || 'https://via.placeholder.com/50?text=Job'} alt="Company Logo" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Job'; }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`font-bold text-base ${isUnavailable ? 'text-gray-400' : 'text-gray-900'}`}>{app.jobTitle || 'Không rõ vị trí'}</div>
                          {isUnavailable && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-50 text-red-500 border border-red-100 inline-flex items-center gap-1">
                              <FaBan size={8} /> Công ty ngừng hoạt động
                            </span>
                          )}
                        </div>
                        <div className={`font-medium text-xs ${isUnavailable ? 'text-gray-400' : 'text-[#3AB4E6]'}`}>{app.companyName || 'Công ty chưa xác định'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{app.timeSent ? new Date(app.timeSent).toLocaleDateString('vi-VN') : ''}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-full border ${getStatusStyle(app.status)}`}>
                      {getStatusIcon(app.status)} {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => !isUnavailable && handleStartChatWithEmployer(app)}
                        disabled={chatLoadingId === app.id || isUnavailable}
                        className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm inline-flex items-center gap-2 ${
                          isUnavailable
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-[#EAF6FF] hover:bg-[#3AB4E6] hover:text-white text-[#3AB4E6] disabled:opacity-60'
                        }`}
                      >
                        <FaEnvelope size={11} /> {isUnavailable ? 'Không khả dụng' : chatLoadingId === app.id ? 'Đang mở...' : 'Nhắn tin NTD'}
                      </button>
                      {canWithdraw(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app)}
                          disabled={withdrawLoadingId === app.id}
                          title="Rút đơn ứng tuyển (chỉ áp dụng khi NTD chưa duyệt/từ chối)"
                          className="text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm inline-flex items-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-100 disabled:opacity-60"
                        >
                          <FaUndo size={11} /> {withdrawLoadingId === app.id ? 'Đang rút...' : 'Rút hồ sơ'}
                        </button>
                      )}
                      <Link to={buildJobDetailPath({
                          id: app.jobId,
                          title: app.jobTitle,
                          jobKey: app.jobKey
                        })}
                        className={`text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm inline-block ${
                          isUnavailable
                            ? 'bg-gray-100 text-gray-400 border border-gray-200'
                            : 'bg-gray-100 hover:bg-[#3AB4E6] hover:text-white text-gray-500'
                        }`}
                      >
                        Xem Chi Tiết
                      </Link>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
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

      {/* Custom Confirm Modal */}
      {confirmWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setConfirmWithdraw(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Xác nhận rút hồ sơ</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Bạn chắc chắn muốn rút đơn ứng tuyển vị trí{' '}
                <span className="font-bold text-gray-800">"{confirmWithdraw.jobTitle || 'Không rõ'}"</span>{' '}
                tại <span className="font-bold text-[#3AB4E6]">{confirmWithdraw.companyName || 'NTD'}</span>?
              </p>
              <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-600 font-medium">
                ⚠️ Hành động này không thể hoàn tác. Nhà tuyển dụng sẽ không còn thấy hồ sơ của bạn.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setConfirmWithdraw(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={executeWithdraw}
                disabled={withdrawLoadingId === confirmWithdraw.id}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {withdrawLoadingId === confirmWithdraw.id ? 'Đang xử lý...' : (<><FaUndo size={12} /> Xác nhận rút</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
