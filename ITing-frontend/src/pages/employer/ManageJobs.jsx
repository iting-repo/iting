import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserFriends,
  FaEye,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaClock,
  FaPauseCircle,
  FaExclamationTriangle,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "sonner";
import PostJob from "./PostJob";
import JobPreview from "./JobPreview";
import companyService from "../../services/companyService";
import { ConfirmDialog, Table, Td } from "../../components/common";
import { buildEmployerJobApplicationsPath } from "../../utils/jobUrl";

const ITEMS_PER_PAGE = 5;

const formatJobType = (jobType) => {
  const map = {
    FULL_TIME: "Toàn thời gian",
    PART_TIME: "Bán thời gian",
    REMOTE: "Làm từ xa",
    FREELANCE: "Tự do",
    INTERN: "Thực tập",
  };

  return map[jobType] || jobType || "Chưa cập nhật";
};

const formatDeadline = (dueDate) => {
  if (!dueDate) return "Chưa có hạn";
  try {
    return new Date(dueDate).toLocaleDateString("vi-VN");
  } catch {
    return dueDate;
  }
};

const mapJobToTableRow = (job) => ({
  id: job.id,
  title: job.title,
  type: formatJobType(job.jobType),
  deadline: formatDeadline(job.dueDate),
  status: job.status,
  apps: job.applicationCount ?? 0,
  raw: job,
});

const ManageJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [previewJob, setPreviewJob] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });
  const [rejectionModal, setRejectionModal] = useState(null); // { title, reason }

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await companyService.getMyJobs(0, 50);
      const content = Array.isArray(data?.content) ? data.content : [];
      setJobs(content.map(mapJobToTableRow));
    } catch (err) {
      console.error("Lỗi load jobs:", err);
      toast.error("Không tải được danh sách công việc");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filterStatus === "All") return true;
      return job.status === filterStatus;
    });
  }, [jobs, filterStatus]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  const toggleMenu = (id, event) => {
    if (activeMenu === id) {
      setActiveMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 224, // 224 = w-56
    });
    setActiveMenu(id);
  };

  const handleReopenJob = (jobId) => {
    setConfirmModal({
      isOpen: true,
      title: "Mở lại tin tuyển dụng",
      message: "Bạn có muốn mở lại tin tuyển dụng này?",
      type: "info",
      onConfirm: async () => {
        try {
          await companyService.reopenEmployerJob(jobId);
          toast.success("Mở lại tin tuyển dụng thành công");
          await fetchJobs();
        } catch (err) {
          console.error("Lỗi reopen job:", err);
          toast.error(
            err?.response?.data?.message || "Mở lại tin tuyển dụng thất bại",
          );
        }
      },
    });
    setActiveMenu(null);
  };

  const handleRemoveJob = (jobId) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa tin tuyển dụng",
      message: "Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.",
      type: "danger",
      onConfirm: async () => {
        try {
          await companyService.deleteEmployerJob(jobId);
          toast.success("Xóa tin tuyển dụng thành công");
          await fetchJobs();
        } catch (err) {
          console.error("Lỗi xóa job", err);
          toast.error(
            err?.response?.data?.message || "Xóa tin tuyển dụng thất bại",
          );
        }
      },
    });
    setActiveMenu(null);
  };

  const handleAddNewJob = async () => {
    await fetchJobs();
  };

  const handleCloseJob = (jobId) => {
    setConfirmModal({
      isOpen: true,
      title: "Đóng tin tuyển dụng",
      message: "Bạn có chắc muốn đóng tin tuyển dụng này?",
      type: "warning",
      onConfirm: async () => {
        try {
          await companyService.closeEmployerJob(jobId);
          toast.success("Đóng tin tuyển dụng thành công");
          await fetchJobs();
        } catch (err) {
          console.error("Lỗi đóng job:", err);
          toast.error(
            err?.response?.data?.message || "Đóng tin tuyển dụng thất bại",
          );
        }
      },
    });
    setActiveMenu(null);
  };

  const STATUS_FILTER_OPTIONS = [
    { value: "All", label: "Tất cả" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "EXPIRED", label: "Hết hạn" },
    { value: "CLOSED", label: "Đã đóng" },
    { value: "REJECTED", label: "Bị từ chối" },
    { value: "NEEDS_REVISION", label: "Cần chỉnh sửa" },
    { value: "SUSPENDED", label: "Bị tạm dừng" },
  ];

  const STATUS_CONFIG = {
    ACTIVE: {
      label: "Đang hoạt động",
      color: "text-green-600",
      icon: <FaCheckCircle />,
    },
    PENDING: {
      label: "Đang chờ duyệt",
      color: "text-orange-500",
      icon: <FaClock />,
    },
    EXPIRED: {
      label: "Đã hết hạn",
      color: "text-red-500",
      icon: <FaTimesCircle />,
    },
    CLOSED: {
      label: "Đã đóng",
      color: "text-gray-700",
      icon: <FaBan />,
    },
    REJECTED: {
      label: "Bị từ chối",
      color: "text-red-600",
      icon: <FaTimesCircle />,
    },
    NEEDS_REVISION: {
      label: "Cần chỉnh sửa",
      color: "text-yellow-600",
      icon: <FaExclamationTriangle />,
    },
    SUSPENDED: {
      label: "Bị đình chỉ",
      color: "text-sky-600",
      icon: <FaBan />,
    },
  };

  return (
    <>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Tất cả công việc ({filteredJobs.length})
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Quản lý trạng thái và hồ sơ ứng tuyển
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="bg-[#1967D2] hover:bg-blue-700 text-white text-sm font-bold px-5 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <FaPlus size={12} />
              Đăng công việc
            </button>

            <span className="text-sm text-gray-500 font-medium">
              Trạng thái:
            </span>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[#3AB4E6] cursor-pointer text-sm font-medium shadow-sm hover:border-gray-300 transition-colors"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Table
          headers={[
            { label: "Công việc" },
            { label: "Trạng thái" },
            { label: "Số lượng hồ sơ" },
            { label: "Hành động", className: "text-right" }
          ]}
        >
          {loadingJobs ? (
            <tr>
              <Td colSpan="4" className="text-center py-10 text-gray-500">
                Đang tải dữ liệu...
              </Td>
            </tr>
          ) : currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-gray-50/60 transition-colors group"
              >
                <Td>
                  <div className="font-bold text-gray-800 text-base mb-1 group-hover:text-[#3AB4E6] transition-colors cursor-pointer">
                    {job.title}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                      {job.type}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 text-xs">
                      {job.deadline}
                    </span>
                  </div>
                </Td>

                <Td>
                  {(() => {
                    const config = STATUS_CONFIG[job.status] || {
                      label: job.status,
                      color: "text-gray-500",
                      icon: <FaTimesCircle />,
                    };

                    const hasReason = ["REJECTED", "NEEDS_REVISION", "SUSPENDED"].includes(job.status)
                      && job.raw?.reviewReason;

                    const tooltipTitle =
                      job.status === "REJECTED" ? "Lý do từ chối" :
                      job.status === "NEEDS_REVISION" ? "Cần chỉnh sửa" :
                      "Lý do đình chỉ";

                    const MAX_CHARS = 120;
                    const shortReason = hasReason && job.raw.reviewReason.length > MAX_CHARS
                      ? job.raw.reviewReason.slice(0, MAX_CHARS) + "..."
                      : job.raw.reviewReason;

                    return hasReason ? (
                      <div className="relative group/status inline-flex">
                        <span
                          className={`flex items-center gap-2 font-medium text-sm ${config.color} cursor-pointer`}
                          onClick={() => setRejectionModal({ title: tooltipTitle, reason: job.raw.reviewReason })}
                        >
                          {config.icon} {config.label}
                        </span>

                        {/* Hover tooltip – rộng hơn, giới hạn ký tự */}
                        <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover/status:flex flex-col" style={{ minWidth: "320px", maxWidth: "420px" }}>
                          <div className="bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-xl leading-relaxed w-full">
                            <p className="font-bold mb-1.5 text-gray-300 text-[11px] uppercase tracking-wide">{tooltipTitle}</p>
                            <p className="text-white break-words">{shortReason}</p>
                            {job.raw.reviewReason.length > MAX_CHARS && (
                              <p className="mt-2 text-blue-300 italic text-[10px]">Click để xem đầy đủ →</p>
                            )}
                          </div>
                          {/* Arrow */}
                          <div className="w-3 h-3 bg-gray-900 rotate-45 ml-4 -mt-1.5 shrink-0" />
                        </div>
                      </div>
                    ) : (
                      <span className={`flex items-center gap-2 font-medium text-sm ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                    );
                  })()}
                </Td>

                <Td>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUserFriends className="text-gray-400" />
                    <span className="font-semibold text-sm">
                      {job.apps} Hồ sơ ứng tuyển
                    </span>
                  </div>
                </Td>

                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3 transition-opacity">
                    <button
                      onClick={() => navigate(buildEmployerJobApplicationsPath(job.raw))}
                      className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm border border-transparent"
                    >
                      Xem hồ sơ ({job.apps})
                    </button>

                    <button
                      onClick={(e) => toggleMenu(job.id, e)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        activeMenu === job.id
                          ? "bg-gray-200 text-gray-700"
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {activeMenu &&
                      createPortal(
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenu(null)}
                          />
                          <div
                            className="fixed w-56 bg-white rounded-lg border border-black/20 z-50 overflow-hidden shadow-xl"
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                            }}
                          >
                            {(() => {
                              const selectedJob = jobs.find(
                                (j) => j.id === activeMenu,
                              );
                              if (!selectedJob) return null;

                              return (
                                <>
                                  <button
                                    onClick={() => {
                                      setPreviewJob(selectedJob.raw);
                                      setActiveMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-2 border-b border-gray-50"
                                  >
                                    <FaEye /> Xem thử tin tuyển dụng
                                  </button>

                                  <button
                                    onClick={() => {
                                      setEditingJob(selectedJob.raw);
                                      setActiveMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-2 border-b border-gray-50"
                                  >
                                    <FaEdit /> Chỉnh sửa tin tuyển dụng
                                  </button>

                                  {selectedJob.status === "ACTIVE" && (
                                    <button
                                      className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-2 border-b border-gray-50"
                                      onClick={() =>
                                        handleCloseJob(selectedJob.id)
                                      }
                                    >
                                      <FaBan /> Dừng đăng bài
                                    </button>
                                  )}

                                  {selectedJob.status === "CLOSED" && (
                                    <button
                                      className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-b border-gray-50"
                                      onClick={() =>
                                        handleReopenJob(selectedJob.id)
                                      }
                                    >
                                      <FaCheckCircle /> Đăng bài lại
                                    </button>
                                  )}

                                  <button
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    onClick={() => handleRemoveJob(selectedJob.id)}
                                  >
                                    <FaTrash /> Xóa bài đăng
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </>,
                        document.body,
                      )}
                  </div>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="4" className="text-center py-10 text-gray-500">
                Không tìm thấy việc làm nào.
              </Td>
            </tr>
          )}
        </Table>

        {!loadingJobs && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100"
              }`}
            >
              <FaChevronLeft size={12} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentPage === page
                    ? "bg-[#1967D2] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {page < 10 ? `0${page}` : page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100"
              }`}
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        )}

        {activeMenu && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setActiveMenu(null)}
          />
        )}
      </div>

      {editingJob && (
        <PostJob
          initialData={editingJob}
          isEdit={true}
          onClose={() => setEditingJob(null)}
          onSubmitSuccess={async () => {
            await fetchJobs();
            setEditingJob(null);
          }}
        />
      )}

      {isPostJobOpen && (
        <PostJob
          onClose={() => setIsPostJobOpen(false)}
          onSubmitSuccess={async () => {
            await handleAddNewJob();
            setIsPostJobOpen(false);
          }}
        />
      )}
      {previewJob && (
        <JobPreview job={previewJob} onClose={() => setPreviewJob(null)} />
      )}

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Modal lý do từ chối / đình chỉ */}
      {rejectionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setRejectionModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4 px-8 py-5 border-b border-gray-100">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <FaTimesCircle size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{rejectionModal.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Phản hồi từ Admin</p>
              </div>
              <button
                onClick={() => setRejectionModal(null)}
                className="ml-auto w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body – scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-sm text-red-800 leading-7 whitespace-pre-wrap break-words">
                {rejectionModal.reason || "Không có lý do cụ thể."}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-8 py-4 border-t border-gray-100">
              <button
                onClick={() => setRejectionModal(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageJobs;
