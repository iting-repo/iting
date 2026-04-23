import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNowStrict, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { fetchJobDetailRequest } from '../../store/job/jobSlice';
import {
    FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark, FaBookmark,
    FaExclamationTriangle, FaBell, FaLaptop, FaGift, FaUser,
    FaAward, FaGraduationCap, FaWallet, FaEnvelope, FaPhone, FaRegComment,
    FaExternalLinkAlt, FaUsers, FaLayerGroup
} from 'react-icons/fa';
import JobCard from '../../components/JobCard';
import JobApplyModal from '../../components/JobApplyModal';
import companyService from '../../services/companyService';
import messageService from '../../services/messageService';
import applicationService from '../../services/applicationService';
import axiosInstance from '../../utils/axiosInstance';
import { storage } from '../../utils/storage';
import { Breadcrumb, CompanyLogo } from '../../components/common';
import {
    buildJobDetailPath,
    getJobTitle,
    normalizeJobKey,
    slugify,
    getCompanyLogoUrl,
} from '../../utils/jobUrl';

const normalizeList = (value, delimiter = /\n|\.|;/) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);

  return String(value)
    .split(delimiter)
    .map((v) => v.trim())
    .filter(Boolean);
};

const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  const f = (v) => Number(v).toLocaleString('vi-VN') + ' VND';
  if (min && max) return `${f(min)} - ${f(max)}`;
  if (min) return `Từ ${f(min)}`;
  return `Đến ${f(max)}`;
};

