import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaLink,
  FaListUl,
  FaListOl,
  FaArrowRight,
  FaChevronDown,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import { toast } from "sonner";
import companyService from "../../services/companyService";

// const PROVINCE_API_BASE = "https://provinces.open-api.vn/api/v2";

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "INTERN", label: "Thực tập sinh" },
  { value: "FRESHER", label: "Fresher" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MIDDLE", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "MANAGER", label: "Manager" },
];

const JOB_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "REMOTE", label: "Làm từ xa" },
  { value: "FREELANCE", label: "Tự do" },
  { value: "INTERN", label: "Thực tập" },
];

const SALARY_TYPE_OPTIONS = [
  { value: "NEGOTIABLE", label: "Thỏa thuận" },
  { value: "MONTH", label: "Theo tháng" },
  { value: "PROJECT", label: "Theo dự án" },
  { value: "HOUR", label: "Theo giờ" },
];

const DEFAULT_POSITION_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "UI/UX Designer",
  "QA Engineer",
  "DevOps Engineer",
  "Business Analyst",
  "Mobile Developer",
  "Project Manager",
];

const DEFAULT_TECH_OPTIONS = [
  "ReactJS",
  "NodeJS",
  "Java",
  "Spring Boot",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
];

const normalizeMultiValueField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

function EditorToolbar() {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-4 text-gray-500 mb-2">
      <button type="button" className="hover:text-black">
        <FaBold />
      </button>
      <button type="button" className="hover:text-black">
        <FaItalic />
      </button>
      <button type="button" className="hover:text-black">
        <FaUnderline />
      </button>
      <button type="button" className="hover:text-black">
        <FaStrikethrough />
      </button>
      <div className="w-px bg-gray-300 mx-1"></div>
      <button type="button" className="hover:text-black">
        <FaLink />
      </button>
      <button type="button" className="hover:text-black">
        <FaListUl />
      </button>
      <button type="button" className="hover:text-black">
        <FaListOl />
      </button>
    </div>
  );
}

