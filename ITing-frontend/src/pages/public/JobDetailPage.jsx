import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { encodeId } from '../../utils/idCodec';
import { fetchJobDetailRequest } from '../../store/job/jobSlice';
import {
    FaMapMarkerAlt,
    FaDollarSign,
    FaClock,
    FaBriefcase,
    FaRegBookmark,
    FaBookmark,
    FaExclamationTriangle,
    FaBell,
    FaLaptop,
    FaGift,
    FaUser,
    FaAward,
    FaGraduationCap,
    FaWallet,
    FaExternalLinkAlt,
    FaUsers,
    FaLayerGroup,
} from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { differenceInDays, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import JobCard from '../../components/JobCard';
import JobApplyModal from '../../components/JobApplyModal';
import { getCvLanguageCta } from '../../utils/cvLanguage';
import companyService from '../../services/companyService';
import messageService from '../../services/messageService';
import applicationService from '../../services/applicationService';
import reportService from '../../services/reportService';
import axiosInstance from '../../utils/axiosInstance';
import { storage } from '../../utils/storage';
import { Breadcrumb, CompanyLogo, LocationPicker, CategoryPicker, SearchOverlay, saveSearchKeyword } from '../../components/common';
import {
    getCompanyLogoUrl,
    getJobTitle,
    normalizeJobKey,
} from '../../utils/jobUrl';
import { lookupMergedWards } from '../../utils/districtWardMapping';

const JOB_REPORT_REASONS = [
    { value: 'MISLEADING_INFO', label: 'Thông tin sai lệch / Không chính xác', priority: 'MEDIUM' },
    { value: 'SCAM', label: 'Lừa đảo / Dấu hiệu lừa đảo', priority: 'CRITICAL' },
    { value: 'EXPIRED_JOB', label: 'Tin tuyển dụng đã hết hạn', priority: 'LOW' },
    { value: 'DISCRIMINATION', label: 'Phân biệt đối xử', priority: 'HIGH' },
    { value: 'SPAM', label: 'Spam / Tin tuyển dụng rác', priority: 'LOW' },
    { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp', priority: 'MEDIUM' },
    { value: 'OTHER', label: 'Lý do khác...', priority: 'LOW' },
];

const normalizeList = (value, delimiter = /\n|\.|;/) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }

    return String(value)
        .split(delimiter)
        .map((v) => v.trim())
        .filter(Boolean);
};

const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';

    const format = (value) => `${Number(value).toLocaleString('vi-VN')} VND`;

    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `Từ ${format(min)}`;
    return `Đến ${format(max)}`;
};

const formatJobType = (type) => {
    const map = {
        FULL_TIME: 'Toàn thời gian',
        PART_TIME: 'Bán thời gian',
        CONTRACT: 'Hợp đồng',
        INTERNSHIP: 'Thực tập',
        INTERN: 'Thực tập',
        REMOTE: 'Làm việc từ xa',
        FREELANCE: 'Tự do',
    };

    return map[type] || type || 'Toàn thời gian';
};

const formatExperience = (level) => {
    const map = {
        INTERN: 'Thực tập sinh',
        FRESHER: 'Mới ra trường / Fresher',
        JUNIOR: 'Junior (1-2 năm)',
        MIDDLE: 'Middle (2-4 năm)',
        MID_LEVEL: 'Mid-level (2-4 năm)',
        SENIOR: 'Senior (4-7 năm)',
        LEAD: 'Lead (7+ năm)',
        EXPERT: 'Chuyên gia',
        MANAGER: 'Quản lý',
    };

    return map[level] || level || 'Chưa cập nhật';
};

