import React from 'react';
import { JobFilters, JobCard, JobPromo } from '../../components';
import { FaChevronRight } from 'react-icons/fa';

const JobPage = () => {
    // Mock Data Jobs
    const jobs = [
        {
            id: 1,
            title: "Forward Security Director",
            company: "Bauch, Schuppe and Schulist Co",
            logo: "https://logo.clearbit.com/security.com",
            category: "Hotels & Tourism",
            type: "Full time",
            salary: "$40000-$42000",
            location: "New-York, USA",
            timePosted: "10 min ago"
        },
        {
            id: 2,
            title: "Regional Creative Facilitator",
            company: "Wisozk - Becker Co",
            logo: "https://logo.clearbit.com/creative.com",
            category: "Media",
            type: "Part time",
            salary: "$28000-$32000",
            location: "Los- Angeles, USA",
            timePosted: "12 min ago"
        },
        {
            id: 3,
            title: "Internal Integration Planner",
            company: "Mraz, Quigley and Feest Inc.",
            logo: "https://logo.clearbit.com/integration.com",
            category: "Construction",
            type: "Full time",
            salary: "$48000-$50000",
            location: "Texas, USA",
            timePosted: "15 min ago"
        },
        {
            id: 4,
            title: "District Intranet Director",
            company: "VonRueden - Weber Co",
            logo: "https://logo.clearbit.com/intranet.com",
            category: "Commerce",
            type: "Full time",
            salary: "$42000-$48000",
            location: "Florida, USA",
            timePosted: "24 min ago"
        },
        {
            id: 5,
            title: "Corporate Tactics Facilitator",
            company: "Cormier, Turner and Flatley Inc",
            logo: "https://logo.clearbit.com/tactics.com",
            category: "Commerce",
            type: "Full time",
            salary: "$38000-$40000",
            location: "Boston, USA",
            timePosted: "26 min ago"
        }
    ];

    // Mock Data Featured Companies
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
                                Hiển thị <span className="font-bold text-gray-800">1-6</span> trong tổng số <span className="font-bold text-gray-800">10</span> kết quả
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
                            {jobs.map(job => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#00B4D8] text-white font-bold shadow-md">
                                1
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                2
                            </button>
                            <button className="h-10 px-4 flex items-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                                Tiếp <FaChevronRight size={12} />
                            </button>
                        </div>

                        {/* --- FEATURED COMPANIES SECTION (Như ảnh dưới) --- */}
                        <div className="pt-12">
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
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobPage;