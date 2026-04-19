import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BarChart3, Bell, BookOpen, Building2, CheckCircle, FileText, HelpCircle, LayoutDashboard, Layers, Image, Settings, Shield, Users } from "lucide-react";

const SIDEBAR_SECTIONS = [
  {
    title: "TỔNG QUAN",
    items: [
      { path: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
      { path: "/admin/notifications", label: "Thông báo", icon: Bell },
    ],
  },
  {
    title: "QUẢN LÝ",
    items: [
      { path: "/admin/jobs", label: "Quản lý công việc", icon: BookOpen },
      { path: "/admin/companies", label: "Quản lý công ty", icon: Building2 },
      { path: "/admin/users", label: "Người dùng", icon: Users },
      { path: "/admin/reports", label: "Báo cáo", icon: FileText },
    ],
  },
  {
    title: "CMS",
    items: [
      { path: "/admin/blog", label: "Blog", icon: BookOpen },
      { path: "/admin/faq", label: "FAQ", icon: HelpCircle },
      { path: "/admin/pages", label: "Trang tĩnh", icon: FileText },
      { path: "/admin/categories", label: "Danh mục", icon: Layers },
      { path: "/admin/banner", label: "Banner", icon: Image },
    ],
  },
  {
    title: "HỆ THỐNG",
    items: [
      { path: "/admin/roles", label: "Phân quyền", icon: Shield },
      { path: "/admin/audit", label: "Nhật ký kiểm tra", icon: FileText },
      { path: "/admin/stats", label: "Thống kê", icon: BarChart3 },
      { path: "/admin/config", label: "Cấu hình", icon: Settings },
    ],
  },
];

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Đồng bộ margin của layout chính khi đóng/mở sidebar
  useEffect(() => {
    const mainEls = document.querySelectorAll('main');
    mainEls.forEach(main => {
      if (isOpen) {
        main.classList.remove('ml-16', 'md:ml-16');
        if (main.classList.contains('min-w-0')) {
          main.classList.add('ml-52');
        }
      } else {
        main.classList.remove('ml-52', 'md:ml-52');
        if (main.classList.contains('min-w-0')) {
          main.classList.add('ml-16');
        }
      }
    });
  }, [isOpen]);

  return (
    <aside className={`fixed left-0 top-14 bottom-0 ${isOpen ? 'w-52' : 'w-16'} bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar z-40 transition-all duration-300`}>
      {/* Nút Toggle Sidebar */}
      <div className="flex items-center justify-end p-2 border-b border-gray-100 h-10 sticky top-0 bg-white z-10 hidden md:flex">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          title={isOpen ? "Thu gọn" : "Mở rộng"}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="py-2">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-4">
            {isOpen && <p className="px-4 text-[10px] font-bold text-gray-500 tracking-wider mb-2 mt-2">{section.title}</p>}
            {!isOpen && <div className="h-4 mt-2 border-b border-gray-100 w-6 mx-auto mb-2"></div>}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={!isOpen ? item.label : ""}
                    className={({ isActive }) =>
                      `w-full flex items-center ${isOpen ? 'gap-2.5 px-4' : 'justify-center px-0'} py-2.5 text-sm transition-colors ${isActive
                        ? "bg-[#3AB4E6]/10 text-[#3AB4E6] font-bold border-r-4 border-[#3AB4E6]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r-4 border-transparent"
                      }`
                    }
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
