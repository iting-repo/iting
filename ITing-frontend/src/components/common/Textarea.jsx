import React from 'react';

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-[#9D5CE9] transition-all ${className}`}
    {...props}
  />
);

export default Textarea;
