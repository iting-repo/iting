import React, { useState, useEffect, useCallback } from 'react';
import SEO from '../../components/common/SEO';
import GdprExportButton from '../../components/settings/GdprExportButton';
import {
  FaBell, FaBriefcase, FaEnvelope, FaCommentDots, FaStar,
  FaCog, FaShieldAlt, FaMobileAlt, FaSms, FaMoon, FaClock,
  FaCheckCircle, FaExclamationTriangle, FaVolumeUp, FaVolumeMute,
  FaUserCog, FaGlobe, FaSave
} from 'react-icons/fa';
import { toast } from 'sonner';
import notificationPreferenceService from '../../services/notificationPreferenceService';

const DEFAULT_NOTIFICATIONS = {
  jobAlerts: true,
  applicationUpdates: true,
  newMessages: true,
  recommendations: true,
  systemUpdates: false,
  promotions: false,
  weeklyDigest: true,
  followedCompanies: true,
};

const DEFAULT_DELIVERY = {
  email: true,
  push: true,
  sms: false,
};

const DEFAULT_QUIET = {
  enabled: false,
  from: '22:00',
  to: '07:00',
};

/* ── Animated Toggle Switch ─────────────────────────────────────── */
const ToggleSwitch = ({ enabled, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={enabled}
    onClick={() => onChange(!enabled)}
    className={`
      relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full
      border-2 border-transparent transition-colors duration-300 ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3AB4E6]/50 focus-visible:ring-offset-2
      ${enabled ? 'bg-[#3AB4E6]' : 'bg-gray-200'}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg
        ring-0 transition-transform duration-300 ease-in-out
        ${enabled ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

/* ── Notification Row ───────────────────────────────────────────── */
const NotificationRow = ({ icon: Icon, iconColor, title, description, enabled, onChange, id }) => (
  <div className="group flex items-center justify-between gap-4 py-4 px-5 rounded-xl
                  hover:bg-[#3AB4E6]/[0.03] transition-all duration-200">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconColor}`}>
        <Icon className="text-lg" />
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
      </div>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onChange} id={id} />
  </div>
);

/* ── Section Card ───────────────────────────────────────────────── */
const SectionCard = ({ icon: Icon, title, subtitle, children, accentColor = 'text-[#3AB4E6]' }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                  transition-shadow duration-300 hover:shadow-md">
    {/* Header */}
    <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-50">
      <div className={`w-9 h-9 rounded-xl bg-[#3AB4E6]/10 flex items-center justify-center ${accentColor}`}>
        <Icon className="text-base" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {/* Body */}
    <div className="px-6 py-3 divide-y divide-gray-50">
      {children}
    </div>
  </div>
);

