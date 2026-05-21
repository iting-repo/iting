import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../../components/common';
import {
  FaSearch, FaArrowRight, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import publicService from '../../services/publicService';
import { CompanyLogo } from '../../components/common';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildJobDetailPath } from '../../utils/jobUrl';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalaryLookupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || 'Lập trình viên';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [expandedNote, setExpandedNote] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await publicService.getSalaryReport({
        keyword,
        location: location || undefined,
        experience: experience || undefined
      });
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch salary report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [searchParams]); // Re-fetch if searchParams change

  const toggleNote = (id) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  const experienceChartData = {
    labels: report?.experienceStats?.map(s => s.label) || [],
    datasets: [
      {
        label: 'Lương (Tr/tháng)',
        data: report?.experienceStats?.map(s => s.value) || [],
        borderColor: '#3AB4E6',
        backgroundColor: 'rgba(58, 180, 230, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3AB4E6',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const experienceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 12 },
        bodyFont: { size: 13, weight: 'bold' },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} Tr/tháng`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: '#9CA3AF' },
        border: { display: false },
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: { font: { size: 12 }, color: '#9CA3AF' },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  const locationChartData = {
    labels: report?.locationStats?.map(s => s.label) || [],
    datasets: [
      {
        label: 'Lương (Tr/tháng)',
        data: report?.locationStats?.map(s => s.value) || [],
        backgroundColor: '#3AB4E6',
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const locationChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 12 },
        bodyFont: { size: 13, weight: 'bold' },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => `${ctx.parsed.x} triệu`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        ticks: { display: false },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: '500' }, color: '#374151' },
        border: { display: false },
      },
    },
  };

  const barLabelPlugin = {
    id: 'barLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, index) => {
          const value = dataset.data[index];
          ctx.save();
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#374151';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${value} triệu`, bar.x + 8, bar.y);
          ctx.restore();
        });
      });
    },
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Thỏa thuận";
    if (min >= 1000000) {
      const fmt = (n) => (n / 1000000).toFixed(0);
      return `${fmt(min)} - ${fmt(max)} triệu`;
    }
    return `${min} - ${max}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Tra cứu mức lương', link: '/salary-lookup' },
            { label: keyword }
          ]}
        />

        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Báo cáo lương vị trí <span className="text-[#3AB4E6]">{keyword}</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap items-center gap-4 mb-10">
          <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập tên vị trí công việc"
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#3AB4E6] text-gray-700 font-medium"
            />
          </div>
          <div className="hidden lg:block w-px h-8 bg-gray-200"></div>
          <div className="flex-1 min-w-[150px] relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full appearance-none bg-transparent border-none focus:ring-0 text-gray-600 font-medium py-3 px-4 cursor-pointer"
            >
              <option value="">Tất cả tỉnh/thành phố</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="hidden lg:block w-px h-8 bg-gray-200"></div>
          <div className="flex-1 min-w-[150px] relative">
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full appearance-none bg-transparent border-none focus:ring-0 text-gray-600 font-medium py-3 px-4 cursor-pointer"
            >
              <option value="">Tất cả kinh nghiệm</option>
              <option value="INTERN">Thực tập</option>
              <option value="FRESHER">Mới ra trường</option>
              <option value="JUNIOR">1-3 năm</option>
              <option value="SENIOR">Trên 5 năm</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="bg-[#3AB4E6] hover:bg-[#2da0d0] text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            {isLoading ? 'Đang tải...' : 'Tra cứu'}
          </button>
        </div>

        {/* Salary Range Overview */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dải lương</h2>
          <p className="text-gray-500 text-sm mb-8">Dải lương vị trí <span className="font-bold">{keyword}</span></p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#f3f0ff] p-6 rounded-2xl border-l-[6px] border-purple-500">
              <p className="text-purple-600 font-medium mb-2">Mức lương trung bình</p>
              <p className="text-3xl font-black text-gray-800">{report?.averageSalary || 0} Tr/tháng</p>
            </div>
            <div className="bg-sky-50 p-6 rounded-2xl border-l-[6px] border-[#3AB4E6]">
              <p className="text-[#3AB4E6] font-medium mb-2">Khoảng lương phổ biến</p>
              <p className="text-3xl font-black text-gray-800">{report?.minSalary || 0} – {report?.maxSalary || 0} Tr/tháng</p>
            </div>
          </div>

          <div className="relative pt-10 pb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2 absolute -top-0 w-full">
              <span>{report?.minSalary || 0}</span>
              <span className="text-gray-800 font-bold">Phổ biến</span>
              <span>{report?.maxSalary || 100}</span>
            </div>
            <div className="h-6 w-full flex rounded-full overflow-hidden">
              <div className="bg-gray-200 w-[15%]"></div>
              <div className="bg-[#93D9F8] w-[20%]"></div>
              <div className="bg-[#3AB4E6] w-[65%]"></div>
            </div>
            <div className="flex justify-between items-start mt-2">
              <div className="ml-[15%] text-center">
                <div className="w-px h-4 bg-gray-300 mx-auto"></div>
                <span className="text-xs text-gray-500">{report?.minSalary || 0}</span>
              </div>
              <div className="absolute left-1/4 mt-8 text-center translate-x-12">
                <div className="w-px h-8 border-l border-dashed border-[#3AB4E6] mx-auto"></div>
                <span className="text-xs text-[#3AB4E6] font-bold">TB: {report?.averageSalary || 0} Tr/Tháng</span>
              </div>
              <div className="mr-[65%] text-center">
                <div className="w-px h-4 bg-gray-300 mx-auto"></div>
                <span className="text-xs text-gray-500">{report?.maxSalary || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Theo kinh nghiệm</h2>
            <p className="text-gray-400 text-xs mb-8">Lương trung bình/tháng vị trí <span className="font-bold">{keyword}</span> phân tích theo <span className="font-bold">kinh nghiệm</span></p>

            <div className="h-[300px]">
              {report?.experienceStats?.length > 0 ? (
                <Line data={experienceChartData} options={experienceChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Chưa có dữ liệu thống kê</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Theo khu vực</h2>
            <p className="text-gray-400 text-xs mb-8">Lương trung bình/tháng vị trí <span className="font-bold">{keyword}</span> phân tích theo <span className="font-bold">các khu vực</span></p>

            <div className="h-[300px]">
              {report?.locationStats?.length > 0 ? (
                <Bar data={locationChartData} options={locationChartOptions} plugins={[barLabelPlugin]} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Chưa có dữ liệu thống kê</div>
              )}
            </div>
          </div>
        </div>

        {/* High Salary Jobs */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Việc làm {keyword} lương cao</h2>
              <p className="text-gray-400 text-xs mt-1">Top việc làm lương cao cho vị trí {keyword}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report?.highSalaryJobs?.map((job, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate(buildJobDetailPath(job))}>
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CompanyLogo
                      logoUrl={job.companyLogo}
                      companyName={job.companyName}
                      className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-2 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 group-hover:text-[#3AB4E6] transition-colors line-clamp-2">{job.title || job.position}</h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase truncate">{job.companyName}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 bg-sky-50 text-[#3AB4E6] text-[10px] font-black rounded-lg border border-sky-100">
                        {formatSalary(job.minSalary, job.maxSalary)}
                      </span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">{job.province || job.location}</span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">{job.experienceLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!report?.highSalaryJobs || report.highSalaryJobs.length === 0) && (
              <div className="col-span-2 text-center py-10 text-gray-400">Không tìm thấy việc làm liên quan</div>
            )}
          </div>
        </div>

        {/* Notes / FAQ */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-gray-800 px-4">Lưu ý</h3>
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div
              className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleNote('general')}
            >
              <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Tổng quát</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                {expandedNote === 'general' ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            {expandedNote === 'general' && (
              <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                Dữ liệu được tổng hợp từ các tin tuyển dụng được đăng tải trên nền tảng ITing. Mức lương thực tế phụ thuộc vào kỹ năng, quy mô công ty và địa điểm làm việc cụ thể.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-800 mb-4">Xem thêm Báo cáo lương của các vị trí liên quan:</p>
          <div className="flex flex-wrap gap-2">
            {report?.relatedPositions && report.relatedPositions.length > 0 ? (
              report.relatedPositions.map(item => (
                <span key={item} onClick={() => { setKeyword(item); fetchReport(); }} className="px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-500 font-bold hover:bg-[#E6F6FD] hover:text-[#3AB4E6] cursor-pointer transition-colors">
                  {item}
                </span>
              ))
            ) : (
              ['Tư vấn tài chính', 'Market Research', 'Lập trình viên'].map(item => (
                <span key={item} onClick={() => { setKeyword(item); fetchReport(); }} className="px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-500 font-bold hover:bg-[#E6F6FD] hover:text-[#3AB4E6] cursor-pointer transition-colors">
                  {item}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryLookupPage;
