import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Bell, BookOpen, Building2, CheckCircle, FileText, HelpCircle, LayoutDashboard, Layers, Image, Settings, Shield, Users } from "lucide-react";

const SIDEBAR_SECTIONS = [
  {
    title: "TỔNG QUAN",
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/notifications", label: "Thông báo", icon: Bell },
    ],
  },
  {
    title: "QUẢN LÝ",
    items: [
      { path: "/admin/approvals", label: "Duyệt công việc", icon: CheckCircle },
      { path: "/admin/companies", label: "Duyệt công ty", icon: Building2 },
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
      { path: "/admin/audit", label: "Audit Log", icon: FileText },
      { path: "/admin/stats", label: "Thống kê", icon: BarChart3 },
      { path: "/admin/config", label: "Cấu hình", icon: Settings },
    ],
  },
];

const AdminSidebar = () => {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-52 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar z-40">
      <nav className="py-4">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-4">
            <p className="px-4 text-[10px] font-bold text-gray-500 tracking-wider mb-2 mt-2">{section.title}</p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isActive 
                          ? "bg-[#3AB4E6]/10 text-[#3AB4E6] font-bold border-r-4 border-[#3AB4E6]" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`
                    }
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {item.label}
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