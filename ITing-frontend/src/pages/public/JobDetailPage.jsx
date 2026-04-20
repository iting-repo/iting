import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNowStrict, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { fetchJobDetailRequest } from '../../store/job/jobSlice';
import {
    FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark,
    FaExclamationTriangle, FaBell, FaLaptop, FaGift, FaUser,
    FaAward, FaGraduationCap, FaWallet, FaEnvelope, FaPhone, FaRegComment,
    FaExternalLinkAlt, FaUsers, FaLayers
} from 'react-icons/fa';
import JobCard from '../../components/JobCard';
import JobApplyModal from '../../components/JobApplyModal';
import companyService from '../../services/companyService';
import { Breadcrumb, CompanyLogo } from '../../components/common';
import {
    buildJobDetailPath,
    getJobTitle,
    normalizeJobKey,
    slugify,
    getCompanyLogoUrl,
} from '../../utils/jobUrl';
import applicationService from '../../services/applicationService';

const normalizeList = (value, separator = ',') => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value.split(separator).map((item) => item.trim()).filter(Boolean);
    }

    return [];
};

const JobDetailPage = () => {
    const { slug, jobKey } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentJob, isLoading } = useSelector(state => state.job || {});
    const { user, isAuthenticated } = useSelector(state => state.auth || {});
    const normalizedJobKey = normalizeJobKey(jobKey);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        if (normalizedJobKey) {
            dispatch(fetchJobDetailRequest(normalizedJobKey));
        }
    }, [normalizedJobKey, dispatch]);

    useEffect(() => {
        if (!currentJob || !normalizedJobKey) return;

        const expectedSlug = slugify(getJobTitle(currentJob)) || 'chi-tiet-viec-lam';
        if (slug !== expectedSlug) {
            navigate(buildJobDetailPath(currentJob), { replace: true });
        }
    }, [currentJob, navigate, normalizedJobKey, slug]);

    useEffect(() => {
        const checkAppStatus = async () => {
            if (isAuthenticated && user?.role === 'CANDIDATE' && currentJob?.id) {
                try {
                    const res = await applicationService.checkApplied(currentJob.id);
                    setHasApplied(res?.hasApplied || false);
                } catch (err) {
                    console.error("Check applied error:", err);
                }
            }
        };
        checkAppStatus();
    }, [isAuthenticated, user, currentJob]);

    const [companyInfo, setCompanyInfo] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            if (currentJob?.companyId) {
                try {
                    const res = await companyService.getCompanyDetail(currentJob.companyId);
                    setCompanyInfo(res);
                } catch (err) {
                    console.error("Fetch company detail error:", err);
                }
            }
        };
        fetchCompany();
    }, [currentJob?.companyId]);

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    if (isLoading) return <div className="text-center py-20 font-bold text-gray-500">Đang tải chi tiết công việc...</div>;
    if (!currentJob) return <div className="text-center py-20 font-bold text-red-500">Không tìm thấy công việc!</div>;

    const formatSalary = (min, max) => {
        if (!min && !max) return "Thỏa thuận";
        const format = (n) => n?.toLocaleString('vi-VN') + ' VNĐ';
        if (min && max) return `${format(min)} - ${format(max)}`;
        if (min) return `Từ ${format(min)}`;
        return `Up to ${format(max)}`;
    };

    const descriptionList = normalizeList(currentJob.description, '\n');
    const responsibilitiesList = normalizeList(currentJob.responsibilities, '\n');
    const requirementsList = normalizeList(currentJob.requirements, '\n');
    const benefitsList = normalizeList(currentJob.benefits, '\n');
    const techList = currentJob.techRequired || [];

    const formatJobType = (type) => {
        const map = {
            'FULL_TIME': 'Toàn thời gian',
            'PART_TIME': 'Bán thời gian',
            'CONTRACT': 'Hợp đồng',
            'INTERNSHIP': 'Thực tập',
            'REMOTE': 'Làm việc từ xa',
            'FREELANCE': 'Tự do'
        };
        return map[type] || type || "Toàn thời gian";
    };

    const formatExperience = (level) => {
        const map = {
            'INTERN': 'Thực tập sinh',
            'FRESHER': 'Mới ra trường / Fresher',
            'JUNIOR': 'Junior (1-2 năm)',
            'MIDDLE': 'Middle (2-4 năm)',
            'MID_LEVEL': 'Mid-level (2-4 năm)',
            'SENIOR': 'Senior (4-7 năm)',
            'LEAD': 'Lead (7+ năm)',
            'EXPERT': 'Chuyên gia',
            'MANAGER': 'Quản lý'
        };
        return map[level] || level || "Chưa cập nhật";
    };

    const formatDeadline = (dueDate) => {
        if (!dueDate) return "Không có";
        try {
            const deadline = parseISO(dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deadlineDate = new Date(deadline);
            deadlineDate.setHours(0, 0, 0, 0);

            const diffDays = differenceInDays(deadlineDate, today);
            const formattedDate = deadline.toLocaleDateString("vi-VN");

            if (diffDays < 0) return `${formattedDate} (Hết hạn)`;
            if (diffDays === 0) return `${formattedDate} (Hôm nay)`;
            return `${formattedDate} (Còn ${diffDays} ngày)`;
        } catch {
            return dueDate;
        }
    };

    const jobDetail = {
        title: currentJob.title || currentJob.position,
        position: currentJob.position,
        company: currentJob.companyName,
        logo: getCompanyLogoUrl(companyInfo?.logoUrl || currentJob.companyLogo),
        deadline: formatDeadline(currentJob.dueDate),
        salary: formatSalary(currentJob.minSalary, currentJob.maxSalary),
        location: currentJob.location || "Chưa cập nhật",
        description: descriptionList.length > 0 ? descriptionList : ["Chưa có mô tả chi tiết"],
        responsibilities: responsibilitiesList.length > 0 ? responsibilitiesList : ["Chưa có thông tin trách nhiệm"],
        requirements: requirementsList.length > 0 ? requirementsList : ["Chưa có thông tin yêu cầu"],
        benefits: benefitsList.length > 0 ? benefitsList : ["Chưa có thông tin quyền lợi"],
        techs: techList,
        jobType: formatJobType(currentJob.jobType),
        experience: formatExperience(currentJob.experienceLevel),
        domain: currentJob.domain || "Công nghệ thông tin",
        province: currentJob.province || "Việt Nam",
        postedTime: currentJob.createdAt ? formatDistanceToNowStrict(parseISO(currentJob.createdAt), { addSuffix: true, locale: vi }) : "Vừa xong"
    };

    const relatedJobs = [
        {
            id: 1,
            title: "Internal Creative Coordinator",
            company: "Green Group",
            logo: "",
            category: "Commerce",
            type: "Full time",
            salary: "$44000-$46000",
            location: "New-York, USA",
            timePosted: "24 min ago"
        },
        {
            id: 2,
            title: "District Intranet Director",
            company: "VonRueden - Weber Co",
            logo: "",
            category: "Commerce",
            type: "Full time",
            salary: "$42000-$48000",
            location: "New-York, USA",
            timePosted: "24 min ago"
        },
        {
            id: 3,
            title: "Corporate Tactics Facilitator",
            company: "Cormier, Turner and Flatley Inc",
            logo: "",
            category: "Commerce",
            type: "Full time",
            salary: "$38000-$40000",
            location: "New-York, USA",
            timePosted: "26 min ago"
        }
    ];

    return (
        <div className="bg-white min-h-screen py-10 font-sans">
            <JobApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onSuccess={() => {
                    setIsApplyModalOpen(false);
                    setHasApplied(true);
                }}
                jobTitle={jobDetail.title}
                jobId={currentJob.id}
            />
            <div className="container mx-auto px-4 max-w-7xl">
                <Breadcrumb 
                    items={[
                        { label: 'Tìm việc làm', link: '/jobs' },
                        { label: jobDetail.title }
                    ]} 
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-8 space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#E6F6FD] text-[#00B4D8] text-xs font-bold px-3 py-1 rounded-full">
                                    {jobDetail.postedTime}
                                </span>
                                <span className="flex-1"></span>
                                <button className="flex items-center gap-2 text-[#00B4D8] text-sm font-bold border border-[#00B4D8] px-4 py-2 rounded-lg hover:bg-[#E6F6FD] transition-colors">
                                    <FaBell /> Gửi tôi việc làm tương tự
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm">
                                    <CompanyLogo 
                                        logoUrl={companyInfo?.logoUrl || currentJob.companyLogo}
                                        companyId={currentJob.companyId}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{jobDetail.title}</h1>
                                    <p className="text-gray-500 font-medium">{jobDetail.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-500 bg-[#F5F7FA] p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaBriefcase /></span>
                                    {jobDetail.domain}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaClock /></span>
                                    {jobDetail.jobType}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaDollarSign /></span>
                                    {jobDetail.salary}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8]"><FaMapMarkerAlt /></span>
                                    {jobDetail.location}
                                </div>
                                <div className="w-full pt-2 mt-2 border-t border-gray-200 text-gray-400 text-xs flex items-center justify-between">
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded">Hạn nộp hồ sơ: {jobDetail.deadline}</span>
                                    <Link 
                                        to="/salary-lookup" 
                                        className="text-[#3AB4E6] font-bold flex items-center gap-1 hover:underline hover:scale-105 transition-transform"
                                    >
                                        <FaDollarSign size={12} />
                                        Xem mức lương thị trường
                                    </Link>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => !hasApplied && setIsApplyModalOpen(true)}
                                    disabled={hasApplied}
                                    className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-all transform ${
                                        hasApplied 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                                        : 'bg-[#00B4D8] text-white hover:bg-[#0096B4] hover:-translate-y-0.5'
                                    }`}>
                                    {hasApplied ? 'Đã Ứng Tuyển' : 'Ứng Tuyển Ngay'}
                                </button>
                                <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                                    <FaRegBookmark size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8 text-gray-700 leading-relaxed">
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả công việc</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.description.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Trách nhiệm công việc</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.responsibilities.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu ứng viên</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.requirements.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Quyền lợi</h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.benefits.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <hr className="border-gray-100" />

                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Địa điểm làm việc</h3>
                                    <p className="text-sm text-gray-500">• {jobDetail.location}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Thời gian làm việc</h3>
                                    <p className="text-sm text-gray-500">• Thứ 2 - Thứ 6 (từ 08:15 đến 17:30)</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">Cách thức ứng tuyển</h3>
                                    <p className="text-sm text-gray-500">• Ứng viên nộp hồ sơ trực tuyến bằng cách bấm <strong>Ứng tuyển ngay</strong> dưới đây.</p>
                                    <p className="text-sm text-gray-400 mt-2">Hạn nộp hồ sơ: {jobDetail.deadline}</p>
                                </div>
                            </section>

                            <div className="bg-gray-50 p-4 rounded-lg flex gap-3 border border-gray-100 items-start">
                                <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                                <p className="text-xs text-gray-500">
                                    <strong>Báo cáo tin tuyển dụng:</strong> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo, <a href="#" className="text-[#00B4D8] underline">hãy phản ánh với chúng tôi.</a>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-800">Tags:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {jobDetail.techs.length > 0 ? jobDetail.techs.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-[#E6F6FD] text-[#00B4D8] text-xs font-medium rounded hover:bg-[#d0f0fd] cursor-pointer">
                                            {tag}
                                        </span>
                                    )) : (
                                        <span className="text-gray-400 text-xs italic">Không có tag</span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0">
                                        <FaLaptop size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Thiết bị làm việc</h3>
                                        <p className="text-sm text-gray-500">Được cấp máy tính</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0">
                                        <FaGift size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Quyền lợi</h3>
                                        <p className="text-sm text-gray-500">Bảo hiểm xã hội, Team building, Du lịch hàng năm, Thưởng tháng 13...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Việc làm liên quan</h2>
                            <div className="space-y-4">
                                {relatedJobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Company Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl border border-gray-100 p-2 flex items-center justify-center shrink-0">
                                    <CompanyLogo 
                                        logoUrl={companyInfo?.logoUrl || currentJob.companyLogo}
                                        companyId={currentJob.companyId}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-800 leading-tight">{jobDetail.company}</h3>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-[13px]">
                                    <FaUsers className="text-gray-400 w-4 flex-shrink-0" />
                                    <span className="text-gray-400 min-w-[70px]">Quy mô:</span>
                                    <span className="text-gray-600 font-medium">{currentJob?.companySize || "25-99 nhân viên"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[13px]">
                                    <FaBriefcase className="text-gray-400 w-4 flex-shrink-0" />
                                    <span className="text-gray-400 min-w-[70px]">Lĩnh vực:</span>
                                    <span className="text-gray-600 font-medium">{jobDetail.domain}</span>
                                </div>
                                <div className="flex items-start gap-3 text-[13px]">
                                    <FaMapMarkerAlt className="text-gray-400 w-4 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-400 min-w-[70px]">Địa điểm:</span>
                                    <span className="text-gray-600 font-medium">{jobDetail.location}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/companies/${currentJob?.companyId || currentJob?.companyCode || '#'}`} 
                                className="flex items-center justify-center gap-2 text-[#3AB4E6] font-bold py-2.5 border border-[#3AB4E6] rounded-xl hover:bg-[#3AB4E6] hover:text-white transition-all duration-300 group mt-2"
                            >
                                <span>Xem trang công ty</span>
                                <FaExternalLinkAlt className="text-xs transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="bg-[#E6F6FD]/50 p-6 rounded-2xl">
                            <h3 className="font-bold text-gray-800 mb-6">Thông tin chung</h3>

                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaUser /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Cấp bậc</p>
                                        <p className="text-gray-500 text-sm">Nhân viên</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaClock /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Hình thức làm việc</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.jobType}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaBriefcase /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lĩnh vực</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.domain}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaAward /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Kinh nghiệm</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.experience}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaGraduationCap /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Học vấn</p>
                                        <p className="text-gray-500 text-sm">Cao đẳng trở lên</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#00B4D8]"><FaWallet /></div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lương</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.salary}</p>
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

                            <div className="mt-6 rounded-xl overflow-hidden h-40 border border-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924048679543!2d105.77258331476346!3d21.035727985994535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b991d80fd5%3A0x53cefc99d6b0bf86!2zUuG6oXAgQ2hp4bq_dSBQaGltIFF14buRYyBHaWE!5e0!3m2!1svi!2s!4v1642672322442!5m2!1svi!2s"
                                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                                    title="Job Location"
                                ></iframe>
                            </div>
                        </div>

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
