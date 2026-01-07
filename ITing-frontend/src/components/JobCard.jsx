import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark } from 'react-icons/fa';

const JobCard = ({ job }) => {
    const navigate = useNavigate(); // 2. Khởi tạo hook
    const [imageError, setImageError] = useState(false);

    // Hàm xử lý chuyển trang
    const handleNavigate = () => {
        // Chuyển sang đường dẫn /jobs/[ID của job]
        // Ví dụ: job.id = 1 => chuyển sang /jobs/1
        navigate(`/jobs/${job.id}`);
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative group">

            {/* Time & Bookmark */}
            <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-[#00B4D8] text-[10px] font-bold px-2 py-1 rounded">
                    {job.timePosted}
                </span>
                <button className="text-gray-300 hover:text-[#00B4D8] transition-colors">
                    <FaRegBookmark size={16} />
                </button>
            </div>

            {/* Main Info */}
            <div className="flex gap-3 items-start">

                {/* Logo - Bấm vào logo cũng chuyển trang luôn cho tiện */}
                <div
                    onClick={handleNavigate}
                    className="w-12 h-12 rounded-lg flex-shrink-0 border border-gray-100 p-1.5 bg-white flex items-center justify-center cursor-pointer overflow-hidden"
                >
                    {job.logo && !imageError ? (
                        <img
                            src={job.logo}
                            alt={job.company}
                            className="w-full h-full object-contain"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-lg rounded-md">
                            {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Tiêu đề - Bấm vào cũng chuyển trang */}
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

            {/* Action Button */}
            <div className="mt-4 md:mt-0 md:absolute md:bottom-4 md:right-4">
                <button
                    onClick={handleNavigate} // 3. Gắn sự kiện vào nút bấm
                    className="w-full md:w-auto px-5 py-1.5 bg-[#E6F6FD] hover:bg-[#00B4D8] text-[#00B4D8] hover:text-white font-bold rounded transition-all text-xs"
                >
                    Chi Tiết
                </button>
            </div>
        </div>
    );
};

export default JobCard;