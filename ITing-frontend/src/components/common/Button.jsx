import React from 'react';

const Button = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    primary: "bg-[#5D5FEF] text-white hover:bg-[#4a4cdb]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
