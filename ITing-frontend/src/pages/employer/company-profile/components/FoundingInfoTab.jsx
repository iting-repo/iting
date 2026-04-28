import React, { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaRegCircle, FaArrowRight, FaCamera, FaSpinner } from 'react-icons/fa';
import companyService from '../../../../services/companyService';
import { toast } from 'sonner';

const FoundingInfoTab = () => {
  const [form, setForm] = useState({
    id: null,
    companyName: '',
    taxCode: '',
    foundedYear: '',
    companySize: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    description: '',
    industry: '',
    logoUrl: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [verificationLevel, setVerificationLevel] = useState('UNVERIFIED');

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        const data = await companyService.getMyCompany();
        if (data) {
          setForm({
            id: data.id,
            companyName: data.name || '',
            taxCode: data.taxCode || '',
            foundedYear: data.lastUpdate ? new Date(data.lastUpdate).getFullYear() : '', // API doesn't have foundedYear, using lastUpdate year as placeholder or keeping it empty if not sure. Or maybe it's industry?
            companySize: data.companySize || '',
            phone: data.phone || '',
            email: data.companyEmail || '',
            address: data.address || '',
            website: data.website || '',
            description: data.description || '',
            industry: data.industry || '',
            logoUrl: data.logoUrl || null,
          });
          setVerificationLevel(data.verificationLevel);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin công ty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const verificationSteps = [
    { label: 'Xác thực số điện thoại', done: verificationLevel !== 'UNVERIFIED' },
    { label: 'Cập nhật thông tin công ty', done: !!form.companyName },
    { label: 'Xác thực Giấy đăng ký doanh nghiệp', done: verificationLevel === 'VERIFIED_LEVEL_2' }, // Giả định cấp độ xác thực
  ];

  const completedCount = verificationSteps.filter((item) => item.done).length;
  const percentage = Math.round((completedCount / verificationSteps.length) * 100);

  const validate = () => {
    const newErrors = {};

    if (!form.companyName.trim()) newErrors.companyName = 'Vui lòng nhập tên công ty';
    if (!form.taxCode.trim()) newErrors.taxCode = 'Vui lòng nhập mã số thuế';
    if (!form.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!form.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!form.website.trim()) newErrors.website = 'Vui lòng nhập website';

    return newErrors;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước logo không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const data = await companyService.uploadLogo(file);
      const newLogoUrl = data.logoUrl || data.data?.logoUrl || data;
      handleChange('logoUrl', newLogoUrl);
      toast.success('Tải logo lên thành công!');
    } catch (error) {
      console.error('Lỗi khi tải logo:', error);
      toast.error('Không thể tải logo lên. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setSaving(true);
        // Map back to API format for potential update API call
        const companyData = {
          name: form.companyName,
          logoUrl: form.logoUrl,
          taxCode: form.taxCode,
          companySize: form.companySize,
          companyEmail: form.email,
          industry: form.industry,
          address: form.address,
          phone: form.phone,
          description: form.description,
        };
        await companyService.updateCompanyBasicInfo(form.id, companyData);
        toast.success('Cập nhật thông tin công ty thành công!');
      } catch (error) {
        console.error('Lỗi khi lưu thông tin:', error);
        toast.error(error?.message || 'Lỗi: Không thể cập nhật thông tin công ty.');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <FaSpinner className="animate-spin text-4xl text-[#3AB4E6] mb-4" />
        <p className="text-gray-500">Đang tải thông tin công ty...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card xác thực */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Tài khoản xác thực: Cấp {completedCount}/{verificationSteps.length}
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Nâng cấp tài khoản để tăng độ tin cậy và mở thêm quyền quản lý hồ sơ công ty.
        </p>

        <p className="text-sm text-gray-600 mb-2">Xác thực thông tin</p>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-green-600">
            Hoàn thành {percentage}%
          </span>
        </div>

        <div className="space-y-3">
          {verificationSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {step.done ? (
                  <FaCheckCircle className="text-green-500 text-lg" />
                ) : (
                  <FaRegCircle className="text-gray-400 text-lg" />
                )}

                <span
                  className={`text-sm ${
                    step.done ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              <FaArrowRight className="text-gray-400 text-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Form thông tin công ty */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Cập nhật thông tin công ty
        </h3>

          {/* Cột logo */}
          <div className="md:col-span-4">
            <div className=" rounded-xl p-6 h-full flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500 mb-4">Logo công ty</p>

              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-3xl mb-4 overflow-hidden relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-full">
                    <FaSpinner className="animate-spin text-white text-xl" />
                  </div>
                )}
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  form.companyName.charAt(0) || 'C'
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <button 
                type="button"
                onClick={handleLogoClick}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 text-base font-medium text-[#3AB4E6] hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                <FaCamera className="text-lg" />
                {isUploading ? 'Đang tải...' : 'Đổi logo'}
              </button>
            
          </div>

          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên công ty
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Nhập tên công ty"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                errors.companyName
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-[#3AB4E6]'
              }`}
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã số thuế
            </label>
            <input
              type="text"
              value={form.taxCode}
              onChange={(e) => handleChange('taxCode', e.target.value)}
              placeholder="Nhập mã số thuế"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                errors.taxCode
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-[#3AB4E6]'
              }`}
            />
            {errors.taxCode && (
              <p className="text-red-500 text-sm mt-1">{errors.taxCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm thành lập
            </label>
            <input
              type="text"
              value={form.foundedYear}
              onChange={(e) => handleChange('foundedYear', e.target.value)}
              placeholder="Ví dụ: 2020"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3AB4E6] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quy mô công ty
            </label>
            <select
              value={form.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3AB4E6] transition"
            >
              <option value="">Chọn quy mô</option>
              <option value="1-10">1 - 10 nhân sự</option>
              <option value="11-50">11 - 50 nhân sự</option>
              <option value="51-100">51 - 100 nhân sự</option>
              <option value="100+">Trên 100 nhân sự</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
            </div>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                errors.phone
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-[#3AB4E6]'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                errors.website
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-[#3AB4E6]'
              }`}
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website}</p>
            )}
          </div>

           <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email công ty
                </label>
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Nhập email công ty"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#3AB4E6]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ công ty
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ công ty"
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                    errors.address
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-[#3AB4E6]'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới thiệu công ty
            </label>
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Nhập mô tả ngắn về công ty"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#3AB4E6] transition resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            disabled={saving}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#3AB4E6] text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoundingInfoTab;
