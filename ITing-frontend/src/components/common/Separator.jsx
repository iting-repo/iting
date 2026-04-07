import React from 'react';

const Separator = ({ className = "" }) => {
  return (
    <div className={`h-[1px] w-full bg-slate-100 ${className}`} />
  );
};

export default Separator;
