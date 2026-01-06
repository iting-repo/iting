import React, { useState } from 'react';
import {
    FaExclamationTriangle, FaBan, FaCheckCircle, FaClock,
    FaFilter, FaCheck, FaInfoCircle, FaSearch
} from 'react-icons/fa';
import StatsCard from '../components/StatsCard';

const ReportManagement = () => {
    // 1. MOCK DATA (Giả lập dữ liệu báo cáo)
    const [reports, setReports] = useState([
        {
            id: "#R-1234",
            reporter: "System",
            reportedUser: "Alex Brown",
            avatar: "https://i.pravatar.cc/150?img=11",
            type: "Post",
            violation: "Spam posting",
            severity: "High",
            date: "2024-01-15",
            status: "Pending"
        },
        {
            id: "#R-1235",
            reporter: "Jane Doe",
            reportedUser: "Maria Garcia",
            avatar: "https://i.pravatar.cc/150?img=5",
            type: "Job",
            violation: "Fake job postings",
            severity: "Critical",
            date: "2024-01-15",
            status: "Pending"
        },
        {
            id: "#R-1236",
            reporter: "Mike Ross",
            reportedUser: "Tom Wilson",
            avatar: "https://i.pravatar.cc/150?img=3",
            type: "Comment",
            violation: "Inappropriate content",
            severity: "Medium",
            date: "2024-01-14",
            status: "Investigating"
        },
        {
            id: "#R-1237",
            reporter: "System",
            reportedUser: "Lisa Chen",
            avatar: "https://i.pravatar.cc/150?img=9",
            type: "Account",
            violation: "Duplicate accounts",
            severity: "Low",
            date: "2024-01-14",
            status: "Resolved"
        },
    ]);

    // Helper chọn màu cho mức độ nghiêm trọng (Severity)
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Các hàm xử lý hành động (Dummy)
    const handleResolve = (id) => console.log("Resolve report:", id);
    const handleWarn = (id) => console.log("Warn user:", id);
    const handleBlock = (id) => {
        if (window.confirm("Khóa tài khoản này vĩnh viễn?")) {
            console.log("Block user:", id);
        }
    }
    const handleViewDetail = (id) => console.log("View details:", id);

    return (
        <div className="space-y-8">

            {/* ================= ROW 1: STATS CARDS (Màu sắc theo thiết kế) ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pending Reports - Màu Vàng */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Reports</h3>
                            <div className="text-3xl font-bold text-gray-800">47</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-500 flex items-center justify-center text-lg">
                            <FaExclamationTriangle />
                        </div>
                    </div>
                    <div className="text-xs font-bold text-green-500 flex items-center gap-1">
                        +12 today
                    </div>
                </div>

                {/* Blocked Accounts - Màu Đỏ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Blocked Accounts</h3>
                            <div className="text-3xl font-bold text-gray-800">234</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-lg">
                            <FaBan />
                        </div>
                    </div>
                    <div className="text-xs font-bold text-green-500 flex items-center gap-1">
                        -8 this week
                    </div>
                </div>

                {/* Resolved Today - Màu Xanh Lá */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resolved Today</h3>
                            <div className="text-3xl font-bold text-gray-800">89</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-500 flex items-center justify-center text-lg">
                            <FaCheckCircle />
                        </div>
                    </div>
                    <div className="text-xs font-bold text-green-500 flex items-center gap-1">
                        +23%
                    </div>
                </div>

                {/* Avg Response Time - Màu Tím */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#9D5CE9]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Response Time</h3>
                            <div className="text-3xl font-bold text-gray-800">2.4h</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#9D5CE9] flex items-center justify-center text-lg">
                            <FaClock />
                        </div>
                    </div>
                    <div className="text-xs font-bold text-green-500 flex items-center gap-1">
                        Within SLA
                    </div>
                </div>
            </div>

            {/* ================= ROW 2: ACCOUNT MODERATION QUEUE ================= */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* --- HEADER --- */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Account Moderation Queue</h3>
                        <p className="text-xs text-gray-400 mt-1">Review and take action on reported violations.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg transition-colors">
                            <FaFilter size={12} /> Filter by Type
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 text-sm font-bold rounded-lg border border-orange-200">
                            <FaExclamationTriangle size={12} /> High Priority
                        </button>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Violation</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">

                                    <td className="p-4 text-sm font-medium text-gray-500">{report.id}</td>

                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={report.avatar} alt={report.reportedUser} className="w-8 h-8 rounded-full object-cover" />
                                            <span className="font-bold text-gray-700 text-sm">{report.reportedUser}</span>
                                        </div>
                                    </td>

                                    <td className="p-4 text-sm text-gray-600">{report.type}</td>

                                    <td className="p-4 text-sm font-medium text-gray-800">{report.violation}</td>

                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityColor(report.severity)}`}>
                                            {report.severity.toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="p-4 text-sm text-gray-500">{report.date}</td>

                                    {/* ACTIONS BUTTONS */}
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* 1. Resolve (Green) */}
                                            <button
                                                onClick={() => handleResolve(report.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                title="Resolve / Mark Safe"
                                            >
                                                <FaCheck size={12} />
                                            </button>

                                            {/* 2. Warn (Yellow) */}
                                            <button
                                                onClick={() => handleWarn(report.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                                                title="Send Warning"
                                            >
                                                <FaExclamationTriangle size={12} />
                                            </button>

                                            {/* 3. Block (Red) */}
                                            <button
                                                onClick={() => handleBlock(report.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                title="Block Account"
                                            >
                                                <FaBan size={12} />
                                            </button>

                                            {/* 4. Info (Blue) */}
                                            <button
                                                onClick={() => handleViewDetail(report.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                title="View Details"
                                            >
                                                <FaInfoCircle size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-center md:justify-end gap-2">
                    <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">Previous</button>
                    <button className="px-3 py-1 text-xs bg-[#9D5CE9] text-white rounded shadow-sm">1</button>
                    <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">2</button>
                    <button className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-500">Next</button>
                </div>

            </div>
        </div>
    );
};

export default ReportManagement;