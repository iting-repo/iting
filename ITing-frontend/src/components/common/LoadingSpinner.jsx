import React from 'react';
import { FaCircleNotch } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-[#9D5CE9]',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <FaCircleNotch 
        className={`animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary}`}
      />
    </div>
  );
};

export default LoadingSpinner;
