import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaBookmark, 
  FaArrowRight, FaClock, FaArrowLeft, FaTrashAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FavoriteJobs = () => {
  const navigate = useNavigate();

  // 1. MOCK DATA
  // Danh sách này đều là việc đã lưu
  const savedJobs = [
    {
      id: 1,
      title: "Senior UX Designer",
      company: "Slack",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
      type: "Full Time",
      location: "United Kingdom",
      salary: "$30k-$35k",
      postedTime: "Vừa xong",
    },
    {
      id: 2,
      title: "Internship Graphics",
      company: "Pinterest",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png",
      type: "Internship",
      location: "Remote",
      salary: "$500-$800",
      postedTime: "1 ngày trước",
    },
    {
      id: 3,
      title: "Marketing Officer",
      company: "Intel", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg",
      type: "Full Time",
      location: "Montana, USA",
      salary: "$50k-$60k",
      postedTime: "2 ngày trước",
    },
    {
      id: 4,
      title: "Networking Engineer",
      company: "Instagram",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
      type: "Full Time",
      location: "Michigan, USA",
      salary: "$5k-$10k",
      postedTime: "3 ngày trước",
    },
    {
      id: 5,
      title: "Product Designer",
      company: "Figma",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
      type: "Full Time",
      location: "San Francisco",
      salary: "$80k-$100k",
      postedTime: "5 ngày trước",
    },
    {
      id: 6,
      title: "Java Developer",
      company: "Oracle",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
      type: "Contract",
      location: "Austin, Texas",
      salary: "$40k-$50k",
      postedTime: "1 tuần trước",
    }
  ];

  // 2. PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = savedJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(savedJobs.length / itemsPerPage);

  // Helper đổi màu Badge
  const getTypeStyle = (type) => {
    if (type === 'Full Time') return 'bg-blue-50 text-blue-600';
    if (type === 'Internship') return 'bg-purple-50 text-purple-600';
    if (type === 'Remote') return 'bg-green-50 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  // Hàm xử lý xóa việc đã lưu (Giả lập)
  const handleRemove = (id) => {
    if(window.confirm("Bạn có chắc muốn bỏ lưu công việc này?")) {
        console.log("Remove job id:", id);
        // Logic gọi API xóa...
    }
  }

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Công việc đã lưu <span className="text-gray-400 font-normal text-lg">({savedJobs.length})</span>
        </h2>
      </div>

      {/* JOB LIST */}
      <div className="space-y-4 mb-8">
        {currentJobs.map((job) => (
          <div 
            key={job.id} 
            className="group relative border border-gray-100 rounded-xl p-5 hover:border-[#3AB4E6] hover:shadow-lg transition-all bg-white flex flex-col md:flex-row items-center gap-6"
          >
             {/* Logo */}
             <div className="w-14 h-14 shrink-0 bg-white rounded-lg border border-gray-100 p-2 flex items-center justify-center">
                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
             </div>

             {/* Info */}
             <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                   <h3 
                     onClick={() => navigate(`/jobs/${job.id}`)}
                     className="font-bold text-gray-800 text-lg group-hover:text-[#3AB4E6] transition-colors cursor-pointer"
                   >
                      {job.title}
                   </h3>
                   <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeStyle(job.type)}`}>
                      {job.type}
                   </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                   <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-gray-400" /> {job.location}</span>
                   <span className="flex items-center gap-1.5"><FaDollarSign className="text-gray-400" /> {job.salary}</span>
                   {/* Thời gian đăng */}
                   <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      <FaClock size={10} /> {job.postedTime}
                   </span>
                </div>
             </div>

             {/* Actions */}
             <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {/* Nút Xóa (Trash Icon) thay vì Bookmark để người dùng dễ hiểu là "Bỏ lưu" */}
                <button 
                    onClick={() => handleRemove(job.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors tooltip"
                    title="Bỏ lưu"
                >
                   <FaTrashAlt /> 
                </button>

                {/* Nút Ứng tuyển */}
                <button 
                   onClick={() => navigate(`/jobs/${job.id}`)}
                   className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                >
                   Ứng Tuyển <FaArrowRight size={12} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#3AB4E6] hover:bg-blue-50'}`}
            >
                <FaArrowLeft size={10} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        currentPage === page 
                        ? 'bg-[#1967D2] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {page < 10 ? `0${page}` : page}
                </button>
            ))}

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

export default FavoriteJobs;