function MultiSelectTagInput({
  label,
  selectedValues,
  setSelectedValues,
  options,
  placeholder,
}) {
  const [customValue, setCustomValue] = useState("");

  const availableOptions = useMemo(
    () => options.filter((item) => !selectedValues.includes(item)),
    [options, selectedValues],
  );

  const addItem = (value) => {
    const clean = value.trim();
    if (!clean) return;
    if (selectedValues.includes(clean)) {
      setCustomValue("");
      return;
    }
    setSelectedValues([...selectedValues, clean]);
    setCustomValue("");
  };

  const removeItem = (value) => {
    setSelectedValues(selectedValues.filter((item) => item !== value));
  };

  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>

      <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white">
        <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
          {selectedValues.length === 0 ? (
            <span className="text-sm text-gray-400">Chưa chọn</span>
          ) : (
            selectedValues.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-[#E8F6FD] text-[#1487B8] px-3 py-1 text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="font-bold"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mb-2">
          <div className="relative">
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                addItem(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Chọn từ danh sách</option>
              {availableOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
            />
            <button
              type="button"
              onClick={() => addItem(customValue)}
              className="bg-[#1967D2] hover:bg-blue-700 text-white px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <FaPlus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PostJob = ({
  onClose,
  onSubmitSuccess,
  initialData = null,
  isEdit = false,
}) => {
  const initialFormState = useMemo(() => ({
    jobTitle: initialData?.title || "",
    jobPosition: normalizeMultiValueField(initialData?.position),
    techStack: normalizeMultiValueField(initialData?.techRequired),
    workType: initialData?.jobType || "",
    experienceLevel: initialData?.experienceLevel || "",
    workingDays: initialData?.workingDays || "",
    quantity: initialData?.maxAccept ?? "",
    deadline: initialData?.dueDate || "",
    province: initialData?.province || "",
    ward: initialData?.ward || "",
    address: initialData?.address || "",
    minSalary: initialData?.minSalary ?? "",
    maxSalary: initialData?.maxSalary ?? "",
    salaryType: initialData?.salaryType || "NEGOTIABLE",
    description: initialData?.description || "",
    responsibilities: initialData?.responsibilities || "",
    requirements: initialData?.requirements || "",
    benefits: initialData?.benefits || "",
  }), [initialData]);

  const [formData, setFormData] = useState(initialFormState);

  const hasChanges = useMemo(() => {
    if (!isEdit) return true;
    return JSON.stringify(formData) !== JSON.stringify(initialFormState);
  }, [formData, initialFormState, isEdit]);

  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => toast.error("Không tải được danh sách tỉnh/thành"));
  }, []);

  useEffect(() => {
    const selectedProvince = provinces.find(
      (p) => p.name === formData.province,
    );

    if (selectedProvince) {
      setLoadingWards(true);

      fetch(
        `https://provinces.open-api.vn/api/v2/p/${selectedProvince.code}?depth=2`,
      )
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
        })
        .catch(() => {
          setWards([]);
          toast.error("Không tải được danh sách phường/xã");
        })
        .finally(() => setLoadingWards(false));
    } else {
      setWards([]);
    }
  }, [formData.province, provinces]);

  const validate = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Bắt buộc";
    if (formData.jobPosition.length === 0) newErrors.jobPosition = "Bắt buộc";
    if (formData.techStack.length === 0) newErrors.techStack = "Bắt buộc";
    if (!formData.workType) newErrors.workType = "Bắt buộc";
    if (!formData.experienceLevel) newErrors.experienceLevel = "Bắt buộc";
    if (!formData.workingDays.trim()) newErrors.workingDays = "Bắt buộc";
    if (!formData.quantity) newErrors.quantity = "Bắt buộc";
    if (!formData.deadline) newErrors.deadline = "Bắt buộc";
    if (!formData.province) newErrors.province = "Bắt buộc";
    if (!formData.ward) newErrors.ward = "Bắt buộc";
    if (!formData.address.trim()) newErrors.address = "Bắt buộc";
    if (formData.salaryType !== "NEGOTIABLE" && !formData.minSalary) {
      newErrors.minSalary = "Bắt buộc";
    }
    if (formData.salaryType !== "NEGOTIABLE" && !formData.maxSalary) {
      newErrors.maxSalary = "Bắt buộc";
    }
    if (!formData.description.trim()) newErrors.description = "Bắt buộc";

    if (
      formData.salaryType !== "NEGOTIABLE" &&
      formData.minSalary &&
      formData.maxSalary &&
      Number(formData.minSalary) > Number(formData.maxSalary)
    ) {
      newErrors.maxSalary =
        "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const selectedProvince = provinces.find(
        (p) => p.name === formData.province,
      );

      const payload = {
        title: formData.jobTitle.trim(),
        position: formData.jobPosition.join(", "),
        techRequired: formData.techStack,
        jobType: formData.workType || null,
        experienceLevel: formData.experienceLevel || null,
        workingDays: formData.workingDays.trim() || null,

        minSalary:
          formData.salaryType === "NEGOTIABLE" || formData.minSalary === ""
            ? null
            : Number(formData.minSalary),
        maxSalary:
          formData.salaryType === "NEGOTIABLE" || formData.maxSalary === ""
            ? null
            : Number(formData.maxSalary),
        salaryType: formData.salaryType || null,

        maxAccept: formData.quantity ? Number(formData.quantity) : 0,
        dueDate: formData.deadline || null,

        province: formData.province || null,
        ward: formData.ward || null,
        address: formData.address.trim() || null,
        locId: null,

        description: formData.description.trim() || "",
        responsibilities: formData.responsibilities.trim() || "",
        requirements: formData.requirements.trim() || "",
        benefits: formData.benefits.trim() || "",
      };

      let result;

      if (isEdit && initialData?.id) {
        result = await companyService.updateEmployerJob(
          initialData.id,
          payload,
        );
        toast.success("Cập nhật công việc thành công");
      } else {
        result = await companyService.createEmployerJob(payload);
        toast.success("Đăng bài thành công");
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }

      onClose();
    } catch (error) {
      console.error("Lỗi lưu công việc:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lưu công việc thất bại, vui lòng thử lại",
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "province") {
        return {
          ...prev,
          province: value,
          ward: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 backdrop-blur-sm 
      transition-opacity duration-300 ease-in-out
      animate-fade-in
      px-4 py-6"
    >
      <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEdit ? "Chỉnh sửa công việc" : "Đăng công việc"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Cập nhật thông tin tuyển dụng"
                : "Tạo bài đăng tuyển dụng mới"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Tiêu đề công việc
              </h3>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                placeholder="Thêm tiêu đề vào đây"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                onChange={handleChange}
              />
              {errors.jobTitle && (
                <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Thông tin chi tiết
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <MultiSelectTagInput
                  label="Vị trí tuyển dụng"
                  selectedValues={formData.jobPosition}
                  setSelectedValues={(value) =>
                    setFormData((prev) => ({ ...prev, jobPosition: value }))
                  }
                  options={DEFAULT_POSITION_OPTIONS}
                  placeholder="Nhập vị trí mới"
                />

                <MultiSelectTagInput
                  label="Công nghệ yêu cầu"
                  selectedValues={formData.techStack}
                  setSelectedValues={(value) =>
                    setFormData((prev) => ({ ...prev, techStack: value }))
                  }
                  options={DEFAULT_TECH_OPTIONS}
                  placeholder="Nhập công nghệ mới"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Hình thức làm việc
                  </label>
                  <div className="relative">
                    <select
                      name="workType"
                      value={formData.workType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
                    >
                      <option value="">Chọn...</option>
                      {JOB_TYPE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                  {errors.workType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.workType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Kinh nghiệm
                  </label>
                  <div className="relative">
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
                    >
                      <option value="">Chọn...</option>
                      {EXPERIENCE_LEVEL_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                  {errors.experienceLevel && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.experienceLevel}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Ngày làm việc
                  </label>
                  <input
                    type="text"
                    name="workingDays"
                    value={formData.workingDays}
                    placeholder="Ví dụ: Thứ 2 - Thứ 6"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                    onChange={handleChange}
                  />
                  {errors.workingDays && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.workingDays}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Số lượng cần tuyển
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    placeholder="Nhập số lượng"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                    onChange={handleChange}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Ngày hết hạn
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm text-gray-500"
                    onChange={handleChange}
                  />
                  {errors.deadline && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deadline}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Địa chỉ làm việc
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <div className="relative">
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
                    >
                      <option value="">Chọn...</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                  {errors.province && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phường/Xã
                  </label>
                  <div className="relative">
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      disabled={!formData.province || loadingWards}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingWards ? "Đang tải..." : "Chọn..."}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Địa chỉ cụ thể
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="Nhập vị trí cụ thể"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm"
                    onChange={handleChange}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Mức lương
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tối thiểu
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minSalary"
                      value={formData.minSalary}
                      placeholder="Giá trị tối thiểu..."
                      disabled={formData.salaryType === "NEGOTIABLE"}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm disabled:bg-gray-100"
                      onChange={handleChange}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                      VND
                    </span>
                  </div>
                  {errors.minSalary && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.minSalary}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tối đa
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="maxSalary"
                      value={formData.maxSalary}
                      placeholder="Giá trị tối đa..."
                      disabled={formData.salaryType === "NEGOTIABLE"}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm disabled:bg-gray-100"
                      onChange={handleChange}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                      VND
                    </span>
                  </div>
                  {errors.maxSalary && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.maxSalary}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Hình thức trả lương
                  </label>
                  <div className="relative">
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
                    >
                      {SALARY_TYPE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Mô tả công việc & Trách nhiệm
              </h3>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Mô tả
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                  <EditorToolbar />
                  <textarea
                    name="description"
                    value={formData.description}
                    className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                    placeholder="Thêm mô tả công việc tại đây..."
                    onChange={handleChange}
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Trách nhiệm
                </label>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                  <EditorToolbar />
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                    placeholder="Thêm trách nhiệm công việc tại đây..."
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={!hasChanges}
                className={`flex items-center gap-2 font-bold py-3 px-8 rounded-lg transition-all ${
                  hasChanges 
                    ? "bg-[#1967D2] hover:bg-blue-700 text-white shadow-lg shadow-blue-200" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed grayscale"
                }`}
              >
                {isEdit ? "Cập nhật → Chờ duyệt lại" : "Đăng bài → Chờ duyệt"}
                <FaArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