/* ── Delivery Method Chip ───────────────────────────────────────── */
const DeliveryChip = ({ icon: Icon, label, active, onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
      border-2 transition-all duration-200
      ${active
        ? 'border-[#3AB4E6] bg-[#3AB4E6]/10 text-[#3AB4E6] shadow-sm shadow-[#3AB4E6]/10'
        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-500'
      }
    `}
  >
    <Icon className="text-base" />
    {label}
    {active && <FaCheckCircle className="text-xs ml-1" />}
  </button>
);

/* ── Quiet Hours Time Picker ────────────────────────────────────── */
const TimePicker = ({ label, value, onChange, id }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-400">{label}</label>
    <input
      id={id}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700
        focus:outline-none focus:ring-2 focus:ring-[#3AB4E6]/30 focus:border-[#3AB4E6]
        transition-all duration-200 bg-gray-50/50
      "
    />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   ██  MAIN SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════════ */
const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [deliveryMethods, setDeliveryMethods] = useState(DEFAULT_DELIVERY);
  const [quietHours, setQuietHours] = useState(DEFAULT_QUIET);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Convert "HH:mm" string ↔ keep as-is (BE đã serialize TIME thành "HH:mm" qua @JsonFormat).
  const normalizeTime = (t) => {
    if (!t) return '22:00';
    // BE có thể trả "22:00" hoặc "22:00:00" — chuẩn hoá về "HH:mm"
    return typeof t === 'string' && t.length >= 5 ? t.slice(0, 5) : t;
  };

  // ── Load preferences từ backend ──
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await notificationPreferenceService.get();
        if (!active || !data) return;
        setNotifications({
          jobAlerts: data.jobAlerts ?? true,
          applicationUpdates: data.applicationUpdates ?? true,
          newMessages: data.newMessages ?? true,
          recommendations: data.recommendations ?? true,
          systemUpdates: data.systemUpdates ?? false,
          promotions: data.promotions ?? false,
          weeklyDigest: data.weeklyDigest ?? true,
          followedCompanies: data.followedCompanies ?? true,
        });
        setDeliveryMethods({
          email: data.emailEnabled ?? true,
          push: data.pushEnabled ?? true,
          sms: data.smsEnabled ?? false,
        });
        setSoundEnabled(data.soundEnabled ?? true);
        setQuietHours({
          enabled: data.quietHoursEnabled ?? false,
          from: normalizeTime(data.quietHoursFrom) || '22:00',
          to: normalizeTime(data.quietHoursTo) || '07:00',
        });
        setHasChanges(false);
      } catch (err) {
        console.error('Failed to load notification preferences', err);
        toast.error('Không tải được cài đặt thông báo, dùng giá trị mặc định.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ── Mutators (đánh dấu dirty) ──
  const updateNotification = useCallback((key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const toggleDelivery = useCallback((key) => {
    setDeliveryMethods((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  }, []);

  const updateQuietHours = useCallback((key, value) => {
    setQuietHours((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const allEnabled = Object.values(notifications).every(Boolean);
  const toggleAll = () => {
    const newVal = !allEnabled;
    const updated = {};
    Object.keys(notifications).forEach((k) => (updated[k] = newVal));
    setNotifications(updated);
    setHasChanges(true);
  };

  // ── Save to backend ──
  const handleSave = async () => {
    // Edge case: bật quiet hours mà 2 mốc trùng → block ngay tại FE
    if (quietHours.enabled && quietHours.from === quietHours.to) {
      toast.error('Giờ bắt đầu và kết thúc của chế độ im lặng không được trùng nhau.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...notifications,
        emailEnabled: deliveryMethods.email,
        pushEnabled: deliveryMethods.push,
        smsEnabled: deliveryMethods.sms,
        soundEnabled,
        quietHoursEnabled: quietHours.enabled,
        quietHoursFrom: quietHours.from,
        quietHoursTo: quietHours.to,
      };
      await notificationPreferenceService.update(payload);
      toast.success('Đã lưu cài đặt thông báo thành công!');
      setHasChanges(false);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Không thể lưu cài đặt. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO title="Cài đặt thông báo" noIndex />

      <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-screen animate-fade-in">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#3AB4E6]/10 flex items-center justify-center">
                <FaCog className="text-[#3AB4E6] text-lg" />
              </div>
              Cài đặt
            </h1>
            <p className="text-sm text-gray-400 mt-1.5 ml-[52px]">
              Quản lý thông báo, phương thức nhận tin và quyền riêng tư
            </p>
          </div>

          {/* Global Toggle & Save */}
          <div className="flex items-center gap-3 ml-[52px] md:ml-0">
            <button
              id="toggle-all-notifications"
              onClick={toggleAll}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                transition-all duration-200 border-2
                ${allEnabled
                  ? 'border-[#3AB4E6] text-[#3AB4E6] bg-[#3AB4E6]/5 hover:bg-[#3AB4E6]/10'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }
              `}
            >
              {allEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              {allEnabled ? 'Tắt tất cả' : 'Bật tất cả'}
            </button>

            <button
              id="save-notification-settings"
              onClick={handleSave}
              disabled={!hasChanges || saving || loading}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                transition-all duration-200 shadow-sm
                ${hasChanges && !loading
                  ? 'bg-[#3AB4E6] text-white hover:bg-[#2da3d5] hover:shadow-md shadow-[#3AB4E6]/20'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }
              `}
            >
              <FaSave />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

        {/* ── Loading / Unsaved indicator ── */}
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-6 bg-blue-50 border border-blue-100 rounded-xl animate-pulse">
            <FaClock className="text-[#3AB4E6] text-sm shrink-0" />
            <span className="text-xs text-[#2a8ab3] font-medium">
              Đang tải cài đặt thông báo từ máy chủ...
            </span>
          </div>
        ) : hasChanges && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-6 bg-amber-50 border border-amber-100 rounded-xl animate-fade-in">
            <FaExclamationTriangle className="text-amber-500 text-sm shrink-0" />
            <span className="text-xs text-amber-600 font-medium">
              Bạn có thay đổi chưa được lưu. Nhấn "Lưu thay đổi" để áp dụng.
            </span>
          </div>
        )}

        {/* ═══ Main Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* ── Section 1: Thông báo việc làm ── */}
          <SectionCard
            icon={FaBriefcase}
            title="Thông báo việc làm"
            subtitle="Cập nhật về công việc phù hợp với bạn"
          >
            <NotificationRow
              id="toggle-job-alerts"
              icon={FaBell}
              iconColor="bg-blue-50 text-[#3AB4E6]"
              title="Thông báo việc làm mới"
              description="Nhận thông báo khi có việc làm mới phù hợp"
              enabled={notifications.jobAlerts}
              onChange={(v) => updateNotification('jobAlerts', v)}
            />
            <NotificationRow
              id="toggle-recommendations"
              icon={FaStar}
              iconColor="bg-amber-50 text-amber-500"
              title="Đề xuất việc làm"
              description="Gợi ý công việc dựa trên hồ sơ của bạn"
              enabled={notifications.recommendations}
              onChange={(v) => updateNotification('recommendations', v)}
            />
            <NotificationRow
              id="toggle-followed-companies"
              icon={FaGlobe}
              iconColor="bg-teal-50 text-teal-500"
              title="Công ty theo dõi"
              description="Thông báo khi công ty bạn theo dõi đăng việc mới"
              enabled={notifications.followedCompanies}
              onChange={(v) => updateNotification('followedCompanies', v)}
            />
            <NotificationRow
              id="toggle-weekly-digest"
              icon={FaClock}
              iconColor="bg-purple-50 text-purple-500"
              title="Tóm tắt hàng tuần"
              description="Email tổng hợp việc làm mỗi tuần"
              enabled={notifications.weeklyDigest}
              onChange={(v) => updateNotification('weeklyDigest', v)}
            />
          </SectionCard>

          {/* ── Section 2: Hoạt động & Hệ thống ── */}
          <SectionCard
            icon={FaUserCog}
            title="Hoạt động & Hệ thống"
            subtitle="Thông báo về tài khoản và tương tác"
          >
            <NotificationRow
              id="toggle-application-updates"
              icon={FaBriefcase}
              iconColor="bg-green-50 text-green-500"
              title="Cập nhật ứng tuyển"
              description="Trạng thái đơn ứng tuyển của bạn thay đổi"
              enabled={notifications.applicationUpdates}
              onChange={(v) => updateNotification('applicationUpdates', v)}
            />
            <NotificationRow
              id="toggle-new-messages"
              icon={FaCommentDots}
              iconColor="bg-sky-50 text-sky-500"
              title="Tin nhắn mới"
              description="Nhận thông báo khi có tin nhắn từ nhà tuyển dụng"
              enabled={notifications.newMessages}
              onChange={(v) => updateNotification('newMessages', v)}
            />
            <NotificationRow
              id="toggle-system-updates"
              icon={FaCog}
              iconColor="bg-gray-100 text-gray-500"
              title="Cập nhật hệ thống"
              description="Bảo trì, tính năng mới và thay đổi chính sách"
              enabled={notifications.systemUpdates}
              onChange={(v) => updateNotification('systemUpdates', v)}
            />
            <NotificationRow
              id="toggle-promotions"
              icon={FaStar}
              iconColor="bg-rose-50 text-rose-400"
              title="Khuyến mãi & Sự kiện"
              description="Ưu đãi đặc biệt và sự kiện tuyển dụng"
              enabled={notifications.promotions}
              onChange={(v) => updateNotification('promotions', v)}
            />
          </SectionCard>

          {/* ── Section 3: Phương thức nhận thông báo ── */}
          <SectionCard
            icon={FaMobileAlt}
            title="Phương thức nhận thông báo"
            subtitle="Chọn cách bạn muốn nhận thông báo"
          >
            <div className="py-4">
              <div className="flex flex-wrap gap-3 mb-5">
                <DeliveryChip
                  id="delivery-email"
                  icon={FaEnvelope}
                  label="Email"
                  active={deliveryMethods.email}
                  onClick={() => toggleDelivery('email')}
                />
                <DeliveryChip
                  id="delivery-push"
                  icon={FaBell}
                  label="Đẩy (Push)"
                  active={deliveryMethods.push}
                  onClick={() => toggleDelivery('push')}
                />
                <DeliveryChip
                  id="delivery-sms"
                  icon={FaSms}
                  label="SMS"
                  active={deliveryMethods.sms}
                  onClick={() => toggleDelivery('sms')}
                />
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-gray-50/70">
                <div className="flex items-center gap-3">
                  {soundEnabled
                    ? <FaVolumeUp className="text-[#3AB4E6]" />
                    : <FaVolumeMute className="text-gray-300" />
                  }
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Âm thanh thông báo</span>
                    <p className="text-xs text-gray-400">Phát âm thanh khi nhận thông báo mới</p>
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-sound"
                  enabled={soundEnabled}
                  onChange={(v) => { setSoundEnabled(v); setHasChanges(true); }}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Section 4: Chế độ im lặng ── */}
          <SectionCard
            icon={FaMoon}
            title="Chế độ im lặng"
            subtitle="Tạm dừng thông báo trong khoảng thời gian nhất định"
          >
            <div className="py-4">
              {/* Toggle quiet hours */}
              <div className="flex items-center justify-between gap-4 mb-5 px-4 py-3 rounded-xl bg-gray-50/70">
                <div className="flex items-center gap-3">
                  <FaMoon className={quietHours.enabled ? 'text-indigo-500' : 'text-gray-300'} />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Bật chế độ im lặng</span>
                    <p className="text-xs text-gray-400">Không nhận thông báo trong giờ nghỉ</p>
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-quiet-hours"
                  enabled={quietHours.enabled}
                  onChange={(v) => updateQuietHours('enabled', v)}
                />
              </div>

              {/* Time range */}
              <div className={`
                flex items-center gap-4 px-4 transition-all duration-300
                ${quietHours.enabled ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-1'}
              `}>
                <TimePicker
                  id="quiet-from"
                  label="Từ"
                  value={quietHours.from}
                  onChange={(v) => updateQuietHours('from', v)}
                />
                <div className="text-gray-300 font-bold text-lg mt-5">→</div>
                <TimePicker
                  id="quiet-to"
                  label="Đến"
                  value={quietHours.to}
                  onChange={(v) => updateQuietHours('to', v)}
                />
              </div>

              {quietHours.enabled && (
                <div className="mt-4 px-4">
                  <div className="flex items-center gap-2 text-xs text-indigo-500 bg-indigo-50 px-3 py-2 rounded-lg">
                    <FaMoon className="text-[10px]" />
                    Thông báo sẽ được tạm dừng từ {quietHours.from} đến {quietHours.to}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── Section 5: Dữ liệu & Quyền riêng tư ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#3AB4E6]/10 flex items-center justify-center text-[#3AB4E6]">
              <FaShieldAlt className="text-base" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Dữ liệu & Quyền riêng tư</h3>
              <p className="text-xs text-gray-400">Quản lý dữ liệu cá nhân của bạn</p>
            </div>
          </div>
          <GdprExportButton />
        </div>

        {/* ── Info footer ── */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-3 text-xs text-gray-400">
            <FaShieldAlt className="text-gray-300 mt-0.5 shrink-0" />
            <p>
              Cài đặt thông báo được áp dụng cho tài khoản của bạn trên tất cả thiết bị.
              Thay đổi có thể mất vài phút để có hiệu lực. Nếu gặp vấn đề, vui lòng liên hệ{' '}
              <a href="mailto:support@iting.vn" className="text-[#3AB4E6] hover:underline">
                support@iting.vn
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
