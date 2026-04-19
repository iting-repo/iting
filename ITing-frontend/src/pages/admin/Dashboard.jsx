import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaFileAlt, FaClipboardList, FaHourglassHalf } from 'react-icons/fa';
import { StatsCard, Table, Td, LoadingSpinner } from '../../components';
import adminDashboardService from '../../services/adminDashboardService';

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

// 3. CẤU HÌNH GIAO DIỆN BIỂU ĐỒ
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
            ticks: { display: false },
            border: { display: false }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
    elements: {
        line: { tension: 0.4 }
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'ACTIVE': return 'bg-green-100 text-green-600';
        case 'PENDING': return 'bg-yellow-100 text-yellow-600';
        case 'CLOSED':
        case 'REJECTED': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const getStatusLabel = (status) => {
    const map = {
        ACTIVE: 'Đang hoạt động',
        PENDING: 'Chờ duyệt',
        CLOSED: 'Đã đóng',
        REJECTED: 'Bị từ chối',
        EXPIRED: 'Hết hạn',
        SUSPENDED: 'Bị đình chỉ',
        NEEDS_REVISION: 'Cần chỉnh sửa',
    };

    return map[status] || status || 'Chưa cập nhật';
};

const formatter = new Intl.NumberFormat('en-US');

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminDashboardService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Oops! Something went wrong fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    if (!stats) return <div className="p-8 text-center text-gray-500">Không thể tải dữ liệu bảng điều khiển.</div>;

    const chartData = {
        labels: stats.chartData.map(d => d.day),
        datasets: [
            {
                label: 'Tin tuyển dụng',
                data: stats.chartData.map(d => d.jobPosts),
                borderColor: '#3AB4E6',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(58, 180, 230, 0.4)');
                    gradient.addColorStop(1, 'rgba(58, 180, 230, 0.0)');
                    return gradient;
                },
                fill: true,
                pointBackgroundColor: '#3AB4E6',
            },
            {
                label: 'Người dùng',
                data: stats.chartData.map(d => d.users),
                borderColor: '#34D399',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
                    gradient.addColorStop(1, 'rgba(52, 211, 153, 0.0)');
                    return gradient;
                },
                fill: true,
                pointBackgroundColor: '#34D399',
            },
        ],
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* TITLE */}
            <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>

            {/* ROW 1: STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Tổng người dùng" 
                    value={formatter.format(stats.totalUsers)} 
                    icon={<FaUserFriends />} 
                    percentage={Math.abs(stats.userChange).toFixed(1)} 
                    isIncrease={stats.userChange >= 0} 
                />
                <StatsCard 
                    title="Tổng tin tuyển dụng" 
                    value={formatter.format(stats.totalJobs)} 
                    icon={<FaFileAlt />} 
                    percentage={Math.abs(stats.jobChange).toFixed(1)} 
                    isIncrease={stats.jobChange >= 0} 
                />
                <StatsCard 
                    title="Tổng lượt ứng tuyển" 
                    value={formatter.format(stats.totalApplications)} 
                    icon={<FaClipboardList />} 
                    percentage={Math.abs(stats.applicationChange).toFixed(1)} 
                    isIncrease={stats.applicationChange >= 0} 
                />
                <StatsCard 
                    title="Ứng tuyển chờ duyệt" 
                    value={formatter.format(stats.pendingApplications)} 
                    icon={<FaHourglassHalf />} 
                    percentage={Math.abs(stats.pendingChange).toFixed(1)} 
                    isIncrease={stats.pendingChange >= 0} 
                />
            </div>

            {/* ROW 2: JOB ANALYTICS CHART */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#3AB4E6] rounded-full"></span> Phân tích tuyển dụng
                </h3>
                <div className="h-[350px] w-full">
                    <Line options={chartOptions} data={chartData} />
                </div>
            </div>

            {/* ROW 3: TABLE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#3AB4E6] rounded-full"></span> Hoạt động gần đây
                </h3>
                <Table
                    headers={[
                        { label: "Tiêu đề công việc" },
                        { label: "Công ty" },
                        { label: "Ngày - Giờ" },
                        { label: "Lượt ứng tuyển" },
                        { label: "Trạng thái", className: "text-center" }
                    ]}
                >
                    {stats.recentActivities.length > 0 ? stats.recentActivities.map((job, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60 transition-colors group">
                            <Td className="font-bold text-gray-800">{job.jobTitle}</Td>
                            <Td className="text-gray-600">{job.company}</Td>
                            <Td className="text-gray-500 whitespace-nowrap">{job.dateTime}</Td>
                            <Td className="font-medium text-gray-700">{formatter.format(job.applications)}</Td>
                            <Td className="text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                                    {getStatusLabel(job.status)}
                                </span>
                            </Td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">Không có hoạt động gần đây.</td>
                        </tr>
                    )}
                </Table>
            </div>
        </div>
    );
};

export default AdminDashboard;
