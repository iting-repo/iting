import React, { useState, useMemo } from 'react';
import {
  FaShieldAlt, FaUserShield, FaBriefcase, FaUserTie,
  FaCheck, FaTimes, FaInfoCircle, FaSearch, FaChevronDown, FaChevronRight,
  FaEdit, FaSave, FaUndo, FaLock
} from 'react-icons/fa';
import { toast } from 'sonner';

// ── Hệ thống roles ──────────────────────────────────────────────
const SYSTEM_ROLES = [
  {
    key: 'ADMIN',
    label: 'Quản trị viên',
    description: 'Toàn quyền quản trị hệ thống, duyệt công ty, quản lý người dùng',
    icon: FaUserShield,
    color: 'amber',
    locked: true, // ADMIN không thể chỉnh sửa để tránh khóa hệ thống
  },
  {
    key: 'EMPLOYER',
    label: 'Nhà tuyển dụng',
    description: 'Đăng tin tuyển dụng, quản lý ứng viên, chỉnh sửa hồ sơ công ty',
    icon: FaBriefcase,
    color: 'sky',
    locked: false,
  },
  {
    key: 'CANDIDATE',
    label: 'Ứng viên',
    description: 'Tìm việc, ứng tuyển, quản lý hồ sơ cá nhân, theo dõi công ty',
    icon: FaUserTie,
    color: 'emerald',
    locked: false,
  },
];

// ── Permission matrix ────────────────────────────────────────────
const INITIAL_PERMISSIONS = [
  {
    group: 'Người dùng',
    permissions: [
      { key: 'users.view',    label: 'Xem danh sách',    ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'users.create',  label: 'Tạo tài khoản',    ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'users.edit',    label: 'Chỉnh sửa',        ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'users.ban',     label: 'Khóa / Mở khóa',   ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'users.delete',  label: 'Xóa tài khoản',    ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'users.export',  label: 'Xuất Excel',        ADMIN: true, EMPLOYER: false, CANDIDATE: false },
    ],
  },
  {
    group: 'Công việc',
    permissions: [
      { key: 'jobs.view',     label: 'Xem công việc',     ADMIN: true, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'jobs.create',   label: 'Đăng tin mới',      ADMIN: true, EMPLOYER: true,  CANDIDATE: false },
      { key: 'jobs.edit',     label: 'Chỉnh sửa tin',     ADMIN: true, EMPLOYER: true,  CANDIDATE: false },
      { key: 'jobs.delete',   label: 'Xóa tin',           ADMIN: true, EMPLOYER: true,  CANDIDATE: false },
      { key: 'jobs.approve',  label: 'Duyệt / Từ chối',   ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'jobs.apply',    label: 'Ứng tuyển',         ADMIN: false, EMPLOYER: false, CANDIDATE: true  },
      { key: 'jobs.save',     label: 'Lưu tin',           ADMIN: false, EMPLOYER: false, CANDIDATE: true  },
    ],
  },
  {
    group: 'Công ty',
    permissions: [
      { key: 'companies.view',    label: 'Xem thông tin',    ADMIN: true, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'companies.edit',    label: 'Chỉnh sửa hồ sơ', ADMIN: true, EMPLOYER: true,  CANDIDATE: false },
      { key: 'companies.verify',  label: 'Xác minh KYB',     ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'companies.suspend', label: 'Đình chỉ / Khôi phục', ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'companies.follow',  label: 'Theo dõi',         ADMIN: false, EMPLOYER: false, CANDIDATE: true  },
      { key: 'companies.review',  label: 'Đánh giá',         ADMIN: false, EMPLOYER: false, CANDIDATE: true  },
    ],
  },
  {
    group: 'Ứng tuyển',
    permissions: [
      { key: 'applications.view',   label: 'Xem đơn ứng tuyển', ADMIN: true, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'applications.manage', label: 'Quản lý trạng thái', ADMIN: true, EMPLOYER: true,  CANDIDATE: false },
      { key: 'applications.submit', label: 'Nộp đơn',           ADMIN: false, EMPLOYER: false, CANDIDATE: true  },
    ],
  },
  {
    group: 'Tin nhắn',
    permissions: [
      { key: 'messages.send',   label: 'Gửi tin nhắn',   ADMIN: false, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'messages.view',   label: 'Xem hội thoại',   ADMIN: false, EMPLOYER: true,  CANDIDATE: true  },
    ],
  },
  {
    group: 'Báo cáo & Kiểm duyệt',
    permissions: [
      { key: 'reports.create',  label: 'Gửi báo cáo vi phạm', ADMIN: false, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'reports.manage',  label: 'Xử lý báo cáo',       ADMIN: true,  EMPLOYER: false, CANDIDATE: false },
      { key: 'audit.view',     label: 'Xem nhật ký kiểm tra',  ADMIN: true,  EMPLOYER: false, CANDIDATE: false },
    ],
  },
  {
    group: 'Hệ thống',
    permissions: [
      { key: 'config.view',    label: 'Xem cấu hình',    ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'config.edit',    label: 'Chỉnh sửa cấu hình', ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'roles.view',     label: 'Xem phân quyền',   ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'roles.edit',     label: 'Chỉnh sửa quyền',  ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'notifications.send', label: 'Gửi thông báo hệ thống', ADMIN: true, EMPLOYER: false, CANDIDATE: false },
      { key: 'cms.manage',     label: 'Quản lý CMS',      ADMIN: true, EMPLOYER: false, CANDIDATE: false },
    ],
  },
  {
    group: 'Hồ sơ cá nhân',
    permissions: [
      { key: 'profile.view',   label: 'Xem hồ sơ',       ADMIN: true, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'profile.edit',   label: 'Chỉnh sửa hồ sơ', ADMIN: true, EMPLOYER: true,  CANDIDATE: true  },
      { key: 'cv.upload',      label: 'Tải lên CV',       ADMIN: false, EMPLOYER: false, CANDIDATE: true  },
      { key: 'cv.search',      label: 'Tìm kiếm CV',     ADMIN: true,  EMPLOYER: true,  CANDIDATE: false },
    ],
  },
];

