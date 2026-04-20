import React, { useState, useRef, useEffect } from 'react';
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

const EXPERIENCE_LABELS = ['Dưới 1 năm', '1-3 năm', '3-5 năm', 'Trên 5 năm'];
const EXPERIENCE_VALUES = [15, 16, 20.3, 35];

const LOCATION_LABELS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Bình Dương'];
const LOCATION_VALUES = [18, 15, 15, 15, 15];

const SalaryLookupPage = () => {
  const [keyword, setKeyword] = useState('Nhân viên tư vấn');
  const [expandedNote, setExpandedNote] = useState(null);

  const toggleNote = (id) => {
    setExpandedNote(expandedNote === id ? null : id);
  };

  const experienceChartData = {
    labels: EXPERIENCE_LABELS,
    datasets: [
      {
        label: 'Lương (Tr/tháng)',
        data: EXPERIENCE_VALUES,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10B981',
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
    labels: LOCATION_LABELS,
    datasets: [
      {
        label: 'Lương (Tr/tháng)',
        data: LOCATION_VALUES,
        backgroundColor: '#10B981',
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

  // Plugin to draw value labels on bar chart
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
            Báo cáo lương vị trí <span className="text-[#10B981]">{keyword}</span>
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
            <select className="w-full appearance-none bg-transparent border-none focus:ring-0 text-gray-600 font-medium py-3 px-4 cursor-pointer">
              <option>Tất cả tỉnh/thành phố</option>
              <option>Hà Nội</option>
              <option>Hồ Chí Minh</option>
              <option>Đà Nẵng</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="hidden lg:block w-px h-8 bg-gray-200"></div>
          <div className="flex-1 min-w-[150px] relative">
            <select className="w-full appearance-none bg-transparent border-none focus:ring-0 text-gray-600 font-medium py-3 px-4 cursor-pointer">
              <option>Tất cả kinh nghiệm</option>
              <option>Dưới 1 năm</option>
              <option>1-3 năm</option>
              <option>3-5 năm</option>
              <option>Trên 5 năm</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button className="bg-[#3AB4E6] hover:bg-[#2da0d0] text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-sky-500/20">
            Tra cứu
          </button>
        </div>

        {/* Salary Range Overview */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dải lương</h2>
          <p className="text-gray-500 text-sm mb-8">Dải lương vị trí <span className="font-bold">{keyword}</span></p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#f3f0ff] p-6 rounded-2xl border-l-[6px] border-purple-500">
              <p className="text-purple-600 font-medium mb-2">Mức lương trung bình</p>
              <p className="text-3xl font-black text-gray-800">16 Tr/tháng</p>
            </div>
            <div className="bg-[#e0f2f1] p-6 rounded-2xl border-l-[6px] border-teal-500">
              <p className="text-teal-600 font-medium mb-2">Khoảng lương phổ biến</p>
              <p className="text-3xl font-black text-gray-800">12 – 20 Tr/tháng</p>
            </div>
          </div>

          <div className="relative pt-10 pb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2 absolute -top-0 w-full">
              <span>4</span>
              <span className="text-gray-800 font-bold">Phổ biến</span>
              <span>80</span>
            </div>
            <div className="h-6 w-full flex rounded-full overflow-hidden">
               <div className="bg-[#D97706] w-[15%]"></div>
               <div className="bg-[#3AB4E6] w-[20%]"></div>
               <div className="bg-[#10B981] w-[65%]"></div>
            </div>
            <div className="flex justify-between items-start mt-2">
              <div className="ml-[15%] text-center">
                 <div className="w-px h-4 bg-gray-300 mx-auto"></div>
                 <span className="text-xs text-gray-500">12</span>
              </div>
              <div className="absolute left-1/4 mt-8 text-center translate-x-12">
                 <div className="w-px h-8 border-l border-dashed border-[#3AB4E6] mx-auto"></div>
                 <span className="text-xs text-[#3AB4E6] font-bold">TB: 16 Tr/Tháng</span>
              </div>
              <div className="mr-[65%] text-center">
                 <div className="w-px h-4 bg-gray-300 mx-auto"></div>
                 <span className="text-xs text-gray-500">20</span>
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
              <Line data={experienceChartData} options={experienceChartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Theo khu vực</h2>
            <p className="text-gray-400 text-xs mb-8">Lương trung bình/tháng vị trí <span className="font-bold">{keyword}</span> phân tích theo <span className="font-bold">các khu vực</span></p>
            
            <div className="h-[300px]">
              <Bar data={locationChartData} options={locationChartOptions} plugins={[barLabelPlugin]} />
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
              {[
                { title: 'Nhân Viên Kinh Doanh / Sales Bất Động Sản', company: 'CÔNG TY CỔ PHẦN BĐS NOV NHẬT TÂN', salary: '100 - 300 triệu', location: 'Hà Nội', exp: 'Dưới 1 năm' },
                { title: 'Nhân Viên Kinh Doanh/Sale/ Tư Vấn/Bán Hàng', company: 'CÔNG TY CỔ PHẦN DKRA GROUP', salary: '80 - 200 triệu', location: 'Hồ Chí Minh', exp: 'Không yêu cầu' },
                { title: 'Quản Lý Chi Nhánh (Phòng Khám Thẩm Mỹ)', company: 'CÔNG TY TNHH THẨM MỸ LINH ANH SAIGON', salary: '80 - 200 triệu', location: 'Hồ Chí Minh', exp: '3 năm' },
                { title: 'Chuyên Viên Tư Vấn/ Kinh Doanh/Bán Hàng', company: 'CÔNG TY CỔ PHẦN BĐS THỊNH VƯỢNG HOME', salary: 'Tới 200 triệu', location: 'Hồ Chí Minh', exp: 'Không yêu cầu' },
              ].map((job, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer">
                   <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-2 shrink-0 flex items-center justify-center">
                         <img src="/assets/default-company.png" alt="Company" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-gray-800 group-hover:text-[#3AB4E6] transition-colors line-clamp-2">{job.title}</h3>
                         <p className="text-xs text-gray-400 mt-1 uppercase truncate">{job.company}</p>
                         <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100">{job.salary}</span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">{job.location}</span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">{job.exp}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <div className="flex justify-center mt-10">
              <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 group transition-all">
                Xem tất cả <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
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
                   Dữ liệu được tổng hợp từ hàng ngàn tin tuyển dụng được đăng tải trên nền tảng ITing trong 12 tháng qua. Mức lương thực tế phụ thuộc vào kỹ năng, quy mô công ty và địa điểm làm việc cụ thể.
                </div>
              )}
           </div>
           <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <div 
                className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleNote('source')}
              >
                <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Nguồn dữ liệu</span>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  {expandedNote === 'source' ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
              {expandedNote === 'source' && (
                <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                   Từ các tin tuyển dụng xác thực của các doanh nghiệp đối tác.
                </div>
              )}
           </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
           <p className="text-sm font-bold text-gray-800 mb-4">Xem thêm Báo cáo lương của các vị trí liên quan:</p>
           <div className="flex flex-wrap gap-2">
              {['Tư vấn tài chính', 'Market Research', 'Nhân viên tư vấn'].map(item => (
                <span key={item} className="px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-500 font-bold hover:bg-[#E6F6FD] hover:text-[#00B4D8] cursor-pointer transition-colors">
                  {item}
                </span>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryLookupPage;
