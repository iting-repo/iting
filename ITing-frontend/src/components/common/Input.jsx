import React from 'react';

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6] transition-all ${className}`}
    {...props}
  />
);

export default Input;
