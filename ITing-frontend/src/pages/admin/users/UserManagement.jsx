import React, { useState } from 'react';
import {
    FaUserFriends, FaBuilding, FaUserTie, FaUserClock,
    FaFilter, FaPlus, FaEdit, FaTrash, FaBan, FaSearch
} from 'react-icons/fa';
import { 
    StatsCard, Pagination, Button, Input, Badge, Card, CardHeader, Table, Td 
} from '../../../components';

const UserManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    
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
            <Card className="!p-0 overflow-hidden border-gray-100">
                {/* --- HEADER CỦA BẢNG --- */}
                <CardHeader
                    className="px-6 pt-6 mb-4"
                    title={<span className="text-gray-800">User Management</span>}
                    icon={<FaUserFriends className="text-[#9D5CE9]" />}
                    action={
                        <>
                            <div className="relative hidden md:block w-48">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <Input placeholder="Search user..." className="pl-8" />
                            </div>
                            <Button variant="outline" className="flex items-center gap-2">
                                <FaFilter size={12} /> Filter
                            </Button>
                            <Button className="flex items-center gap-2 bg-[#5D5FEF] hover:bg-[#4a4cdb]">
                                <FaPlus size={12} /> Add User
                            </Button>
                        </>
                    }
                />

                {/* --- TABLE CONTENT --- */}
                <Table
                    headers={[
                        { label: "ID", className: "text-center w-16" },
                        { label: "Name" },
                        { label: "Type" },
                        { label: "Email" },
                        { label: "Status" },
                        { label: "Actions", className: "text-right" }
                    ]}
                >
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">

                                    {/* ID */}
                                    <Td className="font-medium text-gray-400 text-center">{user.id}</Td>

                                    {/* NAME & AVATAR */}
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                                            <span className="font-bold text-gray-700">{user.name}</span>
                                        </div>
                                    </Td>

                                    {/* TYPE (ROLE) */}
                                    <Td>
                                        <Badge variant={user.role === 'COMPANY' ? 'purple' : 'info'}>
                                            {user.role}
                                        </Badge>
                                    </Td>

                                    {/* EMAIL */}
                                    <Td className="text-gray-500">{user.email}</Td>

                                    {/* STATUS */}
                                    <Td>
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
                                    </Td>

                                    {/* ACTIONS */}
                                    <Td className="text-right">
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
                                    </Td>
                                </tr>
                            ))}
                </Table>

                {/* --- PAGINATION (Footer) --- */}
                <Pagination 
                    totalItems={12458} 
                    itemsPerPage={5} 
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

        </div>
    );
};

export default UserManagement;