const formatDeadline = (dueDate) => {
    if (!dueDate) return 'Không có';

    try {
        const deadlineDate = parseISO(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadline = new Date(deadlineDate);
        deadline.setHours(0, 0, 0, 0);

        const diffDays = differenceInDays(deadline, today);
        const formattedDate = deadline.toLocaleDateString('vi-VN');

        if (diffDays < 0) return `${formattedDate} (Hết hạn)`;
        if (diffDays === 0) return `${formattedDate} (Hôm nay)`;
        return `${formattedDate} (Còn ${diffDays} ngày)`;
    } catch {
        return dueDate;
    }
};

const JobDetailPage = () => {
    const { jobKey: id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentJob, isLoading } = useSelector((state) => state.job || {});
    const { currentUser } = useSelector((state) => state.auth || {});

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [sendingContact, setSendingContact] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({ type: 'MISLEADING_INFO', description: '' });
    const [isReporting, setIsReporting] = useState(false);
    const [showSimilarModal, setShowSimilarModal] = useState(false);
    const [isFollowingCompany, setIsFollowingCompany] = useState(false);
    const [isAlreadyFollowing, setIsAlreadyFollowing] = useState(false);
    const [mergedLocation, setMergedLocation] = useState(null);
    const [loadingMerged, setLoadingMerged] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const [searchType, setSearchType] = useState('job');

    const normalizedJobId = useMemo(() => (id ? normalizeJobKey(id) : null), [id]);

    useEffect(() => {
        if (normalizedJobId) {
            dispatch(fetchJobDetailRequest(normalizedJobId));
        }
    }, [dispatch, normalizedJobId]);

    // Fetch provinces for LocationPicker
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch('https://provinces.open-api.vn/api/v2/p/');
                const data = await res.json();
                if (Array.isArray(data)) setProvinces(data);
            } catch { /* silent */ }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        const checkAppStatus = async () => {
            if (!storage.getToken() || currentUser?.role !== 'CANDIDATE' || !currentJob?.id) {
                setHasApplied(false);
                return;
            }

            try {
                const res = await applicationService.checkApplied(currentJob.id);
                setHasApplied(Boolean(res?.hasApplied));
            } catch (err) {
                console.error('Check applied error:', err);
                setHasApplied(false);
            }
        };

        checkAppStatus();
    }, [currentUser?.role, currentJob?.id]);

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
            if (!currentJob?.companyId) {
                setCompanyInfo(null);
                return;
            }

            try {
                const res = await companyService.getCompanyDetail(currentJob.companyId);
                setCompanyInfo(res);
            } catch (err) {
                console.error('Fetch company detail error:', err);
                setCompanyInfo(null);
            }
        };

        fetchCompany();
    }, [currentJob?.companyId]);

    // Kiểm tra trạng thái follow company
    useEffect(() => {
        const checkFollow = async () => {
            if (!currentJob?.companyId || !storage.getToken() || currentUser?.role !== 'CANDIDATE') {
                setIsAlreadyFollowing(false);
                return;
            }
            try {
                const res = await companyService.checkFollowing(currentJob.companyId);
                setIsAlreadyFollowing(Boolean(res?.isFollowing ?? res?.data?.isFollowing));
            } catch {
                setIsAlreadyFollowing(false);
            }
        };
        checkFollow();
    }, [currentJob?.companyId, currentUser?.role]);

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

    const description = useMemo(
        () => normalizeList(currentJob?.description),
        [currentJob?.description],
    );

    const responsibilities = useMemo(
        () => normalizeList(currentJob?.responsibilities),
        [currentJob?.responsibilities],
    );

    const requirements = useMemo(
        () => normalizeList(currentJob?.requirements || currentJob?.skills || currentJob?.techRequired, /,|\n|\.|;/),
        [currentJob?.requirements, currentJob?.skills, currentJob?.techRequired],
    );

    const benefits = useMemo(
        () => normalizeList(currentJob?.benefits),
        [currentJob?.benefits],
    );

    const techList = useMemo(() => {
        if (Array.isArray(currentJob?.skills)) return currentJob.skills;
        if (typeof currentJob?.skills === 'string') return normalizeList(currentJob.skills, /,|\n|;/);
        if (typeof currentJob?.techRequired === 'string') return normalizeList(currentJob.techRequired, /,|\n|;/);
        return [];
    }, [currentJob?.skills, currentJob?.techRequired]);

    const jobDetail = useMemo(() => {
        if (!currentJob) return null;

        const title = getJobTitle(currentJob) || currentJob.position || currentJob.title || 'Chi tiết việc làm';

        return {
            title,
            company: currentJob.companyName || companyInfo?.name || 'Công ty',
            logo: getCompanyLogoUrl(currentJob.companyLogo || companyInfo?.logoUrl),
            domain: currentJob.industry || currentJob.category || 'IT',
            deadline: formatDeadline(currentJob.dueDate),
            salary: formatSalary(currentJob.minSalary, currentJob.maxSalary),
            location:
                currentJob.location ||
                [currentJob.address, currentJob.ward, currentJob.province].filter(Boolean).join(', ') ||
                'Chưa cập nhật',
            description: description.length ? description : ['Không có mô tả chi tiết'],
            responsibilities: responsibilities.length ? responsibilities : ['Chưa cập nhật'],
            requirements: requirements.length ? requirements : ['Không có yêu cầu đặc biệt'],
            benefits: benefits.length ? benefits : ['Chưa cập nhật'],
            jobType: formatJobType(currentJob.jobType),
            experience: formatExperience(currentJob.experienceLevel),
            techs: techList,
            postedTime: currentJob.createdAt || currentJob.lastUpdate
                ? formatDistanceToNowStrict(parseISO(currentJob.createdAt || currentJob.lastUpdate), {
                    addSuffix: true,
                    locale: vi,
                })
                : 'Mới đăng',
        };
    }, [currentJob, companyInfo, description, responsibilities, requirements, benefits, techList]);

    const mapJobToCard = (job) => ({
        id: job.id,
        title: job.title || job.position || 'Vị trí tuyển dụng',
        company: job.companyName || 'Công ty',
        logo: getCompanyLogoUrl(job.companyLogo),
        category: (Array.isArray(job.skills) && job.skills[0]) || job.experienceLevel || 'IT',
        type: job.jobType || 'FULL_TIME',
        salary: formatSalary(job.minSalary, job.maxSalary),
        location: job.location || job.province || 'Việt Nam',
        // Ưu tiên createdAt — lastUpdate bị reset khi admin edit/approve.
        timePosted: job.createdAt || job.lastUpdate
            ? formatDistanceToNowStrict(parseISO(job.createdAt || job.lastUpdate), {
                addSuffix: true,
                locale: vi,
            })
            : 'Mới đăng',
    });

    useEffect(() => {
        const province = (currentJob?.province || '').trim();
        const ward = (currentJob?.ward || '').trim();
        if (!currentJob?.id || (!province && !ward)) {
            setMergedLocation(null);
            return;
        }
        fetchMergedLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentJob?.id, currentJob?.ward, currentJob?.province]);

    const fetchMergedLocation = async () => {
        setLoadingMerged(true);
        try {
            const province = (currentJob?.province || '').trim();
            const ward = (currentJob?.ward || '').trim();

            if (!province && !ward) {
                setMergedLocation({ error: 'Tin tuyển dụng chưa có thông tin tỉnh/phường để tra cứu.' });
                return;
            }

            const stripPrefix = (s = '') => s
                .replace(/^(Tỉnh|Thành phố|TP\.?|Thành Phố)\s+/i, '')
                .replace(/^(Phường|Xã|Thị trấn|Quận|Huyện)\s+/i, '')
                .trim()
                .toLowerCase();

            const normalizedProvince = stripPrefix(province);

            // Tải danh sách 34 tỉnh sau sáp nhập (v2)
            let provinceList = [];
            try {
                const res = await fetch('https://provinces.open-api.vn/api/v2/p/');
                provinceList = await res.json();
                if (!Array.isArray(provinceList)) provinceList = [];
            } catch {
                provinceList = [];
            }

            const matchedProvince = provinceList.find((p) => {
                const pName = stripPrefix(p.name || '');
                return pName === normalizedProvince
                    || pName.includes(normalizedProvince)
                    || (normalizedProvince && normalizedProvince.includes(pName));
            });

            // Trường hợp 1: province lưu trong DB đã là tỉnh sau sáp nhập (v2)
            if (matchedProvince) {
                if (!ward) {
                    setMergedLocation({
                        ward: null,
                        province: matchedProvince.name,
                        source: 'province',
                    });
                    return;
                }

                // Verify ward có thuộc tỉnh này trong v2 không
                // - Nếu match → đó là phường/xã mới hợp lệ
                // - Nếu không match → ward cũ (quận/huyện cũ) → KHÔNG hiển thị ward nữa
                let verifiedWard = null;
                try {
                    const wardRes = await fetch(
                        `https://provinces.open-api.vn/api/v2/p/${matchedProvince.code}?depth=2`,
                    );
                    const wardData = await wardRes.json();
                    const wards = Array.isArray(wardData?.wards) ? wardData.wards : [];
                    const normWardInput = stripPrefix(ward);
                    const wardMatch = wards.find((w) => {
                        const wName = stripPrefix(w.name || '');
                        return wName === normWardInput
                            || wName.includes(normWardInput)
                            || normWardInput.includes(wName);
                    });
                    if (wardMatch) verifiedWard = wardMatch.name;
                } catch {
                    // ignore
                }

                if (verifiedWard) {
                    setMergedLocation({
                        ward: verifiedWard,
                        province: matchedProvince.name,
                        source: 'verified',
                    });
                } else {
                    // Ward cũ (quận/huyện trước sáp nhập) — tra mapping tĩnh để gợi ý phường mới
                    const mapping = lookupMergedWards(ward, province);
                    if (mapping && Array.isArray(mapping.wards) && mapping.wards.length > 0) {
                        setMergedLocation({
                            ward: null,
                            province: matchedProvince.name,
                            candidateWards: mapping.wards,
                            source: 'mapping',
                            oldWard: ward,
                        });
                    } else {
                        setMergedLocation({
                            ward: null,
                            province: matchedProvince.name,
                            source: 'stale-ward',
                            oldWard: ward,
                        });
                    }
                }
                return;
            }

            // Trường hợp 2: province cũ (job đăng trước sáp nhập) → tra theo ward để tìm tỉnh mới
            if (ward) {
                try {
                    const res = await fetch(
                        `https://provinces.open-api.vn/api/v2/w/search/?q=${encodeURIComponent(ward)}`,
                    );
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const match = data[0];
                        setMergedLocation({
                            ward: match.name,
                            province: match.province_name,
                            source: 'ward',
                        });
                        return;
                    }
                } catch {
                    // ignore
                }
            }

            setMergedLocation({
                error: 'Không tìm thấy địa giới mới tương ứng. Tỉnh/Phường có thể đã được sáp nhập với tên khác — vui lòng tra cứu thủ công.',
            });
        } catch {
            setMergedLocation({ error: 'Không tải được dữ liệu địa giới mới. Vui lòng thử lại.' });
        } finally {
            setLoadingMerged(false);
        }
    };

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

        if (currentUser?.role !== 'CANDIDATE') {
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
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-16 bg-gray-50 rounded-xl" />
                            ))}
                        </div>
                        <div className="h-64 bg-gray-50 rounded-xl" />
                    </section>

                    <aside className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-fit">
                        <div className="h-40 bg-gray-50 rounded-xl mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div key={item} className="h-10 bg-gray-50 rounded-lg" />
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    if (!currentJob || !jobDetail) {
        return (
            <div className="bg-[#f8fafc] min-h-screen py-20">
                <div className="max-w-2xl mx-auto text-center px-4">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-400 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy công việc này</h2>
                    <p className="text-gray-500 mb-8">Tin tuyển dụng có thể đã bị xóa hoặc không còn khả dụng.</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="bg-[#3AB4E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2a9fd4] transition-colors"
                    >
                        Quay lại trang việc làm
                    </button>
                </div>
            </div>
        );
    }

    // Kiểm tra công ty bị đình chỉ
    const isCompanySuspended = currentJob.companyActive === false;

    const mapQuery =
        [currentJob.address, currentJob.ward, currentJob.province, currentJob.location]
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .join(', ') || 'Việt Nam';

    const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

    return (
        <div className="bg-white min-h-screen">
            <JobApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onSuccess={() => {
                    setIsApplyModalOpen(false);
                    setHasApplied(true);
                }}
                jobTitle={jobDetail.title}
                jobId={currentJob.id}
                cvLanguage={currentJob?.cvLanguage}
            />

            {/* ── CTA Search Banner (homepage style) ── */}
            <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2a7cb8] to-[#3AB4E6] relative overflow-visible">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/4 w-[50%] h-[200%] rounded-full bg-white/[0.04] blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-full rounded-full bg-cyan-300/10 blur-3xl" />
                </div>
                <div className="container mx-auto px-4 max-w-7xl py-4 relative z-10">
                    <div className="bg-white rounded-lg md:rounded-full p-1 flex flex-col md:flex-row items-center max-w-5xl mx-auto shadow-xl overflow-visible">
                        {/* Category */}
                        <div className="w-full md:w-[25%] h-11 flex items-center px-4 relative border-b md:border-b-0 md:border-r border-gray-200">
                            <CategoryPicker
                                value={searchCategory}
                                onChange={(val) => setSearchCategory(val)}
                            />
                        </div>
                        {/* Keyword */}
                        <div className="flex-1 w-full md:w-auto h-11 px-4 flex items-center border-b md:border-b-0 md:border-r border-gray-200 relative">
                            <FaSearch className="text-gray-400 mr-2 flex-shrink-0 text-sm" />
                            <input
                                id="jd-search-keyword"
                                type="text"
                                data-search-trigger
                                placeholder="Vị trí tuyển dụng, tên công ty"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onFocus={() => setIsSearchOverlayOpen(true)}
                                className="w-full outline-none text-gray-700 text-sm placeholder-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsSearchOverlayOpen(false);
                                        const params = new URLSearchParams();
                                        const finalKeyword = [searchCategory, e.target.value.trim()].filter(Boolean).join(' ');
                                        if (finalKeyword) {
                                            params.append('keyword', finalKeyword);
                                            saveSearchKeyword(finalKeyword);
                                        }
                                        if (searchLocation) params.append('location', searchLocation);
                                        if (searchType === 'company') params.append('searchType', 'company');
                                        navigate(`/jobs?${params.toString()}`);
                                    }
                                }}
                            />
                            <SearchOverlay
                                isOpen={isSearchOverlayOpen}
                                onClose={() => setIsSearchOverlayOpen(false)}
                                searchType={searchType}
                                onSearchTypeChange={setSearchType}
                                onSearch={(keyword) => {
                                    setSearchKeyword(keyword);
                                    saveSearchKeyword(keyword);
                                    const params = new URLSearchParams();
                                    const finalKeyword = [searchCategory, keyword].filter(Boolean).join(' ');
                                    if (finalKeyword) params.append('keyword', finalKeyword);
                                    if (searchLocation) params.append('location', searchLocation);
                                    if (searchType === 'company') params.append('searchType', 'company');
                                    navigate(`/jobs?${params.toString()}`);
                                }}
                                variant="compact"
                            />
                        </div>
                        {/* Location */}
                        <div className="w-full md:w-[30%] h-11 px-4 flex items-center border-b md:border-b-0 md:border-r border-gray-200 relative">
                            <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0 text-sm" />
                            <LocationPicker
                                value={searchLocation}
                                onChange={(val) => setSearchLocation(val)}
                                provinces={provinces}
                            />
                        </div>
                        {/* Button */}
                        <button
                            onClick={() => {
                                setIsSearchOverlayOpen(false);
                                const keyword = searchKeyword.trim();
                                const finalKeyword = [searchCategory, keyword].filter(Boolean).join(' ');
                                const params = new URLSearchParams();
                                if (finalKeyword) {
                                    params.append('keyword', finalKeyword);
                                    saveSearchKeyword(finalKeyword);
                                }
                                if (searchLocation) params.append('location', searchLocation);
                                if (searchType === 'company') params.append('searchType', 'company');
                                navigate(`/jobs?${params.toString()}`);
                            }}
                            className="w-full md:w-auto bg-[#3AB4E6] hover:bg-[#2a9fd4] text-white px-6 py-2.5 rounded-b-lg md:rounded-r-full md:rounded-bl-none font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <FaSearch className="text-xs" /> Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl pt-6 pb-10">
                <Breadcrumb
                    items={[
                        { label: 'Tìm việc làm', link: '/jobs' },
                        { label: jobDetail.title },
                    ]}
                />

                {/* Banner cảnh báo công ty bị đình chỉ */}
                {isCompanySuspended && (
                    <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <FaExclamationTriangle className="text-amber-500 text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-800 text-base">Tin tuyển dụng hiện không khả dụng</h3>
                            <p className="text-amber-600 text-sm mt-0.5">Công ty đăng tin này đang tạm ngừng hoạt động. Bạn không thể ứng tuyển hoặc liên hệ vào lúc này.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className="bg-[#E6F6FD] text-[#3AB4E6] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full">
                                    {jobDetail.postedTime}
                                </span>

                                <span className="flex-1" />

                                <button
                                    onClick={() => {
                                        if (!storage.getToken()) {
                                            toast.error('Vui lòng đăng nhập để sử dụng tính năng này.');
                                            navigate('/login');
                                            return;
                                        }
                                        setShowSimilarModal(true);
                                    }}
                                    className="flex items-center gap-2 text-[#3AB4E6] text-xs md:text-sm font-bold border border-[#3AB4E6] px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#E6F6FD] transition-colors"
                                >
                                    <FaBell /> <span className="hidden sm:inline">Gửi tôi việc làm tương tự</span><span className="sm:hidden">Nhận thông báo</span>
                                </button>
                            </div>

                            <div className="flex gap-3 md:gap-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm">
                                    <CompanyLogo
                                        logoUrl={currentJob.companyLogo || companyInfo?.logoUrl}
                                        companyId={currentJob.companyId}
                                        companyName={jobDetail.company}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
                                        {jobDetail.title}
                                    </h1>
                                    <p className="text-sm md:text-base text-gray-500 font-medium">
                                        {jobDetail.company}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-500 bg-[#F5F7FA] p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm">
                                        <FaBriefcase />
                                    </span>
                                    {jobDetail.domain}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm">
                                        <FaClock />
                                    </span>
                                    {jobDetail.jobType}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#3AB4E6] shadow-sm">
                                        <FaDollarSign />
                                    </span>
                                    {jobDetail.salary}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="bg-white p-2 rounded-full text-[#3AB4E6]">
                                        <FaMapMarkerAlt />
                                    </span>
                                    {jobDetail.location}
                                </div>

                                <div className="w-full pt-2 mt-2 border-t border-gray-200 text-gray-400 text-xs flex items-center justify-between">
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                        Hạn nộp hồ sơ: {jobDetail.deadline}
                                    </span>

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
                                    onClick={() => !hasApplied && !isCompanySuspended && setIsApplyModalOpen(true)}
                                    disabled={hasApplied || isCompanySuspended}
                                    className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-all transform ${isCompanySuspended
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : hasApplied
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-[#3AB4E6] text-white hover:bg-[#2C9ACD] hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isCompanySuspended ? 'Không khả dụng' : hasApplied ? 'Đã Ứng Tuyển' : 'Ứng Tuyển Ngay'}
                                </button>

                                <button
                                    onClick={isCompanySuspended ? undefined : handleToggleSave}
                                    disabled={isSaving || isCompanySuspended}
                                    className={`px-4 py-3 border border-gray-200 rounded-lg transition-colors ${isCompanySuspended
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : isSaved ? 'text-blue-500 bg-blue-50 hover:bg-gray-50' : 'text-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {isSaved ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                                </button>
                            </div>

                            {/* Thông báo ngôn ngữ CV (giống popup ứng tuyển) — hiển thị ngay tại đây */}
                            {(() => {
                                const cta = getCvLanguageCta(currentJob?.cvLanguage);
                                return (
                                    <div className={`mt-3 rounded-lg p-3 border ${cta.cls} flex items-start gap-3`}>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${cta.cls} shrink-0`}>
                                            {cta.badge}
                                        </span>
                                        <div className="text-xs leading-relaxed">
                                            <p className="font-semibold mb-0.5">{cta.cvHint}</p>
                                            <p className="opacity-80">{cta.coverHint}</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="space-y-8 text-gray-700 leading-relaxed">
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#3AB4E6] rounded-full" />
                                    Mô tả công việc
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.description.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#3AB4E6] rounded-full" />
                                    Trách nhiệm công việc
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.responsibilities.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#3AB4E6] rounded-full" />
                                    Yêu cầu ứng viên
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.requirements.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#3AB4E6] rounded-full" />
                                    Quyền lợi
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {jobDetail.benefits.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <hr className="border-gray-100" />

                            <section className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">
                                        Địa điểm làm việc
                                    </h3>
                                    <p className="text-sm text-gray-500">• {jobDetail.location}</p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">
                                        Thời gian làm việc
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        • {{
                                            MON_TO_FRI: 'Thứ 2 - Thứ 6',
                                            MON_TO_SAT: 'Thứ 2 - Thứ 7',
                                            FLEXIBLE: 'Linh động',
                                        }[currentJob?.workingDays] || currentJob?.workingDays || 'Chưa cập nhật'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">
                                        Ngôn ngữ CV yêu cầu
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {(() => {
                                            const lang = currentJob?.cvLanguage || 'ANY';
                                            const badgeMap = {
                                                VIETNAMESE: { label: '🇻🇳 Bắt buộc tiếng Việt', cls: 'bg-red-50 text-red-700 border-red-200' },
                                                ENGLISH:    { label: '🇬🇧 Bắt buộc tiếng Anh',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
                                                BOTH:       { label: '🇻🇳 + 🇬🇧 Song ngữ (Việt + Anh)', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
                                                ANY:        { label: '✓ Việt hoặc Anh đều được', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
                                            };
                                            const b = badgeMap[lang] || badgeMap.ANY;
                                            return (
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${b.cls}`}>
                                                    {b.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    {currentJob?.cvLanguage && currentJob.cvLanguage !== 'ANY' && (
                                        <p className="text-xs text-gray-400 mt-2 italic">
                                            Vui lòng nộp CV đúng ngôn ngữ yêu cầu để hồ sơ được xét duyệt thuận lợi.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">
                                        Cách thức ứng tuyển
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        • Ứng viên nộp hồ sơ trực tuyến bằng cách bấm{' '}
                                        <button
                                            type="button"
                                            onClick={() => !hasApplied && !isCompanySuspended && setIsApplyModalOpen(true)}
                                            className="font-semibold text-[#3AB4E6] hover:underline"
                                        >
                                            Ứng tuyển ngay
                                        </button>.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Hạn nộp hồ sơ: {jobDetail.deadline}
                                    </p>
                                </div>
                            </section>

                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3 border border-gray-100 items-start">
                                <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                                <p className="text-xs text-gray-500">
                                    <strong>Báo cáo tin tuyển dụng:</strong> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo,{' '}
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="text-[#3AB4E6] underline hover:text-[#2C9ACD] transition-colors"
                                    >
                                        hãy phản ánh với chúng tôi.
                                    </button>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-800">Tags:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {jobDetail.techs.length > 0 ? (
                                        jobDetail.techs.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-[#E6F6FD] text-[#3AB4E6] text-xs font-medium rounded hover:bg-[#D8F1FB] cursor-pointer"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">
                                            Không có tag
                                        </span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#3AB4E6] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <FaLaptop size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Thiết bị làm việc</h3>
                                        <p className="text-sm text-gray-500">Được cấp máy tính</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded bg-[#E6F6FD] text-[#3AB4E6] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <FaGift size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Quyền lợi</h3>
                                        <p className="text-sm text-gray-500">
                                            Bảo hiểm xã hội, Team building, Du lịch hàng năm, Thưởng tháng 13...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                                Việc làm liên quan
                            </h2>

                            <div className="space-y-4">
                                {relatedLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="h-32 bg-gray-50 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : relatedJobs.length > 0 ? (
                                    relatedJobs.map((job) => (
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
                                <h3 className="font-bold text-gray-800 leading-tight">
                                    {jobDetail.company}
                                </h3>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-[13px]">
                                    <FaUsers className="text-gray-400 w-4 flex-shrink-0" />
                                    <span className="text-gray-400 min-w-[70px]">Quy mô:</span>
                                    <span className="text-gray-600 font-medium">
                                        {companyInfo?.companySize || '25-99 nhân viên'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-[13px]">
                                    <FaBriefcase className="text-gray-400 w-4 flex-shrink-0" />
                                    <span className="text-gray-400 min-w-[70px]">Lĩnh vực:</span>
                                    <span className="text-gray-600 font-medium">
                                        {jobDetail.domain}
                                    </span>
                                </div>

                                <div className="flex items-start gap-3 text-[13px]">
                                    <FaMapMarkerAlt className="text-gray-400 w-4 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-400 min-w-[70px]">Địa điểm:</span>
                                    <span className="text-gray-600 font-medium line-clamp-2">
                                        {jobDetail.location}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to={currentJob?.companyId ? `/companies/${encodeId(currentJob.companyId)}` : '#'}
                                className="flex items-center justify-center gap-2 text-[#3AB4E6] font-bold py-2.5 border border-[#3AB4E6] rounded-xl hover:bg-[#3AB4E6] hover:text-white transition-all duration-300 group mt-2"
                            >
                                <span>Xem trang công ty</span>
                                <FaExternalLinkAlt className="text-xs transition-transform group-hover:translate-x-1" />
                            </Link>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">
                                    Nhắn tin cho nhà tuyển dụng
                                </h3>

                                <div className="space-y-4">
                                    <textarea
                                        rows="4"
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        placeholder="Nhập nội dung tin nhắn..."
                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-[#3AB4E6] outline-none resize-none transition-all"
                                    />

                                    <button
                                        onClick={handleContactCompany}
                                        disabled={sendingContact}
                                        className="w-full py-2.5 bg-[#3AB4E6] text-white font-bold rounded-lg hover:bg-[#2C9ACD] transition-colors shadow-sm text-sm disabled:opacity-50"
                                    >
                                        {sendingContact ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#E6F6FD]/50 p-6 rounded-2xl">
                            <h3 className="font-bold text-gray-800 mb-6">
                                Thông tin chung
                            </h3>

                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Cấp bậc</p>
                                        <p className="text-gray-500 text-sm">Nhân viên</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaClock />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">
                                            Hình thức làm việc
                                        </p>
                                        <p className="text-gray-500 text-sm">{jobDetail.jobType}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaLayerGroup />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lĩnh vực</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.domain}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaAward />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Kinh nghiệm</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.experience}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaGraduationCap />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Học vấn</p>
                                        <p className="text-gray-500 text-sm">Cao đẳng trở lên</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaWallet />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Lương</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.salary}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 text-[#3AB4E6]">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm">Địa điểm</p>
                                        <p className="text-gray-500 text-sm">{jobDetail.location}</p>

                                        <div className="mt-2 p-3 bg-white border border-[#3AB4E6]/30 rounded-lg">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-[#2C9ACD] mb-1">
                                                Sau sáp nhập (1/7/2025)
                                            </p>
                                            {loadingMerged ? (
                                                <p className="text-xs text-gray-400 italic">Đang tra cứu...</p>
                                            ) : mergedLocation?.error ? (
                                                <p className="text-xs text-amber-700">{mergedLocation.error}</p>
                                            ) : mergedLocation ? (
                                                <>
                                                    <p className="text-sm text-gray-800 font-semibold break-words">
                                                        {[mergedLocation.ward, mergedLocation.province].filter(Boolean).join(', ')}
                                                    </p>

                                                    {mergedLocation.source === 'mapping' && Array.isArray(mergedLocation.candidateWards) && (
                                                        <div className="mt-2">
                                                            <p className="text-[10px] uppercase font-bold text-[#2C9ACD] mb-1">
                                                                Có thể thuộc một trong các phường mới:
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {mergedLocation.candidateWards.map((w) => (
                                                                    <span
                                                                        key={w}
                                                                        className="px-2 py-0.5 bg-[#E6F6FD] text-[#3AB4E6] text-[11px] font-medium rounded"
                                                                    >
                                                                        {w}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {mergedLocation.source === 'verified' && 'Đối chiếu theo phường/xã hiện hành'}
                                                        {mergedLocation.source === 'ward' && 'Đối chiếu theo phường/xã hiện hành'}
                                                        {mergedLocation.source === 'province' && 'Đối chiếu theo tỉnh/thành hiện hành'}
                                                        {mergedLocation.source === 'mapping' && (
                                                            <span className="text-amber-700">
                                                                Quận cũ (&quot;{mergedLocation.oldWard}&quot;) đã chia thành nhiều phường mới. Theo Nghị quyết 1685/NQ-UBTVQH15.
                                                            </span>
                                                        )}
                                                        {mergedLocation.source === 'stale-ward' && (
                                                            <span className="text-amber-700">
                                                                Phường/xã cũ (&quot;{mergedLocation.oldWard}&quot;) đã đổi sau sáp nhập — chỉ hiển thị tỉnh/thành.
                                                            </span>
                                                        )}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">Không có dữ liệu phường/tỉnh để tra cứu.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl overflow-hidden h-44 border border-gray-200">
                                <iframe
                                    src={googleMapEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Job Location"
                                />
                            </div>
                        </div>

                        {/* ── CTA Banners ── */}
                        <div className="space-y-3">
                            <Link to="/blogs" className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#3AB4E6]/30 transition-all bg-white">
                                <img src="/blog-cta-removebg-preview.png" alt="Blog nghề nghiệp" className="w-full h-auto object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                            </Link>
                            <Link to="/salary-lookup" className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#3AB4E6]/30 transition-all bg-white">
                                <img src="/salary-cta-removebg-preview.png" alt="Tra cứu lương" className="w-full h-auto object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                            </Link>
                            <Link to="/jobs" className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#3AB4E6]/30 transition-all bg-white">
                                <img src="/cta-ai-removebg-preview.png" alt="AI gợi ý việc làm" className="w-full h-auto object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL GỬI VIỆC LÀM TƯƠNG TỰ */}
            {showSimilarModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowSimilarModal(false); }}
                >
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                            <div className="p-3 bg-blue-100 text-[#3AB4E6] rounded-2xl">
                                <FaBell size={24} />
                            </div>
                            Nhận việc làm tương tự
                        </h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">
                            Chọn cách bạn muốn nhận thông tin về các công việc tương tự <span className="text-slate-800 font-bold">{jobDetail?.title}</span>
                        </p>

                        <div className="space-y-4">
                            {/* Option 1: Follow công ty */}
                            <button
                                onClick={async () => {
                                    if (!currentJob?.companyId) return;
                                    try {
                                        setIsFollowingCompany(true);
                                        if (isAlreadyFollowing) {
                                            await companyService.unfollowCompany(currentJob.companyId);
                                            setIsAlreadyFollowing(false);
                                            toast.success(`Đã bỏ theo dõi ${jobDetail?.company}`);
                                        } else {
                                            await companyService.followCompany(currentJob.companyId);
                                            setIsAlreadyFollowing(true);
                                            toast.success(`Đã theo dõi ${jobDetail?.company}! Bạn sẽ nhận thông báo khi có việc làm mới.`);
                                        }
                                    } catch (error) {
                                        toast.error(error?.message || 'Không thể thực hiện. Vui lòng thử lại.');
                                    } finally {
                                        setIsFollowingCompany(false);
                                    }
                                }}
                                disabled={isFollowingCompany}
                                className={`w-full p-5 rounded-2xl border-2 text-left transition-all group ${isAlreadyFollowing
                                    ? 'border-green-200 bg-green-50 hover:border-green-300'
                                    : 'border-slate-100 bg-slate-50 hover:border-[#3AB4E6] hover:bg-[#E6F6FD]'
                                    } disabled:opacity-50`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isAlreadyFollowing ? 'bg-green-100 text-green-600' : 'bg-white text-[#3AB4E6] shadow-sm'
                                        }`}>
                                        <FaUsers size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm">
                                            {isFollowingCompany ? 'Đang xử lý...' : isAlreadyFollowing ? `Đang theo dõi ${jobDetail?.company}` : `Theo dõi ${jobDetail?.company}`}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {isAlreadyFollowing
                                                ? 'Nhấn để bỏ theo dõi'
                                                : 'Nhận thông báo khi công ty đăng việc mới'
                                            }
                                        </p>
                                    </div>
                                    {isAlreadyFollowing && (
                                        <span className="text-green-500 shrink-0">✓</span>
                                    )}
                                </div>
                            </button>

                            {/* Option 2: Tìm việc tương tự */}
                            <button
                                onClick={() => {
                                    const keyword = currentJob?.position || currentJob?.title || '';
                                    const location = currentJob?.province || '';
                                    const params = new URLSearchParams();
                                    if (keyword) params.set('keyword', keyword);
                                    if (location) params.set('location', location);
                                    setShowSimilarModal(false);
                                    navigate(`/jobs?${params.toString()}`);
                                }}
                                className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-[#3AB4E6] hover:bg-[#E6F6FD] text-left transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white text-[#3AB4E6] flex items-center justify-center shrink-0 shadow-sm">
                                        <FaExternalLinkAlt size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm">Xem việc làm tương tự ngay</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Tìm kiếm công việc với từ khóa "{currentJob?.position || currentJob?.title || 'tương tự'}"
                                        </p>
                                    </div>
                                    <FaExternalLinkAlt className="text-slate-300 group-hover:text-[#3AB4E6] transition-colors shrink-0" size={14} />
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowSimilarModal(false)}
                            className="w-full mt-6 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL BÁO CÁO TIN TUYỂN DỤNG */}
            {showReportModal && (
                <div
                    className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}
                >
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                <FaExclamationTriangle size={24} />
                            </div>
                            Báo cáo tin tuyển dụng
                        </h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">
                            Bạn đang báo cáo tin tuyển dụng <span className="text-slate-800 font-bold">{jobDetail?.title}</span> của <span className="text-slate-800 font-bold">{jobDetail?.company}</span>. Vui lòng chọn lý do chính xác.
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Lý do chính</label>
                                <div className="relative">
                                    <select
                                        value={reportData.type}
                                        onChange={(e) => setReportData({ ...reportData, type: e.target.value })}
                                        className="w-full h-14 px-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:border-blue-400 outline-none transition-all cursor-pointer appearance-none"
                                    >
                                        {JOB_REPORT_REASONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mô tả chi tiết</label>
                                <textarea
                                    rows="4"
                                    placeholder="Vui lòng cung cấp thêm thông tin để bộ phận hỗ trợ xử lý nhanh hơn..."
                                    value={reportData.description}
                                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-medium focus:border-blue-400 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => { setShowReportModal(false); setReportData({ type: 'MISLEADING_INFO', description: '' }); }}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!reportData.description.trim()) {
                                            toast.error('Vui lòng nhập mô tả chi tiết lý do báo cáo.');
                                            return;
                                        }
                                        try {
                                            setIsReporting(true);
                                            const selectedReason = JOB_REPORT_REASONS.find(r => r.value === reportData.type);
                                            await reportService.createReport({
                                                targetId: currentJob.id,
                                                targetType: 'JOB',
                                                targetName: jobDetail?.title || 'Tin tuyển dụng',
                                                type: reportData.type,
                                                reason: selectedReason.label,
                                                description: reportData.description,
                                                priority: selectedReason.priority,
                                                status: 'PENDING'
                                            });
                                            toast.success('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất!');
                                            setShowReportModal(false);
                                            setReportData({ type: 'MISLEADING_INFO', description: '' });
                                        } catch (error) {
                                            console.error('Lỗi khi báo cáo:', error);
                                            toast.error(error?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
                                        } finally {
                                            setIsReporting(false);
                                        }
                                    }}
                                    disabled={isReporting}
                                    className="flex-[1.5] py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all disabled:opacity-50"
                                >
                                    {isReporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetailPage;