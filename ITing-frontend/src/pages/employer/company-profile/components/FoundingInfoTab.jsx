import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaRegCircle,
  FaArrowRight,
  FaCamera,
  FaSpinner,
  FaPlus,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { AVAILABLE_INDUSTRIES } from "../../../../constants/industries";
import companyService from "../../../../services/companyService";
import { toast } from "sonner";
import AppModal from "../../../../components/common/AppModal";

const STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: "Đang chờ admin duyệt",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Đã được duyệt",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  DRAFT: {
    label: "Nháp",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  SUSPENDED: {
    label: "Đang bị đình chỉ",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  NEEDS_RESUBMISSION: {
    label: "Cần bổ sung hồ sơ",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  }
};

const DEFAULT_LOGO_HINTS = [
  "default",
  "placeholder",
  "company-default",
  "logo-default",
  "logo-placeholder"
];

const emptyRequestForm = {
  companyName: "",
  taxCode: "",
  industries: [],
  companySize: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  description: "",
  logoUrl: "",
};

const ReadOnlyField = ({ label, value, multiline = false, extra = null }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {extra}
    </div>

    {multiline ? (
      <div className="min-h-[120px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
        {value || "Chưa có thông tin"}
      </div>
    ) : (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        {value || "Chưa có thông tin"}
      </div>
    )}
  </div>
);

const StatusBadge = ({ status, onClick, hasReason }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
      {hasReason && (
        <button
          onClick={onClick}
          className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
        >
          <FaFileAlt /> Xem lý do
        </button>
      )}
    </div>
  );
};

const FoundingInfoTab = ({ onTabChange }) => {
  const [company, setCompany] = useState(null);
  const [verificationLevel, setVerificationLevel] = useState("UNVERIFIED");

  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [requestForm, setRequestForm] = useState(emptyRequestForm);
  const [requestErrors, setRequestErrors] = useState({});

  const [showReasonModal, setShowReasonModal] = useState(false);
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState(null);
  const [imageError, setImageError] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const companyData = await companyService.getMyCompany();

      if (companyData) {
        setCompany(companyData);
        setVerificationLevel(companyData.verificationLevel || "UNVERIFIED");

        setRequestForm({
          companyName: companyData.name || "",
          taxCode: companyData.taxCode || "",
          industries: companyData.industries || [],
          companySize: companyData.companySize || "",
          phone: companyData.phone || "",
          email: companyData.companyEmail || "",
          address: companyData.address || "",
          website: companyData.website || companyData.webLink || "",
          description: companyData.description || "",
          logoUrl: companyData.logoUrl || companyData.logo || "",
        });
      }

    } catch (error) {
      console.error("Lỗi khi lấy thông tin công ty:", error);
      toast.error("Không thể tải thông tin công ty.");
    } finally {
      setLoading(false);
    }
  };

  const ReasonModal = ({ reason, onClose, status, isOpen }) => {
    const isErrorStatus = status === 'REJECTED' || status === 'SUSPENDED';

    return (
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        title="Thông báo từ Admin"
        size="sm"
        footer={
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-800 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700"
          >
            Đã hiểu
          </button>
        }
      >
        <div className={`mb-4 flex items-center gap-3 rounded-lg p-3 ${isErrorStatus ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
          }`}>
          <FaExclamationTriangle className="text-xl shrink-0" />
          <p className="text-sm font-medium">
            {status === 'REJECTED' ? 'Yêu cầu của bạn đã bị từ chối' :
              status === 'SUSPENDED' ? 'Tài khoản của bạn đã bị đình chỉ' :
                'Hồ sơ của bạn cần bổ sung thông tin'}
          </p>
        </div>

        <div className="mb-2">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Lý do cụ thể:</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap italic">
            "{reason || "Không có lý do chi tiết"}"
          </div>
        </div>
      </AppModal>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const verificationSteps = useMemo(() => {
    return [
      {
        id: 'phone',
        label: "Xác thực số điện thoại",
        done: company?.phone && (
          verificationLevel === "BASIC" ||
          verificationLevel === "ADVANCED" ||
          verificationLevel === "VERIFIED"
        ),
      },
      {
        id: 'info',
        label: "Cập nhật thông tin công ty",
        done: company?.companyInfoUpdateStatus === 'APPROVED' ||
          verificationLevel === "BASIC" ||
          verificationLevel === "ADVANCED" ||
          verificationLevel === "VERIFIED",
      },
      {
        id: 'license',
        label: "Xác thực Giấy đăng ký doanh nghiệp",
        done: company?.documentReviewStatus === 'APPROVED' ||
          verificationLevel === "ADVANCED" ||
          verificationLevel === "VERIFIED",
      },
    ];
  }, [verificationLevel, company]);

  const completedCount = verificationSteps.filter((item) => item.done).length;
  const percentage = Math.round(
    (completedCount / verificationSteps.length) * 100,
  );

  const isUsingDefaultLogo = useMemo(() => {
    const logo = company?.logoUrl || company?.logo || "";
    if (!logo) return true;
    return DEFAULT_LOGO_HINTS.some((hint) =>
      logo.toLowerCase().includes(hint.toLowerCase()),
    );
  }, [company]);

  const hasPendingRequest = company?.companyInfoUpdateStatus === "PENDING_REVIEW";

  const hasChanges = useMemo(() => {
    if (!company) return false;

    const initialValues = {
      companyName: company.name || "",
      taxCode: company.taxCode || "",
      industries: company.industries || [],
      companySize: company.companySize || "",
      phone: company.phone || "",
      email: company.companyEmail || "",
      address: company.address || "",
      website: company.website || company.webLink || "",
      description: company.description || "",
      logoUrl: company.logoUrl || company.logo || "",
    };

    // Deep compare for industries
    const industriesMatch =
      JSON.stringify([...(initialValues.industries || [])].sort()) ===
      JSON.stringify([...(requestForm.industries || [])].sort());

    return (
      requestForm.companyName !== initialValues.companyName ||
      requestForm.taxCode !== initialValues.taxCode ||
      !industriesMatch ||
      requestForm.companySize !== initialValues.companySize ||
      requestForm.phone !== initialValues.phone ||
      requestForm.email !== initialValues.email ||
      requestForm.address !== initialValues.address ||
      requestForm.website !== initialValues.website ||
      requestForm.description !== initialValues.description ||
      requestForm.logoUrl !== initialValues.logoUrl
    );
  }, [requestForm, company]);

  const validateRequest = () => {
    const newErrors = {};

    if (!requestForm.companyName.trim()) {
      newErrors.companyName = "Vui lòng nhập tên công ty";
    }
    if (!requestForm.taxCode.trim()) {
      newErrors.taxCode = "Vui lòng nhập mã số thuế";
    }
    if (!requestForm.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    }
    if (!requestForm.email.trim()) {
      newErrors.email = "Vui lòng nhập email công ty";
    }
    if (!requestForm.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ công ty";
    }
    if (!requestForm.website.trim()) {
      newErrors.website = "Vui lòng nhập website";
    }

    return newErrors;
  };

  const openCreateRequestModal = () => {
    if (!company) return;

    setRequestErrors({});
    setRequestForm({
      companyName: company.name || "",
      taxCode: company.taxCode || "",
      industries: company.industries || [],
      companySize: company.companySize || "",
      phone: company.phone || "",
      email: company.companyEmail || "",
      address: company.address || "",
      website: company.website || company.webLink || "",
      description: company.description || "",
      logoUrl: company.logoUrl || company.logo || "",
    });
    setLogoPreview(null);
    setImageError(false);
    setShowRequestModal(true);
  };

  const handleRequestFieldChange = (field, value) => {
    setRequestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitUpdateRequest = async () => {
    const newErrors = validateRequest();
    setRequestErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmittingRequest(true);

      const payload = {
        name: requestForm.companyName,
        taxCode: requestForm.taxCode,
        industries: requestForm.industries,
        companySize: requestForm.companySize,
        phone: requestForm.phone,
        companyEmail: requestForm.email,
        address: requestForm.address,
        website: requestForm.website,
        description: requestForm.description,
        logoUrl: requestForm.logoUrl,
      };

      await companyService.createCompanyUpdateRequest(payload);

      toast.success("Đã gửi yêu cầu cập nhật thông tin tới admin.");
      setShowRequestModal(false);
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu cập nhật:", error);
      toast.error(
        error?.message || "Không thể gửi yêu cầu cập nhật. Vui lòng thử lại.",
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Create local preview
    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    setImageError(false);

    try {
      setUploadingLogo(true);
      const res = await companyService.uploadCompanyLogo(file);
      const newUrl = res.logoUrl || res.data?.logoUrl;
      handleRequestFieldChange("logoUrl", newUrl);
      toast.success("Đã tải logo lên thành công");
    } catch (error) {
      console.error("Lỗi upload logo:", error);
      toast.error("Không thể tải logo lên. Vui lòng thử lại.");
      setLogoPreview(null); // Revert on error if needed
    } finally {
      setUploadingLogo(false);
    }
  };

  const renderIndustries = (industries = []) => {
    if (!industries.length) return "Chưa có thông tin";

    return (
      <div className="flex flex-wrap gap-2">
        {industries.map((industry, index) => (
          <span
            key={`${industry}-${index}`}
            className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700"
          >
            {AVAILABLE_INDUSTRIES.find((i) => i.value === industry)?.label ||
              industry}
          </span>
        ))}
      </div>
    );
  };

  const handleStepAction = (index) => {
    switch (index) {
      case 0:
        onTabChange?.('settings');
        // Scroll to phone section if possible or just switch tab
        break;
      case 1:
        openCreateRequestModal();
        break;
      case 2:
        navigate('/employer/verification');
        break;
      default:
        break;
    }
  };

  const handleUploadLicense = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      await companyService.uploadBusinessLicense(file);
      toast.success("Tải giấy phép kinh doanh thành công! Đang chờ admin duyệt.");
      await fetchData();
    } catch (error) {
      console.error("Lỗi upload license:", error);
      toast.error(error?.response?.data?.message || "Không thể upload giấy phép.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <FaSpinner className="mb-4 text-4xl text-[#3AB4E6] animate-spin" />
        <p className="text-gray-500">Đang tải thông tin công ty...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        id="business-license-upload"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleUploadLicense}
      />

      <ReasonModal
        isOpen={showReasonModal}
        reason={company?.statusReason}
        onClose={() => setShowReasonModal(false)}
        status={company?.companyInfoUpdateStatus}
      />

      <div className="rounded-2xl border border-green-100 bg-[#F4FBF4] p-8 shadow-sm">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Tài khoản xác thực: Cấp {completedCount}/{verificationSteps.length}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-2xl">
            Thông tin công ty là thông tin xác thực. Bạn không thể chỉnh sửa trực tiếp. Mọi thay đổi phải được gửi thành yêu cầu để admin xem xét và duyệt trước khi cập nhật chính thức.
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Xác thực thông tin</span>
            <span className="text-sm font-bold text-green-600">Hoàn thành {percentage}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200/60">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-8 divide-y divide-green-100/50">
          {verificationSteps.map((step, index) => (
            <div
              key={index}
              onClick={() => handleStepAction(index)}
              className="group flex items-center justify-between py-4 cursor-pointer transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${step.done ? 'bg-green-500 text-white' : 'border-2 border-gray-300 bg-white text-transparent'
                  }`}>
                  <FaCheckCircle className="text-lg" />
                </div>
                <span className={`text-sm font-medium transition-colors ${step.done ? "text-gray-400 line-through" : "text-gray-700 group-hover:text-green-600"}`}>
                  {step.label}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 text-gray-400 opacity-0 transition-all group-hover:opacity-100 group-hover:shadow-sm">
                <FaArrowRight className="text-xs group-hover:text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isUsingDefaultLogo && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="mt-0.5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">Bạn đang sử dụng logo mặc định.</p>
              <p className="mt-1 text-sm text-yellow-700">Bổ sung Logo Công ty giúp tin tuyển dụng uy tín và nổi bật hơn.</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Yêu cầu cập nhật thông tin</h3>
            <p className="mt-1 text-sm text-gray-500">Thông tin hiển thị bên dưới là dữ liệu cuối cùng đã được duyệt.</p>
          </div>
          <div className="flex gap-2">
            {(company?.companyInfoUpdateStatus === 'DRAFT' || company?.companyInfoUpdateStatus === 'REJECTED' || company?.companyInfoUpdateStatus === 'NEEDS_RESUBMISSION') && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await companyService.submitInfoReview();
                    toast.success("Hồ sơ đã được gửi đi. Vui lòng chờ Admin xét duyệt.");
                    await fetchData();
                  } catch (error) {
                    toast.error(error?.response?.data?.message || "Không thể gửi duyệt");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaCheckCircle />
                Gửi duyệt hồ sơ
              </button>
            )}
            <button
              type="button"
              onClick={openCreateRequestModal}
              disabled={hasPendingRequest}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3AB4E6] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaPlus />
              {company?.companyInfoUpdateStatus === 'APPROVED' ? "Tạo yêu cầu thay đổi" : "Chỉnh sửa thông tin"}
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Trạng thái hiện tại</span>
          </div>
          <StatusBadge
            status={company?.companyInfoUpdateStatus}
            hasReason={!!company?.statusReason && ['REJECTED', 'SUSPENDED', 'NEEDS_RESUBMISSION'].includes(company?.companyInfoUpdateStatus)}
            onClick={() => setShowReasonModal(true)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
          <div><span className="font-medium text-gray-800">Cập nhật cuối:</span> {company?.lastUpdate ? new Date(company.lastUpdate).toLocaleString("vi-VN") : "—"}</div>
          <div><span className="font-medium text-gray-800">Mức xác thực:</span> <span className="text-green-600 font-semibold">{company?.verificationLevel || "UNVERIFIED"}</span></div>
        </div>

        {hasPendingRequest && (
          <p className="mt-3 text-sm text-amber-700 font-medium bg-amber-50 p-2 rounded border border-amber-200">
            Lưu ý: Thông tin đang chờ admin duyệt.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6"><h3 className="text-lg font-semibold text-gray-800">Thông tin công ty đã duyệt</h3></div>

        <div className="mb-8 flex flex-col items-center rounded-xl bg-gray-50 p-6 text-center">
          <p className="mb-4 text-sm text-gray-500">Logo công ty</p>
          <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-3xl font-semibold text-gray-500">
            {company?.logoUrl ? <img src={company.logoUrl} alt="Logo" className="h-full w-full object-cover" /> : company?.name?.charAt(0) || "C"}
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500"><FaCamera />Chỉ hiển thị. Hãy tạo yêu cầu để thay đổi.</div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ReadOnlyField label="Tên công ty" value={company?.name} />
          <ReadOnlyField label="Mã số thuế" value={company?.taxCode} />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Lĩnh vực</label>
            <div className="min-h-[52px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{renderIndustries(company?.industries || [])}</div>
          </div>
          <ReadOnlyField label="Quy mô công ty" value={company?.companySize} />
          <ReadOnlyField label="Số điện thoại" value={company?.phone} />
          <ReadOnlyField label="Website" value={company?.website || company?.webLink} />
          <ReadOnlyField label="Email công ty" value={company?.companyEmail} />
          <ReadOnlyField label="Địa chỉ công ty" value={company?.address} />
          <div className="md:col-span-2"><ReadOnlyField label="Giới thiệu công ty" value={company?.description} multiline /></div>
        </div>
      </div>

      <AppModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Tạo yêu cầu cập nhật thông tin"
        subtitle="Thông tin sẽ được admin duyệt trước khi cập nhật chính thức."
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRequestModal(false)} className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">Hủy</button>
            <button
              onClick={handleSubmitUpdateRequest}
              disabled={submittingRequest || uploadingLogo || !hasChanges}
              className={`flex items-center gap-2 rounded-lg px-8 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed ${hasChanges
                  ? "bg-[#3AB4E6] hover:opacity-90"
                  : "bg-gray-300 text-gray-500 opacity-60"
                }`}
            >
              {submittingRequest ? "Đang gửi..." : "Gửi admin duyệt"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-6">
            <p className="mb-4 text-sm font-semibold text-gray-700">Logo công ty</p>
            <div className="group relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md ring-1 ring-gray-200">
                {(logoPreview || requestForm.logoUrl) && !imageError ? (
                  <img
                    src={logoPreview || requestForm.logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-300 uppercase">
                    {requestForm.companyName?.charAt(0) || "C"}
                  </span>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                    <FaSpinner className="animate-spin text-white text-2xl" />
                  </div>
                )}
              </div>
              <label htmlFor="logo-upload-modal" className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-sky-600 shadow-lg border border-gray-100 transition hover:scale-110">
                <FaCamera className="text-sm" />
                <input type="file" id="logo-upload-modal" className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files[0])} />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 italic">Khuyên dùng ảnh vuông, tối thiểu 200x200px</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Tên công ty</label>
              <input type="text" value={requestForm.companyName} onChange={(e) => handleRequestFieldChange("companyName", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Mã số thuế</label>
              <input type="text" value={requestForm.taxCode} onChange={(e) => handleRequestFieldChange("taxCode", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lĩnh vực
              </label>
              <div className="group relative min-h-[52px] w-full rounded-lg border border-gray-300 bg-white p-2 transition focus-within:border-[#3AB4E6]">
                <div className="flex flex-wrap items-center gap-2">
                  {requestForm.industries.map((industry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700"
                    >
                      <span>
                        {AVAILABLE_INDUSTRIES.find(
                          (i) => i.value === industry,
                        )?.label || industry}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestFieldChange(
                            "industries",
                            requestForm.industries.filter(
                              (_, i) => i !== index,
                            ),
                          );
                        }}
                        className="transition-colors hover:text-red-500"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </div>
                  ))}

                  <div className="relative min-w-[120px] flex-1">
                    <select
                      value=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value &&
                          !requestForm.industries.includes(value)
                        ) {
                          handleRequestFieldChange("industries", [
                            ...requestForm.industries,
                            value,
                          ]);
                        }
                      }}
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    >
                      <option value="" disabled>
                        Thêm lĩnh vực...
                      </option>
                      {AVAILABLE_INDUSTRIES.filter(
                        (item) =>
                          !requestForm.industries.includes(item.value),
                      ).map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none flex items-center justify-between px-2 text-gray-400 group-focus-within:text-[#3AB4E6]">
                      <span className="truncate text-sm">
                        {requestForm.industries.length === 0
                          ? "Chọn lĩnh vực từ danh sách..."
                          : "Thêm mới..."}
                      </span>
                      <FaPlus className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Quy mô công ty</label>
              <select value={requestForm.companySize} onChange={(e) => handleRequestFieldChange("companySize", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]">
                <option value="">Chọn quy mô</option>
                <option value="1-10">1-10 nhân sự</option>
                <option value="11-50">11-50 nhân sự</option>
                <option value="51-100">51-100 nhân sự</option>
                <option value="100+">Trên 100 nhân sự</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="text" value={requestForm.phone} onChange={(e) => handleRequestFieldChange("phone", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email công ty</label>
              <input type="text" value={requestForm.email} onChange={(e) => handleRequestFieldChange("email", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Website</label>
              <input type="text" value={requestForm.website} onChange={(e) => handleRequestFieldChange("website", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]" />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ công ty
                </label>
                {requestForm.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(requestForm.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-tighter font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    <FaMapMarkerAlt /> Xem trên Map
                  </a>
                )}
              </div>
              <input
                type="text"
                value={requestForm.address}
                onChange={(e) => handleRequestFieldChange("address", e.target.value)}
                placeholder="Nhập địa chỉ chính xác của công ty"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Giới thiệu công ty</label>
              <textarea rows="4" value={requestForm.description} onChange={(e) => handleRequestFieldChange("description", e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3AB4E6]" />
            </div>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default FoundingInfoTab;
