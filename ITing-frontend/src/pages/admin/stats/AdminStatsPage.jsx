import React, { useState, useEffect } from 'react';
import { 
    FaChartLine, FaUsers, FaBriefcase, FaBuilding, 
    FaCalendarAlt, FaDownload 
} from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/common';
import { Button, LoadingSpinner } from '../../../components';
import adminStatsService from '../../../services/adminStatsService';

// Biểu đồ
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminStatsPage = () => {
    const [dateRange, setDateRange] = useState('7days');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await adminStatsService.getDetailedStats(dateRange);
                setStats(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dateRange]);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const growthData = {
        labels: stats.growthData.labels,
        datasets: [
            {
                label: 'Người dùng mới',
                data: stats.growthData.newUsers,
                borderColor: '#3AB4E6',
                backgroundColor: 'rgba(58, 180, 230, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Lượt ứng tuyển',
                data: stats.growthData.applications,
                borderColor: '#34D399',
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const topSkillsData = {
        labels: Object.keys(stats.topSkills),
        datasets: [
            {
                label: 'Nhu cầu tuyển dụng',
                data: Object.values(stats.topSkills),
                backgroundColor: '#3AB4E6',
                borderRadius: 4,
            }
        ]
    };

    const userRolesData = {
        labels: Object.keys(stats.userRoles),
        datasets: [{
            data: Object.values(stats.userRoles),
            backgroundColor: ['#34D399', '#3AB4E6', '#FBBF24'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const trendingDomainsData = {
        labels: Object.keys(stats.trendingDomains),
        datasets: [{
            label: 'Độ hot (thang 100)',
            data: Object.values(stats.trendingDomains),
            backgroundColor: 'rgba(58, 180, 230, 0.2)',
            borderColor: '#3AB4E6',
            pointBackgroundColor: '#3AB4E6',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#3AB4E6'
        }]
    };

    const topLocationsData = {
        labels: Object.keys(stats.topLocations),
        datasets: [{
            label: 'Số lượng việc làm',
            data: Object.values(stats.topLocations),
            backgroundColor: '#F59E0B',
            borderRadius: 4,
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#f3f4f6' }, border: { display: false } },
            x: { grid: { display: false } }
        }
    };

    const horizontalBarOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#f3f4f6' } },
            y: { grid: { display: false } }
        }
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: '#f3f4f6' },
                grid: { color: '#f3f4f6' },
                pointLabels: { font: { size: 11, family: "'Inter', sans-serif" } },
                ticks: { display: false }
            }
        },
        plugins: { legend: { display: false } }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
        }
    };

    return (
        <div className="space-y-6 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                        <FaChartLine className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Thống kê chi tiết</h1>
                        <p className="text-sm text-slate-500 font-medium">Phân tích chuyên sâu về hiệu suất của nền tảng</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-sky-500"
                    >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="thisYear">Năm nay</option>
                    </select>
                    <Button variant="outline" className="h-10 border-slate-200">
                        <FaDownload className="mr-2" /> Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Tổng Người Dùng</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.totalVisits.toLocaleString()}</h3>
                        <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${stats.visitsChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.visitsChange >= 0 ? '+' : ''}{stats.visitsChange}% <span className="text-slate-400 font-medium">so với kỳ trước</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl">
                        <FaUsers />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Công Việc Đang Mở</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.openJobs.toLocaleString()}</h3>
                        <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${stats.jobsChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.jobsChange >= 0 ? '+' : ''}{stats.jobsChange}% <span className="text-slate-400 font-medium">so với kỳ trước</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">
                        <FaBriefcase />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Tổng Doanh Nghiệp</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.newCompanies.toLocaleString()}</h3>
                        <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${stats.companiesChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.companiesChange >= 0 ? '+' : ''}{stats.companiesChange}% <span className="text-slate-400 font-medium">so với kỳ trước</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl">
                        <FaBuilding />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Tỷ Lệ Phản Hồi</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.responseRate}%</h3>
                        <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${stats.responseRateChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stats.responseRateChange >= 0 ? '+' : ''}{stats.responseRateChange}% <span className="text-slate-400 font-medium">so với kỳ trước</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl">
                        <FaChartLine />
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Trend */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-sky-500 rounded-full"></span>
                            Tăng trưởng Người dùng & Ứng tuyển
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <Line options={commonOptions} data={growthData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Top Skills */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                            Top Kỹ năng được săn đón
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <Bar options={commonOptions} data={topSkillsData} />
                        </div>
                    </CardContent>
                </Card>

                {/* User Roles (Doughnut) */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-amber-400 rounded-full"></span>
                            Cơ cấu Người dùng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 relative">
                        <div className="h-[300px] w-full">
                            <Doughnut options={doughnutOptions} data={userRolesData} />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                            <span className="text-2xl font-black text-slate-800">
                                {Object.values(stats.userRoles).reduce((a, b) => a + b, 0).toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng User</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Locations (Horizontal Bar) */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                            Top Khu vực tuyển dụng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <Bar options={horizontalBarOptions} data={topLocationsData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Trending Domains (Radar) */}
                <Card className="border-slate-100 shadow-sm lg:col-span-2">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                            Xu hướng Mảng Công nghệ (Tech Domains)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex justify-center">
                        <div className="h-[350px] w-full max-w-[600px]">
                            <Radar options={radarOptions} data={trendingDomainsData} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminStatsPage;
