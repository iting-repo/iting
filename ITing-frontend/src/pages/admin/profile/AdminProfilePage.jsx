import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FaIdBadge, FaEnvelope, FaPhone, FaUserShield, FaCheckCircle,
  FaCircle, FaClock, FaCalendarAlt, FaUserTie,
} from "react-icons/fa";
import adminProfileService from "../../../services/adminProfileService";

const ADMIN_LEVEL_LABEL = {
  SUPER_ADMIN: "Quản trị cấp cao",
  MODERATOR: "Điều hành nội dung",
  VIEWER: "Chỉ xem",
};

const STATUS_TONE = {
  ACTIVE: { label: "Đang hoạt động", color: "bg-emerald-100 text-emerald-700" },
  SUSPENDED: { label: "Đã khoá", color: "bg-rose-100 text-rose-700" },
  PENDING: { label: "Chờ xác minh", color: "bg-amber-100 text-amber-700" },
};

const formatDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN");
};

const Row = ({ icon, label, value, mono }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
      <p className={`text-sm text-slate-800 break-words ${mono ? "font-mono" : "font-medium"}`}>
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  </div>
);

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminProfileService.getProfile()
      .then((data) => { if (alive) setProfile(data); })
      .catch(() => toast.error("Không tải được hồ sơ admin"))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">Đang tải hồ sơ...</div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-rose-500">Không có dữ liệu hồ sơ.</div>
    );
  }

  const status = STATUS_TONE[profile.status] || STATUS_TONE.PENDING;
  const initials = (profile.fullName || profile.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Thông tin cá nhân nhân viên ITing — kế thừa từ Account + thuộc tính riêng của admin.
        </p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow">
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {profile.fullName || profile.email}
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.color} inline-flex items-center gap-1`}>
              <FaCircle className="w-2 h-2" /> {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <FaIdBadge className="text-slate-400" />
            Mã nhân viên: <span className="font-mono font-bold text-slate-700">{profile.staffCode || "—"}</span>
            {profile.adminLevel && (
              <>
                <span className="text-slate-300">·</span>
                <FaUserShield className="text-slate-400" />
                {ADMIN_LEVEL_LABEL[profile.adminLevel] || profile.adminLevel}
              </>
            )}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
            Thông tin tài khoản
          </h3>
          <Row icon={<FaEnvelope />} label="Email" value={profile.email} />
          <Row icon={<FaPhone />} label="Số điện thoại" value={profile.phone} />
          <Row icon={<FaUserShield />} label="Vai trò" value={profile.role} />
          <Row
            icon={<FaCheckCircle />}
            label="Trạng thái"
            value={status.label}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
            Thuộc tính nhân viên ITing
          </h3>
          <Row icon={<FaIdBadge />} label="Mã nhân viên" value={profile.staffCode} mono />
          <Row
            icon={<FaUserTie />}
            label="Cấp bậc"
            value={profile.adminLevel ? (ADMIN_LEVEL_LABEL[profile.adminLevel] || profile.adminLevel) : null}
          />
          <Row icon={<FaCalendarAlt />} label="Ngày tạo tài khoản" value={formatDateTime(profile.createdAt)} />
          <Row icon={<FaClock />} label="Đăng nhập gần nhất" value={formatDateTime(profile.lastLoginAt)} />
        </div>
      </section>
    </div>
  );
};

export default AdminProfilePage;
