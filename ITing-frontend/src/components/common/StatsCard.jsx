import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsCard = ({ title, value, icon, percentage = "0", isIncrease = true, footerLabel }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0 flex-1">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-2" title={title}>{title}</h3>
           <div className="text-2xl font-bold text-[#3AB4E6]">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-50 text-[#3AB4E6] flex items-center justify-center text-lg shrink-0">
           {icon}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold mt-2">
         <span className={`${isIncrease ? 'text-green-500' : 'text-red-500'} flex items-center gap-1 shrink-0`}>
            {isIncrease ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
            {percentage}%
         </span>
         <span className="text-gray-400 truncate min-w-0" title={footerLabel || "So với hôm qua"}>{footerLabel || "So với hôm qua"}</span>
      </div>
    </div>
  );
};

export default StatsCard;