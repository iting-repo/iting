import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { toast } from 'sonner';
import { buildJobDetailPath, getCompanyLogoUrl } from '../utils/jobUrl';
import { CompanyLogo } from './common';
import axiosInstance from '../utils/axiosInstance';
import { storage } from '../utils/storage';

const JobCard = ({ job }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const token = storage.getToken();
    const canSave = Boolean(token);

    useEffect(() => {
        if (!canSave || !job?.id) {
            setIsSaved(false);
            return;
        }

        let active = true;

        const checkSaved = async () => {
            try {
                const response = await axiosInstance.get(`/candidates/saved-jobs/${job.id}/check`);
                if (active) {
                    setIsSaved(Boolean(response?.saved));
                }
            } catch {
                if (active) {
                    setIsSaved(false);
                }
            }
        };

        checkSaved();

        return () => {
            active = false;
        };
    }, [canSave, job?.id]);

    const handleNavigate = () => {
        navigate(buildJobDetailPath(job));
    };

    const handleToggleSave = async (event) => {
        event.stopPropagation();

        if (!canSave) {
            toast.error('Vui lòng đăng nhập để lưu công việc.');
            return;
        }

        if (!job?.id || isSaving) {
            return;
        }

        setIsSaving(true);
        try {
            if (isSaved) {
                await axiosInstance.delete(`/candidates/saved-jobs/${job.id}`);
                setIsSaved(false);
                toast.success('Đã bỏ lưu công việc.');
            } else {
                await axiosInstance.post(`/candidates/saved-jobs/${job.id}`);
                setIsSaved(true);
                toast.success('Đã lưu tin tuyển dụng thành công!');
            }
        } catch (error) {
            const message = error?.message || 'Không thể lưu công việc lúc này.';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                    <span className="bg-blue-50 text-[#00B4D8] text-[10px] font-bold px-2 py-1 rounded">
                        {job.timePosted}
                    </span>
                    {job.isAiSuggested && (
                        <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                             AI Suggestion
                        </span>
                    )}
                </div>
                <button 
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`transition-colors ${isSaved ? 'text-[#00B4D8]' : 'text-gray-300 hover:text-[#00B4D8]'} ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {isSaved ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
                </button>
            </div>

            <div className="flex gap-3 items-start">
                <div
                    onClick={handleNavigate}
                    className="w-12 h-12 rounded-lg flex-shrink-0 border border-gray-100 p-1.5 bg-white flex items-center justify-center cursor-pointer"
                >
                    <CompanyLogo 
                        logoUrl={job.logo || job.companyLogo || job.logoUrl}
                        companyId={job.companyId}
                        companyName={job.company}
                        className="w-full h-full object-contain"
                    />
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
