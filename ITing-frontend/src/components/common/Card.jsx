import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-2 space-y-1.5 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-bold text-slate-900 tracking-tight leading-none ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-500 font-medium ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
