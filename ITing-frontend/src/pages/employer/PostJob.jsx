import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModalEscape } from "../../hooks/useModalEscape";
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
import { CheckCircle2, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";
import companyService from "../../services/companyService";
import axiosInstance from "../../utils/axiosInstance";
import { moderateJobWithGemini } from "../../services/geminiModerationService";
import { PromptModal } from "../../components/common";
import usePrompt from "../../hooks/usePrompt";

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
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "REMOTE", label: "Remote" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERN", label: "Internship" },
];

const SALARY_TYPE_OPTIONS = [
  { value: "NEGOTIABLE", label: "Thỏa thuận" },
  { value: "MONTH", label: "Theo tháng" },
  { value: "PROJECT", label: "Theo dự án" },
  { value: "HOUR", label: "Theo giờ" },
];

const WORKING_DAYS_OPTIONS = [
  { value: "MON_TO_FRI", label: "Thứ 2 - Thứ 6" },
  { value: "MON_TO_SAT", label: "Thứ 2 - Thứ 7" },
  { value: "FLEXIBLE", label: "Linh động" },
];

const CV_LANGUAGE_OPTIONS = [
  { value: "ANY", label: "Việt hoặc Anh (không bắt buộc)" },
  { value: "VIETNAMESE", label: "Bắt buộc tiếng Việt" },
  { value: "ENGLISH", label: "Bắt buộc tiếng Anh" },
  { value: "BOTH", label: "Song ngữ (Việt + Anh)" },
];

const MAX_TITLE_LENGTH = 150;

const formatSalaryDisplay = (value) => {
  if (!value && value !== 0) return "";
  const num = String(value).replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("vi-VN");
};

const parseSalaryValue = (formatted) => {
  if (!formatted) return "";
  return String(formatted).replace(/\./g, "").replace(/,/g, "");
};