const JobDetailPage = () => {
    const { slug, jobKey } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentJob, isLoading } = useSelector(state => state.job || {});
    const { user, isAuthenticated } = useSelector(state => state.auth || {});
    
    // States
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [sendingContact, setSendingContact] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    const normalizedJobId = normalizeJobKey(jobKey);

    useEffect(() => {
        if (normalizedJobId) {
            dispatch(fetchJobDetailRequest(normalizedJobId));
        }
    }, [dispatch, normalizedJobId]);

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

    useEffect(() => {
        const checkSaved = async () => {
            if (!currentJob?.id || !storage.getToken()) {
                setIsSaved(false);
                return;
            }
            try {
                const res = await axiosInstance.get(`/candidates/saved-jobs/${currentJob.id}/check`);
                setIsSaved(Boolean(res?.saved));
            } catch {
                setIsSaved(false);
            }
        };
        checkSaved();
    }, [currentJob?.id]);

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

    useEffect(() => {
        if (!currentJob || String(currentJob.id) !== String(normalizedJobId)) return;
        const expectedSlug = slugify(getJobTitle(currentJob)) || 'chi-tiet-viec-lam';
        if (slug !== expectedSlug) {
            navigate(buildJobDetailPath(currentJob), { replace: true });
        }
    }, [currentJob, slug, navigate, normalizedJobId]);

    useEffect(() => {
        const loadRelatedJobs = async () => {
            if (!currentJob?.id) {
                setRelatedJobs([]);
                return;
            }

            setRelatedLoading(true);
            try {
                const primaryKeyword = currentJob.position || currentJob.title || '';
                const byKeyword = await axiosInstance.get('/jobs/search', {
                    params: {
                        keyword: primaryKeyword,
                        page: 0,
                        size: 5,
                        sortBy: 'lastUpdate',
                        sortOrder: 'desc',
                    },
                });

                let candidates = Array.isArray(byKeyword?.content) ? byKeyword.content : [];
                candidates = candidates.filter((job) => Number(job.id) !== Number(currentJob.id));

                if (candidates.length < 3 && currentJob.companyId) {
                    const byCompany = await axiosInstance.get('/jobs/search', {
                        params: {
                            companyId: currentJob.companyId,
                            page: 0,
                            size: 5,
                            sortBy: 'lastUpdate',
                            sortOrder: 'desc',
                        },
                    });

                    const companyJobs = (Array.isArray(byCompany?.content) ? byCompany.content : [])
                        .filter((job) => Number(job.id) !== Number(currentJob.id));

                    const mergeMap = new Map();
                    [...candidates, ...companyJobs].forEach((job) => {
                        if (!mergeMap.has(job.id)) mergeMap.set(job.id, job);
                    });
                    candidates = [...mergeMap.values()];
                }

                setRelatedJobs(candidates.slice(0, 3));
            } catch {
                setRelatedJobs([]);
            } finally {
                setRelatedLoading(false);
            }
        };

        loadRelatedJobs();
    }, [currentJob?.id, currentJob?.companyId, currentJob?.position, currentJob?.title]);

    const handleToggleSave = async () => {
        if (!storage.getToken()) {
            toast.error('Vui lòng đăng nhập để lưu công việc.');
            return;
        }
        if (!currentJob?.id || isSaving) return;

        setIsSaving(true);
        try {
            if (isSaved) {
                await axiosInstance.delete(`/candidates/saved-jobs/${currentJob.id}`);
                setIsSaved(false);
                toast.success('Đã bỏ lưu công việc.');
            } else {
                await axiosInstance.post(`/candidates/saved-jobs/${currentJob.id}`);
                setIsSaved(true);
                toast.success('Đã lưu công việc.');
            }
        } catch (error) {
            toast.error(error?.message || 'Không thể cập nhật trạng thái lưu job.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleContactCompany = async () => {
        const token = storage.getToken();
        if (!token) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'CANDIDATE') {
            toast.error('Chỉ ứng viên mới có thể nhắn tin với nhà tuyển dụng.');
            return;
        }

        const content = contactMessage.trim();
        if (!content) {
            toast.error('Vui lòng nhập nội dung tin nhắn.');
            return;
        }

        if (!currentJob?.companyId) {
            toast.error('Không xác định được nhà tuyển dụng.');
            return;
        }

        setSendingContact(true);
        try {
            const sent = await messageService.sendMessage({
                receiverId: currentJob.companyId,
                receiverType: 'COMPANY',
                senderType: 'USER',
                content,
            });
            setContactMessage('');
            toast.success('Đã gửi tin nhắn.');
            navigate(`/messages?conversationId=${sent.conversationId}`);
        } catch (error) {
            toast.error(error?.message || 'Không thể gửi tin nhắn lúc này.');
        } finally {
            setSendingContact(false);
        }
    };

    const description = useMemo(() => normalizeList(currentJob?.description), [currentJob?.description]);
    const responsibilities = useMemo(() => normalizeList(currentJob?.responsibilities), [currentJob?.responsibilities]);
    const requirements = useMemo(() => normalizeList(currentJob?.requirements || currentJob?.techRequired), [currentJob?.requirements, currentJob?.techRequired]);
    const benefits = useMemo(() => normalizeList(currentJob?.benefits), [currentJob?.benefits]);
    const techList = currentJob?.techRequired || [];

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
            const deadlineDate = parseISO(dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deadline = new Date(deadlineDate);
            deadline.setHours(0, 0, 0, 0);

            const diffDays = differenceInDays(deadline, today);
            const formattedDate = deadline.toLocaleDateString("vi-VN");

            if (diffDays < 0) return `${formattedDate} (Hết hạn)`;
            if (diffDays === 0) return `${formattedDate} (Hôm nay)`;
            return `${formattedDate} (Còn ${diffDays} ngày)`;
        } catch {
            return dueDate;
        }
    };

    const jobDetail = {
        title: currentJob?.title || currentJob?.position || 'Vị trí tuyển dụng',
        position: currentJob?.position,
        company: currentJob?.companyName || 'Công ty',
        logo: getCompanyLogoUrl(companyInfo?.logoUrl || currentJob?.companyLogo),
        deadline: formatDeadline(currentJob?.dueDate),
        salary: formatSalary(currentJob?.minSalary, currentJob?.maxSalary),
        location: currentJob?.location || currentJob?.province || "Chưa cập nhật",
        description: description.length > 0 ? description : ["Chưa có mô tả chi tiết"],
        responsibilities: responsibilities.length > 0 ? responsibilities : ["Chưa có thông tin trách nhiệm"],
        requirements: requirements.length > 0 ? requirements : ["Chưa có thông tin yêu cầu"],
        benefits: benefits.length > 0 ? benefits : ["Chưa có thông tin quyền lợi"],
        techs: techList,
        jobType: formatJobType(currentJob?.jobType),
        experience: formatExperience(currentJob?.experienceLevel),
        domain: currentJob?.domain || "Công nghệ thông tin",
        province: currentJob?.province || "Việt Nam",
        postedTime: currentJob?.createdAt ? formatDistanceToNowStrict(parseISO(currentJob.createdAt), { addSuffix: true, locale: vi }) : "Vừa xong"
    };

    const mapJobToCard = (job) => ({
        id: job.id,
        title: job.title || job.position || 'Vị trí tuyển dụng',
        company: job.companyName || 'Công ty',
        logo: getCompanyLogoUrl(job.companyLogo),
        category: (job.techRequired && job.techRequired[0]) || (job.experienceLevel || 'IT'),
        type: job.jobType || 'FULL_TIME',
        salary: formatSalary(job.minSalary, job.maxSalary),
        location: job.location || job.province || 'Việt Nam',
        timePosted: job.lastUpdate || job.createdAt ? formatDistanceToNowStrict(parseISO(job.lastUpdate || job.createdAt), { addSuffix: true, locale: vi }) : 'Mới đăng',
    });

    if (isLoading) {
        return (
            <div className="bg-[#f8fafc] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <section className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-8 space-y-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                        <div className="flex gap-4 mb-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl" />
                            <div className="flex-1 space-y-3">
                                <div className="h-8 bg-gray-200 rounded w-3/4" />
                                <div className="h-5 bg-gray-100 rounded w-1/3" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl" />)}
                        </div>
                        <div className="h-64 bg-gray-50 rounded-xl" />
                    </section>
                    <aside className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-fit">
                        <div className="h-40 bg-gray-50 rounded-xl mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-gray-50 rounded-lg" />)}
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    if (!currentJob) {
        return <div className="text-center py-20 font-bold text-red-500">Không tìm thấy công việc này.</div>;
    }

    const mapQuery = [currentJob.address, currentJob.ward, currentJob.province, currentJob.location]
        .map(item => String(item || '').trim())
        .filter(Boolean)
        .join(', ') || 'Việt Nam';
    const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

    return (
        <div className="bg-white min-h-screen py-10">
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
                                <div className="w-20 h-20 rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm bg-white overflow-hidden">
                                    <CompanyLogo 
                                        logoUrl={companyInfo?.logoUrl || currentJob.companyLogo}
                                        companyId={currentJob.companyId}
                                        companyName={companyInfo?.name || currentJob.companyName}
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
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8] shadow-sm"><FaBriefcase /></span>
                                    {jobDetail.domain}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8] shadow-sm"><FaClock /></span>
                                    {jobDetail.jobType}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8] shadow-sm"><FaDollarSign /></span>
                                    {jobDetail.salary}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#00B4D8] shadow-sm"><FaMapMarkerAlt /></span>
                                    {jobDetail.location}
                                </div>
                                <div className="w-full pt-2 mt-2 border-t border-gray-200 text-gray-400 text-xs flex items-center justify-between">
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded">Hạn nộp hồ sơ: {jobDetail.deadline}</span>
                                    <Link 
                                        to={`/salary-lookup?keyword=${encodeURIComponent(jobDetail.title)}`} 
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
                                <button 
                                    onClick={handleToggleSave}
                                    disabled={isSaving}
                                    className={`px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-400'}`}
                                >
                                    {isSaved ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8 text-gray-700 leading-relaxed">
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#00B4D8] rounded-full"></span>
                                    Mô tả công việc
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.description.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#00B4D8] rounded-full"></span>
                                    Trách nhiệm công việc
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.responsibilities.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#00B4D8] rounded-full"></span>
                                    Yêu cầu ứng viên
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.requirements.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#00B4D8] rounded-full"></span>
                                    Quyền lợi
                                </h2>
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

                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3 border border-gray-100 items-start">
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
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <FaLaptop size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Thiết bị làm việc</h3>
                                        <p className="text-sm text-gray-500">Được cấp máy tính</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#00B4D8] flex items-center justify-center flex-shrink-0 shadow-sm">
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 font-black">Việc làm liên quan</h2>
                            <div className="space-y-4">
                                {relatedLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : relatedJobs.length > 0 ? (
                                    relatedJobs.map(job => (
                                        <JobCard key={job.id} job={mapJobToCard(job)} />
                                    ))
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 italic">
                                        Hiện chưa có việc làm liên quan phù hợp.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Company Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl border border-gray-100 p-2 flex items-center justify-center shrink-0 bg-white overflow-hidden">
                                    <CompanyLogo 
                                        logoUrl={companyInfo?.logoUrl || currentJob.companyLogo}
                                        companyId={currentJob.companyId}
                                        companyName={companyInfo?.name || currentJob.companyName}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-800 leading-tight">{jobDetail.company}</h3>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-[13px]">
                                    <FaUsers className="text-gray-400 w-4 flex-shrink-0" />
                                    <span className="text-gray-400 min-w-[70px]">Quy mô:</span>
                                    <span className="text-gray-600 font-medium">{companyInfo?.companySize || "25-99 nhân viên"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[13px]">
                                    <FaBriefcase className="text-gray-400 w-4 flex-shrink-0" />
                                    <span className="text-gray-400 min-w-[70px]">Lĩnh vực:</span>
                                    <span className="text-gray-600 font-medium">{jobDetail.domain}</span>
                                </div>
                                <div className="flex items-start gap-3 text-[13px]">
                                    <FaMapMarkerAlt className="text-gray-400 w-4 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-400 min-w-[70px]">Địa điểm:</span>
                                    <span className="text-gray-600 font-medium line-clamp-2">{jobDetail.location}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/companies/${currentJob?.companyId || '#'}`} 
                                className="flex items-center justify-center gap-2 text-[#3AB4E6] font-bold py-2.5 border border-[#3AB4E6] rounded-xl hover:bg-[#3AB4E6] hover:text-white transition-all duration-300 group mt-2"
                            >
                                <span>Xem trang công ty</span>
                                <FaExternalLinkAlt className="text-xs transition-transform group-hover:translate-x-1" />
                            </Link>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">Nhắn tin cho nhà tuyển dụng</h3>
                                <div className="space-y-4">
                                    <textarea 
                                        rows="4" 
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        placeholder="Nhập nội dung tin nhắn..." 
                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#00B4D8] outline-none resize-none transition-all"
                                    ></textarea>
                                    <button 
                                        onClick={handleContactCompany}
                                        disabled={sendingContact}
                                        className="w-full py-2.5 bg-[#00B4D8] text-white font-bold rounded-lg hover:bg-[#0096B4] transition-colors shadow-sm text-sm disabled:opacity-50"
                                    >
                                        {sendingContact ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
                                    </button>
                                </div>
                            </div>
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
                                    <div className="mt-1 text-[#00B4D8]"><FaLayerGroup /></div>
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
                                        <p className="font-bold text-gray-800 text-sm">Mức lương</p>
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

                            <div className="mt-6 rounded-xl overflow-hidden h-44 border border-gray-200">
                                <iframe
                                    src={googleMapEmbedUrl}
                                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                                    title="Job Location"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;