// ── Color helper ──────────────────────────────────────────────────
const colorMap = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200', text: 'text-amber-700',   iconBg: 'bg-amber-100',   badge: 'bg-amber-500' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',   text: 'text-sky-700',     iconBg: 'bg-sky-100',     badge: 'bg-sky-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100', badge: 'bg-emerald-500' },
};

// ── Main Component ────────────────────────────────────────────────
const RoleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(
    INITIAL_PERMISSIONS.reduce((acc, g) => ({ ...acc, [g.group]: true }), {})
  );
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null); // role key being edited
  const [permissionGroups, setPermissionGroups] = useState(INITIAL_PERMISSIONS);
  const [originalPermissions, setOriginalPermissions] = useState(null); // snapshot for undo
  const [changedKeys, setChangedKeys] = useState(new Set()); // track changed cells

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return permissionGroups;
    const term = searchTerm.toLowerCase();
    return permissionGroups
      .map(g => ({
        ...g,
        permissions: g.permissions.filter(p =>
          p.label.toLowerCase().includes(term) || p.key.toLowerCase().includes(term)
        ),
      }))
      .filter(g => g.permissions.length > 0);
  }, [searchTerm, permissionGroups]);

  const totalPermissions = permissionGroups.reduce((s, g) => s + g.permissions.length, 0);
  const roleStats = SYSTEM_ROLES.map(role => ({
    ...role,
    permCount: permissionGroups.reduce(
      (s, g) => s + g.permissions.filter(p => p[role.key]).length, 0
    ),
  }));

  // ── Edit Mode ─────────────────────────────────────────────────
  const startEdit = (roleKey) => {
    setEditingRole(roleKey);
    setOriginalPermissions(JSON.parse(JSON.stringify(permissionGroups)));
    setChangedKeys(new Set());
    toast.info(`Đang chỉnh sửa quyền cho: ${SYSTEM_ROLES.find(r => r.key === roleKey)?.label}`);
  };

  const cancelEdit = () => {
    if (originalPermissions) {
      setPermissionGroups(originalPermissions);
    }
    setEditingRole(null);
    setOriginalPermissions(null);
    setChangedKeys(new Set());
    toast.info('Đã hủy thay đổi');
  };

  const saveEdit = () => {
    // In a real app: call API to persist permission changes
    // await axiosInstance.put(`/admin/roles/${editingRole}/permissions`, payload);
    toast.success(`Đã lưu ${changedKeys.size} thay đổi quyền cho ${SYSTEM_ROLES.find(r => r.key === editingRole)?.label}`);
    setEditingRole(null);
    setOriginalPermissions(null);
    setChangedKeys(new Set());
  };

  const togglePermission = (permKey, roleKey) => {
    if (editingRole !== roleKey) return;
    const trackKey = `${permKey}::${roleKey}`;
    setPermissionGroups(prev =>
      prev.map(g => ({
        ...g,
        permissions: g.permissions.map(p =>
          p.key === permKey ? { ...p, [roleKey]: !p[roleKey] } : p
        ),
      }))
    );
    setChangedKeys(prev => {
      const next = new Set(prev);
      if (next.has(trackKey)) next.delete(trackKey); else next.add(trackKey);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaShieldAlt className="text-[#3AB4E6]" />
            Phân quyền RBAC
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {SYSTEM_ROLES.length} vai trò · {totalPermissions} quyền hạn · Quản lý theo mô hình Role-Based Access Control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm quyền hạn..."
              className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/20 w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleStats.map((role) => {
          const c = colorMap[role.color];
          const Icon = role.icon;
          const isSelected = selectedRole === role.key;
          const isEditing = editingRole === role.key;
          return (
            <div
              key={role.key}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                isEditing
                  ? `${c.border} ${c.bg} shadow-lg ring-2 ring-offset-1 ring-${role.color}-300`
                  : isSelected
                  ? `${c.border} ${c.bg} shadow-md`
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => !isEditing && setSelectedRole(isSelected ? null : role.key)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.iconBg} ${c.text} flex items-center justify-center shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">{role.label}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${c.badge}`}>
                        {role.key}
                      </span>
                      {role.locked && (
                        <FaLock size={10} className="text-slate-400" title="Không thể chỉnh sửa" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700">
                        {role.permCount}/{totalPermissions} quyền
                      </span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.badge} transition-all`}
                          style={{ width: `${(role.permCount / totalPermissions) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Edit / Save / Cancel buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                    >
                      <FaSave size={11} /> Lưu ({changedKeys.size})
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      <FaUndo size={11} /> Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => !role.locked && (editingRole ? toast.warning('Hãy lưu hoặc hủy chỉnh sửa hiện tại trước.') : startEdit(role.key))}
                    disabled={role.locked}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      role.locked
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#3AB4E6] hover:text-[#3AB4E6]'
                    }`}
                  >
                    {role.locked ? <><FaLock size={10} /> Không thể sửa</> : <><FaEdit size={11} /> Chỉnh sửa quyền</>}
                  </button>
                )}
              </div>

              {isEditing && (
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${c.badge} animate-pulse`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#3AB4E6]" />
            <span className="font-bold text-slate-800">Ma trận quyền hạn</span>
            {selectedRole && (
              <span className="ml-2 px-2.5 py-0.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">
                Đang lọc: {SYSTEM_ROLES.find(r => r.key === selectedRole)?.label}
              </span>
            )}
            {editingRole && (
              <span className="ml-2 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 animate-pulse">
                ✏️ Đang chỉnh sửa: {SYSTEM_ROLES.find(r => r.key === editingRole)?.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FaInfoCircle size={12} />
            {editingRole ? 'Click ô để bật/tắt quyền' : 'Chọn "Chỉnh sửa quyền" để thay đổi'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-[45%]">
                  Quyền hạn
                </th>
                {SYSTEM_ROLES.map(role => {
                  const c = colorMap[role.color];
                  const isHighlighted = !selectedRole || selectedRole === role.key;
                  const isEditingThis = editingRole === role.key;
                  return (
                    <th
                      key={role.key}
                      className={`px-4 py-3 text-center transition-opacity ${isHighlighted ? 'opacity-100' : 'opacity-30'}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text} ${c.border} border ${isEditingThis ? 'ring-2 ring-amber-400' : ''}`}>
                          {role.label}
                        </span>
                        {isEditingThis && (
                          <span className="text-[10px] text-amber-600 font-bold">✏️ ĐANG SỬA</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <React.Fragment key={group.group}>
                  {/* Group Header */}
                  <tr
                    className="bg-slate-25 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleGroup(group.group)}
                  >
                    <td colSpan={4} className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {expandedGroups[group.group]
                          ? <FaChevronDown size={10} className="text-slate-400" />
                          : <FaChevronRight size={10} className="text-slate-400" />
                        }
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          {group.group}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({group.permissions.length} quyền)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Permission Rows */}
                  {expandedGroups[group.group] && group.permissions.map((perm, pIdx) => (
                    <tr
                      key={perm.key}
                      className={`border-b border-slate-50 transition-colors hover:bg-sky-50/30 ${
                        pIdx === group.permissions.length - 1 ? 'border-b-slate-100' : ''
                      }`}
                    >
                      <td className="px-6 py-3 pl-12">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{perm.label}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{perm.key}</p>
                        </div>
                      </td>
                      {SYSTEM_ROLES.map(role => {
                        const isHighlighted = !selectedRole || selectedRole === role.key;
                        const isEditingThis = editingRole === role.key;
                        const isChanged = changedKeys.has(`${perm.key}::${role.key}`);
                        const allowed = perm[role.key];
                        return (
                          <td
                            key={role.key}
                            className={`px-4 py-3 text-center transition-opacity ${isHighlighted ? 'opacity-100' : 'opacity-20'}`}
                          >
                            <div className="flex justify-center">
                              <button
                                onClick={() => togglePermission(perm.key, role.key)}
                                disabled={!isEditingThis}
                                title={isEditingThis ? (allowed ? 'Click để tắt quyền' : 'Click để bật quyền') : ''}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isEditingThis
                                    ? 'cursor-pointer hover:scale-110 hover:shadow-md'
                                    : 'cursor-default'
                                } ${
                                  allowed
                                    ? `bg-emerald-100 text-emerald-600 ${isChanged ? 'ring-2 ring-amber-400' : ''}`
                                    : `bg-slate-50 text-slate-300 ${isChanged ? 'ring-2 ring-amber-400' : ''}`
                                }`}
                              >
                                {allowed ? <FaCheck size={12} /> : <FaTimes size={10} />}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    <FaSearch className="mx-auto mb-2 text-2xl" />
                    <p className="text-sm">Không tìm thấy quyền hạn nào phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="bg-gradient-to-br from-slate-50 to-sky-50/30 rounded-2xl border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-[#3AB4E6]" />
          Kiến trúc RBAC — ITing Platform
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Backend</p>
            <p className="text-sm text-slate-700">
              Spring Security <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">@PreAuthorize</code> + JWT Role Claims. Mỗi endpoint được bảo vệ bởi <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">hasRole()</code>.
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frontend</p>
            <p className="text-sm text-slate-700">
              Route Guard với <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">PrivateRoute</code> kiểm tra <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">allowedRoles</code> từ JWT token trước khi render.
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Database</p>
            <p className="text-sm text-slate-700">
              Enum <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">Role</code> lưu trong bảng <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">account</code>. Hỗ trợ normalize legacy (USER→CANDIDATE, COMPANY→EMPLOYER).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
