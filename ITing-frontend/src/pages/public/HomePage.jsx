import React, { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchJobsRequest } from '../../store/job/jobSlice';
import { buildJobDetailPath } from '../../utils/jobUrl';
import { jobTypeLabel } from '../../utils/enumLabels';
import publicService from '../../services/publicService';
import { CompanyLogo, LocationPicker, CategoryPicker, SearchOverlay, saveSearchKeyword } from '../../components/common';
import { useModalEscape } from '../../hooks/useModalEscape';

// FIX: Gom tất cả icon về react-icons/fa để tránh lỗi import undefined
import {
    FaSearch, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaUserFriends,
    FaCode, FaCloud, FaShieldAlt, FaDatabase, FaMobileAlt, FaPencilRuler, FaBug,
    FaArrowRight, FaRegBookmark, FaBookmark, FaClock, FaFilter, FaArrowLeft, FaMagic, FaChevronRight,
    FaCubes, FaGamepad, FaLaptopCode, FaCloudUploadAlt, FaFilePdf, FaKeyboard
} from 'react-icons/fa';
import { toast } from 'sonner';
import jobService from '../../services/jobService';
import recommendationService from '../../services/recommendationService';
import JobCard from '../../components/JobCard';
import JobPreviewPane from '../../components/JobPreviewModal';

