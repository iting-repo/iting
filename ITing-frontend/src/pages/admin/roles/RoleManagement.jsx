import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FaShieldAlt,
  FaUserShield,
  FaBuilding,
  FaHourglassHalf,
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
  FaPaperPlane,
  FaLock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaUsers,
  FaUserPlus,
  FaUserCog,
  FaSearch,
} from 'react-icons/fa';
import { toast } from 'sonner';
import Dialog from '../../../components/common/Dialog';
import rbacService from '../../../services/rbacService';

// ── Tham chiếu hiển thị ───────────────────────────────────────────────
const STATUS_META = {
  DRAFT: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  REJECTED: { label: 'Bị từ chối', cls: 'bg-red-50 text-red-700 border-red-200' },
  ACTIVE: { label: 'Đang hoạt động', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DISABLED: { label: 'Vô hiệu hóa', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const RISK_META = {
  LOW: { label: 'Thấp', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEDIUM: { label: 'Trung bình', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGH: { label: 'Cao', cls: 'bg-red-50 text-red-700 border-red-200' },
};

const MODULE_LABEL = {
  USER: 'Người dùng',
  JOB: 'Công việc',
  COMPANY: 'Công ty',
  REPORT: 'Báo cáo',
  CMS: 'Nội dung',
  SYSTEM: 'Hệ thống',
  FINANCE: 'Tài chính',
  APPLICATION: 'Ứng tuyển',
};

const TABS = [
  { key: 'platform', label: 'Vai trò nền tảng ITing', icon: FaUserShield, scope: 'PLATFORM' },
  { key: 'company', label: 'Vai trò doanh nghiệp', icon: FaBuilding, scope: 'COMPANY' },
  { key: 'staff', label: 'Tài khoản nội bộ', icon: FaUserCog, scope: null },
  { key: 'pending', label: 'Yêu cầu chờ duyệt', icon: FaHourglassHalf, scope: null },
];

const ACCOUNT_TYPE_META = {
  INTERNAL_STAFF: {
    label: 'Nội bộ ITing',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  COMPANY_STAFF: { label: 'Nhân sự công ty', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  PUBLIC: { label: 'Công khai', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const Badge = ({ meta }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${meta.cls}`}>
    {meta.label}
  </span>
);

// Lưới chọn quyền (dùng chung cho tạo mới & sửa role) — nhóm theo module.
const PermissionPicker = ({ perms, selected, onToggle }) => {
  const grouped = useMemo(() => {
    const g = {};
    perms.forEach((p) => (g[p.module] = g[p.module] || []).push(p));
    return g;
  }, [perms]);
  return (
    <div className="space-y-3 max-h-[34vh] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3">
      {Object.entries(grouped).map(([mod, list]) => (
        <div key={mod}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {MODULE_LABEL[mod] || mod}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {list.map((p) => {
              const on = selected.has(p.code);
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => onToggle(p.code)}
                  className={`flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 border text-left transition-colors ${
                    on
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${on ? 'bg-emerald-500 text-white' : 'border border-slate-300'}`}
                  >
                    {on && <FaCheck size={8} />}
                  </span>
                  <span className="truncate">{p.name}</span>
                  {p.riskLevel === 'HIGH' && (
                    <FaExclamationTriangle
                      size={10}
                      className="text-red-400 ml-auto shrink-0"
                      title="Rủi ro cao"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────
const RoleManagement = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState({ platform: [], company: [], pending: [] });
  const [loading, setLoading] = useState(false);
  const [detailRole, setDetailRole] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // ── Data loading ────────────────────────────────────────────────────
  const loadPermissions = useCallback(async () => {
    try {
      setPermissions(await rbacService.getPermissions());
    } catch {
      toast.error('Không tải được catalog quyền');
    }
  }, []);

  const loadRoles = useCallback(async (tab) => {
    if (tab === 'staff') return; // tab này tự fetch trong StaffManagement
    try {
      setLoading(true);
      if (tab === 'pending') {
        const data = await rbacService.getPendingRoles();
        setRoles((prev) => ({ ...prev, pending: data || [] }));
      } else {
        const scope = tab === 'platform' ? 'PLATFORM' : 'COMPANY';
        const data = await rbacService.getRoles(scope);
        setRoles((prev) => ({ ...prev, [tab]: data || [] }));
      }
    } catch {
      toast.error('Không tải được danh sách vai trò');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);
  useEffect(() => {
    loadRoles(activeTab);
  }, [activeTab, loadRoles]);

  const refresh = () => {
    loadRoles(activeTab);
    loadRoles('pending');
  };

  const permByScope = useMemo(
    () => ({
      PLATFORM: permissions.filter((p) => p.scope === 'PLATFORM'),
      COMPANY: permissions.filter((p) => p.scope === 'COMPANY'),
    }),
    [permissions]
  );

  const permByCode = useMemo(
    () => Object.fromEntries(permissions.map((p) => [p.code, p])),
    [permissions]
  );

  // ── Actions ─────────────────────────────────────────────────────────
  const doApprove = async (role) => {
    try {
      await rbacService.approveRole(role.id);
      toast.success(`Đã duyệt & kích hoạt "${role.name}"`);
      refresh();
    } catch (e) {
      toast.error(e?.message || 'Duyệt thất bại');
    }
  };
  const doReject = async () => {
    try {
      await rbacService.rejectRole(rejectTarget.id, rejectReason);
      toast.success(`Đã từ chối "${rejectTarget.name}"`);
      setRejectTarget(null);
      setRejectReason('');
      refresh();
    } catch (e) {
      toast.error(e?.message || 'Từ chối thất bại');
    }
  };
  const doSubmit = async (role) => {
    try {
      await rbacService.submitRole(role.id);
      toast.success('Đã gửi duyệt');
      refresh();
      setDetailRole(null);
    } catch (e) {
      toast.error(e?.message || 'Gửi duyệt thất bại');
    }
  };
  const doToggle = async (role) => {
    const next = role.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await rbacService.setRoleStatus(role.id, next);
      toast.success(next === 'ACTIVE' ? 'Đã kích hoạt' : 'Đã vô hiệu hóa');
      refresh();
      setDetailRole(null);
    } catch (e) {
      toast.error(e?.message || 'Thao tác thất bại');
    }
  };
  const doDelete = async (role) => {
    if (!window.confirm(`Xóa vai trò "${role.name}"?`)) return;
    try {
      await rbacService.deleteRole(role.id);
      toast.success('Đã xóa vai trò');
      refresh();
      setDetailRole(null);
    } catch (e) {
      toast.error(e?.message || 'Xóa thất bại');
    }
  };

  const pendingCount = roles.pending.length;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaShieldAlt className="text-[#3AB4E6] shrink-0" />
            <span>Phân quyền RBAC</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tách quyền nền tảng (PLATFORM) & doanh nghiệp (COMPANY) · Least-privilege + quy trình
            duyệt vai trò
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-sm font-bold transition-colors shrink-0"
        >
          <FaPlus size={12} /> Tạo vai trò mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                active
                  ? 'text-[#3AB4E6] border-b-2 border-[#3AB4E6]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} /> {t.label}
              {t.key === 'pending' && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Đang tải…</div>
      ) : activeTab === 'pending' ? (
        <PendingTab
          roles={roles.pending}
          permByCode={permByCode}
          onApprove={doApprove}
          onReject={(r) => setRejectTarget(r)}
        />
      ) : activeTab === 'staff' ? (
        <StaffManagement />
      ) : activeTab === 'company' ? (
        <div className="space-y-8">
          <CompanyMembers companyRoles={roles.company} />
          <div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaBuilding size={13} className="text-slate-400" /> Danh mục vai trò doanh nghiệp
            </h3>
            <RoleGrid roles={roles.company} onSelect={setDetailRole} />
          </div>
        </div>
      ) : (
        <RoleGrid roles={roles[activeTab]} onSelect={setDetailRole} />
      )}

      {/* Detail dialog */}
      {detailRole && (
        <RoleDetailDialog
          role={detailRole}
          permByCode={permByCode}
          permByScope={permByScope}
          onClose={() => setDetailRole(null)}
          onSubmit={doSubmit}
          onToggle={doToggle}
          onDelete={doDelete}
          onSaved={() => {
            setDetailRole(null);
            refresh();
          }}
        />
      )}

      {/* Create dialog */}
      {showCreate && (
        <CreateRoleDialog
          permByScope={permByScope}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Từ chối vai trò"
        widthClass="max-w-md"
      >
        <p className="text-sm text-slate-600 mb-3">
          Từ chối vai trò <b>{rejectTarget?.name}</b>. Nêu lý do để người tạo chỉnh sửa:
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          placeholder="Lý do từ chối…"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3AB4E6]"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setRejectTarget(null)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={doReject}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold"
          >
            Từ chối
          </button>
        </div>
      </Dialog>
    </div>
  );
};

// ── Role grid (platform / company) ─────────────────────────────────────
const RoleGrid = ({ roles, onSelect }) => {
  if (!roles.length) {
    return <div className="text-center py-16 text-slate-400 text-sm">Chưa có vai trò nào.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onSelect(role)}
          className="text-left p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-[#3AB4E6]/50 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 truncate">{role.name}</h3>
                {role.systemRole && (
                  <FaLock size={10} className="text-slate-400 shrink-0" title="Vai trò hệ thống" />
                )}
              </div>
              <code className="text-[11px] text-slate-400 font-mono">{role.code}</code>
            </div>
            <Badge meta={STATUS_META[role.status] || STATUS_META.DRAFT} />
          </div>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[2rem]">
            {role.description || '—'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">{role.permissionCount} quyền</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Rủi ro</span>
            <Badge meta={RISK_META[role.highestRisk] || RISK_META.LOW} />
            {role.systemRole && (
              <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Hệ thống
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

// ── Pending approvals tab ──────────────────────────────────────────────
const PendingTab = ({ roles, permByCode, onApprove, onReject }) => {
  if (!roles.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <FaCheck className="mx-auto mb-2 text-2xl text-emerald-300" />
        <p className="text-sm">Không có yêu cầu nào đang chờ duyệt.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800">{role.name}</h3>
                <code className="text-[11px] text-slate-400 font-mono">{role.code}</code>
                <Badge
                  meta={{
                    label: role.scope === 'PLATFORM' ? 'Nền tảng' : 'Doanh nghiệp',
                    cls: 'bg-slate-100 text-slate-600 border-slate-200',
                  }}
                />
                <span className="text-xs text-slate-500">Rủi ro</span>
                <Badge meta={RISK_META[role.highestRisk] || RISK_META.LOW} />
              </div>
              {role.reason && (
                <p className="text-xs text-slate-500 mt-2">
                  <b>Lý do:</b> {role.reason}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">Người tạo: {role.createdByName || '—'}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.permissions.map((code) => (
                  <span
                    key={code}
                    className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600"
                  >
                    {permByCode[code]?.name || code}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex md:flex-col gap-2 shrink-0">
              <button
                onClick={() => onApprove(role)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
              >
                <FaCheck size={11} /> Duyệt
              </button>
              <button
                onClick={() => onReject(role)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
              >
                <FaTimes size={11} /> Từ chối
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Group permissions by module for display ────────────────────────────
const groupByModule = (codes, permByCode) => {
  const groups = {};
  codes.forEach((code) => {
    const p = permByCode[code];
    const mod = p?.module || 'OTHER';
    (groups[mod] = groups[mod] || []).push(p || { code, name: code, riskLevel: 'LOW' });
  });
  return groups;
};

// ── Role detail dialog (có chế độ sửa quyền cho role tùy biến) ──────────
const RoleDetailDialog = ({
  role,
  permByCode,
  permByScope,
  onClose,
  onSubmit,
  onToggle,
  onDelete,
  onSaved,
}) => {
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState(() => new Set(role.permissions));
  const [saving, setSaving] = useState(false);

  const groups = useMemo(() => groupByModule(role.permissions, permByCode), [role, permByCode]);
  const scopePerms = useMemo(() => permByScope[role.scope] || [], [permByScope, role.scope]);
  const canSubmit = role.status === 'DRAFT' || role.status === 'REJECTED';
  const canToggle = role.status === 'ACTIVE' || role.status === 'DISABLED';
  const editable = !role.systemRole;
  const hasHighRisk = scopePerms.some((p) => sel.has(p.code) && p.riskLevel === 'HIGH');

  const toggleSel = (c) =>
    setSel((prev) => {
      const n = new Set(prev);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });
  const startEdit = () => {
    setSel(new Set(role.permissions));
    setEditing(true);
  };
  const save = async () => {
    if (sel.size === 0) {
      toast.error('Chọn ít nhất một quyền');
      return;
    }
    try {
      setSaving(true);
      await rbacService.updateRole(role.id, { permissions: Array.from(sel) });
      toast.success(
        role.status === 'ACTIVE' || role.status === 'APPROVED'
          ? 'Đã lưu — role cần được duyệt lại'
          : 'Đã lưu thay đổi quyền'
      );
      onSaved();
    } catch (e) {
      toast.error(e?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title={role.name} widthClass="max-w-2xl">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <code className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded">
          {role.code}
        </code>
        <Badge meta={STATUS_META[role.status] || STATUS_META.DRAFT} />
        <Badge meta={RISK_META[role.highestRisk] || RISK_META.LOW} />
        {role.systemRole && (
          <span className="text-[11px] text-slate-400 font-bold">
            <FaLock className="inline mr-1" size={9} />
            Vai trò hệ thống
          </span>
        )}
      </div>
      {role.description && <p className="text-sm text-slate-600 mb-3">{role.description}</p>}
      {role.rejectReason && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <b>Lý do từ chối:</b> {role.rejectReason}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quyền hạn ({editing ? sel.size : role.permissionCount})
        </p>
        {editable && !editing && (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3AB4E6] hover:underline"
          >
            <FaEdit size={11} /> Sửa quyền
          </button>
        )}
      </div>

      {editing ? (
        <>
          <PermissionPicker perms={scopePerms} selected={sel} onToggle={toggleSel} />
          {hasHighRisk && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex gap-2">
              <FaExclamationTriangle className="shrink-0 mt-0.5" />
              <span>Có quyền rủi ro cao. Sau khi lưu, role cần được Super Admin duyệt lại.</span>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
          {Object.keys(groups).length === 0 && (
            <p className="text-sm text-slate-400">Chưa gán quyền nào.</p>
          )}
          {Object.entries(groups).map(([mod, perms]) => (
            <div key={mod}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {MODULE_LABEL[mod] || mod}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {perms.map((p) => (
                  <div
                    key={p.code}
                    className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-2.5 py-1.5"
                  >
                    <FaCheck size={10} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{p.name}</span>
                    {p.riskLevel === 'HIGH' && (
                      <FaExclamationTriangle
                        size={10}
                        className="text-red-400 ml-auto shrink-0"
                        title="Quyền rủi ro cao"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
        {editing ? (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-60"
            >
              <FaCheck size={11} /> {saving ? 'Đang lưu…' : 'Lưu quyền'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold"
            >
              Hủy
            </button>
          </>
        ) : (
          <>
            {canSubmit && (
              <button
                onClick={() => onSubmit(role)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-sm font-bold"
              >
                <FaPaperPlane size={11} /> Gửi duyệt
              </button>
            )}
            {canToggle && (
              <button
                onClick={() => onToggle(role)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold"
              >
                {role.status === 'ACTIVE' ? (
                  <>
                    <FaToggleOff size={13} /> Vô hiệu hóa
                  </>
                ) : (
                  <>
                    <FaToggleOn size={13} /> Kích hoạt
                  </>
                )}
              </button>
            )}
            {!role.systemRole && (
              <button
                onClick={() => onDelete(role)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold ml-auto"
              >
                <FaTrash size={11} /> Xóa
              </button>
            )}
            {role.systemRole && (
              <span className="ml-auto text-xs text-slate-400 flex items-center gap-1.5 py-2">
                <FaLock size={10} /> Vai trò hệ thống — không thể sửa/xóa
              </span>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
};

// ── Create role dialog ─────────────────────────────────────────────────
const CreateRoleDialog = ({ permByScope, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [scope, setScope] = useState('PLATFORM');
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const perms = useMemo(() => permByScope[scope] || [], [permByScope, scope]);
  const grouped = useMemo(() => {
    const g = {};
    perms.forEach((p) => (g[p.module] = g[p.module] || []).push(p));
    return g;
  }, [perms]);

  const hasHighRisk = perms.some((p) => selected.has(p.code) && p.riskLevel === 'HIGH');

  const autoCode = (v) =>
    v
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  const onNameChange = (v) => {
    setName(v);
    setCode(autoCode(v));
  };
  const toggle = (c) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const submit = async () => {
    if (!name.trim() || !code.trim()) {
      toast.error('Nhập tên & mã vai trò');
      return;
    }
    if (selected.size === 0) {
      toast.error('Chọn ít nhất một quyền');
      return;
    }
    try {
      setSaving(true);
      await rbacService.createRole({
        name: name.trim(),
        code: code.trim(),
        scope,
        reason,
        permissions: Array.from(selected),
      });
      toast.success('Đã tạo vai trò (bản nháp). Hãy gửi duyệt để kích hoạt.');
      onCreated();
    } catch (e) {
      toast.error(e?.message || 'Tạo vai trò thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Tạo vai trò mới" widthClass="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-600">Tên vai trò *</label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="vd: Kiểm duyệt AI"
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3AB4E6]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600">Mã vai trò *</label>
          <input
            value={code}
            onChange={(e) => setCode(autoCode(e.target.value))}
            placeholder="AI_REVIEWER"
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-[#3AB4E6]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-xs font-bold text-slate-600">Phạm vi *</label>
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setSelected(new Set());
            }}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3AB4E6] bg-white"
          >
            <option value="PLATFORM">Nền tảng ITing (PLATFORM)</option>
            <option value="COMPANY">Doanh nghiệp (COMPANY)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600">Lý do tạo</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do / mục đích"
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#3AB4E6]"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Chọn quyền ({selected.size})
          </label>
        </div>
        <div className="space-y-3 max-h-[34vh] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3">
          {Object.entries(grouped).map(([mod, list]) => (
            <div key={mod}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {MODULE_LABEL[mod] || mod}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {list.map((p) => {
                  const on = selected.has(p.code);
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => toggle(p.code)}
                      className={`flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 border text-left transition-colors ${
                        on
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${on ? 'bg-emerald-500 text-white' : 'border border-slate-300'}`}
                      >
                        {on && <FaCheck size={8} />}
                      </span>
                      <span className="truncate">{p.name}</span>
                      {p.riskLevel === 'HIGH' && (
                        <FaExclamationTriangle
                          size={10}
                          className="text-red-400 ml-auto shrink-0"
                          title="Rủi ro cao"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasHighRisk && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex gap-2">
          <FaExclamationTriangle className="shrink-0 mt-0.5" />
          <span>
            Bạn đang chọn quyền rủi ro cao. Vai trò này cần Super Admin duyệt trước khi kích hoạt.
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-sm font-bold disabled:opacity-60"
        >
          {saving ? 'Đang lưu…' : 'Tạo bản nháp'}
        </button>
      </div>
    </Dialog>
  );
};

// ── Company members management (gán HR con vào công ty) ─────────────────
const CompanyMembers = ({ companyRoles }) => {
  const activeRoles = useMemo(
    () => (companyRoles || []).filter((r) => r.status === 'ACTIVE'),
    [companyRoles]
  );
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    rbacService
      .getCompanies()
      .then((data) => {
        setCompanies(data || []);
        if (data?.length && !companyId) setCompanyId(String(data[0].id));
      })
      .catch(() => toast.error('Không tải được danh sách công ty'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMembers = useCallback((id) => {
    if (!id) {
      setMembers([]);
      return;
    }
    setLoading(true);
    rbacService
      .getCompanyMembers(id)
      .then((data) => setMembers(data || []))
      .catch(() => toast.error('Không tải được thành viên'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMembers(companyId);
  }, [companyId, loadMembers]);

  const changeRole = async (m, roleCode) => {
    try {
      await rbacService.assignMemberRole(m.affiliationId, roleCode);
      toast.success(`Đã gán vai trò cho ${m.email}`);
      loadMembers(companyId);
    } catch (e) {
      toast.error(e?.message || 'Gán vai trò thất bại');
    }
  };
  const remove = async (m) => {
    if (!window.confirm(`Gỡ ${m.email} khỏi công ty?`)) return;
    try {
      await rbacService.removeCompanyMember(m.affiliationId);
      toast.success('Đã gỡ thành viên');
      loadMembers(companyId);
    } catch (e) {
      toast.error(e?.message || 'Gỡ thất bại');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FaUsers className="text-[#3AB4E6]" /> Phân quyền HR theo công ty
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[#3AB4E6] max-w-[260px]"
          >
            {companies.length === 0 && <option value="">— Chưa có công ty —</option>}
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.memberCount})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(true)}
            disabled={!companyId}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-sm font-bold disabled:opacity-50 shrink-0"
          >
            <FaUserPlus size={12} /> Thêm HR
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Đang tải…</div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">Công ty chưa có HR nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-2 px-2">HR</th>
                <th className="py-2 px-2">Trạng thái</th>
                <th className="py-2 px-2 w-[200px]">Vai trò trong công ty</th>
                <th className="py-2 px-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.affiliationId} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-2.5 px-2">
                    <div className="font-medium text-slate-700">{m.fullName || m.email}</div>
                    <div className="text-[11px] text-slate-400">{m.email}</div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-xs text-slate-500">{m.status}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <select
                      value={m.companyRoleCode || ''}
                      onChange={(e) => e.target.value && changeRole(m, e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:border-[#3AB4E6]"
                    >
                      <option value="">— Chưa gán —</option>
                      {activeRoles.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => remove(m)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600"
                    >
                      <FaTrash size={10} /> Gỡ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddMemberDialog
          companyId={companyId}
          activeRoles={activeRoles}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            loadMembers(companyId);
            rbacService.getCompanies().then((d) => setCompanies(d || []));
          }}
        />
      )}
    </div>
  );
};

// ── Add HR to company dialog ────────────────────────────────────────────
const AddMemberDialog = ({ companyId, activeRoles, onClose, onAdded }) => {
  const [available, setAvailable] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    rbacService
      .getAvailableHr()
      .then((data) => setAvailable(data || []))
      .catch(() => toast.error('Không tải được danh sách HR'));
  }, []);

  const submit = async () => {
    if (!accountId) {
      toast.error('Chọn tài khoản HR');
      return;
    }
    if (!roleCode) {
      toast.error('Chọn vai trò');
      return;
    }
    try {
      setSaving(true);
      await rbacService.addCompanyMember(companyId, Number(accountId), roleCode);
      toast.success('Đã thêm HR vào công ty');
      onAdded();
    } catch (e) {
      toast.error(e?.message || 'Thêm HR thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Thêm HR vào công ty" widthClass="max-w-md">
      <p className="text-xs text-slate-500 mb-3">
        Chỉ hiển thị tài khoản HR (EMPLOYER) chưa thuộc công ty nào.
      </p>
      <label className="text-xs font-bold text-slate-600">Tài khoản HR *</label>
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="mt-1 mb-3 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[#3AB4E6]"
      >
        <option value="">— Chọn HR —</option>
        {available.map((h) => (
          <option key={h.accountId} value={h.accountId}>
            {(h.fullName ? h.fullName + ' · ' : '') + h.email}
          </option>
        ))}
      </select>
      {available.length === 0 && (
        <p className="text-xs text-amber-600 mb-3">Không còn HR nào chưa thuộc công ty.</p>
      )}
      <label className="text-xs font-bold text-slate-600">Vai trò trong công ty *</label>
      <select
        value={roleCode}
        onChange={(e) => setRoleCode(e.target.value)}
        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[#3AB4E6]"
      >
        <option value="">— Chọn vai trò —</option>
        {activeRoles.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#3AB4E6] hover:bg-[#2C9ACD] text-white text-sm font-bold disabled:opacity-60"
        >
          {saving ? 'Đang thêm…' : 'Thêm HR'}
        </button>
      </div>
    </Dialog>
  );
};

// ── Internal staff management (gán platform role cho tài khoản) ─────────
const StaffManagement = () => {
  const [platformRoles, setPlatformRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  // Tạo tài khoản nội bộ mới
  const EMPTY_CREATE = { email: '', fullName: '', password: '', platformRoleCode: '' };
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);

  const activeRoles = useMemo(
    () => platformRoles.filter((r) => r.status === 'ACTIVE'),
    [platformRoles]
  );

  useEffect(() => {
    rbacService
      .getRoles('PLATFORM')
      .then((d) => setPlatformRoles(d || []))
      .catch(() => {});
  }, []);

  const load = useCallback((kw) => {
    setLoading(true);
    rbacService
      .getStaff(kw)
      .then((d) => setStaff(d || []))
      .catch(() => toast.error('Không tải được danh sách tài khoản'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const onSearch = (e) => {
    e.preventDefault();
    load(keyword.trim());
  };

  const assign = async (s, roleCode) => {
    try {
      await rbacService.assignRole(s.accountId, roleCode);
      toast.success(`Đã gán vai trò cho ${s.email}`);
      load(keyword.trim());
    } catch (e) {
      toast.error(e?.message || 'Gán vai trò thất bại');
    }
  };
  const promote = async (s) => {
    try {
      await rbacService.promoteStaff(s.accountId);
      toast.success(`${s.email} đã trở thành nhân sự nội bộ`);
      load(keyword.trim());
    } catch (e) {
      toast.error(e?.message || 'Thao tác thất bại');
    }
  };
  const revoke = async (s) => {
    if (!window.confirm(`Thu hồi quyền nội bộ của ${s.email}?`)) return;
    try {
      await rbacService.clearStaffRole(s.accountId);
      toast.success('Đã thu hồi quyền');
      load(keyword.trim());
    } catch (e) {
      toast.error(e?.message || 'Thu hồi thất bại');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const email = createForm.email.trim();
    if (!email) { toast.error('Vui lòng nhập email'); return; }
    if ((createForm.password || '').length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    if (!createForm.fullName.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    setCreating(true);
    try {
      await rbacService.createStaff({
        email,
        password: createForm.password,
        fullName: createForm.fullName.trim(),
        platformRoleCode: createForm.platformRoleCode || null,
      });
      toast.success('Đã tạo tài khoản nội bộ');
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      load('');
      setKeyword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.error || err?.message || 'Tạo tài khoản thất bại');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FaUserCog className="text-[#3AB4E6]" /> Tài khoản nội bộ ITing
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gán vai trò nền tảng cho nhân sự nội bộ. Tìm kiếm để nâng tài khoản khác thành nội bộ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={onSearch} className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm email / tên để gán quyền…"
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#3AB4E6] w-full sm:w-72"
            />
          </form>
          <button
            type="button"
            onClick={() => { setCreateForm(EMPTY_CREATE); setShowCreate(true); }}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#3AB4E6] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#2A9DCB] transition-colors"
          >
            <FaUserPlus size={13} /> Tạo tài khoản
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Đang tải…</div>
      ) : staff.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          {keyword ? 'Không tìm thấy tài khoản phù hợp.' : 'Chưa có tài khoản nội bộ nào.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-2 px-2">Tài khoản</th>
                <th className="py-2 px-2">Loại</th>
                <th className="py-2 px-2">Trạng thái</th>
                <th className="py-2 px-2 w-[210px]">Vai trò nền tảng</th>
                <th className="py-2 px-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => {
                const isInternal = s.accountType === 'INTERNAL_STAFF';
                return (
                  <tr key={s.accountId} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2.5 px-2">
                      <div className="font-medium text-slate-700">{s.fullName || s.email}</div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge meta={ACCOUNT_TYPE_META[s.accountType] || ACCOUNT_TYPE_META.PUBLIC} />
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-xs text-slate-500">{s.status}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      {isInternal ? (
                        <select
                          value={s.platformRoleCode || ''}
                          onChange={(e) => e.target.value && assign(s, e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:border-[#3AB4E6]"
                        >
                          <option value="">— Chưa gán —</option>
                          {activeRoles.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <FaLock size={9} /> Tài khoản công khai
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      {isInternal ? (
                        s.platformRoleCode && (
                          <button
                            onClick={() => revoke(s)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600"
                          >
                            <FaTrash size={10} /> Thu hồi
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => promote(s)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#3AB4E6] hover:underline"
                        >
                          <FaUserPlus size={11} /> Nâng thành nội bộ
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo tài khoản nội bộ */}
      <Dialog
        open={showCreate}
        onClose={() => !creating && setShowCreate(false)}
        title="Tạo tài khoản nội bộ ITing"
        widthClass="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-xs text-slate-500 -mt-1">
            Tài khoản này dùng để nhân sự nội bộ ITing đăng nhập. Mật khẩu nên được đổi sau lần đăng nhập đầu.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="vd: nhanvien@iting.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#3AB4E6] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={createForm.fullName}
              onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="vd: Nguyễn Văn A"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#3AB4E6] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={createForm.password}
              onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#3AB4E6] focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò nền tảng <span className="text-slate-400 font-normal">(tuỳ chọn)</span></label>
            <select
              value={createForm.platformRoleCode}
              onChange={(e) => setCreateForm((f) => ({ ...f, platformRoleCode: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-[#3AB4E6]"
            >
              <option value="">— Chưa gán (gán sau) —</option>
              {activeRoles.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Có thể để trống rồi gán vai trò ở bảng bên ngoài sau khi tạo.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              disabled={creating}
              className="px-4 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-[#3AB4E6] hover:bg-[#2A9DCB] disabled:opacity-50"
            >
              {creating ? 'Đang tạo…' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

// // ── Architecture footer ────────────────────────────────────────────────
// const ArchitectureInfo = () => (
//   <div className="bg-gradient-to-br from-slate-50 to-sky-50/30 rounded-2xl border border-slate-100 p-6">
//     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
//       <FaInfoCircle className="text-[#3AB4E6]" /> Kiến trúc RBAC — ITing Platform
//     </h3>
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <div className="bg-white rounded-xl p-4 border border-slate-100">
//         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tách quyền 2 namespace</p>
//         <p className="text-sm text-slate-700">
//           <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">platform.*</code> chỉ cho nhân sự nội bộ ITing;
//           <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded ml-1">company.*</code> chỉ có hiệu lực trong phạm vi một công ty.
//         </p>
//       </div>
//       <div className="bg-white rounded-xl p-4 border border-slate-100">
//         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quy trình duyệt</p>
//         <p className="text-sm text-slate-700">
//           Vai trò mới: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">DRAFT → PENDING → ACTIVE</code>.
//           Chỉ Super Admin được duyệt; quyền rủi ro cao bắt buộc qua duyệt.
//         </p>
//       </div>
//       <div className="bg-white rounded-xl p-4 border border-slate-100">
//         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chặn leo thang quyền</p>
//         <p className="text-sm text-slate-700">
//           Backend kiểm tra <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">account_type</code>: tài khoản công khai
//           không thể nhận role nội bộ; mọi thay đổi đều ghi audit log.
//         </p>
//       </div>
//     </div>
//   </div>
// );

export default RoleManagement;
