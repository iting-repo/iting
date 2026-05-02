import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

/**
 * ActionMenuPortal - Một component generic dùng cho các bảng Admin
 * Giúp tránh lỗi bị che khuất (clipping) bởi bảng có overflow.
 */
export const ActionMenuPortal = ({ 
  id, 
  openMenuId, 
  setOpenMenuId, 
  actions, // Mảng các action { label, icon: Icon, onClick, className }
  className = "" 
}) => {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const isOpen = openMenuId === id;

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.right - 200, // Chiều rộng menu khoảng 200px (w-48/w-52)
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, setOpenMenuId]);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isOpen ? null : id);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[299]"
            onClick={() => setOpenMenuId(null)}
          />
          <div
            ref={menuRef}
            className="fixed z-[300] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {actions.map((action, index) => {
              if (action.hidden) return null;
              
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(null);
                    // Sử dụng requestAnimationFrame để đảm bảo menu đóng trước khi thực hiện logic
                    requestAnimationFrame(() => {
                      action.onClick();
                    });
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${action.className || 'text-slate-700'}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
