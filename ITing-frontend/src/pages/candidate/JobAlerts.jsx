import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaRegBookmark, FaBookmark, 
  FaArrowRight, FaClock, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { buildJobDetailPath } from '../../utils/jobUrl';

const JobAlerts = () => {
  const navigate = useNavigate();

  const alerts = [
    {
      id: 1,
      title: "Technical Support Specialist",
      company: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
      type: "Full Time",
      location: "Idaho, USA",
      salary: "$15k-$20k",
      remaining: "4 Days Remaining",
      postedTime: "2 giờ trước",
      isSaved: false
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Youtube",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
      type: "Full Time",
      location: "Minnesota, USA",
      salary: "$10k-$15k",
      remaining: "4 Days Remaining",
      postedTime: "5 giờ trước",
      isSaved: false
    },
    {
      id: 3,
      title: "Front End Developer",
      company: "Reddit",
      logo: "https://www.logo.wine/a/logo/Reddit/Reddit-Logo.wine.svg",
      type: "Internship",
      location: "Mymensingh, BD",
      salary: "$10k-$15k",
      remaining: "4 Days Remaining",
      postedTime: "1 ngày trước",
      isSaved: true
    },
    {
      id: 4,
      title: "Marketing Officer",
      company: "Reddit", 
      logo: "https://www.logo.wine/a/logo/Reddit/Reddit-Logo.wine.svg",
      type: "Full Time",
      location: "Montana, USA",
      salary: "$50k-$60k",
      remaining: "4 Days Remaining",
      postedTime: "2 ngày trước",
      isSaved: false
    },
    {
      id: 5,
      title: "Networking Engineer",
      company: "Instagram",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
      type: "Full Time",
      location: "Michigan, USA",
      salary: "$5k-$10k",
      remaining: "4 Days Remaining",
      postedTime: "3 ngày trước",
      isSaved: true
    },
    {
      id: 6,
      title: "Senior UX Designer",
      company: "Slack",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
      type: "Full Time",
      location: "United Kingdom",
      salary: "$30k-$35k",
      remaining: "4 Days Remaining",
      postedTime: "Vừa xong",
      isSaved: false
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = alerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(alerts.length / itemsPerPage);

  const getTypeStyle = (type) => {
    if (type === 'Full Time') return 'bg-blue-50 text-blue-600';
    if (type === 'Internship') return 'bg-sky-50 text-sky-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Thông báo việc làm <span className="bg-blue-100 text-[#3AB4E6] text-sm px-2 py-1 rounded-full ml-2">09</span>
        </h2>
        <div className="text-sm text-gray-500">
           Hiển thị các công việc từ công ty bạn theo dõi
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {currentJobs.map((job) => (
          <div 
            key={job.id} 
            className="group relative border border-gray-100 rounded-xl p-5 hover:border-[#3AB4E6] hover:shadow-lg transition-all bg-white flex flex-col md:flex-row items-center gap-6"
          >
             <div className="w-14 h-14 shrink-0 bg-white rounded-lg border border-gray-100 p-2 flex items-center justify-center">
                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
             </div>

             <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                   <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#3AB4E6] transition-colors cursor-pointer">
                      {job.title}
                   </h3>
                   <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeStyle(job.type)}`}>
                      {job.type}
                   </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                   <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-gray-400" /> {job.location}</span>
                   <span className="flex items-center gap-1.5"><FaDollarSign className="text-gray-400" /> {job.salary}</span>
                   <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-gray-400" /> {job.remaining}</span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                   <FaClock /> Đăng tải: {job.postedTime}
                </div>
             </div>

             <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <button className="text-gray-400 hover:text-[#3AB4E6] text-xl transition-colors">
                   {job.isSaved ? <FaBookmark className="text-[#3AB4E6]" /> : <FaRegBookmark />}
                </button>

                <button 
                   onClick={() => navigate(buildJobDetailPath(job))}
                   className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 text-sm"
                >
                   Ứng Tuyển <FaArrowRight size={12} />
                </button>
             </div>
          </div>
        ))}
      </div>

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

export default JobAlerts;
