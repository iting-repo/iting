import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, FaDollarSign, FaTrashAlt,
  FaArrowRight, FaClock, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog, Table, Td } from "../../components/common";
import { toast } from 'sonner';
import { buildJobDetailPath } from '../../utils/jobUrl';

const FavoriteJobs = () => {
  const navigate = useNavigate();

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

  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const itemsPerPage = 5;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = savedJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(savedJobs.length / itemsPerPage);

  const getTypeStyle = (type) => {
    if (type === 'Full Time') return 'bg-blue-50 text-blue-600';
    if (type === 'Internship') return 'bg-sky-50 text-sky-600';
    if (type === 'Remote') return 'bg-green-50 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  const handleRemove = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmRemove = () => {
    const id = confirmModal.id;
    console.log("Remove job id:", id);
    toast.success("Đã bỏ lưu công việc thành công!");
  };

  return (
    <div className="bg-white rounded-xl p-8 min-h-screen shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Công việc đã lưu <span className="text-gray-400 font-normal text-lg">({savedJobs.length})</span>
        </h2>
      </div>

      {/* JOB TABLE */}
      <Table
        headers={[
          { label: "Công việc" },
          { label: "Mức lương" },
          { label: "Thời gian" },
          { label: "Hành động", className: "text-right" }
        ]}
      >
        {currentJobs.map((job) => (
          <tr 
            key={job.id} 
            className="hover:bg-gray-50/60 transition-all group"
          >
             <Td>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 shrink-0 bg-white rounded-lg border border-gray-100 p-2 flex items-center justify-center">
                      <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <h3 
                           onClick={() => navigate(buildJobDetailPath(job))}
                           className="font-bold text-gray-800 text-sm group-hover:text-[#3AB4E6] transition-colors cursor-pointer"
                         >
                            {job.title}
                         </h3>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getTypeStyle(job.type)}`}>
                            {job.type}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                         <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} className="text-gray-400" /> {job.location}</span>
                         <span className="font-medium">{job.company}</span>
                      </div>
                   </div>
                </div>
             </Td>

             <Td>
                <span className="font-bold text-gray-700">{job.salary}</span>
             </Td>

             <Td>
                <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                   <FaClock size={10} /> {job.postedTime}
                </span>
             </Td>

             <Td className="text-right">
                <div className="flex items-center justify-end gap-3 transition-opacity">
                    <button 
                        onClick={() => handleRemove(job.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Bỏ lưu"
                    >
                       <FaTrashAlt size={16} /> 
                    </button>

                    <button 
                       onClick={() => navigate(buildJobDetailPath(job))}
                       className="bg-[#EAF6FF] text-[#3AB4E6] hover:bg-[#3AB4E6] hover:text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-xs whitespace-nowrap shadow-sm border border-transparent"
                    >
                       Chi Tiết <FaArrowRight size={10} />
                    </button>
                </div>
             </Td>
          </tr>
        ))}
      </Table>

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
                <FaArrowLeft className="rotate-180" size={10} />
            </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmRemove}
        title="Bỏ lưu công việc"
        message="Bạn có chắc muốn bỏ lưu công việc này?"
        type="warning"
      />
    </div>
  );
};

export default FavoriteJobs;
