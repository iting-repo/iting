import React, { useState, useEffect } from 'react';
import { BsBriefcase, BsCardChecklist, BsThreeDotsVertical, BsEye, BsXCircle } from 'react-icons/bs';
import { FaUserFriends } from 'react-icons/fa';
// 1. Thêm import useNavigate
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanyRequest } from '../../store/company/companySlice';

const EmployerDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);
    const { companyJobs, totalCompanyJobs, isLoading } = useSelector((state) => state.job);
    const { profile: companyProfile } = useSelector((state) => state.company);

    useEffect(() => {
        if (currentUser?.userId && !companyProfile) {
            dispatch(fetchCompanyRequest(currentUser.userId));
        }
    }, [dispatch, currentUser, companyProfile]);

    // Calculate stats
    const totalApplications = companyJobs.reduce((acc, job) => acc + (job.applicationCount || 0), 0);
    const stats = { postedJobs: totalCompanyJobs, totalApplications };

    // Recent jobs (take first 5)
    const recentJobs = companyJobs.slice(0, 5);

    const [activeMenu, setActiveMenu] = useState(null);

    const toggleMenu = (id) => {
        if (activeMenu === id) setActiveMenu(null);
        else setActiveMenu(id);
    };

    const displayName = companyProfile?.name || currentUser?.companyName || currentUser?.name || "Doanh nghiệp";

    return (
        <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 min-h-screen">

            {/* Header & Stats (Giữ nguyên) */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Xin chào, {displayName}</h1>
                <p className="text-gray-500 mb-8">Dưới đây là thống kê các công việc và số lượng ứng viên đã ứng tuyển</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#EAF6FF] p-6 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.postedJobs}</div>
                            <div className="text-gray-600 font-medium">Công việc đã đăng tải</div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#3AB4E6] shadow-sm">
                            <BsBriefcase size={24} />
                        </div>
                    </div>

                    <div className="bg-[#FFF6E5] p-6 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalApplications}</div>
                            <div className="text-gray-600 font-medium">Ứng viên đã nộp hồ sơ</div>
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
                    <h2 className="text-lg font-bold text-gray-800">Các công việc đã đăng gần đây</h2>
                    {/* 3. Cập nhật link Xem tất cả */}
                    <Link to="/employer/manage-jobs" className="text-[#3AB4E6] text-sm font-medium hover:underline flex items-center gap-1">
                        Xem tất cả &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">Công việc</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4">Số lượng ứng tuyển</th>
                                <th className="p-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentJobs.length > 0 ? (
                                recentJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">

                                        <td className="p-4">
                                            {/* 4. Click vào tiêu đề cũng chuyển sang trang chi tiết */}
                                            <div
                                                onClick={() => navigate(`/employer/manage-jobs/${job.id}`, { state: { job } })}
                                                className="font-bold text-gray-800 text-base mb-1 cursor-pointer hover:text-[#3AB4E6] transition-colors"
                                            >
                                                {job.position || job.title}
                                            </div>
                                            <div className="text-sm text-gray-500 flex gap-2">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{job.jobType}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-400 text-xs mt-0.5">
                                                    {/* Giả sử API trả về dueDate format chuẩn */}
                                                    Due: {job.dueDate}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {job.status === 'ACTIVE' ? (
                                                <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                                                    <BsXCircle /> Expired
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaUserFriends className="text-gray-400" />
                                                <span className="font-semibold">{job.applicationCount || 0}</span>
                                            </div>
                                        </td>

                                        <td className="p-4 text-right relative">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => navigate(`/employer/job/${job.id}/applications`)}
                                                    className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm"
                                                >
                                                    Xem Hồ Sơ
                                                </button>

                                                <button
                                                    onClick={() => toggleMenu(job.id)}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${activeMenu === job.id ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-400'}`}
                                                >
                                                    <BsThreeDotsVertical />
                                                </button>

                                                {/* Dropdown Menu Popup */}
                                                {activeMenu === job.id && (
                                                    <div className="absolute right-8 top-12 w-48 bg-white shadow-xl rounded-lg border border-gray-100 z-10 animate-fade-in-up overflow-hidden">
                                                        {/* 5. Gắn link điều hướng vào nút Xem chi tiết */}
                                                        <button
                                                            onClick={() => navigate(`/employer/manage-jobs/${job.id}`, { state: { job } })}
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-2 border-b border-gray-50"
                                                        >
                                                            <BsEye /> Xem chi tiết
                                                        </button>

                                                        <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-2">
                                                            <BsXCircle /> Đánh dấu hết hạn
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">Chưa có công việc nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Overlay đóng menu */}
            {activeMenu && (
                <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)}></div>
            )}
        </div>
    );
};

export default EmployerDashboard;