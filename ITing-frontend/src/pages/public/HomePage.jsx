import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchJobsRequest, fetchJobDetailRequest } from '../../store/job/jobSlice';
import { buildJobDetailPath, getJobPublicKey, getCompanyLogoUrl } from '../../utils/jobUrl';
import publicService from '../../services/publicService';
import { CompanyLogo } from '../../components/common';

// FIX: Gom tất cả icon về react-icons/fa để tránh lỗi import undefined
import {
    FaSearch, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaUserFriends,
    FaCode, FaCloud, FaShieldAlt, FaDatabase, FaMobileAlt, FaPencilRuler, FaBug,
    FaArrowRight, FaRegBookmark, FaBookmark, FaClock, FaFilter, FaArrowLeft, FaMagic, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'sonner';
import jobService from '../../services/jobService';
import recommendationService from '../../services/recommendationService';
import JobCard from '../../components/JobCard';

// Import hình nền
import heroBg from '../../assets/bg_login.jpg';

const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { jobs = [], totalJobs = 0, isLoading } = useSelector((state) => state.job || {});
    const { currentUser } = useSelector((state) => state.auth || {});
    const [currentPage, setCurrentPage] = useState(1);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [selectedLocationFilter, setSelectedLocationFilter] = useState(searchParams.get('location') || '');
    const [stats, setStats] = useState({ totalJobs: 0, totalCandidates: 0, totalCompanies: 0 });
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [isRecommending, setIsRecommending] = useState(false);

    const handleJobClick = (job) => {
        const jobKey = getJobPublicKey(job);
        dispatch(fetchJobDetailRequest(jobKey));
        navigate(buildJobDetailPath(job));
    };

    useEffect(() => {
        const locationFromUrl = searchParams.get('location') || '';
        setSelectedLocationFilter(locationFromUrl);
        setSearchForm((prev) => ({ ...prev, location: locationFromUrl }));
        dispatch(fetchJobsRequest({
            location: locationFromUrl || undefined,
            page: 0,
            size: 10,
            sortBy: 'lastUpdate',
            sortOrder: 'desc',
        }));
    }, [dispatch]);

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/v2/p/')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setProvinces(data);
                }
            })
            .catch(() => {
                setProvinces([]);
            });
    }, []);
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await publicService.getHomeStats();
                setStats(data || { totalJobs: 0, totalCandidates: 0, totalCompanies: 0 });
            } catch (error) {
                console.error("Failed to fetch home stats:", error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (!currentUser || (currentUser.role !== 'CANDIDATE' && currentUser.role !== 'USER')) {
            setSavedJobIds([]);
            return;
        }

        const fetchSavedIds = async () => {
            try {
                const ids = await jobService.getSavedJobIds();
                setSavedJobIds(Array.isArray(ids) ? ids : []);
            } catch (error) {
                console.error("Failed to fetch saved job IDs", error);
            }
        };
        fetchSavedIds();
    }, [currentUser]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsRecommending(true);
            try {
                const data = await recommendationService.getHomepageRecommendations(8);
                setRecommendedJobs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setIsRecommending(false);
            }
        };
        fetchRecommendations();
    }, [currentUser]);

    const handleToggleSave = async (e, jobId) => {
        e.stopPropagation();
        if (!currentUser) {
            toast.error("Vui lòng đăng nhập để lưu công việc!");
            return;
        }

        const isCurrentlySaved = savedJobIds.includes(jobId);
        try {
            if (isCurrentlySaved) {
                await jobService.unsaveJob(jobId);
                setSavedJobIds(prev => prev.filter(id => id !== jobId));
                toast.success("Đã bỏ lưu công việc.");
            } else {
                await jobService.saveJob(jobId);
                setSavedJobIds(prev => [...prev, jobId]);
                toast.success("Đã lưu công việc thành công!");
            }
        } catch (error) {
            toast.error("Không thể thao tác lúc này.");
        }
    };

    // Helper: Format Salary
    const formatSalary = (min, max) => {
        if (!min && !max) return "Thỏa thuận";
        const format = (n) => n?.toLocaleString('vi-VN') + ' VNĐ';
        if (min && max) return `${format(min)} - ${format(max)}`;
        if (min) return `Từ ${format(min)}`;
        return `Up to ${format(max)}`;
    };

    // Search 
    const [searchForm, setSearchForm] = useState({
        keyword: '',
        location: '',
        jobType: '',
        experienceLevel: '',
        minSalary: '',
        maxSalary: '',
        companyId: '',
        techRequired: '',
        sortBy: 'lastUpdate',
        sortOrder: 'desc',
        page: 0,
        size: 10,
    });


    // Update field
    const handleChangeSearchField = (field, value) => {
        setSearchForm((prev) => ({
            ...prev,
            [field]: value,
            page: 0,
        }));

        if (field === 'location') {
            setSelectedLocationFilter(value);
        }
    };

    const updateLocationQuery = (locationValue) => {
        if (locationValue) {
            setSearchParams({ location: locationValue });
            return;
        }
        setSearchParams({});
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        const updatedForm = { ...searchForm, page: newPage - 1 };
        setSearchForm(updatedForm);
        
        const params = {
            ...updatedForm,
            minSalary: updatedForm.minSalary || undefined,
            maxSalary: updatedForm.maxSalary || undefined,
            companyId: updatedForm.companyId || undefined,
            keyword: updatedForm.keyword || undefined,
            location: updatedForm.location || undefined,
            jobType: updatedForm.jobType || undefined,
            experienceLevel: updatedForm.experienceLevel || undefined,
            techRequired: updatedForm.techRequired || undefined,
        };
        updateLocationQuery(updatedForm.location);
        dispatch(fetchJobsRequest(params));
    };


    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchForm.keyword) params.append('keyword', searchForm.keyword);
        if (searchForm.location) params.append('location', searchForm.location);
        if (searchForm.jobType) params.append('jobTypes', searchForm.jobType);
        
        navigate(`/jobs?${params.toString()}`);
    };

    // Helper: Time Ago (Simple version)
    const timeAgo = (dateString) => {
        if (!dateString) return "Mới đăng";
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return Math.floor(seconds) + " giây trước";
    };

    // --- MOCK DATA ---
    const categories = [
        { id: 1, name: "Software Development", count: 1254, icon: <FaCode /> },
        { id: 2, name: "DevOps & Cloud", count: 816, icon: <FaCloud /> },
        { id: 3, name: "Cybersecurity", count: 2082, icon: <FaShieldAlt /> },
        { id: 4, name: "Data & AI", count: 1520, icon: <FaDatabase /> },
        { id: 5, name: "Web Development", count: 1022, icon: <FaBriefcase /> },
        { id: 6, name: "Mobile Development", count: 1496, icon: <FaMobileAlt /> },
        { id: 7, name: "UI/UX & Design", count: 1529, icon: <FaPencilRuler /> },
        { id: 8, name: "QA & Testing", count: 1244, icon: <FaBug /> },
    ];

    const bestJobs = [
        {
            id: 1,
            title: "Forward Security Director",
            company: "Bauch, Schuppe and Schulist Co",
            logo: "https://via.placeholder.com/50",
            tags: ["Hotels & Tourism", "Full time", "$40000-$42000", "New-York, USA"],
            time: "10 min ago"
        },
        {
            id: 2,
            title: "Regional Creative Facilitator",
            company: "Wisozk - Becker Co",
            logo: "https://via.placeholder.com/50",
            tags: ["Media", "Part time", "$28000-$32000", "Los- Angeles, USA"],
            time: "12 min ago"
        },
        {
            id: 3,
            title: "Internal Integration Planner",
            company: "Mraz, Quigley and Feest Inc.",
            logo: "https://via.placeholder.com/50",
            tags: ["Construction", "Full time", "$48000-$50000", "Texas, USA"],
            time: "15 min ago"
        },
    ];

    const blogs = [
        {
            id: 1,
            tag: "News",
            date: "30 March 2024",
            title: "Revitalizing Workplace Morale: Innovative Tactics For Boosting Employee Engagement In 2024",
            image: "https://ui-avatars.com/api/?name=News&background=3AB4E6&color=fff&size=600",
        },
        {
            id: 2,
            tag: "Blog",
            date: "30 March 2024",
            title: "How To Avoid The Top Six Most Common Job Interview Mistakes",
            image: "https://ui-avatars.com/api/?name=Blog&background=3AB4E6&color=fff&size=600",
        }
    ];

    return (
        <div className="bg-white font-sans">

            {/* PHẦN 1: HERO SEARCH */}
            <section className="relative bg-gray-900 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-gray-900/60 to-gray-900"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Tìm việc làm IT <span className="text-white">chất lượng trên toàn quốc</span>
                    </h1>
                    <p className="text-gray-400 mb-10 text-sm md:text-base max-w-2xl mx-auto">
                        Tiếp cận {stats.totalJobs.toLocaleString('vi-VN')}+ tin tuyển dụng việc làm mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
                    </p>

                    {/* Search Box */}
                    <div className="bg-white rounded-lg md:rounded-full p-1.5 flex flex-col md:flex-row items-center max-w-4xl mx-auto shadow-2xl">
                        <div className="flex-1 w-full md:w-auto px-4 py-3 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Vị trí tuyển dụng, tên công ty"
                                value={searchForm.keyword}
                                onChange={(e) => handleChangeSearchField('keyword', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch();
                                }}
                                className="w-full outline-none text-gray-700 text-sm placeholder-gray-400"
                            />                        
                            </div>
                        <div className="w-full md:w-[20%] px-4 py-3 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
                            <FaMapMarkerAlt className="text-gray-400 mr-2" />
                            <select
                                value={searchForm.location}
                                onChange={(e) => handleChangeSearchField('location', e.target.value)}
                                className="w-full outline-none text-gray-700 text-sm bg-transparent"
                            >
                                <option value="">Địa điểm</option>
                                {provinces.map((province) => (
                                    <option key={province.code} value={province.name}>{province.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-[25%] px-4 py-3 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
                            <FaBriefcase className="text-gray-400 mr-2" />
                            <select
                                value={searchForm.jobType}
                                onChange={(e) => handleChangeSearchField('jobType', e.target.value)}
                                className="w-full outline-none text-gray-700 text-sm bg-transparent"
                            >
                                <option value="">Loại công việc</option>
                                <option value="FULL_TIME">Full-time</option>
                                <option value="PART_TIME">Part-time</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="REMOTE">Remote</option>
                            </select>
                        </div>
                        <button className="w-full md:w-auto bg-[#3AB4E6] hover:bg-blue-500 text-white px-5 py-3 font-bold text-sm flex items-center justify-center gap-1 transition-colors border-r border-blue-400/30">
                            {/* FIX: Thay HiSparkles bằng FaMagic */}
                            <FaMagic className="text-yellow-300" /> AI
                        </button>
                        <button
                        onClick={handleSearch}
                        className="w-full md:w-auto bg-[#3AB4E6] hover:bg-blue-500 text-white px-8 py-3 rounded-b-lg md:rounded-r-full md:rounded-bl-none font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <FaSearch /> Tìm kiếm
                    </button>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-2 items-center">
                        <span className="text-gray-400 text-sm font-medium">Gợi ý:</span>
                        {['Intern', 'Thực tập sinh IT', 'Thực tập sinh tiếng Trung', 'Thực tập sinh tư vấn', 'Chuyên viên vận hành'].map((tag, i) => (
                            <span 
                                key={i} 
                                onClick={() => {
                                    handleChangeSearchField('keyword', tag);
                                    const params = new URLSearchParams();
                                    params.append('keyword', tag);
                                    if (searchForm.location) params.append('location', searchForm.location);
                                    if (searchForm.jobType) params.append('jobTypes', searchForm.jobType);
                                    navigate(`/jobs?${params.toString()}`);
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-xs cursor-pointer transition-all border border-white/5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-12 h-12 rounded-full bg-[#3AB4E6] flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <FaBriefcase className="text-white text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.totalJobs.toLocaleString('vi-VN')}
                                </div>
                                <div className="text-gray-400 text-xs">Công việc</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-12 h-12 rounded-full bg-[#3AB4E6] flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <FaUserFriends className="text-white text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.totalCandidates.toLocaleString('vi-VN')}
                                </div>
                                <div className="text-gray-400 text-xs">Ứng viên</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-12 h-12 rounded-full bg-[#3AB4E6] flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <FaBuilding className="text-white text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.totalCompanies.toLocaleString('vi-VN')}
                                </div>
                                <div className="text-gray-400 text-xs">Công ty</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
          PHẦN: DÀNH CHO BẠN (RECOMMENDATIONS)
         ================================================================= */}
            <section className="py-16 px-4 bg-[#F8FAFC]">
                <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <FaMagic />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {currentUser ? "Dành cho bạn" : "Việc làm nổi bật"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {currentUser 
                                    ? "Dựa trên hồ sơ và những gì bạn đã xem" 
                                    : "Khám phá các cơ hội việc làm tốt nhất ngay hôm nay"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isRecommending ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-50 rounded w-1/2 mb-4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-50 rounded w-16"></div>
                                        <div className="h-6 bg-gray-50 rounded w-16"></div>
                                    </div>
                                </div>
                            ))
                        ) : recommendedJobs.length > 0 ? (
                            recommendedJobs.map((job) => {
                                const isSaved = savedJobIds.includes(job.id);
                                return (
                                    <div 
                                        key={job.id}
                                        onClick={() => handleJobClick(job)}
                                        className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <CompanyLogo 
                                                logoUrl={job.companyLogo || job.logo || job.logoUrl} 
                                                companyId={job.companyId}
                                                companyName={job.companyName}
                                                className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1" 
                                            />
                                            <button 
                                                onClick={(e) => handleToggleSave(e, job.id)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSaved ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50'}`}
                                            >
                                                {isSaved ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
                                            </button>
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold mb-3 uppercase tracking-wider">
                                            <FaMagic size={10} /> Gợi ý AI
                                        </div>

                                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-500 transition-colors line-clamp-2 min-h-[3rem]">
                                            {job.title || job.position}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mb-4 truncate">{job.companyName}</p>

                                        <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4 pt-4 border-t border-gray-50">
                                            <span className="flex items-center gap-1">
                                                <FaMapMarkerAlt className="text-red-400" /> {job.province || "Việt Nam"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaClock className="text-sky-400" /> {timeAgo(job.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-500">
                                                {job.minSalary || job.maxSalary ? formatSalary(job.minSalary, job.maxSalary) : "Thỏa thuận"}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all">
                                                <FaChevronRight size={10} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <FaBriefcase size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Hiện chưa có đề xuất nào</h3>
                                <p className="text-gray-500 text-sm">Hãy cập nhật CV và xem thêm nhiều việc làm để chúng tôi gợi ý tốt hơn nhé!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <section className="py-10 px-8 bg-white">
                <div className="container mx-auto px-4">

                    {/* 1. HEADER: Loại bỏ nút đen, dùng nút viền mảnh tinh tế */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Việc Làm Tốt Nhất</h2>
                            <p className="text-gray-500 text-sm">Các cơ hội việc làm hấp dẫn nhất đang chờ đón bạn</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <a href="#" className="text-gray-500 font-medium hover:text-[#3AB4E6] transition-colors text-sm mr-2">Xem tất cả</a>
                            {/* Sửa: Nút điều hướng trắng, viền xám */}
                            <button className="w-9 h-9 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:border-[#3AB4E6] hover:text-[#3AB4E6] transition-all">
                                <FaArrowLeft size={12} />
                            </button>
                            <button className="w-9 h-9 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:border-[#3AB4E6] hover:text-[#3AB4E6] transition-all">
                                <FaArrowRight size={12} />
                            </button>
                        </div>
                    </div>

                    {/* 2. FILTER BAR: Tách biệt nút lọc và danh sách cuộn */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">

                        {/* Nút Lọc cố định */}
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-medium text-sm shadow-sm">
                            <FaFilter className="text-[#3AB4E6]" />
                            <span>Lọc theo:</span>
                            <span className="font-bold text-gray-900">Địa điểm</span>
                        </div>

                        {/* Danh sách địa điểm (Scroll ngang) */}
                        <div className="flex-1 w-full flex items-center gap-2 overflow-hidden">
                            {/* Nút scroll trái nhỏ */}
                            <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-200 shrink-0">
                                <FaArrowLeft size={10} />
                            </button>

                            <div className="flex gap-3 overflow-x-auto no-scrollbar px-1 py-1 scroll-smooth flex-1">
                                {provinces.map((province) => (
                                    <button
                                        key={province.code}
                                        onClick={() => {
                                            const newLocation = selectedLocationFilter === province.name ? '' : province.name;
                                            setSelectedLocationFilter(newLocation);
                                            setSearchForm((prev) => ({ ...prev, location: newLocation, page: 0 }));
                                            setCurrentPage(1);

                                            const params = {
                                                ...searchForm,
                                                location: newLocation || undefined,
                                                page: 0,
                                                minSalary: searchForm.minSalary || undefined,
                                                maxSalary: searchForm.maxSalary || undefined,
                                                companyId: searchForm.companyId || undefined,
                                                keyword: searchForm.keyword || undefined,
                                                jobType: searchForm.jobType || undefined,
                                                experienceLevel: searchForm.experienceLevel || undefined,
                                                techRequired: searchForm.techRequired || undefined,
                                            };

                                            updateLocationQuery(newLocation);
                                            dispatch(fetchJobsRequest(params));
                                        }}
                                        className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border
                      ${selectedLocationFilter === province.name
                                             ? 'bg-[#3AB4E6] border-[#3AB4E6] text-white shadow-md shadow-blue-200'
                                             : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {province.name}
                                    </button>
                                ))}
                            </div>

                            {/* Nút scroll phải nhỏ */}
                            <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-200 shrink-0">
                                <FaArrowRight size={10} />
                            </button>
                        </div>
                    </div>

                    {/* 3. TIP BAR: Làm mềm mại hơn */}
                    <div className="mb-10 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-full text-[#3AB4E6] shadow-sm">
                            {/* Dùng icon Magic thay cho Sparkles */}
                            <FaMagic size={14} />
                        </div>
                        <div className="flex-1 text-xs md:text-sm text-gray-600">
                            <span className="font-bold text-[#3AB4E6]">Gợi ý:</span> Đưa chuột vào tiêu đề công việc để xem trước thông tin chi tiết nhanh.
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 px-2">✕</button>
                    </div>

                    {/* 4. JOB LIST: Thêm hiệu ứng hover xịn & bo góc mềm */}
                    <div className="space-y-5 mb-12">
                        {isLoading ? (
                            <div className="text-center py-10">Đang tải danh sách việc làm...</div>
                        ) : (jobs ?? []).map((job) => {
                                const isSaved = savedJobIds.includes(job.id);
                                return (
                                <div 
                                    key={job.id} 
                                    onClick={() => handleJobClick(job)}
                                    className="group relative border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 bg-white overflow-hidden cursor-pointer">

                                    {/* Hiệu ứng: Thanh màu xanh trượt ra khi hover */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3AB4E6] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Logo */}
                                        <div className="shrink-0">
                                            <CompanyLogo 
                                                logoUrl={job.companyLogo || job.logo || job.logoUrl} 
                                                companyId={job.companyId}
                                                companyName={job.companyName}
                                                className="w-14 h-14 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100" 
                                            />
                                        </div>

                                        {/* Nội dung */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#3AB4E6] transition-colors cursor-pointer">
                                                        {job.title || job.position}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-medium mt-1">{job.companyName}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleToggleSave(e, job.id)}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-[#3AB4E6] text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-[#3AB4E6] hover:text-white'}`}>
                                                    {isSaved ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                                                </button>
                                            </div>

                                            {/* Tags styled đẹp hơn */}
                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <FaBriefcase className="text-blue-400" /> {job.jobType || "Full-time"}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <FaClock className="text-sky-400" /> {formatSalary(job.minSalary, job.maxSalary)}
                                                </span>
                                                {/* Tech Stack */}
                                                {job.techRequired && (
                                                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 font-bold truncate max-w-[200px]">
                                                        {job.techRequired}
                                                    </span>
                                                )}

                                                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <FaMapMarkerAlt className="text-red-400" /> {job.location || "Việt Nam"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nút hành động */}
                                        <div className="flex flex-col justify-between items-end gap-3 min-w-[100px]">
                                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                                                {timeAgo(job.createdAt)}
                                            </span>
                                            {/* Nút Chi Tiết style mới */}
                                            <button className="w-full md:w-auto bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-300">
                                                Chi Tiết
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                    </div>

                    {/* 5. PAGINATION: Bỏ nút đen, dùng style Clean */}
                    {totalJobs > 0 && (
                        <div className="flex justify-center items-center gap-2">
                            <button 
                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${currentPage === 1 ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-200 text-gray-400 hover:border-[#3AB4E6] hover:text-[#3AB4E6] bg-white'}`}>
                                <FaArrowLeft size={12} />
                            </button>
                            
                            {Array.from({ length: Math.ceil(totalJobs / searchForm.size) }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === Math.ceil(totalJobs / searchForm.size) || Math.abs(p - currentPage) <= 2)
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="text-gray-300 px-2">...</span>
                                        )}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border
                                                ${currentPage === page
                                                    ? 'bg-[#3AB4E6] border-[#3AB4E6] text-white shadow-lg shadow-blue-200'
                                                    : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {page < 10 ? `0${page}` : page}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                            
                            <button 
                                onClick={() => currentPage < Math.ceil(totalJobs / searchForm.size) && handlePageChange(currentPage + 1)}
                                disabled={currentPage === Math.ceil(totalJobs / searchForm.size)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${currentPage === Math.ceil(totalJobs / searchForm.size) ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-200 text-gray-400 hover:border-[#3AB4E6] hover:text-[#3AB4E6] bg-white'}`}>
                                <FaArrowRight size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* PHẦN 2: JOB CATEGORIES */}
            <section className="py-10 px-8 bg-[#F0F5FA]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">Tìm việc theo lĩnh vực</h2>
                        <p className="text-gray-500 text-sm">Khám phá các cơ hội nghề nghiệp trong lĩnh vực công nghệ – từ phát triển phần mềm, AI, đến an ninh mạng.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col items-center text-center border border-transparent hover:border-blue-200">
                                <div className="w-16 h-16 mb-4 text-[#3AB4E6] text-4xl group-hover:scale-110 transition-transform flex items-center justify-center">
                                    {cat.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#3AB4E6] transition-colors">{cat.name}</h3>
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-medium">
                                    {cat.count} jobs
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* PHẦN 4: BLOGS */}
            <section className="py-10 px-8 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bài viết và blog</h2>
                            <p className="text-gray-500 text-sm">Cập nhật tin tức mới nhất về công nghệ và thị trường tuyển dụng</p>
                        </div>
                        {/* FIX: Thay BsArrowRight bằng FaArrowRight */}
                        <a href="#" className="text-[#3AB4E6] font-medium hover:underline flex items-center gap-1">
                            View all <FaArrowRight />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="group cursor-pointer">
                                <div className="overflow-hidden rounded-xl mb-4 relative">
                                    <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    <span className="absolute top-4 left-4 bg-[#3AB4E6] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        {blog.tag}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-xs mb-2">{blog.date}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#3AB4E6] transition-colors leading-snug">
                                    {blog.title}
                                </h3>
                                {/* FIX: Thay BsArrowRight bằng FaArrowRight */}
                                <div className="flex items-center gap-2 text-[#3AB4E6] text-sm font-medium hover:underline">
                                    Read more <FaArrowRight />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
