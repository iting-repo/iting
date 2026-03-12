import React from 'react';
import { FaUserFriends, FaFileAlt, FaClipboardList, FaHourglassHalf } from 'react-icons/fa';
import { StatsCard } from '../../components';

// 1. IMPORT CHART.JS
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 2. ĐĂNG KÝ CÁC THÀNH PHẦN BIỂU ĐỒ
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

// 3. CẤU HÌNH DỮ LIỆU VÀ GIAO DIỆN BIỂU ĐỒ
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            align: 'end',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 8,
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'white',
            titleColor: '#6B7280',
            bodyColor: '#1F2937',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            usePointStyle: true,
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF' }
        },
        y: {
            grid: { borderDash: [4, 4], color: '#F3F4F6' },
            ticks: { display: false }, // Ẩn số trục Y cho gọn giống design
            border: { display: false } // Ẩn đường kẻ trục Y
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
    elements: {
        line: { tension: 0.4 } // Tạo đường cong mềm mại
    }
};

const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Job Posts',
            data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
            borderColor: '#9D5CE9', // Màu tím chủ đạo
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(157, 92, 233, 0.4)');
                gradient.addColorStop(1, 'rgba(157, 92, 233, 0.0)');
                return gradient;
            },
            fill: true,
            pointBackgroundColor: '#9D5CE9',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#9D5CE9',
        },
        {
            label: 'Users',
            data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
            borderColor: '#34D399', // Màu xanh
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
                gradient.addColorStop(1, 'rgba(52, 211, 153, 0.0)');
                return gradient;
            },
            fill: true,
            pointBackgroundColor: '#34D399',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#34D399',
        },
    ],
};

// 4. DỮ LIỆU BẢNG (Giữ nguyên)
const recentJobs = [
    { id: 1, title: "Software Engineer", company: "Tech Corp", date: "12.09.2025 - 12:53 PM", applications: 423, status: "Active" },
    { id: 2, title: "Data Analyst", company: "Data Inc", date: "11.09.2025 - 09:30 AM", applications: 156, status: "Active" },
    { id: 3, title: "Product Manager", company: "Innovate Ltd", date: "10.09.2025 - 04:15 PM", applications: 89, status: "Pending" },
    { id: 4, title: "UI/UX Designer", company: "Creative Studio", date: "09.09.2025 - 11:20 AM", applications: 230, status: "Closed" },
];

const getStatusColor = (status) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-600';
        case 'Pending': return 'bg-yellow-100 text-yellow-600';
        case 'Closed': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const AdminDashboard = () => {
    return (
        <div className="space-y-8">
            {/* TITLE */}
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            {/* ROW 1: STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Users" value="40,689" icon={<FaUserFriends />} percentage="8.5" isIncrease={true} />
                <StatsCard title="Total Job Posts" value="10,293" icon={<FaFileAlt />} percentage="1.3" isIncrease={true} />
                <StatsCard title="Total Applications" value="89,000" icon={<FaClipboardList />} percentage="4.3" isIncrease={false} />
                <StatsCard title="Pending Applications" value="2,040" icon={<FaHourglassHalf />} percentage="1.8" isIncrease={true} />
            </div>

            {/* ROW 2: JOB ANALYTICS CHART (DÙNG CHART.JS) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#9D5CE9] rounded-full"></span> Job Analytics
                </h3>
                {/* Container cần set chiều cao cố định để ChartJS fill vào */}
                <div className="h-[350px] w-full">
                    <Line options={chartOptions} data={chartData} />
                </div>
            </div>

            {/* ROW 3: TABLE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-400 rounded-full"></span> Recent Activity
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 rounded-tl-lg">Job Title</th>
                                <th className="p-4">Company</th>
                                <th className="p-4">Date - Time</th>
                                <th className="p-4">Applications</th>
                                <th className="p-4 rounded-tr-lg text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                            {recentJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">{job.title}</td>
                                    <td className="p-4 text-gray-600">{job.company}</td>
                                    <td className="p-4 text-gray-500">{job.date}</td>
                                    <td className="p-4 font-medium">{job.applications}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;