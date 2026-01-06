import React from 'react';
import { BsBriefcaseFill } from 'react-icons/bs';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all">
            <div className="flex flex-col items-center">
                {/* Outer Ring */}
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#3AB4E6] rounded-full animate-spin border-t-transparent shadow-lg"></div>

                    {/* Center Icon (Optional - adds branding) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BsBriefcaseFill className="text-[#3AB4E6] text-xl animate-pulse" />
                    </div>
                </div>

                {/* Text */}
                <div className="mt-4 text-gray-500 font-medium tracking-wide animate-pulse">
                    Đang tải trang...
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
