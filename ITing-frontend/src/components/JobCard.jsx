import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark } from 'react-icons/fa';
import { toast } from 'sonner';
import { buildJobDetailPath } from '../utils/jobUrl';

const JobCard = ({ job }) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(buildJobDetailPath(job));
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative group">
            <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-[#00B4D8] text-[10px] font-bold px-2 py-1 rounded">
                    {job.timePosted}
                </span>
                <button 
                  onClick={() => toast.success("Đã lưu tin tuyển dụng thành công!")}
                  className="text-gray-300 hover:text-[#00B4D8] transition-colors"
                >
                    <FaRegBookmark size={16} />
                </button>
            </div>

            <div className="flex gap-3 items-start">
                <div
                    onClick={handleNavigate}
                    className="w-12 h-12 rounded-lg flex-shrink-0 border border-gray-100 p-1.5 bg-white flex items-center justify-center cursor-pointer"
                >
                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                </div>

                <div className="flex-1">
                    <h3
                        onClick={handleNavigate}
                        className="font-bold text-base text-gray-800 group-hover:text-[#00B4D8] transition-colors mb-0.5 cursor-pointer"
                    >
                        {job.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mb-3">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <FaBriefcase className="text-gray-400" /> {job.category}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FaClock className="text-gray-400" /> {job.type}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FaDollarSign className="text-gray-400" /> {job.salary}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-gray-400" /> {job.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 md:mt-0 md:absolute md:bottom-4 md:right-4">
                <button
                    onClick={handleNavigate}
                    className="w-full md:w-auto px-5 py-1.5 bg-[#E6F6FD] hover:bg-[#00B4D8] text-[#00B4D8] hover:text-white font-bold rounded transition-all text-xs"
                >
                    Chi Tiết
                </button>
            </div>
        </div>
    );
};

export default JobCard;
