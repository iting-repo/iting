import React from 'react';
import { X } from "lucide-react";
import { useModalEscape } from "../../hooks/useModalEscape";

const Dialog = ({ open, onClose, title, children }) => {
  useModalEscape(open ? onClose : null);
  
  if (!open) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6 transition-all animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl relative animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
