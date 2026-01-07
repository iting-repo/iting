import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jobService from '../../services/jobService';
import {
    FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark,
    FaExclamationTriangle, FaBell, FaLaptop, FaGift, FaUser,
    FaAward, FaGraduationCap, FaWallet, FaEnvelope, FaPhone, FaRegComment
} from 'react-icons/fa';
import JobCard from '../../components/JobCard';
import JobApplyModal from '../../components/JobApplyModal';

const JobDetailPage = () => {
    const { id } = useParams();
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        const fetchJobDetail = async () => {
            if (!id) return;
            try {
                const data = await jobService.getJobDetail(id);
                if (data) {
                    setJobDetail(data);
                }
            } catch (error) {
                console.error("Failed to fetch job detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [id]);

    // Helper to format currency
    const formatSalary = (min, max) => {
        if (!min && !max) return "Thỏa thuận";
        const format = (n) => n ? (n / 1000000) + " triệu" : "";
        if (min && max) return `${format(min)} - ${format(max)} VND`;
        if (min) return `Từ ${format(min)} VND`;
        if (max) return `Đến ${format(max)} VND`;
        return "Thỏa thuận";
    };

    // Helper to parse string content into list (assuming newlines or just display as paragraph)
    // The user said: "Phần chi tiết công việc đã có trong response... hiển thị đầy đủ các thông tin còn lại"
    // The API returns strings for description. Let's try to split by newline if applicable, or just show text.
    // For now, I will treat them as checking for new lines or bullet points.
    const renderContentList = (content) => {
        if (!content) return null;
        // Basic split by newline or return as single item
        return content.split('\n').filter(line => line.trim() !== '').map((item, idx) => <li key={idx}>{item}</li>);
    };

    const relatedJobs = [
        {
            id: 101,
            title: "Internal Creative Coordinator",
            company: "Green Group",
            logo: "https://logo.clearbit.com/spotify.com",
            category: "Commerce",
            type: "Full time",
            salary: "$44000-$46000",
            location: "New-York, USA",
            timePosted: "24 min ago"
        },
        // ... more mocks or fetch if API supports related jobs
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết công việc...</div>;
    }

    if (!jobDetail) {
        return <div className="min-h-screen flex items-center justify-center">Không tìm thấy công việc hoặc đã bị xoá.</div>;
    }

    return (
        <div className="bg-white min-h-screen py-10 font-sans">
            <JobApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                jobTitle={jobDetail.position}
                jobId={jobDetail.id}
            />
            <div className="container mx-auto px-4 max-w-7xl">

                {/* LAYOUT GRID: Left (Main) - Right (Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ================= LEFT COLUMN (CONTENT) ================= */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* 1. JOB HEADER */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#E6F6FD] text-[#00B4D8] text-xs font-bold px-3 py-1 rounded-full">
                                    {/* CreateAt logic if needed, or status */}
                                    {jobDetail.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                                </span>
                                <span className="flex-1"></span>
                                <button className="flex items-center gap-2 text-[#00B4D8] text-sm font-bold border border-[#00B4D8] px-4 py-2 rounded-lg hover:bg-[#E6F6FD] transition-colors">
                                    <FaBell /> Gửi tôi việc làm tương tự
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm overflow-hidden">
                                    {jobDetail.companyLogo && !logoError ? (
                                        <img
                                            src={jobDetail.companyLogo}
                                            alt="Company Logo"
                                            className="w-full h-full object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-3xl rounded-lg">
                                            {jobDetail.companyName ? jobDetail.companyName.charAt(0).toUpperCase() : 'C'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{jobDetail.position}</h1>
                                    <p className="text-gray-500 font-medium">{jobDetail.companyName}</p>
                                </div>
                            </div>

                            {/* Meta Data Row */}
                            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-500 bg-[#F5F7FA] p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaBriefcase /></span>
                                    {jobDetail.experienceLevel}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaClock /></span>
                                    {jobDetail.jobType}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaDollarSign /></span>
                                    {formatSalary(jobDetail.minSalary, jobDetail.maxSalary)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaMapMarkerAlt /></span>
                                    {jobDetail.location}
                                </div>
                                <div className="w-full pt-2 mt-2 border-t border-gray-200 text-gray-400 text-xs">
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded mr-2">Hạn nộp hồ sơ: {jobDetail.dueDate}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsApplyModalOpen(true)}
                                    className="flex-1 py-3 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] shadow-md transition-all transform hover:-translate-y-0.5">
                                    Ứng Tuyển Ngay
                                </button>
                                <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaRegBookmark size={20} />
                                </button>
                            </div>
                        </div>

                        {/* 2. JOB DESCRIPTION & DETAILS */}
                        <div className="space-y-8 text-gray-700 leading-relaxed">

                            {/* Mô tả */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả công việc</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {renderContentList(jobDetail.description)}
                                </ul>
                            </section>

                            {/* Yêu cầu */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu ứng viên</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {renderContentList(jobDetail.requirements)}
                                </ul>
                            </section>

                            {/* Yêu cầu công nghệ (Tech Stack) */}
                            {jobDetail.techRequired && (
                                <section>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Tech/Skill Yêu cầu</h2>
                                    <p className="text-sm">{jobDetail.techRequired}</p>
                                </section>
                            )}

                            {/* Icons Section (Thiết bị & Quyền lợi thêm) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0">
                                        <FaLaptop size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Hình thức</h3>
                                        <p className="text-sm text-gray-500">{jobDetail.jobType}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0">
                                        <FaGift size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Số lượng tuyển</h3>
                                        <p className="text-sm text-gray-500">{jobDetail.maxAccept} người</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Địa điểm & Thời gian */}
                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Địa điểm làm việc</h3>
                                    <p className="text-sm text-gray-500">• {jobDetail.location}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Thời gian</h3>
                                    <p className="text-sm text-gray-500">• Hạn nộp: {jobDetail.dueDate}</p>
                                </div>
                            </section>

                            {/* Bottom Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsApplyModalOpen(true)}
                                    className="px-6 py-2.5 bg-[#00B4D8] text-white font-bold rounded hover:bg-[#0096B4] transition-colors">
                                    Ứng Tuyển Ngay
                                </button>
                                <button className="px-6 py-2.5 border border-[#00B4D8] text-[#00B4D8] font-bold rounded hover:bg-[#E6F6FD] transition-colors">
                                    Lưu Tin
                                </button>
                            </div>

                            {/* Warning Banner */}
                            <div className="bg-gray-50 p-4 rounded-lg flex gap-3 border border-gray-100 items-start">
                                <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                                <p className="text-xs text-gray-500">
                                    <strong>Báo cáo tin tuyển dụng:</strong> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo, <a href="#" className="text-[#00B4D8] underline">hãy phản ánh với chúng tôi.</a>
                                </p>
                            </div>
                        </div>

                        {/* 3. RELATED JOBS */}
                        <div className="pt-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Việc làm liên quan</h2>
                            <div className="space-y-4">
                                {relatedJobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* 1. THÔNG TIN CHUNG CARD */}
                        <div className="bg-[#E6F6FD]/50 p-6 rounded-2xl">
                            <h3 className="font-bold text-gray-800 mb-6">Thông tin chung</h3>

                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaUser /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Cấp bậc</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.experienceLevel}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaClock /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Hình thức làm việc</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.jobType}</p>
                                    </div>
                                </div>
                                {/* <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaBriefcase /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lĩnh vực</p>
                                        <p className="text-gray-500 text-sm">Tài chính</p>
                                    </div>
                                </div> */}
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaWallet /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lương</p>
                                        <p className="text-gray-500 text-sm">{formatSalary(jobDetail.minSalary, jobDetail.maxSalary)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaMapMarkerAlt /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Địa điểm</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. CONTACT FORM (Giữ nguyên) */}
                        <div className="bg-[#E6F6FD]/30 p-6 rounded-2xl border border-[#E6F6FD]">
                            <h3 className="font-bold text-gray-800 mb-6">Gửi tin nhắn đến chúng tôi</h3>
                            <form className="space-y-4">
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <input type="text" placeholder="Tên đầy đủ" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none" />
                                </div>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <input type="email" placeholder="Địa chỉ email" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none" />
                                </div>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <input type="tel" placeholder="Số điện thoại" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none" />
                                </div>
                                <div className="relative">
                                    <FaRegComment className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                                    <textarea placeholder="Tin nhắn của bạn" rows="4" className="w-full pl-9 py-2.5 bg-white border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none resize-none"></textarea>
                                </div>
                                <button type="button" className="w-full py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] transition-colors shadow-sm text-sm">
                                    Gửi Tin Nhắn
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;