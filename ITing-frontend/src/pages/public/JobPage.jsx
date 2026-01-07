import React, { useState, useEffect } from 'react';
import JobFilters from '../../components/JobFilters';
import JobCard from '../../components/JobCard';
import JobPromo from '../../components/JobPromo';
import { FaChevronRight } from 'react-icons/fa';
import jobService from '../../services/jobService';

const JobPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await jobService.getLatestJobs(20);
                // API trả về array trực tiếp theo ví dụ
                if (Array.isArray(data)) {
                    setJobs(data);
                } else {
                    console.error("API response format error:", data);
                    setJobs([]);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Helper để tính thời gian đăng (đơn giản hoá)
    const getTimePosted = (dateString) => {
        if (!dateString) return "Mới đăng";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return "Hôm nay";
        if (diffDays < 30) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    // Helper format lương
    const formatSalary = (min, max) => {
        if (!min && !max) return "Thỏa thuận";
        const format = (n) => n ? (n / 1000000) + " triệu" : "";
        if (min && max) return `${format(min)} - ${format(max)}`;
        if (min) return `Từ ${format(min)}`;
        if (max) return `Đến ${format(max)}`;
        return "Thỏa thuận";
    };

    // Mock Data Featured Companies (Giữ nguyên hoặc call API nếu có)
    const featuredCompanies = [
        { name: "Instagram", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg", jobs: 8, desc: "Elit velit mauris aliquam est diam. Leo sagittis consectetur." },
        { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png", jobs: 18, desc: "At pellentesque amet odio cras imperdiet nisl. Ac magna aliquet." },
        { name: "McDonald's", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg", jobs: 12, desc: "Odio aliquet tellus tellus maecenas. Faucibus in viverra venenatis." },
        { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", jobs: 9, desc: "Et odio sem tellus ultrices posuere consequat. Tristique nascetur." }
    ];

    return (
        <div className="bg-[#F5F7FA] min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* LAYOUT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - FILTERS */}
                    <div className="lg:col-span-3">
                        <JobFilters />
                        <JobPromo />
                    </div>

                    {/* RIGHT COLUMN - LISTING */}
                    <div className="lg:col-span-9 space-y-6">

                        {/* Header: Count & Sort */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-100">
                            <span className="text-gray-500 text-sm mb-2 md:mb-0">
                                Hiển thị <span className="font-bold text-gray-800">{jobs.length}</span> kết quả công việc mới nhất
                            </span>
                            <div className="flex items-center gap-2">
                                <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
                                    <option>Tìm kiếm bởi AI</option>
                                    <option>Mới nhất</option>
                                    <option>Lương cao nhất</option>
                                </select>
                            </div>
                        </div>

                        {/* Job List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-10">Đang tải công việc...</div>
                            ) : jobs.length > 0 ? (
                                jobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        job={{
                                            id: job.id,
                                            title: job.position,
                                            company: job.companyName,
                                            logo: job.companyLogo,
                                            category: job.experienceLevel, // Tạm dùng field này
                                            type: job.jobType,
                                            salary: formatSalary(job.minSalary, job.maxSalary),
                                            location: job.location,
                                            timePosted: getTimePosted(job.createdAt)
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500">Không có công việc nào.</div>
                            )}
                        </div>

                        {/* Pagination - Tạm ẩn hoặc giữ UI tĩnh */}
                        {jobs.length > 0 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#00B4D8] text-white font-bold shadow-md">1</button>
                            </div>
                        )}

                        {/* --- FEATURED COMPANIES SECTION --- */}
                        {/* <div className="pt-12">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-gray-800 mb-3">Thương hiệu lớn tiêu biểu</h2>
                                <p className="text-gray-500">Hàng trăm thương hiệu lớn đang tuyển dụng trên ITWork</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredCompanies.map((company, index) => (
                                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800 mb-3">{company.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-3">
                                            {company.desc}
                                        </p>
                                        <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full">
                                            {company.jobs} open jobs
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobPage;