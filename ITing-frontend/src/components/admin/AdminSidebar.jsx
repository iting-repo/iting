import React, { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Bell, BookOpen, Building2,
  FileText, HelpCircle, LayoutDashboard,
  Layers, Image, Settings, Shield, ShieldCheck, Users, CreditCard
} from 'lucide-react';
import { usePermissions } from '../../contexts/PermissionsContext';
import './AdminSidebar.css';

/* ─── Menu data ─────────────────────────────────────────────────────────────
 * Mỗi item có thể khai báo `permission` (mã quyền platform). Nếu user không có
 * quyền đó (và không phải super admin) → item bị ẩn. Item không có `permission`
 * luôn hiển thị. */
const SIDEBAR_SECTIONS = [
  {
    id: 'overview',
    title: 'TỔNG QUAN',
    items: [
      { path: '/admin/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
      { path: '/admin/notifications', label: 'Thông báo', icon: Bell },
    ],
  },
  {
    id: 'management',
    title: 'QUẢN LÝ',
    items: [
      { path: '/admin/jobs', label: 'Quản lý công việc', icon: BookOpen, permission: 'platform.jobs.view' },
      { path: '/admin/companies', label: 'Quản lý công ty', icon: Building2, permission: 'platform.companies.view' },
      { path: '/admin/users', label: 'Người dùng', icon: Users, permission: 'platform.users.view' },
      { path: '/admin/reports', label: 'Báo cáo', icon: FileText, permission: 'platform.reports.view' },
      { path: '/admin/subscriptions', label: 'Gói HR & Giá', icon: CreditCard, permission: 'platform.finance.view' },
      { path: '/admin/affiliations', label: 'Xác thực công ty', icon: ShieldCheck, permission: 'platform.companies.approve' },
    ],
  },
  {
    id: 'cms',
    title: 'CMS',
    items: [
      { path: '/admin/blog', label: 'Blog', icon: BookOpen, permission: 'platform.cms.manage' },
      { path: '/admin/faq', label: 'FAQ', icon: HelpCircle, permission: 'platform.cms.manage' },
      { path: '/admin/categories', label: 'Danh mục', icon: Layers, permission: 'platform.cms.manage' },
      { path: '/admin/banner', label: 'Banner', icon: Image, permission: 'platform.cms.manage' },
    ],
  },
  {
    id: 'system',
    title: 'HỆ THỐNG',
    items: [
      { path: '/admin/roles', label: 'Phân quyền', icon: Shield, permission: 'platform.roles.view' },
      { path: '/admin/audit', label: 'Nhật ký kiểm tra', icon: FileText, permission: 'platform.audit.view' },
      { path: '/admin/config', label: 'Cấu hình', icon: Settings, permission: 'platform.system.config' },
    ],
  },
];

/* ─── Collapsible section ───────────────────────────────────────────────── */
const SidebarSection = ({ section, isExpanded, isCollapsed, onToggle }) => {
  const location = useLocation();
  const hasActiveChild = section.items.some(i => location.pathname.startsWith(i.path));

  return (
    <div className="adm-sb__section">
      {/* Section header — clickable to expand/collapse items */}
      {!isCollapsed && (
        <button
          type="button"
          className={`adm-sb__section-header ${hasActiveChild ? 'adm-sb__section-header--active' : ''}`}
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          <span className="adm-sb__section-title">{section.title}</span>
          <ChevronDown
            size={14}
            className={`adm-sb__section-chevron ${isExpanded ? '' : 'adm-sb__section-chevron--closed'}`}
          />
        </button>
      )}

      {/* Collapsed mode: separator */}
      {isCollapsed && <div className="adm-sb__collapsed-sep" />}

      {/* Items container — animated height */}
      <div
        className={`adm-sb__items ${isExpanded || isCollapsed ? 'adm-sb__items--open' : 'adm-sb__items--closed'}`}
      >
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) =>
                `adm-sb__link ${isCollapsed ? 'adm-sb__link--icon-only' : ''} ${isActive ? 'adm-sb__link--active' : ''}`
              }
            >
              <Icon className="adm-sb__icon" />
              {!isCollapsed && <span className="adm-sb__label">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main sidebar ──────────────────────────────────────────────────────── */
const AdminSidebar = ({ isCollapsed, onToggle }) => {
  const { has } = usePermissions();

  // Lọc item theo quyền; bỏ section rỗng. Item không khai báo permission luôn hiện.
  const visibleSections = SIDEBAR_SECTIONS
    .map(section => ({
      ...section,
      items: section.items.filter(item => has(item.permission)),
    }))
    .filter(section => section.items.length > 0);

  // Mặc định GẬP hết các nhóm — chỉ xổ ra khi người dùng bấm vào tiêu đề nhóm.
  // Riêng nhóm chứa trang đang mở thì tự xổ để thấy vị trí hiện tại.
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(() =>
    SIDEBAR_SECTIONS.reduce((acc, s) => {
      const hasActive = s.items.some((i) => location.pathname.startsWith(i.path));
      return { ...acc, [s.id]: hasActive };
    }, {})
  );

  const toggleSection = useCallback((id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <aside className={`adm-sb ${isCollapsed ? 'adm-sb--collapsed' : ''}`}>
      {/* Toggle button */}
      <div className="adm-sb__toggle-bar">
        <button
          type="button"
          className="adm-sb__toggle-btn"
          onClick={onToggle}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Brand mark (collapsed only) */}
      {isCollapsed && (
        <div className="adm-sb__brand-mark">
          <LayoutDashboard size={22} />
        </div>
      )}

      {/* Navigation sections */}
      <nav className="adm-sb__nav">
        {visibleSections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            isExpanded={expandedSections[section.id]}
            isCollapsed={isCollapsed}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="adm-sb__footer">
        {!isCollapsed && (
          <span className="adm-sb__version">ITing Admin v2.0</span>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
