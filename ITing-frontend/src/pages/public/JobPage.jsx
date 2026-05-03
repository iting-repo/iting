import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { JobFilters, JobCard, JobPromo } from '../../components';
import JobPreviewPane from '../../components/JobPreviewModal';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { fetchJobsRequest } from '../../store/job/jobSlice';
import axiosInstance from '../../utils/axiosInstance';

const PAGE_SIZE = 10;

const defaultFilters = {
    keyword: '',
    location: '',
    jobTypes: [],
    experienceLevels: [],
    minSalary: '',
    maxSalary: '',
    postedWithinHours: '',
    page: 0,
    size: PAGE_SIZE,
    sortBy: 'lastUpdate',
    sortOrder: 'desc',
    isAiSearch: false,
};

const normalizeSort = (value) => {
    if (value === 'salary') {
        return { sortBy: 'salary', sortOrder: 'desc' };
    }
    if (value === 'createdAt') {
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
    return { sortBy: 'lastUpdate', sortOrder: 'desc' };
};

const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    const toText = (value) => Number(value).toLocaleString('vi-VN') + ' VND';
    if (min && max) return `${toText(min)} - ${toText(max)}`;
    if (min) return `Từ ${toText(min)}`;
    return `Đến ${toText(max)}`;
};

const timeAgo = (dateString) => {
    if (!dateString) return 'Mới đăng';
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = [
        { sec: 31536000, label: 'năm trước' },
        { sec: 2592000, label: 'tháng trước' },
        { sec: 86400, label: 'ngày trước' },
        { sec: 3600, label: 'giờ trước' },
        { sec: 60, label: 'phút trước' },
    ];

    for (const item of intervals) {
        const amount = Math.floor(seconds / item.sec);
        if (amount > 0) return `${amount} ${item.label}`;
    }
    return 'Vừa xong';
};

const mapJobToCard = (job) => ({
    id: job.id,
    title: job.title || job.position || 'Vị trí tuyển dụng',
    company: job.companyName || 'Công ty',
    logo: job.companyLogo || 'https://via.placeholder.com/80',
    category: (job.skills && job.skills[0]) || (job.experienceLevel || 'IT'),
    type: job.jobType || 'FULL_TIME',
    salary: formatSalary(job.minSalary, job.maxSalary),
    location: job.location || job.province || 'Việt Nam',
    timePosted: timeAgo(job.lastUpdate || job.createdAt),
});

const compactParams = (filters) => ({
    keyword: filters.keyword || undefined,
    location: filters.location || undefined,
    jobTypes: filters.jobTypes.length ? filters.jobTypes.join(',') : undefined,
    experienceLevels: filters.experienceLevels.length ? filters.experienceLevels.join(',') : undefined,
    minSalary: filters.minSalary ? Number(filters.minSalary) : undefined,
    maxSalary: filters.maxSalary ? Number(filters.maxSalary) : undefined,
    postedWithinHours: filters.postedWithinHours ? Number(filters.postedWithinHours) : undefined,
    page: filters.page,
    size: filters.size,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    isAiSearch: filters.isAiSearch || undefined,
});

const filtersFromQuery = (searchParams) => ({
    ...defaultFilters,
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobTypes: (searchParams.get('jobTypes') || '').split(',').filter(Boolean),
    experienceLevels: (searchParams.get('experienceLevels') || '').split(',').filter(Boolean),
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    postedWithinHours: searchParams.get('postedWithinHours') || '',
    page: Math.max(Number(searchParams.get('page') || '1') - 1, 0),
    sortBy: searchParams.get('sortBy') || 'lastUpdate',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    isAiSearch: searchParams.get('isAiSearch') === 'true',
});

const queryFromFilters = (filters) => {
    const entries = Object.entries({
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        jobTypes: filters.jobTypes.length ? filters.jobTypes.join(',') : undefined,
        experienceLevels: filters.experienceLevels.length ? filters.experienceLevels.join(',') : undefined,
        minSalary: filters.minSalary || undefined,
        maxSalary: filters.maxSalary || undefined,
        postedWithinHours: filters.postedWithinHours || undefined,
        page: String(filters.page + 1),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        isAiSearch: filters.isAiSearch ? 'true' : undefined,
    }).filter(([, value]) => value !== undefined);

    return Object.fromEntries(entries);
};