function SearchableSelect({ name, value, onChange, options, disabled, placeholder, loading }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const kw = search.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(kw));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.name === value)?.name || "";

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        className={`w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer flex items-center justify-between ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "text-gray-600 hover:border-gray-300"
          }`}
      >
        <span className={selectedLabel ? "text-gray-800" : "text-gray-400"}>
          {loading ? "Đang tải..." : selectedLabel || placeholder || "Chọn..."}
        </span>
        <FaChevronDown className="text-gray-400 text-xs" />
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#3AB4E6]"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">Không tìm thấy</div>
            ) : filtered.map((o) => (
              <div
                key={o.code}
                onClick={() => {
                  onChange({ target: { name, value: o.name } });
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${value === o.name ? "bg-blue-50 text-[#1967D2] font-medium" : "text-gray-700"
                  }`}
              >
                {o.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

// EditorToolbar nhận textareaRef để insert markdown vào vị trí con trỏ.
// Textarea bên dưới là plain text — markdown sẽ được render khi JobDetail
// hiển thị description (nếu có ReactMarkdown), hoặc giữ nguyên ký tự nếu
// raw text. Người dùng vẫn diễn đạt được ý định format.
function EditorToolbar({ textareaRef }) {
  const [linkPrompt, askLinkPrompt, resetLinkPrompt] = usePrompt();

  // Helper: wrap selection (hoặc insert) bằng prefix/suffix.
  const wrap = (prefix, suffix = prefix, placeholder = '') => {
    const ta = textareaRef?.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + prefix + sel + suffix + value.slice(e);
    ta.value = next;
    // Trigger React onChange qua synthetic input event để state sync.
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    // Đặt lại vị trí con trỏ sau wrap.
    const newPos = s + prefix.length + sel.length;
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(newPos, newPos); });
  };
  const insertLine = (prefix) => {
    const ta = textareaRef?.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    ta.value = next;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const newPos = s + prefix.length;
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(newPos, newPos); });
  };
  const insertLink = () => {
    askLinkPrompt({
      title: 'Chèn liên kết',
      label: 'URL',
      placeholder: 'https://...',
      onSubmit: (url) => {
        resetLinkPrompt();
        if (!url) return;
        wrap('[', `](${url})`, 'liên kết');
      },
    });
  };

  const btn = "hover:text-black p-1 md:p-0";
  return (
    <>
      <div className="bg-gray-50 border-b border-gray-200 px-2 md:px-3 py-2 flex flex-wrap gap-2 md:gap-4 text-gray-500 mb-2 items-center">
        <button type="button" aria-label="In đậm" title="**bold**" onClick={() => wrap('**', '**', 'in đậm')} className={btn}><FaBold /></button>
        <button type="button" aria-label="In nghiêng" title="*italic*" onClick={() => wrap('*', '*', 'in nghiêng')} className={btn}><FaItalic /></button>
        <button type="button" aria-label="Gạch chân" title="<u>underline</u>" onClick={() => wrap('<u>', '</u>', 'gạch chân')} className={btn}><FaUnderline /></button>
        <button type="button" aria-label="Gạch ngang" title="~~strike~~" onClick={() => wrap('~~', '~~', 'gạch ngang')} className={btn}><FaStrikethrough /></button>
        <div className="w-px bg-gray-300 mx-1 h-4"></div>
        <button type="button" aria-label="Chèn liên kết" title="[text](url)" onClick={insertLink} className={btn}><FaLink /></button>
        <button type="button" aria-label="Danh sách" title="- item" onClick={() => insertLine('- ')} className={btn}><FaListUl /></button>
        <button type="button" aria-label="Danh sách có số" title="1. item" onClick={() => insertLine('1. ')} className={btn}><FaListOl /></button>
      </div>
      <PromptModal
        isOpen={linkPrompt.isOpen}
        onClose={resetLinkPrompt}
        onSubmit={linkPrompt.onSubmit}
        title={linkPrompt.title}
        label={linkPrompt.label}
        placeholder={linkPrompt.placeholder}
        confirmText={linkPrompt.confirmText}
        cancelText={linkPrompt.cancelText}
        required={linkPrompt.required}
      />
    </>
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

const normalizeMultiValueField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const PostJob = ({
  onClose,
  onSubmitSuccess,
  initialData = null,
  isEdit = false,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  useModalEscape(handleClose);

  const initialFormState = useMemo(() => ({
    jobTitle: initialData?.title || "",
    jobPosition: normalizeMultiValueField(initialData?.position),
    techStack: normalizeMultiValueField(
      initialData?.skills || initialData?.techRequired,
    ),
    workType: initialData?.jobType || "",
    experienceLevel: initialData?.experienceLevel || "",
    workingDays: initialData?.workingDays || "",
    cvLanguage: initialData?.cvLanguage || "ANY",
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
  }),
    [initialData],
  );

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  // Refs cho 2 textarea description + responsibilities — EditorToolbar dùng để
  // wrap selection với markdown (** bold ** / * italic * / [link](url) / - list).
  const descriptionRef = useRef(null);
  const responsibilitiesRef = useRef(null);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableTechOptions, setAvailableTechOptions] = useState(DEFAULT_TECH_OPTIONS);
  const [availablePositionOptions, setAvailablePositionOptions] = useState(DEFAULT_POSITION_OPTIONS);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiWarning, setAiWarning] = useState(null); // { issues, flaggedTerms, suggestion, summary, riskLevel, payload }
  const [parsingJd, setParsingJd] = useState(false);
  const jdInputRef = useRef(null);

  // Áp dữ liệu Gemini parse từ JD vào form (chỉ ghi đè field có giá trị).
  const ALLOWED = {
    workType: ["FULL_TIME", "PART_TIME", "REMOTE", "FREELANCE", "INTERN"],
    experienceLevel: ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR", "LEAD", "MANAGER"],
    workingDays: ["MON_TO_FRI", "MON_TO_SAT", "FLEXIBLE"],
    cvLanguage: ["ANY", "VIETNAMESE", "ENGLISH", "BOTH"],
    salaryType: ["NEGOTIABLE", "MONTH", "PROJECT", "HOUR"],
  };
  const applyParsedJd = (d) => {
    setFormData((prev) => {
      const next = { ...prev };
      const setStr = (k, v) => { if (v && String(v).trim()) next[k] = String(v).trim(); };
      const setArr = (k, v) => { if (Array.isArray(v) && v.length) next[k] = v.map((x) => String(x).trim()).filter(Boolean); };
      const setEnum = (k, v) => { if (v && ALLOWED[k]?.includes(v)) next[k] = v; };
      setStr("jobTitle", d.jobTitle);
      setArr("jobPosition", d.jobPosition);
      setArr("techStack", d.techStack);
      setEnum("workType", d.workType);
      setEnum("experienceLevel", d.experienceLevel);
      setEnum("workingDays", d.workingDays);
      setEnum("cvLanguage", d.cvLanguage);
      setEnum("salaryType", d.salaryType);
      if (d.quantity && Number(d.quantity) > 0) next.quantity = String(Number(d.quantity));
      if (d.minSalary && Number(d.minSalary) > 0) next.minSalary = String(Number(d.minSalary));
      if (d.maxSalary && Number(d.maxSalary) > 0) next.maxSalary = String(Number(d.maxSalary));
      setStr("province", d.province);
      setStr("address", d.address);
      setStr("description", d.description);
      setStr("responsibilities", d.responsibilities);
      setStr("requirements", d.requirements);
      setStr("benefits", d.benefits);
      return next;
    });
  };

  const handleJdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    const ok = file.type === "application/pdf" || /\.(pdf|png|jpe?g)$/i.test(file.name);
    if (!ok) { toast.error("Chỉ hỗ trợ JD dạng PDF hoặc ảnh."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File tối đa 10MB."); return; }
    try {
      setParsingJd(true);
      toast.loading("🤖 AI đang đọc JD và điền form...", { id: "jd-parse" });
      const fd = new FormData();
      fd.append("file", file);
      const res = await axiosInstance.post("/hr/jobs/parse-jd", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = typeof res === "string" ? JSON.parse(res) : res;
      if (data?.error) throw new Error(data.error);
      applyParsedJd(data);
      toast.success("Đã tự điền từ JD. Vui lòng kiểm tra & chỉnh lại trước khi đăng.", { id: "jd-parse" });
    } catch (err) {
      toast.error(err?.error || err?.message || err?.response?.data?.error || "Không đọc được JD. Thử lại.", { id: "jd-parse" });
    } finally {
      setParsingJd(false);
    }
  };

  useEffect(() => {
    setFormData(initialFormState);
  }, [initialFormState]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => toast.error("Không tải được danh sách tỉnh/thành"));

    const fetchSkills = async () => {
      try {
        const data = await axiosInstance.get('/public/categories/skills');
        if (data && Array.isArray(data)) {
          const apiSkills = data.map(s => s.name);
          const merged = [...DEFAULT_TECH_OPTIONS];
          apiSkills.forEach(s => {
            if (!merged.includes(s)) merged.push(s);
          });
          setAvailableTechOptions(merged);
        }
      } catch (err) {
        console.error("Failed to fetch skills", err);
      }
    };

    const fetchPositions = async () => {
      try {
        const data = await axiosInstance.get('/public/categories/position');
        if (data && Array.isArray(data)) {
          const apiPositions = data.map(p => p.name);
          const merged = [...DEFAULT_POSITION_OPTIONS];
          apiPositions.forEach(p => {
            if (!merged.includes(p)) merged.push(p);
          });
          setAvailablePositionOptions(merged);
        }
      } catch (err) {
        console.error("Failed to fetch positions", err);
      }
    };

    fetchSkills();
    fetchPositions();
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

    if (!formData.jobTitle.trim()) newErrors.jobTitle = "* Vui lòng nhập tiêu đề công việc";
    else if (formData.jobTitle.trim().length > MAX_TITLE_LENGTH) newErrors.jobTitle = `* Tiêu đề không được vượt quá ${MAX_TITLE_LENGTH} ký tự`;
    if (formData.jobPosition.length === 0) newErrors.jobPosition = "* Vui lòng chọn vị trí tuyển dụng";
    if (formData.techStack.length === 0) newErrors.techStack = "* Vui lòng chọn công nghệ yêu cầu";
    if (!formData.workType) newErrors.workType = "* Vui lòng chọn hình thức làm việc";
    if (!formData.experienceLevel) newErrors.experienceLevel = "* Vui lòng chọn kinh nghiệm";
    if (!formData.workingDays) newErrors.workingDays = "* Vui lòng chọn ngày làm việc";
    if (!formData.quantity) newErrors.quantity = "* Vui lòng nhập số lượng cần tuyển";
    if (!formData.deadline) newErrors.deadline = "* Vui lòng chọn ngày hết hạn";
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(formData.deadline + "T00:00:00");
      if (deadlineDate < today) newErrors.deadline = "* Hạn ứng tuyển không được ở quá khứ";
    }
    if (!formData.province) newErrors.province = "* Vui lòng chọn tỉnh/thành phố";
    if (!formData.ward) newErrors.ward = "* Vui lòng chọn phường/xã";
    if (!formData.address.trim()) newErrors.address = "* Vui lòng nhập địa chỉ cụ thể";
    if (formData.salaryType !== "NEGOTIABLE" && !formData.minSalary) {
      newErrors.minSalary = "* Vui lòng nhập lương tối thiểu";
    }
    if (formData.salaryType !== "NEGOTIABLE" && !formData.maxSalary) {
      newErrors.maxSalary = "* Vui lòng nhập lương tối đa";
    }
    if (!formData.description.trim()) newErrors.description = "* Vui lòng nhập mô tả công việc";

    if (
      formData.salaryType !== "NEGOTIABLE" &&
      formData.minSalary &&
      formData.maxSalary &&
      Number(formData.minSalary) > Number(formData.maxSalary)
    ) {
      newErrors.maxSalary =
        "* Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedProvince = provinces.find((p) => p.name === formData.province);
    const payload = {
      title: formData.jobTitle.trim(),
      position: formData.jobPosition.join(", "),
      skills: formData.techStack,
      jobType: formData.workType || null,
      experienceLevel: formData.experienceLevel || null,
      workingDays: formData.workingDays || null,
      cvLanguage: formData.cvLanguage || "ANY",
      minSalary: formData.salaryType === "NEGOTIABLE" || formData.minSalary === "" ? null : Number(formData.minSalary),
      maxSalary: formData.salaryType === "NEGOTIABLE" || formData.maxSalary === "" ? null : Number(formData.maxSalary),
      salaryType: formData.salaryType || null,
      maxAccept: formData.quantity ? Math.max(1, Number(formData.quantity)) : 1,
      dueDate: formData.deadline || null,
      province: formData.province || null,
      ward: formData.ward || null,
      address: formData.address.trim() || null,
      locId: selectedProvince ? Number(selectedProvince.code) : null,
      description: formData.description.trim() || "",
      responsibilities: formData.responsibilities.trim() || "",
      requirements: formData.requirements.trim() || "",
      benefits: formData.benefits.trim() || "",
    };

    // ── Gemini AI moderation (non-blocking) ────────────────────────────────
    try {
      setAiChecking(true);
      toast.loading("🤖 AI đang kiểm tra nội dung...", { id: "ai-check" });
      const aiResult = await moderateJobWithGemini(payload);
      toast.dismiss("ai-check");
      setAiChecking(false);

      // Only show warning modal if AI successfully returned a result with issues
      if (!aiResult._error) {
        const isBlocked = !aiResult.passed || aiResult.riskLevel === "HIGH" || aiResult.riskLevel === "CRITICAL";
        const hasWarning = aiResult.issues && aiResult.issues.length > 0;
        if (isBlocked || hasWarning) {
          setAiWarning({ ...aiResult, payload });
          return; // Wait for user decision
        }
      }
    } catch {
      // AI failed — proceed silently, never block job submission
      toast.dismiss("ai-check");
      setAiChecking(false);
    }
    // ─────────────────────────────────────────────────────────────────────

    await doSubmit(payload);
  };

  const doSubmit = async (payload) => {
    try {
      let result;
      if (isEdit && initialData?.id) {
        result = await companyService.updateEmployerJob(initialData.id, payload);
        toast.success("Cập nhật công việc thành công");
      } else {
        result = await companyService.createEmployerJob(payload);
        toast.success("Đăng bài thành công");
      }
      if (onSubmitSuccess) onSubmitSuccess(result);
      handleClose();
    } catch (error) {
      console.error("Lỗi lưu công việc:", error);
      // Parse backend validation errors (Spring @Valid returns errors as array)
      const data = error?.response?.data;
      let msg = "Lưu công việc thất bại, vui lòng thử lại";
      if (typeof data?.message === "string") {
        msg = data.message;
      } else if (Array.isArray(data?.errors)) {
        msg = data.errors.map(e => e.defaultMessage || e.message).join("; ");
      } else if (typeof data === "string") {
        msg = data;
      }
      toast.error(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "province") {
        return { ...prev, province: value, ward: "" };
      }

      if (name === "jobTitle") {
        if (value.length > MAX_TITLE_LENGTH) return prev;
        return { ...prev, jobTitle: value };
      }

      if (name === "minSalary" || name === "maxSalary") {
        const raw = parseSalaryValue(value);
        if (raw && !/^\d+$/.test(raw)) return prev;
        return { ...prev, [name]: raw };
      }

      return { ...prev, [name]: value };
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 backdrop-blur-sm 
      transition-opacity duration-300 ease-in-out
      animate-fade-in
      px-4 py-6"
      onClick={handleClose}
    >
      {/* ── AI Warning Modal ──────────────────────────────────────────── */}
      {aiWarning && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAiWarning(null); }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={`px-6 py-5 flex items-center gap-3 ${
              aiWarning.riskLevel === 'CRITICAL' || aiWarning.riskLevel === 'HIGH'
                ? 'bg-red-500' : 'bg-amber-500'
            }`}>
              {aiWarning.riskLevel === 'CRITICAL' || aiWarning.riskLevel === 'HIGH'
                ? <XCircle className="w-6 h-6 text-white shrink-0" />
                : <AlertTriangle className="w-6 h-6 text-white shrink-0" />
              }
              <div>
                <h3 className="text-white font-black text-lg">
                  {aiWarning.riskLevel === 'CRITICAL' ? '🚫 AI Chặn Tin Đăng' :
                   aiWarning.riskLevel === 'HIGH' ? '⛔ Nội Dung Rủi Ro Cao' :
                   '⚠️ AI Phát Hiện Vấn Đề'}
                </h3>
                <p className="text-white/80 text-sm">Mức rủi ro: {aiWarning.riskLevel}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary */}
              {aiWarning.summary && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    {aiWarning.summary}
                  </p>
                </div>
              )}

              {/* Issues */}
              {aiWarning.issues.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">📋 Vấn đề phát hiện</p>
                  <ul className="space-y-1.5">
                    {aiWarning.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-red-500 font-bold shrink-0">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Flagged Terms */}
              {aiWarning.flaggedTerms.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">🔴 Từ/cụm từ bị gắn cờ</p>
                  <div className="flex flex-wrap gap-2">
                    {aiWarning.flaggedTerms.map((term, i) => (
                      <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestion */}
              {aiWarning.suggestion && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">💡 Gợi ý cải thiện</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{aiWarning.suggestion}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setAiWarning(null)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                ← Chỉnh sửa lại
              </button>
              {(aiWarning.riskLevel === 'LOW' || aiWarning.riskLevel === 'MEDIUM') && (
                <button
                  onClick={async () => {
                    const payload = aiWarning.payload;
                    setAiWarning(null);
                    await doSubmit(payload);
                  }}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition-colors shadow-lg shadow-amber-100"
                >
                  Vẫn đăng bài →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className="w-full max-w-6xl h-full max-h-[95vh] md:max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
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
            onClick={handleClose}
            type="button"
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 md:p-8 flex-1">
          {
            showSuccess ? (
              <div className="py-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Đăng bài thành công!</h3>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                  Tin tuyển dụng của bạn đã được gửi và đang được
                  <span className="font-bold text-sky-600"> AI tự động kiểm duyệt</span>.
                  Hãy kiểm tra trạng thái tại trang Quản lý công việc.
                </p>
                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => {
                      if (onSubmitSuccess) onSubmitSuccess();
                      handleClose();
                    }}
                    className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-100"
                  >
                    Về trang quản lý
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* AI tự điền từ Job Description */}
                <div className="mb-8 rounded-xl border border-[#3AB4E6]/30 bg-gradient-to-r from-[#EAF6FF] to-blue-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#3AB4E6] text-white flex items-center justify-center shrink-0">🤖</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Tải JD lên — AI tự điền form</p>
                      <p className="text-xs text-gray-500">Hỗ trợ PDF/ảnh. AI (Gemini) đọc JD và điền sẵn tiêu đề, kỹ năng, mô tả, lương... bạn chỉ cần kiểm tra lại.</p>
                    </div>
                  </div>
                  <input
                    ref={jdInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={handleJdUpload}
                  />
                  <button
                    type="button"
                    onClick={() => jdInputRef.current?.click()}
                    disabled={parsingJd}
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#3AB4E6] hover:bg-[#2A9DCB] text-white text-sm font-bold px-5 py-2.5 shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {parsingJd ? "Đang đọc JD..." : "Tải JD lên"}
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Tiêu đề công việc
                  </h3>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    maxLength={MAX_TITLE_LENGTH}
                    placeholder="Thêm tiêu đề vào đây"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm ${formData.jobTitle.length >= MAX_TITLE_LENGTH ? 'border-red-300' : 'border-gray-200'
                      }`}
                    onChange={handleChange}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.jobTitle ? (
                      <p className="text-red-500 text-xs">{errors.jobTitle}</p>
                    ) : <span />}
                    <span className={`text-xs ${formData.jobTitle.length >= MAX_TITLE_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'
                      }`}>
                      {formData.jobTitle.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>
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
                      options={availablePositionOptions}
                      placeholder="Nhập vị trí mới"
                    />

                    <MultiSelectTagInput
                      label="Công nghệ yêu cầu"
                      selectedValues={formData.techStack}
                      setSelectedValues={(value) =>
                        setFormData((prev) => ({ ...prev, techStack: value }))
                      }
                      options={availableTechOptions}
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
                      <div className="relative">
                        <select
                          name="workingDays"
                          value={formData.workingDays}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
                        >
                          <option value="">Chọn...</option>
                          {WORKING_DAYS_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                      </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        min={todayStr}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm text-gray-500 ${errors.deadline ? 'border-red-300' : 'border-gray-200'
                          }`}
                        onChange={handleChange}
                      />
                      {errors.deadline && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.deadline}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Ngôn ngữ CV yêu cầu
                        <span className="ml-1 text-xs text-gray-400 font-normal">
                          (ứng viên sẽ thấy yêu cầu này khi xem job)
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          name="cvLanguage"
                          value={formData.cvLanguage}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:border-[#3AB4E6] text-gray-600 text-sm"
                        >
                          {CV_LANGUAGE_OPTIONS.map((item) => (
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

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Địa chỉ làm việc
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <SearchableSelect
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        options={provinces}
                        placeholder="Chọn tỉnh/thành phố..."
                      />
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
                      <SearchableSelect
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        options={wards}
                        disabled={!formData.province || loadingWards}
                        placeholder="Chọn phường/xã..."
                        loading={loadingWards}
                      />
                      {
                        errors.ward && (
                          <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
                        )
                      }
                    </div >

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
                  </div >
                </div >

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
                          type="text"
                          name="minSalary"
                          value={formatSalaryDisplay(formData.minSalary)}
                          placeholder="Giá trị tối thiểu..."
                          disabled={formData.salaryType === "NEGOTIABLE"}
                          className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm disabled:bg-gray-100"
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
                          type="text"
                          name="maxSalary"
                          value={formatSalaryDisplay(formData.maxSalary)}
                          placeholder="Giá trị tối đa..."
                          disabled={formData.salaryType === "NEGOTIABLE"}
                          className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3AB4E6] text-sm disabled:bg-gray-100"
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
                      <EditorToolbar textareaRef={descriptionRef} />
                      <textarea
                        ref={descriptionRef}
                        name="description"
                        value={formData.description}
                        className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                        placeholder="Add your job description..."
                        onChange={handleChange}
                      />
                    </div>
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Trách nhiệm
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                      <EditorToolbar textareaRef={responsibilitiesRef} />
                      <textarea
                        ref={responsibilitiesRef}
                        name="responsibilities"
                        value={formData.responsibilities}
                        className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                        placeholder="Add your job responsibilities..."
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Yêu cầu & Quyền lợi
                  </h3>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Yêu cầu ứng viên
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                      <EditorToolbar />
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                        placeholder="Ví dụ: Tốt nghiệp đại học ngành CNTT, có kinh nghiệm 1 năm với ReactJS..."
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Quyền lợi
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#3AB4E6] transition-colors">
                      <EditorToolbar />
                      <textarea
                        name="benefits"
                        value={formData.benefits}
                        className="w-full p-4 h-40 focus:outline-none resize-none text-sm text-gray-600"
                        placeholder="Ví dụ: Lương tháng 13, bảo hiểm sức khỏe, team building hàng quý..."
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors hover:bg-gray-50 text-center"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#1967D2] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isEdit ? "Cập nhật" : "Đăng bài"}
                    <FaArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default PostJob;
