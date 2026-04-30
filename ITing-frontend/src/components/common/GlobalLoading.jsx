import React from 'react';

const GlobalLoading = ({ message = "Đang tải...", fullScreen = true }) => {
  if (!fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#3AB4E6] rounded-full border-t-transparent animate-spin"></div>
        </div>
        {message && <p className="text-sm font-medium text-gray-500 animate-pulse">{message}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center justify-center p-6 space-y-5">
        {/* Vòng xoay CSS */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-[4px] border-blue-50 rounded-full"></div>
          <div className="absolute inset-0 border-[4px] border-[#3AB4E6] rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Chữ hiển thị thông báo */}
        {message && (
          <h3 className="text-base font-semibold text-gray-700 animate-pulse tracking-wide">
            {message}
          </h3>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;
