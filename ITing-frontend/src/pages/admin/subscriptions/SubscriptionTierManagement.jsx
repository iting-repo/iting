import React, { useCallback, useEffect, useState } from 'react';
import {
  CreditCard,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  Coins,
  Briefcase,
  Rocket,
  Check,
  EyeOff,
  Star,
  Users,
  Building2,
  Search,
  Mail,
  Gift,
  X,
  Plus as PlusIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Dialog, Switch, ConfirmDialog, Pagination } from '../../../components';
import adminSubscriptionService from '../../../services/adminSubscriptionService';
import categoryService from '../../../services/categoryService';

const TIERS_PER_PAGE = 8; // 2 hàng × 4 cột (xl:grid-cols-4)

const fmtVnd = (n) => Number(n || 0).toLocaleString('vi-VN');
const fmtLimit = (n) => (Number(n) < 0 ? 'Không giới hạn' : Number(n).toLocaleString('vi-VN'));

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
};

/** code trạng thái subscription → nhãn + class màu. */
const SUB_STATUS_META = {
  ACTIVE: { label: 'Đang hiệu lực', cls: 'bg-green-50 text-green-700' },
  PENDING_RENEWAL: { label: 'Chờ gia hạn', cls: 'bg-amber-50 text-amber-700' },
  EXPIRED: { label: 'Hết hạn', cls: 'bg-slate-100 text-slate-500' },
  CANCELED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600' },
};
const subStatusMeta = (s) =>
  SUB_STATUS_META[s] || { label: s || '—', cls: 'bg-slate-100 text-slate-500' };

const SUB_STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hiệu lực' },
  { value: 'PENDING_RENEWAL', label: 'Chờ gia hạn' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'CANCELED', label: 'Đã hủy' },
];

/** Nhóm số bằng dấu chấm để dễ đọc (2000 → "2.000"). */
const groupDigits = (raw) => {
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('vi-VN') : '';
};

/** Như groupDigits nhưng giữ dấu trừ đầu (cho phép -1 = vô hạn). */
const groupSigned = (raw) => {
  const s = String(raw ?? '');
  const neg = s.trim().startsWith('-');
  const digits = s.replace(/\D/g, '');
  if (!digits) return neg ? '-' : '';
  return (neg ? '-' : '') + Number(digits).toLocaleString('vi-VN');
};

/** Lọc input số có dấu (giữ tối đa 1 dấu trừ đầu chuỗi). */
const parseSigned = (v) => {
  const neg = String(v).trim().startsWith('-');
  return (neg ? '-' : '') + String(v).replace(/\D/g, '');
};

const PRESET_COLORS = ['#3AB4E6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#EC4899', '#6366F1'];

const emptyForm = {
  code: '',
  displayName: '',
  priceVnd: '',
  periodDays: '30',
  credits: '0',
  maxJobsPerMonth: '0',
  maxBoostsPerMonth: '0',
  benefits: '',
  active: true,
  sortOrder: '0',
  popular: false,
  talentPool: false,
  badge: '',
  accentColor: '#3AB4E6',
};

