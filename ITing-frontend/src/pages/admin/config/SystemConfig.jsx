import React, { useState, useEffect } from "react";
import { 
  Save, 
  RotateCcw, 
  Mail, 
  Globe, 
  Bell, 
  Shield, 
  Database, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Switch,
  Select,
  Textarea,
  Separator,
  Badge,
  LoadingSpinner
} from "../../../components";
import { ConfirmModal } from "../../../components/common";
import useConfirm from "../../../hooks/useConfirm";
import { toast } from "sonner";
import adminConfigService from "../../../services/adminConfigService";
import backupService from "../../../services/backupService";

const CONFIG_GROUPS = [
  { key: "general", label: "Chung", icon: <Globe className="w-4 h-4" />, description: "Cài đặt chung của hệ thống" },
  { key: "email", label: "Email", icon: <Mail className="w-4 h-4" />, description: "Cấu hình gửi email" },
  { key: "notification", label: "Thông báo", icon: <Bell className="w-4 h-4" />, description: "Quản lý thông báo" },
  { key: "security", label: "Bảo mật", icon: <Shield className="w-4 h-4" />, description: "Thiết lập bảo mật" },
  { key: "maintenance", label: "Bảo trì", icon: <Database className="w-4 h-4" />, description: "Chế độ bảo trì & backup" },
];

