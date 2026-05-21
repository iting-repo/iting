import React from "react";
import { useModalEscape } from "../../hooks/useModalEscape";
import {
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaBriefcase,
  FaRegBookmark,
  FaBell,
  FaLaptop,
  FaGift,
  FaUser,
  FaAward,
  FaGraduationCap,
  FaWallet,
  FaTimes,
} from "react-icons/fa";

const normalizeList = (value, separator = ",") => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const JobPreview = ({ job, onClose }) => {
  useModalEscape(onClose);

  if (!job) return null;

  const formatSalary = (min, max) => {
    if (!min && !max) return "Thỏa thuận";
    const format = (n) => n?.toLocaleString("vi-VN") + " VNĐ";
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `Từ ${format(min)}`;
    return `Up to ${format(max)}`;
  };

  const descriptionList = normalizeList(job.description, "\n");
  const requirementsList = normalizeList(job.skills);

  const jobDetail = {
    title: job.title,
    company: job.companyName || "Công ty của bạn",
    logo: job.companyLogo || "https://via.placeholder.com/100",
    deadline: job.dueDate || "Chưa có",
    salary: formatSalary(job.minSalary, job.maxSalary),
    location: job.location || job.address || "Chưa cập nhật",
    description:
      descriptionList.length > 0 ? descriptionList : ["Không có mô tả chi tiết"],
    requirements:
      requirementsList.length > 0 ? requirementsList : ["Không có yêu cầu đặc biệt"],
    jobType: job.jobType || "Toàn thời gian",
    experience: job.experienceLevel || "Không yêu cầu kinh nghiệm",
    benefits: normalizeList(job.benefits, "\n"),
    responsibilities: normalizeList(job.responsibilities, "\n"),
    industry: Array.isArray(job.industries) && job.industries.length > 0 
      ? job.industries.join(", ") 
      : job.industry || "Công nghệ thông tin", 
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-7xl max-h-[98vh] overflow-y-auto bg-white rounded-2xl shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Sticky */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-[#3AB4E6] rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">Xem trước tin tuyển dụng</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-all hover:rotate-90"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* ================= LEFT COLUMN (CONTENT) ================= */}
            <div className="lg:col-span-8 space-y-10">
              {/* 1. JOB HEADER */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-[#E6F6FD] text-[#3AB4E6] text-xs font-bold px-3 py-1 rounded-full">
                    Mới đăng
                  </span>
                  <div className="flex-1"></div>
                  <button className="flex items-center gap-2 text-[#3AB4E6] text-sm font-bold border border-[#3AB4E6] px-4 py-2 rounded-lg hover:bg-[#E6F6FD] transition-colors">
                    <FaBell /> Gửi tôi việc làm tương tự
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm bg-white">
                    <img
                      src={jobDetail.logo}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{jobDetail.title}</h1>
                    <p className="text-gray-500 font-medium text-lg">{jobDetail.company}</p>
                  </div>
                </div>

                {/* Meta Data Row */}
                <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-500 bg-[#F5F7FA] p-5 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm"><FaBriefcase /></span>
                    {jobDetail.industry}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm"><FaClock /></span>
                    {jobDetail.jobType}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm"><FaDollarSign /></span>
                    {jobDetail.salary}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm"><FaMapMarkerAlt /></span>
                    {jobDetail.location}
                  </div>
                  <div className="w-full pt-3 mt-1 border-t border-gray-200 text-gray-400 text-xs">
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold">
                      Hạn nộp hồ sơ: {jobDetail.deadline}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Placeholder */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-[#3AB4E6] text-white font-bold rounded-lg opacity-80 cursor-not-allowed shadow-md">
                    Ứng Tuyển Ngay (Bản xem trước)
                  </button>
                  <button className="px-4 py-3 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
                    <FaRegBookmark size={20} />
                  </button>
                </div>
              </div>

              {/* 2. JOB DESCRIPTION & DETAILS */}
              <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[#3AB4E6] pl-4">Mô tả công việc</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    {jobDetail.description.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </section>

                {jobDetail.responsibilities.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[#3AB4E6] pl-4">Trách nhiệm</h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      {jobDetail.responsibilities.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </section>
                )}

                <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[#3AB4E6] pl-4">Yêu cầu ứng viên</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    {jobDetail.requirements.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </section>

                {jobDetail.benefits.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[#3AB4E6] pl-4">Quyền lợi</h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      {jobDetail.benefits.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </section>
                )}

                {/* Icons Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="flex gap-4 p-5 rounded-2xl bg-[#E6F6FD]/50 border border-[#E6F6FD]">
                    <div className="w-12 h-12 rounded-xl bg-white text-[#3AB4E6] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FaLaptop size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Thiết bị làm việc</h3>
                      <p className="text-sm text-gray-500">Được cấp máy tính làm việc</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl bg-[#E6F6FD]/50 border border-[#E6F6FD]">
                    <div className="w-12 h-12 rounded-xl bg-white text-[#3AB4E6] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FaGift size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Quyền lợi thêm</h3>
                      <p className="text-sm text-gray-500">BHXH, Team building, Thưởng du lịch hàng năm...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
            <div className="lg:col-span-4 space-y-8">
              {/* 1. THÔNG TIN CHUNG CARD */}
              <div className="bg-[#E6F6FD]/40 p-8 rounded-3xl border border-[#E6F6FD] shadow-sm">
                <h3 className="font-bold text-gray-800 mb-8 border-b border-[#E6F6FD] pb-4">Thông tin chung</h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaUser size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Cấp bậc</p>
                      <p className="text-gray-500 text-sm">Nhân viên</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaClock size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Hình thức làm việc</p>
                      <p className="text-gray-500 text-sm">{jobDetail.jobType}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaBriefcase size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Lĩnh vực</p>
                      <p className="text-gray-500 text-sm">{jobDetail.industry}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaAward size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Kinh nghiệm</p>
                      <p className="text-gray-500 text-sm">{jobDetail.experience}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaGraduationCap size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Học vấn</p>
                      <p className="text-gray-500 text-sm">Cao đẳng trở lên</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaWallet size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Lương</p>
                      <p className="text-gray-500 text-sm">{jobDetail.salary}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-[#3AB4E6] bg-white p-2.5 rounded-xl shadow-sm"><FaMapMarkerAlt size={16} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Địa điểm</p>
                      <p className="text-gray-500 text-sm">{jobDetail.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employer Preview Note */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm ring-1 ring-amber-200/50">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-sm">
                  <FaBriefcase className="text-amber-600" />
                  Ghi chú cho nhà tuyển dụng
                </h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Đây là giao diện xem trước của tin tuyển dụng khi hiển thị cho ứng viên. 
                  Hãy kiểm tra kỹ thông tin trước khi đăng bài để thu hút được ứng viên phù hợp nhất.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-8 py-5 flex justify-end gap-3 rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#3AB4E6] text-white font-bold rounded-xl hover:bg-[#2C9ACD] transition-all shadow-lg active:scale-95"
          >
            Đóng xem trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPreview;
