import React, { useState } from 'react';
import {
    FaUserFriends, FaBuilding, FaUserTie, FaUserClock,
    FaFilter, FaPlus, FaEdit, FaTrash, FaBan, FaSearch
} from 'react-icons/fa';
import StatsCard from '../components/StatsCard';

const UserManagement = () => {
    // 1. MOCK DATA (Giả lập dữ liệu từ API)
    // Trong thực tế, bạn sẽ gọi API ở đây
    const [users, setUsers] = useState([
        {
            id: "#001",
            name: "John Doe",
            avatar: "https://i.pravatar.cc/150?img=11",
            email: "john@example.com",
            role: "CANDIDATE",
            status: "Active",
        },
        {
            id: "#002",
            name: "Tech Solutions Inc.",
            avatar: "https://i.pravatar.cc/150?img=15", // Hoặc logo công ty
            email: "hr@techcorp.com",
            role: "COMPANY",
            status: "Active",
        },
        {
            id: "#003",
            name: "Mike Johnson",
            avatar: "https://i.pravatar.cc/150?img=3",
            email: "mike.j@email.com",
            role: "CANDIDATE",
            status: "Inactive",
        },
        {
            id: "#004",
            name: "Sarah Williams",
            avatar: "https://i.pravatar.cc/150?img=5",
            email: "sarah.w@techcorp.com",
            role: "COMPANY",
            status: "Banned",
        },
        {
            id: "#005",
            name: "David Brown",
            avatar: "https://i.pravatar.cc/150?img=8",
            email: "david.b@email.com",
            role: "CANDIDATE",
            status: "Active",
        },
    ]);

    // Hàm xử lý giả lập (Log ra console)
    const handleEdit = (id) => console.log("Edit user:", id);
    const handleBan = (id) => {
        if (window.confirm("Bạn có chắc muốn khóa tài khoản này?")) {
            console.log("Ban user:", id);
            // Logic cập nhật state users ở đây
        }
    };
    const handleDelete = (id) => {
        if (window.confirm("Xóa tài khoản này khỏi hệ thống?")) {
            setUsers(users.filter(user => user.id !== id));
        }
    };

    return (
        <div className="space-y-8">

            {/* ================= ROW 1: STATS CARDS ================= */}
            {/* Dữ liệu giống trong thiết kế Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value="12,458"
                    icon={<FaUserFriends />}
                    percentage="12.5"
                    isIncrease={true}
                />
                <StatsCard
                    title="Employers"
                    value="3,245"
                    icon={<FaBuilding />}
                    percentage="8.2"
                    isIncrease={true}
                />
                <StatsCard
                    title="Candidates"
                    value="9,213"
                    icon={<FaUserTie />}
                    percentage="15.8"
                    isIncrease={true}
                />
                <StatsCard
                    title="Active Today"
                    value="2,847"
                    icon={<FaUserClock />}
                    percentage="22.9"
                    isIncrease={true}
                />
            </div>

            {/* ================= ROW 2: MAIN CONTENT (TABLE) ================= */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* --- HEADER CỦA BẢNG --- */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUserFriends className="text-[#9D5CE9]" /> User Management
                    </h3>

                    <div className="flex items-center gap-3">
                        {/* Search Box nhỏ */}
                        <div className="relative hidden md:block">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search user..."
                                className="pl-8 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#9D5CE9] outline-none transition-all w-48"
                            />
                        </div>

                        {/* Filter Button */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                            <FaFilter size={12} /> Filter
                        </button>

                        {/* Add User Button */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#5D5FEF] hover:bg-[#4a4cdb] text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            <FaPlus size={12} /> Add User
                        </button>
                    </div>
                </div>

                {/* --- TABLE CONTENT --- */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-16">ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">

                                    {/* ID */}
                                    <td className="p-4 text-sm font-medium text-gray-400 text-center">{user.id}</td>

                                    {/* NAME & AVATAR */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                                            <span className="font-bold text-gray-700">{user.name}</span>
                                        </div>
                                    </td>

                                    {/* TYPE (ROLE) */}
                                    <td className="p-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${user.role === 'COMPANY'
                                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* EMAIL */}
                                    <td className="p-4 text-sm text-gray-500">{user.email}</td>

                                    {/* STATUS */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' :
                                                    user.status === 'Banned' ? 'bg-red-500' : 'bg-gray-400'
                                                }`}></span>
                                            <span className={`text-xs font-bold ${user.status === 'Active' ? 'text-green-600' :
                                                    user.status === 'Banned' ? 'text-red-600' : 'text-gray-500'
                                                }`}>
                                                {user.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEdit(user.id)}
                                                className="w-8 h-8 rounded flex items-center justify-center bg-[#5D5FEF] text-white hover:bg-[#4a4cdb] shadow-sm transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={12} />
                                            </button>

                                            {/* Ban/Lock Button */}
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                className="w-8 h-8 rounded flex items-center justify-center bg-orange-400 text-white hover:bg-orange-500 shadow-sm transition-colors"
                                                title="Ban/Block"
                                            >
                                                <FaBan size={12} />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="w-8 h-8 rounded flex items-center justify-center bg-red-500 text-white hover:bg-red-600 shadow-sm transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION (Footer) --- */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-400">Showing 1-5 of 12,458 users</div>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">Prev</button>
                        <button className="px-3 py-1 text-xs bg-[#9D5CE9] text-white rounded shadow-sm">1</button>
                        <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">2</button>
                        <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">3</button>
                        <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">Next</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserManagement;