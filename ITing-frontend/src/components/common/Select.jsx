import React from 'react';

const Select = ({ value, onChange, children, className = '', ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] bg-white text-sm text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;
