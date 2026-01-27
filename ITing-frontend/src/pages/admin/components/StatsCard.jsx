import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatsCard = ({ title, value, icon, percentage, isIncrease }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</h3>
          <div className="text-2xl font-bold text-[#3ab4e6]">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-50 text-[#3ab4e6] flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold">
        <span className={`${isIncrease ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
          {isIncrease ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
          {percentage}%
        </span>
        <span className="text-gray-400">Up from yesterday</span>
      </div>
    </div>
  );
};

export default StatsCard;