const SubscriptionTierManagement = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false); // create vs edit
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1); // phân trang client-side (1-indexed)

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminSubscriptionService.listTiers();
      setTiers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách gói HR');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  /* ─── Người đăng ký ─── */
  const [subscribers, setSubscribers] = useState([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subStatus, setSubStatus] = useState('');
  const [subSearch, setSubSearch] = useState('');

  const fetchSubscribers = useCallback(async () => {
    setSubsLoading(true);
    try {
      const data = await adminSubscriptionService.listSubscribers(
        subStatus ? { status: subStatus } : {},
      );
      setSubscribers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách người đăng ký');
    } finally {
      setSubsLoading(false);
    }
  }, [subStatus]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  /* ─── Danh sách quyền lợi (quản lý ở Danh mục → Quyền lợi) ─── */
  const [benefitOptions, setBenefitOptions] = useState([]); // [{ name, nameEn }]

  useEffect(() => {
    (async () => {
      try {
        const data = await categoryService.getByType('BENEFIT');
        const active = (Array.isArray(data) ? data : [])
          .filter((c) => c.active !== false)
          .map((c) => ({ name: c.name, nameEn: c.nameEn }));
        setBenefitOptions(active);
      } catch {
        setBenefitOptions([]);
      }
    })();
  }, []);

  // form.benefits là chuỗi nối bằng ' · '. Tách/ghép để thao tác dạng chip.
  const selectedBenefits = (form.benefits || '')
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean);

  const setSelectedBenefits = (list) =>
    setForm((f) => ({ ...f, benefits: list.join(' · ') }));

  const addBenefit = (name) => {
    if (!name || selectedBenefits.includes(name)) return;
    setSelectedBenefits([...selectedBenefits, name]);
  };

  const removeBenefit = (name) =>
    setSelectedBenefits(selectedBenefits.filter((b) => b !== name));

  const availableBenefits = benefitOptions.filter(
    (o) => !selectedBenefits.includes(o.name),
  );

  const filteredSubscribers = subscribers.filter((s) => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return true;
    return [s.email, s.fullName, s.companyName, s.tier, s.tierName]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const openCreate = () => {
    setCreating(true);
    setForm({ ...emptyForm, sortOrder: String(tiers.length + 1) });
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setCreating(false);
    setForm({
      code: t.code,
      displayName: t.displayName ?? '',
      priceVnd: String(t.priceVnd ?? ''),
      periodDays: String(t.periodDays ?? '30'),
      credits: String(t.credits ?? '0'),
      maxJobsPerMonth: String(t.maxJobsPerMonth ?? '0'),
      maxBoostsPerMonth: String(t.maxBoostsPerMonth ?? '0'),
      benefits: t.benefits ?? '',
      active: !!t.active,
      sortOrder: String(t.sortOrder ?? '0'),
      popular: !!t.popular,
      talentPool: !!t.talentPool,
      badge: t.badge ?? '',
      accentColor: t.accentColor || '#3AB4E6',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (creating && !/^[A-Za-z][A-Za-z0-9_]{1,29}$/.test(form.code.trim())) {
      toast.error('Mã gói: bắt đầu bằng chữ, chỉ gồm chữ/số/gạch dưới (VD: STARTER)');
      return;
    }
    if (!form.displayName.trim()) {
      toast.error('Vui lòng nhập tên hiển thị');
      return;
    }
    const price = Number(form.priceVnd);
    if (Number.isNaN(price) || price < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }
    const period = Number(form.periodDays);
    if (Number.isNaN(period) || period < 1) {
      toast.error('Số ngày phải ≥ 1');
      return;
    }

    const toInt = (s, def = 0) => {
      const n = parseInt(s, 10);
      return Number.isNaN(n) ? def : n;
    };

    const payload = {
      displayName: form.displayName.trim(),
      priceVnd: price,
      periodDays: period,
      credits: toInt(form.credits, 0),
      maxJobsPerMonth: toInt(form.maxJobsPerMonth, 0),
      maxBoostsPerMonth: toInt(form.maxBoostsPerMonth, 0),
      benefits: form.benefits.trim(),
      active: form.active,
      sortOrder: toInt(form.sortOrder, 0),
      popular: form.popular,
      talentPool: form.talentPool,
      badge: form.badge.trim() || null,
      accentColor: form.accentColor || null,
    };

    setSaving(true);
    try {
      if (creating) {
        await adminSubscriptionService.createTier({
          ...payload,
          code: form.code.trim().toUpperCase(),
        });
        toast.success(`Đã tạo gói ${form.code.trim().toUpperCase()}`);
      } else {
        await adminSubscriptionService.updateTier(form.code, payload);
        toast.success(`Đã cập nhật gói ${form.code}`);
      }
      closeDialog();
      fetchTiers();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      await adminSubscriptionService.updateTier(t.code, { active: !t.active });
      toast.success(!t.active ? `Đã bật gói ${t.code}` : `Đã ẩn gói ${t.code}`);
      fetchTiers();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể đổi trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminSubscriptionService.deleteTier(deleteTarget.code);
      toast.success(`Đã xóa gói ${deleteTarget.code}`);
      setDeleteTarget(null);
      fetchTiers();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể xóa gói');
      setDeleteTarget(null);
    }
  };

  const benefitList = (b) =>
    (b || '')
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean);

  /* ─── Phân trang client-side ─── */
  const totalPages = Math.max(1, Math.ceil(tiers.length / TIERS_PER_PAGE));
  const safePage = Math.min(page, totalPages); // clamp khi danh sách thay đổi (xóa/thêm)
  const pagedTiers = tiers.slice((safePage - 1) * TIERS_PER_PAGE, safePage * TIERS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <CreditCard className="h-6 w-6 text-[#3AB4E6]" />
            Quản lý gói HR Premium
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTiers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm gói
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Đang tải bảng giá...</div>
      ) : tiers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          Chưa có gói nào. Bấm “Thêm gói” để tạo gói đầu tiên.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedTiers.map((t) => {
            const accent = t.accentColor || '#3AB4E6';
            return (
              <div
                key={t.code}
                className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${
                  t.active ? '' : 'opacity-70'
                }`}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-lg font-bold text-slate-900">{t.code}</h3>
                        {t.popular && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                            <Star className="h-3 w-3" /> Nổi bật
                          </span>
                        )}
                        {t.active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            <Check className="h-3 w-3" /> Đang bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            <EyeOff className="h-3 w-3" /> Đang ẩn
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{t.displayName}</p>
                    </div>
                    <Switch checked={t.active} onCheckedChange={() => toggleActive(t)} />
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {fmtVnd(t.priceVnd)}đ
                    </span>
                    <span className="text-sm text-slate-500"> / {t.periodDays} ngày</span>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-amber-50 p-2">
                      <Coins className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                      <div className="font-bold text-slate-800">{fmtVnd(t.credits)}</div>
                      <div className="text-slate-500">credits</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Briefcase className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                      <div className="font-bold text-slate-800">{fmtLimit(t.maxJobsPerMonth)}</div>
                      <div className="text-slate-500">job/th</div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-2">
                      <Rocket className="mx-auto mb-1 h-4 w-4 text-purple-500" />
                      <div className="font-bold text-slate-800">
                        {fmtLimit(t.maxBoostsPerMonth)}
                      </div>
                      <div className="text-slate-500">boost/th</div>
                    </div>
                  </div>

                  {t.talentPool && (
                    <div className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                      <Users className="h-3 w-3" /> Talent Pool
                    </div>
                  )}

                  <ul className="mb-4 flex-1 space-y-1.5 text-sm text-slate-600">
                    {benefitList(t.benefits).map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" onClick={() => openEdit(t)}>
                      <Pencil className="mr-2 h-4 w-4" /> Sửa
                    </Button>
                    <Button variant="outline" onClick={() => setDeleteTarget(t)} title="Xóa gói">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang (chỉ hiện khi > 1 trang) */}
      {!loading && tiers.length > TIERS_PER_PAGE && (
        <div className="rounded-2xl ring-1 ring-slate-100 overflow-hidden">
          <Pagination
            currentPage={safePage}
            totalItems={tiers.length}
            itemsPerPage={TIERS_PER_PAGE}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* ─── Người đăng ký: tài khoản nào đăng ký gói nào + công ty trực thuộc ─── */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Users className="h-5 w-5 text-[#3AB4E6]" />
            Người đăng ký
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {filteredSubscribers.length}
            </span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Tìm email, tên, công ty, gói..."
                className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6]"
              />
            </div>
            <select
              value={subStatus}
              onChange={(e) => setSubStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6]"
            >
              {SUB_STATUS_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={fetchSubscribers} disabled={subsLoading}>
              <RefreshCw className={`h-4 w-4 ${subsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {subsLoading ? (
          <div className="py-14 text-center text-slate-400">Đang tải người đăng ký...</div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-14 text-center text-slate-400">
            {subSearch || subStatus ? 'Không có người đăng ký phù hợp.' : 'Chưa có ai đăng ký gói.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Tài khoản</th>
                  <th className="px-5 py-3">Công ty trực thuộc</th>
                  <th className="px-5 py-3">Gói</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Đăng ký</th>
                  <th className="px-5 py-3">Hết hạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubscribers.map((s) => {
                  const meta = subStatusMeta(s.status);
                  return (
                    <tr key={s.subscriptionId} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-800">
                          {s.fullName || '(Chưa đặt tên)'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3 w-3" /> {s.email || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {s.companyName ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Building2 className="h-4 w-4 text-slate-400" /> {s.companyName}
                          </span>
                        ) : (
                          <span className="text-xs italic text-slate-400">Chưa liên kết công ty</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-md bg-[#EAF6FF] px-2 py-0.5 text-xs font-bold text-[#0E7BAA]">
                          {s.tier}
                        </span>
                        {s.tierName && s.tierName !== s.tier && (
                          <div className="mt-0.5 truncate text-xs text-slate-400">{s.tierName}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{fmtDate(s.startedAt)}</td>
                      <td className="px-5 py-3 text-slate-600">{fmtDate(s.expiresAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={creating ? 'Thêm gói HR mới' : `Chỉnh sửa gói ${form.code}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã gói" required hint={creating ? 'VD: STARTER' : 'không đổi được'}>
              <Input
                value={form.code}
                disabled={!creating}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="STARTER"
                className={!creating ? 'bg-slate-100 text-slate-500' : ''}
              />
            </Field>
            <Field label="Thứ tự hiển thị" hint="nhỏ → trái">
              <Input
                type="text"
                inputMode="numeric"
                value={groupDigits(form.sortOrder)}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
          </div>

          <Field label="Tên hiển thị" required>
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="VD: Pro — 499.000đ / tháng"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Giá (VNĐ)" required>
              <Input
                type="text"
                inputMode="numeric"
                value={groupDigits(form.priceVnd)}
                onChange={(e) => setForm({ ...form, priceVnd: e.target.value.replace(/\D/g, '') })}
                placeholder="VD: 499.000"
              />
            </Field>
            <Field label="Chu kỳ (ngày)" required>
              <Input
                type="text"
                inputMode="numeric"
                value={groupDigits(form.periodDays)}
                onChange={(e) =>
                  setForm({ ...form, periodDays: e.target.value.replace(/\D/g, '') })
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Credits tặng">
              <Input
                type="text"
                inputMode="numeric"
                value={groupDigits(form.credits)}
                onChange={(e) => setForm({ ...form, credits: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
            <Field label="Job / tháng" hint="-1 = vô hạn">
              <Input
                type="text"
                inputMode="numeric"
                value={groupSigned(form.maxJobsPerMonth)}
                onChange={(e) => setForm({ ...form, maxJobsPerMonth: parseSigned(e.target.value) })}
              />
            </Field>
            <Field label="Boost / tháng" hint="-1 = vô hạn">
              <Input
                type="text"
                inputMode="numeric"
                value={groupSigned(form.maxBoostsPerMonth)}
                onChange={(e) =>
                  setForm({ ...form, maxBoostsPerMonth: parseSigned(e.target.value) })
                }
              />
            </Field>
          </div>

          <Field
            label="Quyền lợi"
            hint="chọn từ danh sách — quản lý ở Danh mục → Quyền lợi"
          >
            <div className="space-y-2">
              {/* Chip các quyền lợi đã chọn */}
              {selectedBenefits.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedBenefits.map((b) => {
                    const known = benefitOptions.some((o) => o.name === b);
                    return (
                      <span
                        key={b}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          known
                            ? 'bg-[#EAF6FF] text-[#0E7BAA]'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                        title={known ? '' : 'Quyền lợi tùy chỉnh (không có trong danh mục)'}
                      >
                        <Gift className="h-3 w-3" />
                        {b}
                        <button
                          type="button"
                          onClick={() => removeBenefit(b)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs italic text-slate-400">Chưa chọn quyền lợi nào.</p>
              )}

              {/* Dropdown thêm quyền lợi từ danh mục */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value=""
                    onChange={(e) => {
                      addBenefit(e.target.value);
                      e.target.value = '';
                    }}
                    disabled={availableBenefits.length === 0}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6] disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="" disabled>
                      {benefitOptions.length === 0
                        ? 'Chưa có quyền lợi nào — thêm ở Danh mục → Quyền lợi'
                        : availableBenefits.length === 0
                          ? 'Đã chọn tất cả quyền lợi'
                          : '+ Thêm quyền lợi...'}
                    </option>
                    {availableBenefits.map((o) => (
                      <option key={o.name} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <PlusIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nhãn (badge)" hint="VD: PHỔ BIẾN NHẤT">
              <Input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="(để trống nếu không)"
              />
            </Field>
            <Field label="Màu nhấn">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-300"
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, accentColor: c })}
                      className={`h-6 w-6 rounded-full ring-2 ${form.accentColor === c ? 'ring-slate-800' : 'ring-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ToggleRow
              label="Hiển thị công khai"
              desc="Cho HR thấy & mua"
              checked={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
            />
            <ToggleRow
              label="Gói nổi bật"
              desc="Highlight trên bảng giá"
              checked={form.popular}
              onChange={(v) => setForm({ ...form, popular: v })}
            />
            <ToggleRow
              label="Talent Pool"
              desc="Cho phép tìm ứng viên"
              checked={form.talentPool}
              onChange={(v) => setForm({ ...form, talentPool: v })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeDialog} disabled={saving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creating ? 'Tạo gói' : 'Lưu thay đổi'}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa gói HR"
        message={`Bạn có chắc muốn xóa gói "${deleteTarget?.code}"? Hành động này không thể hoàn tác. (Nếu gói đã có HR đăng ký, hệ thống sẽ chặn — hãy ẩn gói thay vì xóa.)`}
        confirmLabel="Xóa"
        type="danger"
      />
    </div>
  );
};

const Field = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
      {hint && <span className="text-xs font-normal text-slate-400">({hint})</span>}
    </label>
    {children}
  </div>
);

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
    <div className="min-w-0">
      <div className="text-sm font-medium text-slate-800">{label}</div>
      <div className="truncate text-xs text-slate-500">{desc}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default SubscriptionTierManagement;
