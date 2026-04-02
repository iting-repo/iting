import React, { useState } from 'react';
import { FaCheck, FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AppliedJobs = () => {
  const navigate = useNavigate();

  // 1. MOCK DATA (Tạo nhiều dữ liệu để test phân trang)
  const allJobs = [
    {
      id: 1,
      company: "Networking Engineer",
      logo: "https://via.placeholder.com/50/4ade80/ffffff?text=Up",
      type: "Remote",
      location: "Washington",
      salary: "$50k-80k/month",
      date: "Feb 2, 2019 19:28",
      status: "Active",
    },
    {
      id: 2,
      company: "Product Designer",
      logo: "https://via.placeholder.com/50/f43f5e/ffffff?text=P",
      type: "Full Time",
      location: "Dhaka",
      salary: "$50k-80k/month",
      date: "Dec 7, 2019 23:26",
      status: "Active",
    },
    {
      id: 3,
      company: "Junior Graphic Designer",
      logo: "https://via.placeholder.com/50/1e293b/ffffff?text=Apple",
      type: "Temporary",
      location: "Brazil",
      salary: "$50k-80k/month",
      date: "Feb 2, 2019 19:28",
      status: "Active",
    },
    {
      id: 4,
      company: "Visual Designer",
      logo: "https://via.placeholder.com/50/f1f5f9/000000?text=Ms",
      type: "Contract Base",
      location: "Wisconsin",
      salary: "$50k-80k/month",
      date: "Dec 7, 2019 23:26",
      status: "Active",
    },
    {
      id: 5,
      company: "Marketing Officer",
      logo: "https://via.placeholder.com/50/0ea5e9/ffffff?text=T",
      type: "Full Time",
      location: "United States",
      salary: "$50k-80k/month",
      date: "Dec 4, 2019 21:42",
      status: "Active",
    },
    {
      id: 6,
      company: "UI/UX Designer",
      logo: "https://via.placeholder.com/50/2563eb/ffffff?text=Fb",
      type: "Full Time",
      location: "North Dakota",
      salary: "$50k-80k/month",
      date: "Dec 30, 2019 07:52",
      status: "Active",
    },
    {
      id: 7,
      company: "Software Engineer",
      logo: "https://via.placeholder.com/50/6366f1/ffffff?text=S",
      type: "Full Time",
      location: "New York",
      salary: "$50k-80k/month",
      date: "Dec 30, 2019 05:18",
      status: "Active",
    },
    {
      id: 8,
      company: "Front End Developer",
      logo: "https://via.placeholder.com/50/ea580c/ffffff?text=R",
      type: "Full Time",
      location: "Michigan",
      salary: "$50k-80k/month",
      date: "Mar 20, 2019 23:14",
      status: "Active",
    }
  ];

  // 2. STATE PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng tin mỗi trang

  // Logic tính toán cắt mảng
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = allJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allJobs.length / itemsPerPage);

  // Helper đổi màu badge loại công việc
  const getTypeStyle = (type) => {
      if (type.includes("Full Time")) return "bg-blue-50 text-blue-600";
      if (type.includes("Part Time")) return "bg-sky-50 text-sky-600";
      if (type.includes("Remote")) return "bg-green-50 text-green-600";
      return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Công việc đã ứng tuyển <span className="text-gray-400 font-normal text-lg">({allJobs.length})</span>
      </h2>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 mb-8">
        <table className="w-full text-left border-collapse">
          {/* Table Head */}
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 rounded-tl-lg">Công việc</th>
              <th className="p-4">Ngày</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 rounded-tr-lg text-right">Hành động</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 text-sm">
            {currentJobs.map((job) => (
              <tr key={job.id} className="hover:bg-blue-50/30 transition-colors group">
                
                {/* Cột 1: Thông tin Job */}
                <td className="p-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 bg-white">
                         <img src={job.logo} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 text-base">{job.company}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getTypeStyle(job.type)}`}>
                               {job.type}
                            </span>
                         </div>
                         <div className="text-gray-500 flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">📍 {job.location}</span> 
                            <span className="text-gray-300">|</span> 
                            <span>💰 {job.salary}</span>
                         </div>
                      </div>
                   </div>
                </td>

                {/* Cột 2: Ngày */}
                <td className="p-4 text-gray-500">
                   {job.date}
                </td>

                {/* Cột 3: Trạng thái */}
                <td className="p-4">
                   <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                      <FaCheck /> {job.status}
                   </span>
                </td>

                {/* Cột 4: Hành động */}
                <td className="p-4 text-right">
                   <button 
                     onClick={() => navigate(`/jobs/${job.id}`)} // Ví dụ điều hướng sang chi tiết job
                     className="bg-gray-100 hover:bg-[#3AB4E6] hover:text-white text-gray-500 text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm"
                   >
                      Xem Chi Tiết
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION (Phân trang) --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
            {/* Nút Prev */}
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#3AB4E6] hover:bg-blue-50'}`}
            >
                <FaArrowLeft size={10} />
            </button>

            {/* Số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        currentPage === page 
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#3AB4E6] hover:bg-blue-50'}`}
            >
                <FaArrowRight size={10} />
            </button>
        </div>
      )}

    </div>
  );
};

export default AppliedJobs;