const JobPage = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { jobs = [], totalJobs = 0, isLoading } = useSelector((state) => state.job || {});

    const [filters, setFilters] = useState(defaultFilters);
    const [provinces, setProvinces] = useState([]);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/v2/p/')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setProvinces(data);
            })
            .catch(() => setProvinces([]));
    }, []);

    const { keyword: pathKeyword } = useParams();

    useEffect(() => {
        let parsed = filtersFromQuery(searchParams);
        if (pathKeyword) {
            parsed.keyword = pathKeyword;
        }
        setFilters(parsed);
        dispatch(fetchJobsRequest(compactParams(parsed)));
    }, [dispatch, pathKeyword, searchParams]);

    const currentPage = filters.page + 1;
    const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

    const cardJobs = useMemo(() => jobs.map(mapJobToCard), [jobs]);

    const updateFilterField = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: 0,
        }));
    };

    const submitFilters = (nextFilters) => {
        const payload = compactParams(nextFilters);
        dispatch(fetchJobsRequest(payload));
        setSearchParams(queryFromFilters(nextFilters));
    };

    const handleApplyFilters = () => {
        const next = {
            ...filters,
            page: 0,
        };
        setFilters(next);
        submitFilters(next);
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        dispatch(fetchJobsRequest(compactParams(defaultFilters)));
        setSearchParams({ page: '1', sortBy: 'lastUpdate', sortOrder: 'desc' });
    };

    const handleSortChange = (event) => {
        const sortValue = event.target.value;
        const sortInfo = normalizeSort(sortValue);
        const next = {
            ...filters,
            ...sortInfo,
            page: 0,
        };
        setFilters(next);
        submitFilters(next);
    };

    const goToPage = (page) => {
        const clamped = Math.max(1, Math.min(page, totalPages));
        const next = {
            ...filters,
            page: clamped - 1,
        };
        setFilters(next);
        submitFilters(next);
    };

    const start = totalJobs === 0 ? 0 : filters.page * PAGE_SIZE + 1;
    const end = Math.min((filters.page + 1) * PAGE_SIZE, totalJobs);

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [hoveredJob, setHoveredJob] = useState(null);
    const [hoverRect, setHoverRect] = useState(null);
    const enterTimerRef = useRef(null);
    const leaveTimerRef = useRef(null);
    const pendingRef = useRef(null);

    const handleCardEnter = (job, el) => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        pendingRef.current = { job, el };
        enterTimerRef.current = setTimeout(() => {
            const p = pendingRef.current;
            if (!p) return;
            setHoveredJob(p.job);
            setHoverRect(p.el ? p.el.getBoundingClientRect() : null);
        }, 150);
    };
    const handleCardLeave = () => {
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        pendingRef.current = null;
        leaveTimerRef.current = setTimeout(() => {
            setHoveredJob(null);
            setHoverRect(null);
        }, 250);
    };
    const handlePaneEnter = () => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
    const handlePaneLeave = handleCardLeave;

    useEffect(() => () => {
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    }, []);
    
    useEffect(() => {
        if (cardJobs.length === 0 && !isLoading) {
            axiosInstance.get('/jobs/hot?limit=5')
                .then(res => {
                    const formatSalary = (min, max, type) => {
                        if (!min && !max) return 'Thỏa thuận';
                        const formatNum = (num) => {
                            if (num >= 1000000) return `${num / 1000000}Tr`;
                            return num;
                        };
                        return `${formatNum(min)} - ${formatNum(max)}`;
                    };
                    
                    const mapped = res.map(job => ({
                        id: job.id,
                        title: job.title,
                        companyName: job.companyName,
                        companyLogo: job.companyLogo || job.logoUrl || job.logo,
                        skills: job.skills || [],
                        salary: formatSalary(job.minSalary, job.maxSalary, job.salaryType),
                        location: job.location || job.province,
                        type: job.jobType,
                        postedAt: job.lastUpdate || job.createdAt,
                        isHot: job.viewCount > 100 || job.applicationCount > 50,
                        featured: job.featured,
                        isAiSuggested: job.isAiSuggested
                    }));
                    setRecommendedJobs(mapped);
                })
                .catch(err => console.error('Error fetching recommended jobs', err));
        }
    }, [cardJobs.length, isLoading]);

    return (
        <div className="bg-[#F5F7FA] min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumbs */}
                <nav className="text-sm mb-6 text-gray-500 flex items-center gap-2">
                    <Link to="/" className="hover:text-[#3AB4E6] transition-colors">Trang chủ</Link>
                    <FaChevronRight className="text-xs text-gray-400" />
                    <Link to="/jobs" className="hover:text-[#3AB4E6] transition-colors">Việc làm</Link>
                    {filters.keyword && (
                        <>
                            <FaChevronRight className="text-xs text-gray-400" />
                            <span className="text-gray-800 font-semibold">{filters.keyword}</span>
                        </>
                    )}
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <JobFilters
                            filters={filters}
                            provinces={provinces}
                            onFieldChange={updateFilterField}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                        <JobPromo />
                    </div>

                    <div className="lg:col-span-9 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-100">
                            <span className="text-gray-500 text-sm mb-2 md:mb-0">
                                Hiển thị <span className="font-bold text-gray-800">{start}-{end}</span> trong tổng số <span className="font-bold text-gray-800">{totalJobs}</span> kết quả
                            </span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filters.sortBy === 'salary' ? 'salary' : (filters.sortBy === 'createdAt' ? 'createdAt' : 'lastUpdate')}
                                    onChange={handleSortChange}
                                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                >
                                    <option value="lastUpdate">Mới cập nhật</option>
                                    <option value="createdAt">Đăng gần đây</option>
                                    <option value="salary">Lương cao nhất</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">Đang tải danh sách việc làm...</div>
                        ) : (
                            <div className="space-y-4">
                                {cardJobs.length > 0 ? (
                                    cardJobs.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onHoverIn={handleCardEnter}
                                            onHoverOut={handleCardLeave}
                                            isHovered={hoveredJob?.id === job.id}
                                        />
                                    ))
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                                            <p className="text-lg font-semibold mb-2">Không tìm thấy công việc phù hợp bộ lọc.</p>
                                            <p className="text-sm">Hãy thử thay đổi từ khóa hoặc điều kiện lọc để xem thêm kết quả.</p>
                                        </div>
                                        {recommendedJobs.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Gợi ý việc làm tốt nhất cho bạn</h3>
                                                <div className="space-y-4">
                                                    {recommendedJobs.map((job) => (
                                                        <JobCard
                                                            key={job.id}
                                                            job={job}
                                                            onHoverIn={handleCardEnter}
                                                            onHoverOut={handleCardLeave}
                                                            isHovered={hoveredJob?.id === job.id}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <FaChevronLeft size={12} />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#00B4D8] text-white font-bold shadow-md">
                                {currentPage}
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="h-10 px-4 flex items-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Tiếp <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {hoveredJob && hoverRect && (() => {
                const PANE_W = 440;
                const GAP = 12;
                const MARGIN = 12;
                const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
                const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
                const fitsRight = hoverRect.right + GAP + PANE_W <= vw - MARGIN;
                const left = fitsRight
                    ? hoverRect.right + GAP
                    : Math.max(MARGIN, hoverRect.left - GAP - PANE_W);
                const top = Math.max(MARGIN, Math.min(hoverRect.top, vh - 540));
                return (
                    <div
                        className="hidden lg:block fixed z-50"
                        style={{ top, left, width: PANE_W }}
                        onMouseEnter={handlePaneEnter}
                        onMouseLeave={handlePaneLeave}
                    >
                        <JobPreviewPane job={hoveredJob} />
                    </div>
                );
            })()}
        </div>
    );
};

export default JobPage;
