import React from 'react';

export const PageHeader = ({ title, description, children }) => (
  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {children && <div className="flex gap-3">{children}</div>}
  </div>
);