const SystemConfig = () => {
  const [activeGroup, setActiveGroup] = useState("general");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [confirm, askConfirm, resetConfirm] = useConfirm();
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminConfigService.fetchConfig();
        setConfig(data);
      } catch (error) {
        toast.error("Không thể tải cấu hình hệ thống");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validate config
    const errors = [];
    if (config.maxJobsPerCompany < 1) errors.push("Số tin tối đa mỗi công ty phải lớn hơn 0.");
    if (config.jobExpiryDays < 1) errors.push("Thời gian hết hạn tin phải lớn hơn 0.");
    if (config.maxLoginAttempts < 1) errors.push("Số lần đăng nhập sai tối đa phải lớn hơn 0.");
    if (config.lockoutDuration < 1) errors.push("Thời gian khóa tài khoản phải lớn hơn 0.");
    if (config.sessionTimeout < 1) errors.push("Thời gian hết hạn phiên làm việc phải lớn hơn 0.");
    if (config.minPasswordLength < 6) errors.push("Độ dài mật khẩu tối thiểu phải từ 6 ký tự.");
    
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setIsSaving(true);
    try {
      const data = await adminConfigService.updateConfig(config);
      setConfig(data);
      toast.success("Đã lưu cấu hình thành công!");
    } catch (error) {
      toast.error("Không thể lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    askConfirm({
      title: "Khôi phục cấu hình mặc định",
      message: "Bạn có chắc chắn muốn khôi phục cấu hình mặc định?",
      warning: "Tất cả các thay đổi tùy chỉnh sẽ bị mất.",
      confirmText: "Khôi phục",
      variant: "warning",
      onConfirm: async () => {
        resetConfirm();
        setLoading(true);
        try {
          await adminConfigService.resetToDefault();
          const data = await adminConfigService.fetchConfig();
          setConfig(data);
          toast.info("Đã khôi phục cấu hình mặc định");
        } catch (error) {
          toast.error("Không thể khôi phục cấu hình");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailTestStatus(null);
    try {
      await adminConfigService.testEmailConnection(config);
      setEmailTestStatus("success");
      toast.success("Kết nối SMTP thành công!");
    } catch (error) {
      setEmailTestStatus("error");
      toast.error(error.message || "Kết nối SMTP thất bại. Vui lòng kiểm tra lại cấu hình.");
    } finally {
      setTestingEmail(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const result = await backupService.createBackup();
      toast.success(`Backup đã được tạo thành công! Snapshot: ${result.snapshotId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo backup. Vui lòng thử lại.");
    } finally {
      setCreatingBackup(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner /></div>;
  if (!config) return <div className="p-8 text-center text-slate-500">Failed to load configuration.</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-[#3AB4E6]" /> Cấu hình hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các thiết lập vận hành toàn hệ thống</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-slate-200 shrink-0" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Khôi phục
          </Button>
          <Button className="bg-[#3AB4E6] hover:bg-[#2fa0d1] shadow-lg shadow-sky-100 shrink-0" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="flex overflow-x-auto lg:flex-col p-2 bg-white rounded-2xl border border-slate-100 shadow-sm gap-2 lg:gap-0 custom-scrollbar lg:space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CONFIG_GROUPS.map((group) => (
            <button
              key={group.key}
              onClick={() => setActiveGroup(group.key)}
              className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
                activeGroup === group.key 
                  ? "bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 scale-[1.02]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {group.icon}
              {group.label}
            </button>
          ))}
        </div>

        {/* Configuration Forms */}
        <div className="lg:col-span-3 space-y-6">
          {activeGroup === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Thông tin cơ bản và quy tắc vận hành website</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tên website</label>
                    <Input value={config.siteName} onChange={(e) => updateConfig("siteName", e.target.value)} placeholder="VD: ITing" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">URL website</label>
                    <Input value={config.siteUrl} onChange={(e) => updateConfig("siteUrl", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email hỗ trợ</label>
                  <Input value={config.supportEmail} onChange={(e) => updateConfig("supportEmail", e.target.value)} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mt-4">Quy tắc đăng tin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Số tin tối đa / công ty</label>
                      <Input type="number" value={config.maxJobsPerCompany} onChange={(e) => updateConfig("maxJobsPerCompany", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tin hết hạn sau (ngày)</label>
                      <Input type="number" value={config.jobExpiryDays} onChange={(e) => updateConfig("jobExpiryDays", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-center justify-between p-4 bg-sky-50/50 rounded-2xl border border-sky-100 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Tự động duyệt công ty đã xác minh</p>
                    <p className="text-xs text-slate-500">Công ty có trạng thái Verified sẽ được duyệt tin tự động</p>
                  </div>
                  <Switch className="shrink-0" checked={config.autoApproveVerified} onCheckedChange={(v) => updateConfig("autoApproveVerified", v)} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeGroup === "email" && (
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình Email (SMTP)</CardTitle>
                <CardDescription>Thiết lập máy chủ để gửi thông báo hệ thống</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">SMTP Host</label>
                    <Input value={config.smtpHost} onChange={(e) => updateConfig("smtpHost", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">SMTP Port</label>
                    <Input value={config.smtpPort} onChange={(e) => updateConfig("smtpPort", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">SMTP User</label>
                    <Input value={config.smtpUser} onChange={(e) => updateConfig("smtpUser", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">SMTP Password</label>
                    <Input type="password" value={config.smtpPassword} onChange={(e) => updateConfig("smtpPassword", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên người gửi hiển thị</label>
                  <Input value={config.emailFromName} onChange={(e) => updateConfig("emailFromName", e.target.value)} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="text-xs font-bold uppercase tracking-widest h-10 px-6 border-slate-200"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                  >
                    {testingEmail ? "Đang kiểm tra..." : "Gửi email test"}
                  </Button>
                  {emailTestStatus === "success" && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 animate-in fade-in">
                      <CheckCircle2 className="w-3 h-3" /> Kết nối OK
                    </div>
                  )}
                  {emailTestStatus === "error" && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100 animate-in fade-in">
                      <AlertCircle className="w-3 h-3" /> Lỗi kết nối
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeGroup === "notification" && (
            <Card>
              <CardHeader>
                <CardTitle>Quản lý thông báo</CardTitle>
                <CardDescription>Bật/tắt các loại thông báo tự động tới Admin</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 pt-6">
                {[
                  { key: "notifyNewCompany", label: "Công ty mới đăng ký", desc: "Nhận mail khi có công ty mới cần duyệt" },
                  { key: "notifyNewJob", label: "Tin tuyển dụng mới", desc: "Nhận mail khi có tin mới chờ duyệt" },
                  { key: "notifyUserReport", label: "Báo cáo vi phạm", desc: "Nhận mail khi người dùng report" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <Switch className="shrink-0" checked={config[item.key]} onCheckedChange={(v) => updateConfig(item.key, v)} />
                  </div>
                ))}
                <div className="pt-4 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email tổng hợp (Digest)</label>
                  <Select value={config.emailDigest} onChange={(e) => updateConfig("emailDigest", e.target.value)}>
                       <option value="realtime">Thời gian thực</option>
                       <option value="daily">Hàng ngày</option>
                       <option value="weekly">Hàng tuần</option>
                       <option value="off">Tắt</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeGroup === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật hệ thống</CardTitle>
                <CardDescription>Các thiết lập an toàn cho tài khoản và phiên làm việc</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Đăng nhập sai tối đa</label>
                    <Input type="number" value={config.maxLoginAttempts} onChange={(e) => updateConfig("maxLoginAttempts", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Khóa (phút)</label>
                    <Input type="number" value={config.lockoutDuration} onChange={(e) => updateConfig("lockoutDuration", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Hết hạn (phút)</label>
                    <Input type="number" value={config.sessionTimeout} onChange={(e) => updateConfig("sessionTimeout", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Độ dài mật khẩu tối thiểu</label>
                  <Input type="number" value={config.minPasswordLength} onChange={(e) => updateConfig("minPasswordLength", e.target.value)} />
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: "requireEmailVerification", label: "Yêu cầu xác minh email", desc: "Bắt buộc ứng viên xác thực mail sau khi tạo tài khoản" },
                    { key: "enable2FA", label: "Xác thực 2 yếu tố (2FA)", desc: "Dành riêng cho các tài khoản Quản trị" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                      </div>
                      <Switch className="shrink-0" checked={config[item.key]} onCheckedChange={(v) => updateConfig(item.key, v)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeGroup === "maintenance" && (
            <Card>
              <CardHeader>
                <CardTitle>Bảo trì & Sao lưu</CardTitle>
                <CardDescription>Đảm bảo tính ổn định và an toàn dữ liệu</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6 pt-6">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">Chế độ bảo trì</p>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">Hệ thống sẽ bị ngắt kết nối với người dùng</p>
                    </div>
                  </div>
                  <Switch
                    className="shrink-0"
                    checked={config.maintenanceMode}
                    onCheckedChange={(v) => {
                      if (v) {
                        askConfirm({
                          title: "Bật chế độ bảo trì",
                          message: "Khi bật chế độ bảo trì, người dùng thông thường sẽ không thể truy cập website.",
                          warning: "Chỉ tài khoản Admin mới có thể truy cập hệ thống khi đang bảo trì.",
                          confirmText: "Bật bảo trì",
                          variant: "warning",
                          onConfirm: () => {
                            updateConfig("maintenanceMode", true);
                          }
                        });
                      } else {
                        askConfirm({
                          title: "Tắt chế độ bảo trì",
                          message: "Hệ thống sẽ hoạt động bình thường trở lại.",
                          confirmText: "Tắt bảo trì",
                          variant: "primary",
                          onConfirm: () => {
                            updateConfig("maintenanceMode", false);
                          }
                        });
                      }
                    }}
                  />
                </div>
                
                {config.maintenanceMode && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-bold text-slate-700">Thông báo hiển thị cho người dùng</label>
                    <Textarea value={config.maintenanceMessage} onChange={(e) => updateConfig("maintenanceMessage", e.target.value)} rows={3} />
                  </div>
                )}

                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Lịch trình sao lưu (Backup)
                  </h3>
                  <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">Bật sao lưu tự động</p>
                      <p className="text-xs text-slate-500 font-medium">Tự động backup database định kỳ</p>
                    </div>
                    <Switch className="shrink-0" checked={config.autoBackup} onCheckedChange={(v) => updateConfig("autoBackup", v)} />
                  </div>
                  
                  {config.autoBackup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tần suất</label>
                        <Select value={config.backupFrequency} onChange={(e) => updateConfig("backupFrequency", e.target.value)}>
                             <option value="hourly">Mỗi giờ</option>
                             <option value="daily">Hàng ngày</option>
                             <option value="weekly">Hàng tuần</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Số ngày lưu trữ</label>
                        <Input type="number" value={config.backupRetention} onChange={(e) => updateConfig("backupRetention", e.target.value)} />
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-12 md:w-auto px-8 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-[10px]"
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                  >
                    {creatingBackup ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin mr-2" />
                        Đang tạo backup...
                      </>
                    ) : (
                      "Tạo Backup ngay bây giờ"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Bottom padding for bulk bar if needed, but not here */}
      <div className="h-20" />

      <ConfirmModal isOpen={confirm.isOpen} onClose={resetConfirm} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} warning={confirm.warning} confirmText={confirm.confirmText} variant={confirm.variant} />
    </div>
  );
};

export default SystemConfig;
