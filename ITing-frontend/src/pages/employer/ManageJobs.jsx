import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserFriends,
  FaEye,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPlus,
  FaClock,
  FaPauseCircle,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "sonner";

import PostJob from "./PostJob";
import companyService from "../../services/companyService";
import { Breadcrumb } from "../../components/common";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * Sinh dãy số trang hiển thị, dùng dấu `...` khi danh sách dài.
 * Ví dụ: total=10, current=5 → [1, '...', 4, 5, 6, '...', 10]
 */
const buildPageList = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  sorted.forEach((p) => {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  });
  return result;
};

const formatJobType = (jobType) => {
  const map = {
    FULL_TIME: "Toàn thời gian",
    PART_TIME: "Bán thời gian",
    REMOTE: "Từ xa",
    FREELANCE: "Freelance",
    INTERN: "Thực tập",
    INTERNSHIP: "Thực tập",
    CONTRACT: "Hợp đồng",
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

const mapJobToTableRow = (job) => {
  // Auto-detect expired: if status is ACTIVE but dueDate has passed, treat as EXPIRED
  let effectiveStatus = job.status;
  if (job.dueDate && (job.status === 'ACTIVE' || job.status === 'active')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(job.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      effectiveStatus = 'EXPIRED';
    }
  }

  return {
    id: job.id,
    title: job.title || job.position || "Chưa cập nhật",
    type: formatJobType(job.jobType),
    deadline: formatDeadline(job.dueDate),
    status: effectiveStatus,
    apps: job.applicationCount ?? 0,
    raw: job,
  };
};

const ManageJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await companyService.getMyJobs(0, 200);
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
  }, [filterStatus, pageSize]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filterStatus === "All") return true;
      return job.status === filterStatus;
    });
  }, [jobs, filterStatus]);

  const totalItems = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp khi data co lại (vd. xoá job ở trang cuối)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = Math.min(indexOfFirstItem + pageSize, totalItems);
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const pageList = buildPageList(currentPage, totalPages);

  const toggleMenu = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  const handleReopenJob = async (jobId) => {
    const confirmed = window.confirm("Bạn có muốn mở lại tin tuyển dụng này?");
    if (!confirmed) return;

    try {
      await companyService.reopenEmployerJob(jobId);
      toast.success("Mở lại tin tuyển dụng thành công");
      setActiveMenu(null);
      await fetchJobs();
    } catch (err) {
      console.error("Lỗi reopen job:", err);
      toast.error(
        err?.response?.data?.message || "Mở lại tin tuyển dụng thất bại",
      );
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa?");
    if (!confirmed) return;

    try {
      await companyService.deleteEmployerJob(jobId);
      toast.success("Xóa tin tuyển dụng thành công");
      setActiveMenu(null);
      await fetchJobs();
    } catch (err) {
      console.error("Lỗi xóa job", err);
      toast.error(err?.response?.data?.message || "Xóa tin tuyển dụng thất bại");
    }
  };

  const handleAddNewJob = async () => {
    await fetchJobs();
  };

  const handleCloseJob = async (jobId) => {
    const confirmed = window.confirm("Bạn có chắc muốn đóng tin tuyển dụng này?");
    if (!confirmed) return;

    try {
      await companyService.closeEmployerJob(jobId);
      toast.success("Đóng tin tuyển dụng thành công");
      setActiveMenu(null);
      await fetchJobs();
    } catch (err) {
      console.error("Lỗi đóng job:", err);
      toast.error(
        err?.response?.data?.message || "Đóng tin tuyển dụng thất bại",
      );
    }
  };

  const STATUS_FILTER_OPTIONS = [
    { value: "All", label: "Tất cả" },
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "DRAFT", label: "Nháp" },
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
      label: "Chờ duyệt",
      color: "text-orange-500",
      icon: <FaClock />,
    },
    DRAFT: {
      label: "Nháp",
      color: "text-gray-500",
      icon: <FaPauseCircle />,
    },
    EXPIRED: {
      label: "Hết hạn",
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
      label: "Bị tạm dừng",
      color: "text-purple-600",
      icon: <FaBan />,
    },
  };

  return (
    <>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen">
        <Breadcrumb
          rootLabel="Tổng quan"
          rootLink="/employer/dashboard"
          items={[{ label: "Quản lý công việc" }]}
        />

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

        <div className="overflow-x-auto rounded-t-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-5">Công việc</th>
                <th className="p-5">Trạng thái</th>
                <th className="p-5">Số lượng hồ sơ</th>
                <th className="p-5 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loadingJobs ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="font-bold text-gray-800 text-base mb-1 group-hover:text-[#3AB4E6] transition-colors cursor-pointer">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                          {job.type}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 text-xs">
                          Hạn nộp: {job.deadline}
                        </span>
                      </div>
                    </td>

                    <td className="p-5">
                      {(() => {
                        const config = STATUS_CONFIG[job.status] || {
                          label: job.status || "Chưa cập nhật",
                          color: "text-gray-500",
                          icon: <FaTimesCircle />,
                        };

                        return (
                          <span
                            className={`flex items-center gap-2 font-medium text-sm ${config.color}`}
                          >
                            {config.icon} {config.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaUserFriends className="text-gray-400" />
                        <span className="font-semibold">{job.apps} hồ sơ</span>
                      </div>
                    </td>

                    <td className="p-5 text-right relative">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() =>
                            navigate(`/employer/job/${job.id}/applications`)
                          }
                          className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm"
                        >
                          Xem hồ sơ ({job.apps})
                        </button>

                        <button
                          onClick={() => toggleMenu(job.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${activeMenu === job.id
                              ? "bg-gray-200 text-gray-700"
                              : "hover:bg-gray-100 text-gray-400"
                            }`}
                        >
                          <BsThreeDotsVertical />
                        </button>

                        {activeMenu === job.id && (
                          <div className="absolute right-10 top-12 w-56 bg-white shadow-xl rounded-lg border border-gray-100 z-20 animate-fade-in-up overflow-hidden">
                            <button
                              onClick={() => {
                                setEditingJob(job.raw);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-2 border-b border-gray-50"
                            >
                              <FaEye /> Xem / Chỉnh sửa
                            </button>

                            {job.status === "ACTIVE" && (
                              <button
                                className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-2 border-b border-gray-50"
                                onClick={() => handleCloseJob(job.id)}
                              >
                                <FaBan /> Dừng đăng bài
                              </button>
                            )}

                            {job.status === "CLOSED" && (
                              <button
                                className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-b border-gray-50"
                                onClick={() => handleReopenJob(job.id)}
                              >
                                <FaCheckCircle /> Mở lại tin
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <FaTrash /> Xóa tin tuyển dụng
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Không tìm thấy công việc nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loadingJobs && totalItems > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 px-2">
            {/* Counter + page size */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                Hiển thị{" "}
                <span className="font-semibold text-gray-700">
                  {indexOfFirstItem + 1}-{indexOfLastItem}
                </span>{" "}
                trên <span className="font-semibold text-gray-700">{totalItems}</span> tin
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="page-size" className="text-gray-400">
                  Hiển thị:
                </label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-gray-200 text-gray-700 py-1.5 pl-2 pr-7 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm font-medium"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}/trang
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="Trang đầu"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100"
                }`}
              >
                <FaAngleDoubleLeft size={12} />
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                title="Trang trước"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100"
                }`}
              >
                <FaChevronLeft size={12} />
              </button>

              {pageList.map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`min-w-[40px] h-10 px-2 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentPage === p
                        ? "bg-[#1967D2] text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {p < 10 ? `0${p}` : p}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                title="Trang sau"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100"
                }`}
              >
                <FaChevronRight size={12} />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Trang cuối"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100"
                }`}
              >
                <FaAngleDoubleRight size={12} />
              </button>
            </div>
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
    </>
  );
};

export default ManageJobs;