// Hero background: dùng AVIF 11KB thay PNG 1.3MB — ảnh đè opacity-30 nên không cần độ phân giải cao.
const heroBg = '/jobportal_banner.avif';

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
    const [filterMode, setFilterMode] = useState('location'); // 'location' | 'category'
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [stats, setStats] = useState({ totalJobs: 0, totalCandidates: 0, totalCompanies: 0 });
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [isRecommending, setIsRecommending] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [cvText, setCvText] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [aiMode, setAiMode] = useState("text"); // 'text' | 'file'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [hoveredJob, setHoveredJob] = useState(null);
    const [hoverRect, setHoverRect] = useState(null);
    const enterTimerRef = useRef(null);
    const leaveTimerRef = useRef(null);
    const pendingRef = useRef(null);
    const provinceScrollRef = useRef(null);
    const categoryScrollRef = useRef(null);
    const recommendationScrollRef = useRef(null);
    const featuredCategoryScrollRef = useRef(null);
    const searchBoxRef = useRef(null);

    // Search overlay state
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const [searchType, setSearchType] = useState('job');

    // Banner CMS State
    const [banners, setBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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

    useEffect(() => () => {
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    }, []);

    const handleJobClick = (job) => {
        navigate(buildJobDetailPath(job));
    };

    useEffect(() => {
        const locationFromUrl = searchParams.get('location') || '';
        setSelectedLocationFilter(locationFromUrl);
        setSearchForm((prev) => ({ ...prev, location: locationFromUrl }));
        dispatch(fetchJobsRequest({
            location: locationFromUrl || undefined,
            page: 0,
            size: 5,
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
                setStats({ totalJobs: 0, totalCandidates: 0, totalCompanies: 0, ...(data || {}) });
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

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await publicService.getBlogs({ page: 0, size: 2 });
                const data = response.data || response;
                if (data && data.content) {
                    setBlogs(data.content);
                } else if (Array.isArray(data)) {
                    setBlogs(data);
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await publicService.getBanners('homepage_main');
                setBanners(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch active banners:", error);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

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
        category: '',
        jobType: '',
        experienceLevel: '',
        minSalary: '',
        maxSalary: '',
        companyId: '',
        skills: '',
        sortBy: 'lastUpdate',
        sortOrder: 'desc',
        page: 0,
        size: 5,
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
            techRequired: updatedForm.skills || undefined,
        };
        updateLocationQuery(updatedForm.location);
        dispatch(fetchJobsRequest(params));

        // Cuộn lên đầu danh sách việc làm khi chuyển trang trên mobile/tablet
        if (window.innerWidth < 1024) {
            const section = document.getElementById('best-jobs-section');
            if (section) {
                setTimeout(() => {
                    const y = section.getBoundingClientRect().top + window.scrollY - 80; // Trừ hao khoảng trống phía trên (ví dụ: header cố định)
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }, 100);
            }
        }
    };


    const handleSearch = () => {
        const params = new URLSearchParams();
        const finalKeyword = [searchForm.category, searchForm.keyword].filter(Boolean).join(' ');

        if (finalKeyword) {
            params.append('keyword', finalKeyword);
            saveSearchKeyword(finalKeyword);
        }
        if (searchForm.location) params.append('location', searchForm.location);
        if (searchForm.jobType) params.append('jobTypes', searchForm.jobType);
        if (searchType === 'company') params.append('searchType', 'company');

        setIsSearchOverlayOpen(false);
        navigate(`/jobs?${params.toString()}`);
    };

    const handleAiSearch = () => {
        setIsAiModalOpen(true);
    };

    const handleAiFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
            toast.error('Chỉ chấp nhận file PDF hoặc ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file tối đa 5MB');
            return;
        }
        setCvFile(file);
    };

    const handleConfirmAiSearch = async () => {
        if (aiMode === 'text' && !cvText.trim()) {
            toast.error("Vui lòng dán nội dung CV để AI phân tích!");
            return;
        }
        if (aiMode === 'file' && !cvFile) {
            toast.error("Vui lòng chọn file CV để AI phân tích!");
            return;
        }

        setIsAnalyzing(true);
        try {
            let criteria;
            if (aiMode === 'file') {
                const formData = new FormData();
                formData.append('file', cvFile);
                const response = await jobService.analyzeCvFile(formData);
                criteria = response.data || response;
            } else {
                const response = await jobService.analyzeCv(cvText);
                criteria = response.data || response;
            }

            const params = new URLSearchParams();
            if (criteria.keyword) params.append('keyword', criteria.keyword);
            if (criteria.location) params.append('location', searchForm.location);
            if (criteria.techs && criteria.techs.length > 0) params.append('techs', criteria.techs.join(','));
            if (criteria.experienceLevel) params.append('experienceLevels', criteria.experienceLevel);
            params.append('isAiSearch', 'true');

            toast.success("Đã phân tích CV thành công! Đang tìm việc phù hợp...");
            navigate(`/jobs?${params.toString()}`);
        } catch (error) {
            console.error("AI Analysis failed:", error);
            const errorMsg = error?.error || error?.message || error?.response?.data?.message || "Phân tích CV thất bại. Vui lòng thử lại!";
            toast.error(errorMsg);
        } finally {
            setIsAnalyzing(false);
            setIsAiModalOpen(false);
            setCvFile(null);
        }
    };

    useModalEscape(isAiModalOpen ? () => setIsAiModalOpen(false) : null);

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

    // --- DANH MỤC NGÀNH NGHỀ (sync với Industry.java enum) ---
    const categories = [
        { id: 'SOFTWARE_DEVELOPMENT', name: "Phát triển phần mềm", icon: <FaCode /> },
        { id: 'WEB_DEVELOPMENT', name: "Phát triển Web", icon: <FaLaptopCode /> },
        { id: 'MOBILE_DEVELOPMENT', name: "Phát triển Mobile", icon: <FaMobileAlt /> },
        { id: 'CLOUD_COMPUTING', name: "Điện toán đám mây", icon: <FaCloud /> },
        { id: 'DEVOPS', name: "DevOps", icon: <FaCubes /> },
        { id: 'DATA_SCIENCE', name: "Khoa học dữ liệu", icon: <FaDatabase /> },
        { id: 'AI', name: "Trí tuệ nhân tạo (AI)", icon: <FaMagic /> },
        { id: 'CYBERSECURITY', name: "An ninh mạng", icon: <FaShieldAlt /> },
        { id: 'BLOCKCHAIN', name: "Blockchain", icon: <FaCubes /> },
        { id: 'GAME_DEVELOPMENT', name: "Phát triển Game", icon: <FaGamepad /> },
        { id: 'QA_TESTING', name: "Kiểm thử (QA)", icon: <FaBug /> },
        { id: 'IT_SOFTWARE', name: "Phần mềm & CNTT", icon: <FaBriefcase /> },
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

    // Dynamic blogs fetched from API

    // Section "Dành cho bạn" ưu tiên đề xuất mới — ẩn job đã lưu (đã có ở "Việc làm yêu thích").
    // Anonymous user (chưa login) không có savedJobIds → hiển thị nguyên list trending.
    const freshRecommendedJobs = currentUser
        ? recommendedJobs.filter(j => !savedJobIds.includes(j.id))
        : recommendedJobs;

    return (
        <div className="bg-white font-sans">

            {/* PHẦN 1: HERO SEARCH */}
            <section className="relative z-10 bg-[#0B1B3D] pt-6 md:pt-10 pb-64 overflow-visible">
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} alt="" aria-hidden="true" width="1600" height="900" fetchpriority="high" decoding="async" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B1B3D]/50 via-[#0B1B3D]/80 to-[#0B1B3D]"></div>
                    {/* Glowing Orbs */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3AB4E6] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                        Tìm việc làm IT <span className="text-[#3AB4E6]">chất lượng</span><br className="hidden md:block" /> trên toàn quốc
                    </h1>
                    <p className="text-gray-300 mb-6 text-sm md:text-base max-w-2xl mx-auto font-medium">
                        Tiếp cận {(stats.totalJobs ?? 0).toLocaleString('vi-VN')}+ tin tuyển dụng việc làm mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
                    </p>

                    {/* Search Box */}
                    <div className="bg-white/10 backdrop-blur-md p-3 lg:p-3 rounded-2xl max-w-5xl mx-auto shadow-2xl border border-white/20">
                        <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0 lg:bg-white lg:rounded-xl">

                            {/* 1. Category Picker */}
                            <div className="w-full lg:w-[25%] h-14 flex items-center px-5 relative bg-white rounded-xl lg:rounded-none lg:rounded-l-xl lg:border-r border-gray-200 hover:bg-gray-50 transition-colors shadow-sm lg:shadow-none flex-shrink-0">
                                <CategoryPicker
                                    value={searchForm.category}
                                    onChange={(val) => handleChangeSearchField('category', val)}
                                />
                            </div>

                            {/* 2. Keyword Input */}
                            <div className="w-full lg:flex-1 h-14 px-5 flex items-center bg-white rounded-xl lg:rounded-none lg:border-r border-gray-200 hover:bg-gray-50 transition-colors shadow-sm lg:shadow-none relative min-w-0" ref={searchBoxRef}>
                                <FaSearch className="text-[#3AB4E6] absolute left-5 lg:static lg:mr-3 flex-shrink-0" size={18} />
                                <input
                                    type="text"
                                    data-search-trigger
                                    placeholder="Vị trí tuyển dụng, tên công ty"
                                    value={searchForm.keyword}
                                    onChange={(e) => handleChangeSearchField('keyword', e.target.value)}
                                    onFocus={() => setIsSearchOverlayOpen(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsSearchOverlayOpen(false);
                                            handleSearch();
                                        }
                                    }}
                                    className="w-full h-full bg-transparent outline-none text-gray-800 text-sm lg:text-base text-center lg:text-left placeholder-gray-400 font-medium min-w-0 px-8 lg:px-0"
                                />
                                <SearchOverlay
                                    isOpen={isSearchOverlayOpen}
                                    onClose={() => setIsSearchOverlayOpen(false)}
                                    searchType={searchType}
                                    onSearchTypeChange={setSearchType}
                                    onSearch={(keyword) => {
                                        handleChangeSearchField('keyword', keyword);
                                        saveSearchKeyword(keyword);
                                        const params = new URLSearchParams();
                                        const finalKeyword = [searchForm.category, keyword].filter(Boolean).join(' ');
                                        if (finalKeyword) params.append('keyword', finalKeyword);
                                        if (searchForm.location) params.append('location', searchForm.location);
                                        if (searchType === 'company') params.append('searchType', 'company');
                                        navigate(`/jobs?${params.toString()}`);
                                    }}
                                    variant="homepage"
                                />
                            </div>

                            {/* 3. Location Picker */}
                            <div className="w-full lg:w-[22%] h-14 px-5 flex items-center bg-white rounded-xl lg:rounded-none hover:bg-gray-50 transition-colors relative shadow-sm lg:shadow-none flex-shrink-0">
                                <FaMapMarkerAlt className="text-[#3AB4E6] mr-3 flex-shrink-0" size={18} />
                                <LocationPicker
                                    value={searchForm.location}
                                    onChange={(val) => handleChangeSearchField('location', val)}
                                    provinces={provinces}
                                />
                            </div>

                            {/* 4. Buttons */}
                            <div className="w-full lg:w-auto flex flex-row gap-2 lg:gap-0 h-14 flex-shrink-0">
                                <button
                                    onClick={handleAiSearch}
                                    className="flex-1 lg:flex-none rounded-xl lg:rounded-none bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white px-4 lg:px-6 font-bold text-sm lg:text-base flex items-center justify-center gap-2 transition-all lg:border-r border-white/20 shadow-sm lg:shadow-none"
                                >
                                    <FaMagic className="text-[#3AB4E6] flex-shrink-0" /> AI Match
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 lg:flex-none rounded-xl lg:rounded-none lg:rounded-r-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 lg:px-8 font-bold text-sm lg:text-base transition-all flex items-center justify-center gap-2 shadow-sm lg:shadow-none"
                                >
                                    Tìm kiếm
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Banners Carousel (Desktop & Tablet only, hidden on Mobile) */}
                    {banners.length > 0 && (
                        <div className="hidden md:block max-w-5xl mx-auto mt-8 relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20">
                            <div className="relative aspect-[31/10] w-full overflow-hidden bg-slate-950">
                                {banners.map((banner, index) => {
                                    const isActive = index === currentBannerIndex;
                                    return (
                                        <div
                                            key={banner.id || index}
                                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                                            }`}
                                        >
                                            {banner.link ? (
                                                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                                    <img
                                                        src={banner.imageDesktop}
                                                        alt={banner.title}
                                                        className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105"
                                                    />
                                                </a>
                                            ) : (
                                                <img
                                                    src={banner.imageDesktop}
                                                    alt={banner.title}
                                                    className="w-full h-full object-cover select-none"
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Controls: Left & Right Arrows */}
                                {banners.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#3AB4E6] hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                                        >
                                            <FaArrowLeft size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#3AB4E6] hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                                        >
                                            <FaArrowRight size={12} />
                                        </button>
                                    </>
                                )}

                                {/* Dot Indicators */}
                                {banners.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                        {banners.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setCurrentBannerIndex(index)}
                                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                                    index === currentBannerIndex ? "bg-[#3AB4E6] w-6" : "bg-white/40 hover:bg-white/60"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap justify-center gap-3 items-center">
                        <span className="text-gray-300 text-base font-medium">Gợi ý:</span>
                        {['Intern', 'Thực tập sinh IT', 'Senior Frontend', 'Junior', 'Java Developer'].map((tag, i) => (
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
                                className="bg-white/10 hover:bg-[#3AB4E6] text-white px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all border border-white/10"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-16 flex flex-wrap justify-center gap-10 md:gap-24">
                        <div className="flex items-center gap-4 text-left group">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 group-hover:bg-[#3AB4E6] flex items-center justify-center transition-all border border-white/10 group-hover:border-[#3AB4E6] shadow-lg">
                                <FaBriefcase className="text-[#3AB4E6] group-hover:text-white text-2xl md:text-3xl transition-colors" />
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-black text-white">
                                    {(stats.totalJobs ?? 0).toLocaleString('vi-VN')}
                                </div>
                                <div className="text-gray-400 text-sm md:text-base font-medium">Công việc</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-left group">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 group-hover:bg-[#3AB4E6] flex items-center justify-center transition-all border border-white/10 group-hover:border-[#3AB4E6] shadow-lg">
                                <FaUserFriends className="text-[#3AB4E6] group-hover:text-white text-2xl md:text-3xl transition-colors" />
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-black text-white">
                                    {(stats.totalCandidates ?? 0).toLocaleString('vi-VN')}
                                </div>
                                <div className="text-gray-400 text-sm md:text-base font-medium">Ứng viên</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-left group">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 group-hover:bg-[#3AB4E6] flex items-center justify-center transition-all border border-white/10 group-hover:border-[#3AB4E6] shadow-lg">
                                <FaBuilding className="text-[#3AB4E6] group-hover:text-white text-2xl md:text-3xl transition-colors" />
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-black text-white">
                                    {(stats.totalCompanies ?? 0).toLocaleString('vi-VN')}
                                </div>
                                <div className="text-gray-400 text-sm md:text-base font-medium">Công ty</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
             PHẦN BANNER TRỢ LÝ AI (CÁO CÔNG NGHỆ)
            ================================================================= */}
            <section className="py-12 md:py-16 bg-gradient-to-br from-slate-900 via-[#0a192f] to-slate-900 relative overflow-hidden border-y border-[#3AB4E6]/20">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[100%] rounded-full bg-[#3AB4E6]/10 blur-[120px]"></div>
                    <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[80%] rounded-full bg-blue-600/10 blur-[100px]"></div>
                </div>

                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
                    <div className="md:w-1/2 flex justify-center order-2 md:order-1 relative group">
                        {/* Glow effect behind fox */}
                        <div className="absolute inset-0 bg-[#3AB4E6] blur-[60px] opacity-30 rounded-full w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-50 transition-opacity duration-500"></div>

                        {/* Yêu cầu người dùng lưu ảnh với tên tech-fox.png trong thư mục public */}
                        <img
                            src="/tech-fox.png"
                            alt="Cáo Công Nghệ AI"
                            width="320"
                            height="320"
                            loading="lazy"
                            decoding="async"
                            className="relative z-10 w-full max-w-[320px] object-contain drop-shadow-[0_0_25px_rgba(58,180,230,0.4)] animate-[bounce_4s_ease-in-out_infinite] hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <div className="md:w-1/2 text-white order-1 md:order-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-bold mb-6 backdrop-blur-sm">
                            <FaMagic className="animate-pulse" /> Trợ lý AI ITing
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            Khó tìm việc chuẩn gu?<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3AB4E6] to-cyan-300">Đã có Cáo Công Nghệ!</span>
                        </h2>
                        <p className="text-gray-300 mb-8 max-w-lg text-lg leading-relaxed">
                            Cáo Công Nghệ sử dụng AI tiên tiến để đọc hiểu CV của bạn. Không cần điền form dài dòng, chỉ một chạm là ra ngay danh sách việc làm "đo ni đóng giày" cho riêng bạn!
                        </p>
                        <button
                            onClick={handleAiSearch}
                            className="bg-gradient-to-r from-[#3AB4E6] to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(58,180,230,0.4)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1.5 text-lg"
                        >
                            <FaMagic /> Quét CV ngay với Cáo
                        </button>
                    </div>
                </div>
            </section>

            {/* =================================================================
          PHẦN: DÀNH CHO BẠN (RECOMMENDATIONS)
         ================================================================= */}
            <section className="py-16 px-4 bg-[#F8FAFC]">
                <div className="container mx-auto">
                    <div className="flex justify-between items-end mb-6 md:mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <FaMagic />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {currentUser ? "Dành cho bạn" : "Việc làm nổi bật"}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {currentUser
                                        ? "Dựa trên hồ sơ và những gì bạn đã xem"
                                        : "Khám phá các cơ hội việc làm tốt nhất ngay hôm nay"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        {/* Scroll buttons overlay */}
                        <button type="button" aria-label="Cuộn sang trái" onClick={() => recommendationScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-[calc(50%+8px)] -translate-x-2 md:-translate-x-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 flex items-center justify-center hover:bg-[#3AB4E6] hover:text-white transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 border border-gray-200">
                            <FaArrowLeft size={14} aria-hidden="true" />
                        </button>
                        <button type="button" aria-label="Cuộn sang phải" onClick={() => recommendationScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-[calc(50%+8px)] translate-x-2 md:translate-x-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 flex items-center justify-center hover:bg-[#3AB4E6] hover:text-white transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 border border-gray-200">
                            <FaArrowRight size={14} aria-hidden="true" />
                        </button>

                        <div ref={recommendationScrollRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar scroll-smooth px-1">
                            {isRecommending ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-[75vw] sm:w-[40vw] lg:w-[250px] snap-center bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-50 rounded w-1/2 mb-4"></div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-gray-50 rounded w-16"></div>
                                            <div className="h-6 bg-gray-50 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))
                            ) : freshRecommendedJobs.length > 0 ? (
                                freshRecommendedJobs.map((job) => {
                                    const isSaved = savedJobIds.includes(job.id);
                                    return (
                                        <div
                                            key={job.id}
                                            onClick={() => handleJobClick(job)}
                                            onMouseEnter={(e) => handleCardEnter(job, e.currentTarget)}
                                            onMouseLeave={handleCardLeave}
                                            className="flex-shrink-0 w-[75vw] sm:w-[40vw] lg:w-[250px] snap-center group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative cursor-pointer flex flex-col"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <CompanyLogo
                                                    logoUrl={job.companyLogo || job.logo || job.logoUrl}
                                                    companyId={job.companyId}
                                                    companyName={job.companyName}
                                                    className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1"
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
                </div>
            </section>
            <section id="best-jobs-section" className="py-10 px-8 bg-white">
                <div className="container mx-auto px-4">

                    {/* 1. HEADER: Loại bỏ nút đen, dùng nút viền mảnh tinh tế */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-left">
                        <div className="w-full md:w-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Việc Làm Mới Nhất</h2>
                            <p className="text-gray-500 text-sm">Các cơ hội việc làm vừa được cập nhật gần đây</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/jobs" className="text-gray-500 font-medium hover:text-[#3AB4E6] transition-colors text-sm flex items-center gap-1">
                                Xem tất cả <FaArrowRight size={10} />
                            </Link>
                        </div>
                    </div>

                    {/* 2. FILTER BAR: Toggle giữa Địa điểm và Ngành nghề */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">

                        {/* Nút Lọc: Tabs chuyển đổi */}
                        <div className="flex items-center gap-1 p-1 rounded-full border border-gray-200 bg-white shadow-sm shrink-0">
                            <FaFilter className="text-[#3AB4E6] ml-3 mr-1" />
                            <span className="text-gray-500 text-sm mr-1">Lọc theo:</span>
                            <button
                                onClick={() => setFilterMode('location')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterMode === 'location'
                                    ? 'bg-[#3AB4E6] text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <FaMapMarkerAlt className="inline mr-1" size={10} />Địa điểm
                            </button>
                            <button
                                onClick={() => setFilterMode('category')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterMode === 'category'
                                    ? 'bg-[#3AB4E6] text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <FaBriefcase className="inline mr-1" size={10} />Ngành nghề
                            </button>
                        </div>

                        {/* Danh sách cuộn ngang */}
                        <div className="flex-1 w-full flex items-center gap-2 overflow-hidden">
                            {/* Nút scroll trái */}
                            <button
                                onClick={() => {
                                    const ref = filterMode === 'location' ? provinceScrollRef : categoryScrollRef;
                                    ref.current?.scrollBy({ left: -300, behavior: 'smooth' });
                                }}
                                className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 text-gray-400 items-center justify-center hover:bg-gray-200 hover:text-gray-600 shrink-0 transition-colors"
                            >
                                <FaArrowLeft size={10} />
                            </button>

                            {/* Danh sách Địa điểm */}
                            {filterMode === 'location' && (
                                <div ref={provinceScrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-1 py-1 scroll-smooth flex-1">
                                    {provinces.map((province) => {
                                        const shortName = (province.name || '')
                                            .replace(/^Tỉnh\s+/i, '')
                                            .replace(/^Thành phố\s+/i, '');
                                        return (
                                            <button
                                                key={province.code}
                                                onClick={() => {
                                                    const isDeselecting = selectedLocationFilter === province.name;
                                                    const newFilterDisplay = isDeselecting ? '' : province.name;
                                                    const newLocationForApi = isDeselecting ? '' : shortName;
                                                    setSelectedLocationFilter(newFilterDisplay);
                                                    setSearchForm((prev) => ({ ...prev, location: newLocationForApi, page: 0 }));
                                                    setCurrentPage(1);

                                                    const params = {
                                                        ...searchForm,
                                                        location: newLocationForApi || undefined,
                                                        page: 0,
                                                        minSalary: searchForm.minSalary || undefined,
                                                        maxSalary: searchForm.maxSalary || undefined,
                                                        companyId: searchForm.companyId || undefined,
                                                        keyword: searchForm.keyword || undefined,
                                                        jobType: searchForm.jobType || undefined,
                                                        experienceLevel: searchForm.experienceLevel || undefined,
                                                        techRequired: searchForm.skills || undefined,
                                                    };

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
                                        );
                                    })}
                                </div>
                            )}

                            {/* Danh sách Ngành nghề */}
                            {filterMode === 'category' && (
                                <div ref={categoryScrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-1 py-1 scroll-smooth flex-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                const isDeselecting = selectedCategoryFilter === cat.id;
                                                const newCatId = isDeselecting ? '' : cat.id;
                                                const newKeyword = isDeselecting ? '' : cat.name;
                                                setSelectedCategoryFilter(newCatId);
                                                setCurrentPage(1);

                                                const params = {
                                                    ...searchForm,
                                                    keyword: newKeyword || searchForm.keyword || undefined,
                                                    location: searchForm.location || undefined,
                                                    page: 0,
                                                    minSalary: searchForm.minSalary || undefined,
                                                    maxSalary: searchForm.maxSalary || undefined,
                                                    companyId: searchForm.companyId || undefined,
                                                    jobType: searchForm.jobType || undefined,
                                                    experienceLevel: searchForm.experienceLevel || undefined,
                                                    techRequired: searchForm.skills || undefined,
                                                };

                                                dispatch(fetchJobsRequest(params));
                                            }}
                                            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2
                                                ${selectedCategoryFilter === cat.id
                                                    ? 'bg-[#3AB4E6] border-[#3AB4E6] text-white shadow-md shadow-blue-200'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-sm">{cat.icon}</span>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Nút scroll phải */}
                            <button
                                onClick={() => {
                                    const ref = filterMode === 'location' ? provinceScrollRef : categoryScrollRef;
                                    ref.current?.scrollBy({ left: 300, behavior: 'smooth' });
                                }}
                                className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 text-gray-400 items-center justify-center hover:bg-gray-200 hover:text-gray-600 shrink-0 transition-colors"
                            >
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
                        <button type="button" aria-label="Đóng gợi ý" className="text-gray-400 hover:text-gray-600 px-2">✕</button>
                    </div>

                    {/* 4. JOB LIST: Thêm hiệu ứng hover xịn & bo góc mềm */}
                    <div className="space-y-5 mb-12 min-h-[800px] relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex justify-center pt-20 rounded-2xl">
                                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-xl border border-blue-100 text-[#3AB4E6] font-bold h-fit">
                                    <div className="w-5 h-5 border-2 border-[#3AB4E6] border-t-transparent rounded-full animate-spin"></div>
                                    Đang tải dữ liệu...
                                </div>
                            </div>
                        )}
                        {(jobs ?? []).length === 0 && !isLoading ? (
                            <div className="text-center py-20 text-gray-500">Không tìm thấy công việc nào.</div>
                        ) : (jobs ?? []).map((job) => {
                            const isSaved = savedJobIds.includes(job.id);
                            const isHovered = hoveredJob?.id === job.id;
                            return (
                                <div
                                    key={job.id}
                                    onClick={() => handleJobClick(job)}
                                    onMouseEnter={(e) => handleCardEnter(job, e.currentTarget)}
                                    onMouseLeave={handleCardLeave}
                                    className={`group relative border rounded-2xl p-4 md:p-6 transition-all duration-300 bg-white overflow-hidden cursor-pointer ${isHovered
                                        ? 'border-[#3AB4E6] shadow-lg ring-2 ring-[#3AB4E6]/20'
                                        : 'border-gray-100 hover:shadow-xl hover:shadow-blue-500/5'
                                        }`}>

                                    {/* Hiệu ứng: Thanh màu xanh trượt ra khi hover */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3AB4E6] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                        {/* Logo */}
                                        <div className="shrink-0">
                                            <CompanyLogo
                                                logoUrl={job.companyLogo || job.logo || job.logoUrl}
                                                companyId={job.companyId}
                                                companyName={job.companyName}
                                                className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100"
                                            />
                                        </div>

                                        {/* Nội dung */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-[#3AB4E6] transition-colors cursor-pointer truncate md:whitespace-normal">
                                                        {job.title || job.position}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-1 truncate">{job.companyName}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleToggleSave(e, job.id)}
                                                    className={`w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-[#3AB4E6] text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-[#3AB4E6] hover:text-white'}`}>
                                                    {isSaved ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
                                                </button>
                                            </div>

                                            {/* Tags styled đẹp hơn */}
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3 text-[10px] md:text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1 md:gap-1.5 bg-gray-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-100">
                                                    <FaBriefcase className="text-blue-400" /> {jobTypeLabel(job.jobType) || "Toàn thời gian"}
                                                </span>
                                                <span className="flex items-center gap-1 md:gap-1.5 bg-gray-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-100">
                                                    <FaClock className="text-sky-400" /> {formatSalary(job.minSalary, job.maxSalary)}
                                                </span>
                                                {/* Tech Stack */}
                                                {job.skills && (
                                                    <span className="flex items-center gap-1 md:gap-1.5 bg-green-50 text-green-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-green-100 font-bold truncate max-w-[150px] md:max-w-[200px]">
                                                        {Array.isArray(job.skills) ? job.skills.join(', ') : job.skills}
                                                    </span>
                                                )}

                                                <span className="flex items-center gap-1 md:gap-1.5 bg-gray-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-100">
                                                    <FaMapMarkerAlt className="text-red-400" /> {job.location || "Việt Nam"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nút hành động */}
                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 mt-4 md:mt-0 min-w-0 md:min-w-[100px] border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                                                {timeAgo(job.createdAt)}
                                            </span>
                                            {/* Nút Chi Tiết style mới */}
                                            <button className="w-auto md:w-full bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-300">
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

            {/* =================================================================
              PHẦN: BÁO CÁO THỊ TRƯỜNG VIỆC LÀM (MARKET DASHBOARD)
            ================================================================= */}
            <section className="py-0 bg-[#0a192f] overflow-hidden relative border-y border-[#3AB4E6]/20">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(58,180,230,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(58,180,230,0.15) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                </div>

                <div className="relative z-10 container mx-auto px-4 md:px-6 py-10">
                    {/* HEADER ROW */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                Thị trường việc làm hôm nay{' '}
                                <span className="text-[#3AB4E6]">
                                    {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                            </h2>
                            <p className="text-blue-400/70 text-sm mt-1">Cập nhật theo thời gian thực từ hệ thống ITing</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-blue-400/60 text-xs border border-blue-800 rounded-full px-3 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Trực tiếp
                        </div>
                    </div>

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                        {/* LEFT COL — Mascot + recent jobs */}
                        <div className="lg:col-span-1 flex flex-col gap-5">
                            {/* Fox mascot card */}
                            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#112240] to-[#0a192f] border border-blue-800/60 flex items-end justify-center pt-4 h-52">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#3AB4E6]/10 to-transparent"></div>
                                <img
                                    src="/tech-fox-dashboard.png"
                                    alt="Cáo Công Nghệ ITing"
                                    width="200"
                                    height="200"
                                    loading="lazy"
                                    decoding="async"
                                    className="relative z-10 h-44 object-contain drop-shadow-[0_0_20px_rgba(58,180,230,0.5)]"
                                />
                            </div>

                            {/* Recent jobs list */}
                            <div className="rounded-2xl bg-[#112240]/80 border border-blue-800/60 p-4 flex-1">
                                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">Việc làm mới nhất</p>
                                <div className="space-y-3">
                                    {(jobs ?? []).slice(0, 3).map((job) => (
                                        <div
                                            key={job.id}
                                            onClick={() => handleJobClick(job)}
                                            onMouseEnter={(e) => handleCardEnter(job, e.currentTarget)}
                                            onMouseLeave={handleCardLeave}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <CompanyLogo
                                                logoUrl={job.companyLogo || job.logo}
                                                companyId={job.companyId}
                                                companyName={job.companyName}
                                                className="w-9 h-9 rounded-lg object-contain bg-white/10 p-1 flex-shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white text-xs font-semibold group-hover:text-[#3AB4E6] transition-colors truncate">
                                                    {job.title || job.position}
                                                </p>
                                                <p className="text-blue-300/70 text-[10px] truncate">{job.companyName}</p>
                                                <p className="text-blue-400/50 text-[10px]">{job.location || 'Việt Nam'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(jobs ?? []).length === 0 && (
                                        <p className="text-blue-500/50 text-xs text-center py-4">Đang tải dữ liệu...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL — Stats + Charts */}
                        <div className="lg:col-span-3 flex flex-col gap-5">

                            {/* STATS ROW */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Việc làm mới 24h gần nhất', value: (stats.newJobs24h ?? 0).toLocaleString('vi-VN'), accent: true },
                                    { label: 'Việc làm đang tuyển', value: (stats.totalJobs ?? 0).toLocaleString('vi-VN'), accent: false },
                                    { label: 'Công ty đang tuyển', value: (stats.totalCompanies ?? 0).toLocaleString('vi-VN'), accent: false },
                                ].map((s, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-2xl p-4 md:p-5 border ${s.accent
                                            ? 'bg-gradient-to-br from-[#3AB4E6]/20 to-blue-800/10 border-[#3AB4E6]/40'
                                            : 'bg-[#112240]/80 border-blue-800/60'
                                            } ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}
                                    >
                                        <div className={`text-3xl md:text-4xl font-black mb-1 ${s.accent ? 'text-[#3AB4E6]' : 'text-white'}`}>
                                            {s.value}
                                        </div>
                                        <p className="text-blue-400/70 text-xs">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CHARTS ROW */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">

                                {/* Line Chart — Job Growth */}
                                <div className="rounded-2xl bg-[#112240]/80 border border-blue-800/60 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaArrowRight className="text-[#3AB4E6] text-sm" />
                                        <span className="text-white text-sm font-bold">Tăng trưởng cơ hội việc làm</span>
                                    </div>
                                    {/* SVG Sparkline */}
                                    <div className="relative h-32">
                                        <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3AB4E6" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#3AB4E6" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            {/* Grid lines */}
                                            {[20, 40, 60, 80].map(y => (
                                                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(58,180,230,0.1)" strokeWidth="1" />
                                            ))}
                                            {/* Area fill */}
                                            <path d="M0,70 C30,65 50,55 80,50 C110,45 130,60 160,55 C190,50 210,35 240,30 C265,26 280,35 300,28 L300,100 L0,100 Z"
                                                fill="url(#lineGrad)" />
                                            {/* Line */}
                                            <path d="M0,70 C30,65 50,55 80,50 C110,45 130,60 160,55 C190,50 210,35 240,30 C265,26 280,35 300,28"
                                                fill="none" stroke="#3AB4E6" strokeWidth="2.5" strokeLinecap="round" />
                                            {/* Data points */}
                                            {[[0, 70], [80, 50], [160, 55], [240, 30], [300, 28]].map(([x, y], i) => (
                                                <circle key={i} cx={x} cy={y} r="3.5" fill="#3AB4E6" stroke="#0a192f" strokeWidth="2" />
                                            ))}
                                        </svg>
                                        {/* X axis labels */}
                                        <div className="flex justify-between mt-1">
                                            {['02/04', '09/04', '16/04', '23/04', '30/04', new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })].map((d, i) => (
                                                <span key={i} className="text-[9px] text-blue-500/50">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart — Industry Demand */}
                                <div className="rounded-2xl bg-[#112240]/80 border border-blue-800/60 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaDatabase className="text-[#3AB4E6] text-sm" />
                                            <span className="text-white text-sm font-bold">Nhu cầu tuyển dụng theo</span>
                                        </div>
                                        <span className="text-xs text-blue-400 border border-blue-700 rounded px-2 py-0.5">Ngành nghề</span>
                                    </div>
                                    {/* Horizontal bars */}
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Phát triển phần mềm', pct: 90, color: '#3AB4E6' },
                                            { label: 'Phân tích dữ liệu', pct: 72, color: '#60A5FA' },
                                            { label: 'Thiết kế UI/UX', pct: 58, color: '#FBBF24' },
                                            { label: 'DevOps / Cloud', pct: 49, color: '#34D399' },
                                            { label: 'An ninh mạng', pct: 38, color: '#A78BFA' },
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[10px] text-blue-300/70">{item.label}</span>
                                                    <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.pct}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-blue-950/80 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${item.pct}%`, backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}80` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Legend */}
                                    <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-blue-800/40">
                                        {['#3AB4E6', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA'].map((c, i) => (
                                            <span key={i} className="flex items-center gap-1 text-[9px] text-blue-400/60">
                                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c }}></span>
                                                {['Phần mềm', 'Dữ liệu', 'UI/UX', 'DevOps', 'Bảo mật'][i]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PHẦN 2: JOB CATEGORIES */}

            <section className="py-10 px-8 bg-[#F0F5FA]">
                <div className="container mx-auto px-4 relative">
                    <div className="flex justify-between items-end mb-8 md:mb-12">
                        <div className="text-left">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Tìm việc theo lĩnh vực</h2>
                            <p className="text-gray-500 text-sm mt-1">Khám phá các cơ hội nghề nghiệp trong lĩnh vực công nghệ – từ phát triển phần mềm, AI, đến an ninh mạng.</p>
                        </div>
                    </div>

                    <div className="relative group">
                        {/* Scroll buttons overlay */}
                        <button type="button" aria-label="Cuộn sang trái" onClick={() => featuredCategoryScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-[calc(50%+8px)] -translate-x-2 md:-translate-x-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 flex items-center justify-center hover:bg-[#3AB4E6] hover:text-white transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 border border-gray-200">
                            <FaArrowLeft size={14} aria-hidden="true" />
                        </button>
                        <button type="button" aria-label="Cuộn sang phải" onClick={() => featuredCategoryScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-[calc(50%+8px)] translate-x-2 md:translate-x-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 flex items-center justify-center hover:bg-[#3AB4E6] hover:text-white transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 border border-gray-200">
                            <FaArrowRight size={14} aria-hidden="true" />
                        </button>

                        <div ref={featuredCategoryScrollRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar scroll-smooth px-1">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(cat.name)}`)}
                                    className="flex-shrink-0 w-[42vw] sm:w-[30vw] md:w-[220px] snap-center bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col items-center text-center border border-transparent hover:border-blue-200"
                                >
                                    <div className="w-16 h-16 mb-4 text-[#3AB4E6] text-4xl group-hover:scale-110 transition-transform flex items-center justify-center">
                                        {cat.icon}
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800 group-hover:text-[#3AB4E6] transition-colors">{cat.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* PHẦN 4: BLOGS */}
            <section className="py-10 px-8 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bài viết và blog</h2>
                            <p className="text-gray-500 text-sm">Cập nhật tin tức mới nhất về công nghệ và thị trường tuyển dụng</p>
                        </div>
                        {/* FIX: Thay BsArrowRight bằng FaArrowRight */}
                        <Link to="/blogs" className="text-[#3AB4E6] font-medium hover:underline flex items-center gap-1">
                            View all <FaArrowRight />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="group cursor-pointer" onClick={() => navigate(`/blog/${blog.slug}`)}>
                                <div className="overflow-hidden rounded-xl mb-4 relative">
                                    <img src={blog.thumbnailUrl || `https://ui-avatars.com/api/?name=${blog.category || 'Blog'}&background=3AB4E6&color=fff&size=600`} alt={blog.title} className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    <span className="absolute top-4 left-4 bg-[#3AB4E6] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        {blog.category || 'Tin tức'}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-xs mb-2">{timeAgo(blog.createdAt)}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#3AB4E6] transition-colors leading-snug line-clamp-2 min-h-[3.5rem]">
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

            {/* AI CV Modal */}
            {isAiModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsAiModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#3AB4E6] p-4 md:p-6 text-white relative shrink-0">
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors p-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 pr-6">
                                <FaMagic className="text-yellow-300 shrink-0" /> Tìm việc bằng AI
                            </h3>
                            <p className="text-blue-50/80 mt-1 text-sm">Dán nội dung CV của bạn vào đây, AI sẽ tự động phân tích và tìm kiếm công việc phù hợp nhất.</p>
                        </div>

                        <div className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            {/* Tab switcher: paste text vs upload file */}
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setAiMode('text')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${aiMode === 'text'
                                        ? 'bg-white text-[#3AB4E6] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaKeyboard size={14} /> Dán nội dung CV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAiMode('file')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${aiMode === 'file'
                                        ? 'bg-white text-[#3AB4E6] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaCloudUploadAlt size={14} /> Tải lên file CV
                                </button>
                            </div>

                            {aiMode === 'text' ? (
                                <div className="relative">
                                    <textarea
                                        value={cvText}
                                        onChange={(e) => setCvText(e.target.value)}
                                        placeholder="Ví dụ: Tôi là lập trình viên Java có 3 năm kinh nghiệm, thành thạo Spring Boot, React và AWS..."
                                        className="w-full h-64 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#3AB4E6] focus:ring-0 outline-none transition-all resize-none text-gray-700 placeholder-gray-400"
                                    />
                                    <div className="absolute bottom-3 right-3 text-gray-400 text-xs font-medium">
                                        {cvText.length} ký tự
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 min-h-64 flex flex-col items-center justify-center">
                                    {!cvFile ? (
                                        <>
                                            <FaCloudUploadAlt size={48} className="text-gray-300 mb-3" />
                                            <p className="text-sm font-bold text-gray-700 mb-1">Chọn file CV để AI phân tích</p>
                                            <p className="text-xs text-gray-400 mb-4">PDF hoặc ảnh, tối đa 5MB</p>
                                            <label className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors">
                                                Chọn file
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleAiFileChange}
                                                />
                                            </label>
                                        </>
                                    ) : (
                                        <div className="w-full flex items-center justify-between bg-white p-4 rounded-lg border-2 border-[#3AB4E6]">
                                            <div className="flex items-center gap-3 truncate">
                                                <FaFilePdf size={28} className="text-red-500 shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{cvFile.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCvFile(null)}
                                                className="text-gray-400 hover:text-red-500 px-2"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsAiModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleConfirmAiSearch}
                                    disabled={isAnalyzing}
                                    className="flex-[2] px-6 py-3.5 bg-[#3AB4E6] hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang phân tích...
                                        </>
                                    ) : (
                                        <>
                                            <FaSearch size={16} /> Phân tích & Tìm kiếm
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        className="hidden lg:block fixed z-50 pointer-events-auto"
                        style={{ top, left, width: PANE_W }}
                        onMouseEnter={handlePaneEnter}
                        onMouseLeave={handleCardLeave}
                    >
                        <JobPreviewPane job={hoveredJob} />
                    </div>
                );
            })()}
        </div>
    );
};

export default HomePage;
