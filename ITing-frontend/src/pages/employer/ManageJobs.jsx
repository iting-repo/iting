import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaUserFriends, FaEye, FaBan, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

const ManageJobs = () => {
    const navigate = useNavigate();
    // 1. MOCK DATA (Giả lập 12 công việc để test phân trang)
    const initialJobs = [
        { id: 1, title: 'UI/UX Designer', type: 'Full Time', deadline: '27 days remaining', status: 'Active', apps: 798 },
        { id: 2, title: 'Senior UX Designer', type: 'Internship', deadline: '8 days remaining', status: 'Active', apps: 185 },
        { id: 3, title: 'Junior Graphic Designer', type: 'Full Time', deadline: '24 days remaining', status: 'Active', apps: 583 },
        { id: 4, title: 'Front End Developer', type: 'Full Time', deadline: 'Dec 7, 2019', status: 'Expired', apps: 740 },
        { id: 5, title: 'Technical Support Specialist', type: 'Part Time', deadline: '4 days remaining', status: 'Active', apps: 556 },
        { id: 6, title: 'Interaction Designer', type: 'Contract', deadline: 'Feb 2, 2024', status: 'Expired', apps: 426 },
        { id: 7, title: 'Software Engineer', type: 'Temporary', deadline: '9 days remaining', status: 'Active', apps: 922 },
        { id: 8, title: 'Product Designer', type: 'Full Time', deadline: '7 days remaining', status: 'Active', apps: 994 },
        { id: 9, title: 'Project Manager', type: 'Full Time', deadline: 'Dec 4, 2024', status: 'Expired', apps: 196 },
        { id: 10, title: 'Marketing Manager', type: 'Full Time', deadline: '4 days remaining', status: 'Active', apps: 492 },
        { id: 11, title: 'React Native Dev', type: 'Full Time', deadline: '10 days remaining', status: 'Active', apps: 120 },
        { id: 12, title: 'NodeJS Backend', type: 'Part Time', deadline: 'Expired', status: 'Expired', apps: 50 },
    ];

    // 2. STATE QUẢN LÝ
    const [jobs, setJobs] = useState(initialJobs);
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Active', 'Expired'
    const [currentPage, setCurrentPage] = useState(1);
    const [activeMenu, setActiveMenu] = useState(null); // Menu hành động đang mở

    const itemsPerPage = 5; // Yêu cầu: 5 tin/trang

    // 3. LOGIC LỌC (FILTER)
    const filteredJobs = jobs.filter(job => {
        if (filterStatus === 'All') return true;
        return job.status === filterStatus;
    });

    // 4. LOGIC PHÂN TRANG (PAGINATION)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

    // Reset trang về 1 khi đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    // Toggle Kebab Menu
    const toggleMenu = (id) => {
        if (activeMenu === id) setActiveMenu(null);
        else setActiveMenu(id);
    };

    return (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 min-h-screen">

            {/* --- HEADER: Tiêu đề + Bộ lọc --- */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Tất cả công việc ({filteredJobs.length})</h2>
                    <p className="text-gray-500 text-sm mt-1">Quản lý trạng thái và hồ sơ ứng tuyển</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">Trạng thái:</span>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[#3AB4E6] cursor-pointer text-sm font-medium shadow-sm hover:border-gray-300 transition-colors"
                        >
                            <option value="All">Tất cả</option>
                            <option value="Active">Đang hoạt động</option>
                            <option value="Expired">Đã hết hạn</option>
                        </select>
                        {/* Custom Arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABLE CONTENT --- */}
            <div className="overflow-x-auto rounded-t-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-5">Công việc</th>
                            <th className="p-5">Trạng thái</th>
                            <th className="p-5">Số lượng hồ sơ</th>
                            <th className="p-5 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentJobs.length > 0 ? (
                            currentJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50/60 transition-colors group">

                                    {/* Cột 1: Thông tin */}
                                    <td className="p-5">
                                        <div className="font-bold text-gray-800 text-base mb-1 group-hover:text-[#3AB4E6] transition-colors cursor-pointer">{job.title}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">{job.type}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-400 text-xs">{job.deadline}</span>
                                        </div>
                                    </td>

                                    {/* Cột 2: Status */}
                                    <td className="p-5">
                                        {job.status === 'Active' ? (
                                            <span className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                <FaCheckCircle /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-red-500 font-medium text-sm">
                                                <FaTimesCircle /> Expired
                                            </span>
                                        )}
                                    </td>

                                    {/* Cột 3: Applications */}
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaUserFriends className="text-gray-400" />
                                            <span className="font-semibold">{job.apps} Applications</span>
                                        </div>
                                    </td>

                                    {/* Cột 4: Actions */}
                                    <td className="p-5 text-right relative">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => navigate(`/employer/job/${job.id}/applications`)}
                                                className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm"
                                            >
                                                View Applications ({job.apps})
                                            </button>

                                            {/* Kebab Menu */}
                                            <button
                                                onClick={() => toggleMenu(job.id)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${activeMenu === job.id ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-400'}`}
                                            >
                                                <BsThreeDotsVertical />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenu === job.id && (
                                                <div className="absolute right-10 top-12 w-48 bg-white shadow-xl rounded-lg border border-gray-100 z-20 animate-fade-in-up overflow-hidden">
                                                    {/* NÚT XEM CHI TIẾT / SỬA */}
                                                    <button
                                                        onClick={() => navigate(`/employer/manage-jobs/${job.id}`)}
                                                        className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#3AB4E6] flex items-center gap-2 border-b border-gray-50"
                                                    >
                                                        <FaEye /> Xem / Chỉnh sửa
                                                    </button>

                                                    <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-2">
                                                        <FaBan /> Dừng đăng bài
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    Không tìm thấy công việc nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION (Giống hệt thiết kế) --- */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    {/* Nút Prev */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100'}`}
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    {/* Số trang */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentPage === page
                                ? 'bg-[#1967D2] text-white shadow-md' // Active
                                : 'text-gray-500 hover:bg-gray-50' // Inactive
                                }`}
                        >
                            {page < 10 ? `0${page}` : page}
                        </button>
                    ))}

                    {/* Nút Next */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#3AB4E6] hover:bg-blue-50 bg-white shadow-sm border border-gray-100'}`}
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            )}

            {/* Overlay đóng menu */}
            {activeMenu && (
                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
            )}

        </div>
    );
};

export default ManageJobs;