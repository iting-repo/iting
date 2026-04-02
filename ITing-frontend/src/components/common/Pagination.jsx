import React from 'react';

const Pagination = ({ 
  totalPages, 
  currentPage, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) => {
  // Determine total pages if not provided directly
  const finalTotalPages = totalPages || Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Calculate showing range if items info is provided
  const hasItemsInfo = totalItems !== undefined && itemsPerPage !== undefined;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (finalTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= finalTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(finalTotalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < finalTotalPages - 2) pages.push('...');
      if (!pages.includes(finalTotalPages)) pages.push(finalTotalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-white">
      <div className="text-sm text-slate-500">
        {hasItemsInfo ? (
          <>Hiển thị <span className="font-semibold text-slate-700">{startItem}-{endItem}</span> trên <span className="font-semibold text-slate-700">{totalItems}</span> bản ghi</>
        ) : (
          <>Trang <span className="font-semibold text-slate-700">{currentPage}</span> trên <span className="font-semibold text-slate-700">{finalTotalPages}</span></>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-9 min-w-[36px] items-center justify-center rounded-lg border border-slate-200 px-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          Trước
        </button>

        <div className="flex items-center gap-1">
          {getPages().map((p, i) => (
            p === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-slate-400">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  currentPage === p
                    ? "bg-[#3AB4E6] text-white shadow-md shadow-sky-100"
                    : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= finalTotalPages}
          className="flex h-9 min-w-[36px] items-center justify-center rounded-lg border border-slate-200 px-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
