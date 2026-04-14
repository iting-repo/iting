import React, { useState } from 'react';
import { BsBriefcase, BsCardChecklist, BsThreeDotsVertical, BsEye, BsXCircle } from 'react-icons/bs';
import { FaUserFriends } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { useNavigate, Link } from 'react-router-dom';
import { buildEmployerJobApplicationsPath } from '../../utils/jobUrl';

const EmployerDashboard = () => {
    const { t } = useTranslation(); // 2. Khởi tạo hàm t
    const navigate = useNavigate();

    const stats = { postedJobs: 10, totalApplications: 100 };
    const companyName = "(Tên công ty)"; // Sau này lấy từ API hoặc Store

    const recentJobs = [
        { id: 1, title: 'UI/UX Designer', type: 'FULL_TIME', daysLeft: 5, status: 'active', applicants: 798 },
        { id: 2, title: 'Senior UX Designer', type: 'INTERN', daysLeft: 8, status: 'active', applicants: 185 },
        { id: 3, title: 'Technical Support Specialist', type: 'PART_TIME', daysLeft: 4, status: 'active', applicants: 556 },
        { id: 4, title: 'Junior Graphic Designer', type: 'FULL_TIME', daysLeft: 3, status: 'active', applicants: 583 },
        { id: 5, title: 'Front End Developer', type: 'FULL_TIME', deadline: '30/10/2025', status: 'expired', applicants: 740 },
    ];

    const [activeMenu, setActiveMenu] = useState(null);

    const toggleMenu = (id) => {
        if (activeMenu === id) setActiveMenu(null);
        else setActiveMenu(id);
    };

    return (
        <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 min-h-screen">

            {/* Header & Stats */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {t('employer_dashboard.welcome', { name: companyName })}
                </h1>
                <p className="text-gray-500 mb-8">
                    {t('employer_dashboard.description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#EAF6FF] p-6 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.postedJobs}</div>
                            <div className="text-gray-600 font-medium">{t('employer_dashboard.stats.posted_jobs')}</div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#3AB4E6] shadow-sm">
                            <BsBriefcase size={24} />
                        </div>
                    </div>

                    <div className="bg-[#FFF6E5] p-6 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalApplications}</div>
                            <div className="text-gray-600 font-medium">{t('employer_dashboard.stats.total_applications')}</div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-orange-400 shadow-sm">
                            <BsCardChecklist size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Jobs Table */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">{t('employer_dashboard.recent_jobs')}</h2>
                    <Link to="/employer/manage-jobs" className="text-[#3AB4E6] text-sm font-medium hover:underline flex items-center gap-1">
                        {t('employer_dashboard.view_all')} &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">{t('employer_dashboard.table.job')}</th>
                                <th className="p-4">{t('employer_dashboard.table.status')}</th>
                                <th className="p-4">{t('employer_dashboard.table.applicants_count')}</th>
                                <th className="p-4 text-right">{t('employer_dashboard.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div
                                            onClick={() => navigate(`/employer/manage-jobs/${job.id}`)}
                                            className="font-bold text-gray-800 text-base mb-1 cursor-pointer hover:text-[#3AB4E6] transition-colors"
                                        >
                                            {job.title}
                                        </div>
                                        <div className="text-sm text-gray-500 flex gap-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                {t(`manage_jobs.job_types.${job.type}`, { defaultValue: job.type })}
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-400 text-xs mt-0.5">
                                                {job.status === 'active'
                                                    ? t('employer_dashboard.table.days_left', { count: job.daysLeft })
                                                    : job.deadline}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        {job.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                                {t('employer_dashboard.table.active')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                                                <BsXCircle /> {t('employer_dashboard.table.expired')}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaUserFriends className="text-gray-400" />
                                            <span className="font-semibold">{job.applicants}</span>
                                        </div>
                                    </td>

                                    <td className="p-4 text-right relative">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => navigate(buildEmployerJobApplicationsPath(job))}
                                                className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm"
                                            >
                                                {t('employer_dashboard.table.view_applications')}
                                            </button>

                                            <button
                                                onClick={() => toggleMenu(job.id)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${activeMenu === job.id ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-400'}`}
                                            >
                                                <BsThreeDotsVertical />
                                            </button>

                                            {activeMenu === job.id && (
                                                <div className="absolute right-8 top-12 w-48 bg-white shadow-xl rounded-lg border border-gray-100 z-10 animate-fade-in-up overflow-hidden">
                                                    <button
                                                        onClick={() => navigate(`/employer/manage-jobs/${job.id}`)}
                                                        className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-2 border-b border-gray-50"
                                                    >
                                                        <BsEye /> {t('employer_dashboard.table.view_detail')}
                                                    </button>

                                                    <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-2">
                                                        <BsXCircle /> {t('employer_dashboard.table.mark_expired')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {activeMenu && (
                <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)}></div>
            )}
        </div>
    );
};

export default EmployerDashboard;
