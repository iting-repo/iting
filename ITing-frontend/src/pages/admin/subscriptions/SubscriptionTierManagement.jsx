import React, { useCallback, useEffect, useState } from 'react';
import {
  CreditCard, Pencil, RefreshCw, Loader2, Coins, Briefcase, Rocket,
  Check, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Dialog, Switch } from '../../../components';
import adminSubscriptionService from '../../../services/adminSubscriptionService';

const TIER_ACCENT = {
  BASIC: 'from-blue-500 to-sky-400',
  PRO: 'from-amber-500 to-yellow-400',
  ENTERPRISE: 'from-purple-500 to-fuchsia-400',
};

const fmtVnd = (n) => Number(n || 0).toLocaleString('vi-VN');
const fmtLimit = (n) => (Number(n) < 0 ? 'Không giới hạn' : Number(n).toLocaleString('vi-VN'));

const emptyForm = {
  displayName: '',
  priceVnd: '',
  periodDays: '',
  credits: '',
  maxJobsPerMonth: '',
  maxBoostsPerMonth: '',
  benefits: '',
  active: true,
};

const SubscriptionTierManagement = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);   // tier code being edited
  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const openEdit = (t) => {
    setEditing(t.code);
    setForm({
      displayName: t.displayName ?? '',
      priceVnd: String(t.priceVnd ?? ''),
      periodDays: String(t.periodDays ?? ''),
      credits: String(t.credits ?? ''),
      maxJobsPerMonth: String(t.maxJobsPerMonth ?? ''),
      maxBoostsPerMonth: String(t.maxBoostsPerMonth ?? ''),
      benefits: t.benefits ?? '',
      active: !!t.active,
    });
  };

  const closeEdit = () => { setEditing(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.displayName.trim()) { toast.error('Vui lòng nhập tên hiển thị'); return; }
    const price = Number(form.priceVnd);
    if (Number.isNaN(price) || price < 0) { toast.error('Giá không hợp lệ'); return; }
    const period = Number(form.periodDays);
    if (Number.isNaN(period) || period < 1) { toast.error('Số ngày phải ≥ 1'); return; }

    const payload = {
      displayName: form.displayName.trim(),
      priceVnd: price,
      periodDays: period,
      credits: Number(form.credits) || 0,
      maxJobsPerMonth: Number(form.maxJobsPerMonth),
      maxBoostsPerMonth: Number(form.maxBoostsPerMonth),
      benefits: form.benefits.trim(),
      active: form.active,
    };

    setSaving(true);
    try {
      await adminSubscriptionService.updateTier(editing, payload);
      toast.success(`Đã cập nhật gói ${editing}`);
      closeEdit();
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

  const benefitList = (b) =>
    (b || '').split('·').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <CreditCard className="h-6 w-6 text-[#3AB4E6]" />
            Quản lý gói HR Premium
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Chỉnh giá, quyền lợi và quota của các gói. Thay đổi có hiệu lực ngay với HR — không cần deploy lại.
          </p>
        </div>
        <Button variant="outline" onClick={fetchTiers} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Đang tải bảng giá...</div>
      ) : tiers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          Chưa có gói nào.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.code}
              className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${
                t.active ? '' : 'opacity-70'
              }`}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${TIER_ACCENT[t.code] || 'from-slate-400 to-slate-300'}`} />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{t.code}</h3>
                      {t.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          <Check className="h-3 w-3" /> Đang bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          <EyeOff className="h-3 w-3" /> Đang ẩn
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{t.displayName}</p>
                  </div>
                  <Switch checked={t.active} onCheckedChange={() => toggleActive(t)} />
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-extrabold text-slate-900">{fmtVnd(t.priceVnd)}đ</span>
                  <span className="text-sm text-slate-500"> / {t.periodDays} ngày</span>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-amber-50 p-2">
                    <Coins className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                    <div className="font-bold text-slate-800">{fmtVnd(t.credits)}</div>
                    <div className="text-slate-500">credits</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Briefcase className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                    <div className="font-bold text-slate-800">{fmtLimit(t.maxJobsPerMonth)}</div>
                    <div className="text-slate-500">job/tháng</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2">
                    <Rocket className="mx-auto mb-1 h-4 w-4 text-purple-500" />
                    <div className="font-bold text-slate-800">{fmtLimit(t.maxBoostsPerMonth)}</div>
                    <div className="text-slate-500">boost/tháng</div>
                  </div>
                </div>

                <ul className="mb-4 flex-1 space-y-1.5 text-sm text-slate-600">
                  {benefitList(t.benefits).map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>

                <Button variant="primary" className="w-full" onClick={() => openEdit(t)}>
                  <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa giá & quyền lợi
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onClose={closeEdit} title={`Chỉnh sửa gói ${editing || ''}`}>
        <div className="space-y-4">
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
                type="number" min="0"
                value={form.priceVnd}
                onChange={(e) => setForm({ ...form, priceVnd: e.target.value })}
              />
            </Field>
            <Field label="Chu kỳ (ngày)" required>
              <Input
                type="number" min="1"
                value={form.periodDays}
                onChange={(e) => setForm({ ...form, periodDays: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Credits tặng">
              <Input
                type="number" min="0"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
              />
            </Field>
            <Field label="Job / tháng" hint="-1 = vô hạn">
              <Input
                type="number" min="-1"
                value={form.maxJobsPerMonth}
                onChange={(e) => setForm({ ...form, maxJobsPerMonth: e.target.value })}
              />
            </Field>
            <Field label="Boost / tháng" hint="-1 = vô hạn">
              <Input
                type="number" min="-1"
                value={form.maxBoostsPerMonth}
                onChange={(e) => setForm({ ...form, maxBoostsPerMonth: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Quyền lợi" hint="Phân tách từng quyền lợi bằng dấu ·">
            <textarea
              rows={4}
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              placeholder="Đăng 50 job/tháng · 20 boost · Talent pool search · Priority support"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-[#3AB4E6] transition-all"
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-800">Hiển thị công khai</div>
              <div className="text-xs text-slate-500">Tắt để ẩn gói khỏi bảng giá của HR</div>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeEdit} disabled={saving}>Hủy</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </Dialog>
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

export default SubscriptionTierManagement;
