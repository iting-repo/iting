import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, icon, action, className = "" }) => (
  <div className={`mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
      {icon} {title}
    </h3>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);
