import React, { useState, useEffect } from 'react';
import { BsBriefcase, BsCardChecklist, BsThreeDotsVertical, BsEye, BsXCircle } from 'react-icons/bs';
import { FaUserFriends, FaBan } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { buildEmployerJobApplicationsPath } from '../../utils/jobUrl';
import { Breadcrumb } from '../../components/common';
import companyService from '../../services/companyService';
import applicationService from '../../services/applicationService';
import { toast } from 'sonner';

const EmployerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [appStats, setAppStats] = useState({ total: 0 });
    const [recentJobs, setRecentJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Fetch company info, app stats, and recent jobs in parallel
                const [companyRes, statsRes, jobsRes] = await Promise.all([
                    companyService.getMyCompany(),
                    applicationService.getEmployerStats(),
                    companyService.getMyJobs(0, 5) // Get first 5 jobs for "Recent"
                ]);

                console.log("Dashboard Data Loaded:", { companyRes, statsRes, jobsRes });

                if (companyRes) setCompanyInfo(companyRes);
                if (statsRes) setAppStats(statsRes);
                if (jobsRes) {
                    setRecentJobs(jobsRes.content || []);
                    setTotalJobs(jobsRes.totalElements || 0);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error(t('manage_jobs.messages.fetch_error'));
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [t]);

    const toggleMenu = (id) => {
        if (activeMenu === id) setActiveMenu(null);
        else setActiveMenu(id);
    };

    const calculateDaysLeft = (dueDate) => {
        if (!dueDate) return null;
        const today = new Date();
        const expiryDate = new Date(dueDate);
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff > 0 ? daysDiff : 0;
    };

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AB4E6]"></div>
                    <p className="text-gray-400 text-sm animate-pulse">{t('manage_jobs.loading')}</p>
                </div>
            </div>
        );
    }

    const companyName = companyInfo?.name || "(Tên công ty)";

    return (
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-screen">

            <Breadcrumb
              rootLabel="Tổng quan"
              rootLink="/employer/dashboard"
              items={[]}
            />

            {/* Header & Stats */}
            <div className="mb-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                        {t('employer_dashboard.welcome', { name: companyName })}
                    </h1>
                    <p className="text-gray-500 font-medium text-lg lg:max-w-2xl">
                        {t('employer_dashboard.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Posted Jobs Card */}
                    <Link to="/employer/manage-jobs" className="group bg-[#EAF6FF] p-8 rounded-2xl flex items-center justify-between shadow-sm border border-[#D5EFFF] hover:shadow-md hover:border-[#3AB4E6]/30 transition-all">
                        <div>
                            <div className="text-5xl font-black text-gray-900 mb-2">{totalJobs}</div>
                            <div className="text-gray-600 font-bold text-lg">{t('employer_dashboard.stats.posted_jobs')}</div>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#3AB4E6] shadow-sm group-hover:scale-110 transition-transform">
                            <BsBriefcase size={32} />
                        </div>
                    </Link>

                    {/* Total Applications Card */}
                    <Link to="/employer/manage-applications" className="group bg-[#FFF6E5] p-8 rounded-2xl flex items-center justify-between shadow-sm border border-[#FFECD1] hover:shadow-md hover:border-orange-200 transition-all">
                        <div>
                            <div className="text-5xl font-black text-gray-900 mb-2">{appStats.total}</div>
                            <div className="text-gray-600 font-bold text-lg">{t('employer_dashboard.stats.total_applications')}</div>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-400 shadow-sm group-hover:scale-110 transition-transform">
                            <BsCardChecklist size={32} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Jobs Table */}
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t('employer_dashboard.recent_jobs')}</h2>
                    <Link to="/employer/manage-jobs" className="text-[#3AB4E6] text-sm font-bold hover:text-[#2d9dcb] flex items-center gap-1 group">
                        {t('employer_dashboard.view_all')} <span className="text-lg group-hover:translate-x-1 transition-transform ml-1">→</span>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                                <th className="py-5 px-6">{t('employer_dashboard.table.job')}</th>
                                <th className="py-5 px-6">{t('employer_dashboard.table.status')}</th>
                                <th className="py-5 px-6">{t('employer_dashboard.table.applicants_count')}</th>
                                <th className="py-5 px-6 text-right whitespace-nowrap">{t('employer_dashboard.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentJobs.length > 0 ? (
                                recentJobs.map((job) => {
                                    const daysLeft = calculateDaysLeft(job.dueDate);
                                    const isExpiredByDate = job.dueDate && daysLeft === 0;
                                    const isExpiredByStatus = job.status === 'EXPIRED' || job.status === 'expired' || job.status === 'CLOSED' || job.status === 'closed';
                                    const isActive = (job.status === 'ACTIVE' || job.status === 'active') && !isExpiredByDate;
                                    
                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50/40 transition-all group">
                                            <td className="py-6 px-6">
                                                <div
                                                    onClick={() => navigate(`/employer/manage-jobs/${job.id}`)}
                                                    className="font-bold text-gray-900 text-lg mb-1.5 cursor-pointer hover:text-[#3AB4E6] transition-colors line-clamp-1"
                                                >
                                                    {job.title}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                                                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-tighter">
                                                        {t(`manage_jobs.job_types.${job.jobType || job.type}`, { defaultValue: job.jobType || job.type || t('manage_jobs.experience_levels.not_updated') })}
                                                    </span>
                                                    <span className="text-gray-200">|</span>
                                                    <span className="font-medium">
                                                        {isActive && daysLeft !== null
                                                            ? t('employer_dashboard.table.days_left', { count: daysLeft })
                                                            : job.dueDate || t('manage_jobs.deadline.no_limit')}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-6 px-6">
                                                {job.status === 'SUSPENDED' ? (
                                                    <span className="inline-flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full text-xs font-extrabold border border-purple-100/50">
                                                        <FaBan size={12} /> Bị tạm dừng
                                                    </span>
                                                ) : isActive ? (
                                                    <span className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-1.5 rounded-full text-xs font-extrabold border border-green-100/50">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        {t('employer_dashboard.table.active')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-red-500 bg-red-50 px-4 py-1.5 rounded-full text-xs font-extrabold border border-red-100/50">
                                                        <BsXCircle size={14} /> {t('employer_dashboard.table.expired')}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-2.5 text-gray-700">
                                                    <FaUserFriends className="text-gray-300" size={20} />
                                                    <span className="font-black text-xl">{job.applicationCount || 0}</span>
                                                </div>
                                            </td>

                                            <td className="py-6 px-6 text-right relative">
                                                <div className="flex items-center justify-end gap-4">
                                                    <button
                                                        onClick={() => navigate(buildEmployerJobApplicationsPath(job))}
                                                        className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-sm border border-[#D5EFFF] active:scale-95"
                                                    >
                                                        {t('employer_dashboard.table.view_applications')}
                                                    </button>

                                                    <button
                                                        onClick={() => toggleMenu(job.id)}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeMenu === job.id ? 'bg-gray-100 text-[#3AB4E6]' : 'hover:bg-gray-100 text-gray-400 opacity-60 hover:opacity-100'}`}
                                                    >
                                                        <BsThreeDotsVertical size={20} />
                                                    </button>

                                                    {activeMenu === job.id && (
                                                        <div className="absolute right-8 top-14 w-56 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 animate-fade-in-up overflow-hidden py-1">
                                                            <button
                                                                onClick={() => navigate(`/employer/manage-jobs/${job.id}`)}
                                                                className="w-full text-left px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-3 transition-colors"
                                                            >
                                                                <BsEye size={18} /> {t('employer_dashboard.table.view_detail')}
                                                            </button>

                                                            <button className="w-full text-left px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-3 transition-colors">
                                                                <BsXCircle size={18} /> {t('employer_dashboard.table.mark_expired')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                <BsBriefcase size={40} />
                                            </div>
                                            <p className="text-gray-400 font-bold text-lg">{t('manage_jobs.no_data')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click outside to close menu */}
            {activeMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
            )}
        </div>
    );
};

export default EmployerDashboard;
