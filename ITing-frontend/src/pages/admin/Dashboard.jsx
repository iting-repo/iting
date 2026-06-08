import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaFileAlt, FaClipboardList, FaHourglassHalf } from 'react-icons/fa';
import { Badge, Table, Td, LoadingSpinner } from '../../components';
import { StatCard } from '../../components/admin/StatCard';
import { getJobStatusMeta } from '../../utils/statusMeta';
import adminDashboardService from '../../services/adminDashboardService';

// 1. IMPORT CHART.JS
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common';

// 2. ĐĂNG KÝ CÁC THÀNH PHẦN BIỂU ĐỒ
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
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

const formatter = new Intl.NumberFormat('en-US');

// Dòng phụ hiển thị xu hướng tăng/giảm trong StatCard
const trendSub = (change) =>
    `${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}% so với kỳ trước`;

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

    const statusLabels = ['Đang hoạt động', 'Chờ duyệt', 'Đã đóng', 'Khác'];
    const statusValues = stats.jobStatusDistribution ? [
        stats.jobStatusDistribution.ACTIVE || 0,
        stats.jobStatusDistribution.PENDING || 0,
        stats.jobStatusDistribution.CLOSED || 0,
        (stats.jobStatusDistribution.REJECTED || 0) + (stats.jobStatusDistribution.EXPIRED || 0),
    ] : [stats.totalJobs || 0, 0, 0, 0];
    const statusColors = ['#34D399', '#FBBF24', '#F87171', '#9CA3AF'];

    const doughnutData = {
        labels: statusLabels,
        datasets: [
            {
                data: statusValues,
                backgroundColor: statusColors,
                borderWidth: 0,
                hoverOffset: 10,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#6B7280',
                bodyColor: '#1F2937',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                usePointStyle: true,
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* TITLE */}
            <h2 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h2>

            {/* ROW 1: STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    label="Tổng người dùng"
                    value={formatter.format(stats.totalUsers)}
                    icon={<FaUserFriends className="h-5 w-5" />}
                    accent="blue"
                    sub={trendSub(stats.userChange)}
                />
                <StatCard
                    label="Tổng tin tuyển dụng"
                    value={formatter.format(stats.totalJobs)}
                    icon={<FaFileAlt className="h-5 w-5" />}
                    accent="violet"
                    sub={trendSub(stats.jobChange)}
                />
                <StatCard
                    label="Tổng lượt ứng tuyển"
                    value={formatter.format(stats.totalApplications)}
                    icon={<FaClipboardList className="h-5 w-5" />}
                    accent="emerald"
                    sub={trendSub(stats.applicationChange)}
                />
                <StatCard
                    label="Ứng tuyển chờ duyệt"
                    value={formatter.format(stats.pendingApplications)}
                    icon={<FaHourglassHalf className="h-5 w-5" />}
                    accent="amber"
                    sub={trendSub(stats.pendingChange)}
                />
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LINE CHART */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#3AB4E6] rounded-full"></span> Phân tích tuyển dụng
                    </h3>
                    <div className="h-[350px] w-full">
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </div>

                {/* PIE CHART (Doughnut) */}
                <Card className="flex flex-col">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#3AB4E6] rounded-full"></span> Phân bố trạng thái Job
                        </h3>
                    </div>
                    <CardContent className="flex-1 flex flex-col justify-center">
                        <div className="h-[250px] w-full relative">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                            {/* Optional center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-gray-800">{stats.totalJobs}</span>
                                <span className="text-xs text-gray-500 font-medium">Tổng việc</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center mt-6">
                            {statusLabels.map((label, i) => (
                                <div key={label} className="flex items-center gap-2 text-xs">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[i] }} />
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-bold text-gray-800">{statusValues[i]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ROW 3: TABLE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#3AB4E6] rounded-full"></span> Hoạt động gần đây
                </h3>
                <div className="overflow-x-auto custom-scrollbar">
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
                                <Td className="font-bold text-gray-800 whitespace-nowrap">{job.jobTitle}</Td>
                                <Td className="text-gray-600 whitespace-nowrap">{job.company}</Td>
                                <Td className="text-gray-500 whitespace-nowrap">{job.dateTime}</Td>
                                <Td className="font-medium text-gray-700">{formatter.format(job.applications)}</Td>
                                <Td className="text-center">
                                    {(() => {
                                        const meta = getJobStatusMeta(job.status);
                                        return <Badge variant={meta.variant}>{meta.label}</Badge>;
                                    })()}
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
        </div>
    );
};

export default AdminDashboard;
