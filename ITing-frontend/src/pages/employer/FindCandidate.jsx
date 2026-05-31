import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin, GraduationCap, Briefcase, ChevronDown, ChevronUp, X, User, Mail, Award, Star, Zap, ArrowRight, ExternalLink } from "lucide-react";
import {
    FaTimes, FaEnvelope, FaPhone, FaDownload,
    FaStar, FaRegStar, FaCheckCircle, FaUserTie,
    FaExclamationTriangle, FaExternalLinkAlt, FaShieldAlt, FaClock, FaBuilding
} from 'react-icons/fa';
import { Button, Badge, Breadcrumb } from "../../components/common";
import { toast } from "sonner";
import { employerCandidateService } from "../../services/employerCandidateService";
import companyService from "../../services/companyService";
import affiliationService from "../../services/affiliationService";
import ReviewCandidateModal from "../../components/employer/ReviewCandidateModal";
import MatchCandidatesDrawer from "../../components/employer/MatchCandidatesDrawer";
import { FaMagic } from "react-icons/fa";

const POSITIONS = ["Frontend Developer", "Backend Developer", "Fullstack Developer", "Mobile Developer", "DevOps Engineer"];
const WORK_TYPES = [
  { value: "FULL_TIME",   label: "Toàn thời gian" },
  { value: "PART_TIME",   label: "Bán thời gian" },
  { value: "CONTRACT",    label: "Hợp đồng" },
  { value: "INTERNSHIP",  label: "Thực tập" },
  { value: "REMOTE",      label: "Làm từ xa" },
  { value: "FREELANCE",   label: "Freelance" },
];
const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const LEVEL_OPTIONS = [
  { value: "INTERN",    label: "Thực tập sinh" },
  { value: "FRESHER",   label: "Fresher (0 năm)" },
  { value: "JUNIOR",    label: "Junior (1–2 năm)" },
  { value: "MIDDLE",    label: "Middle (3–4 năm)" },
  { value: "MID_LEVEL", label: "Mid-Level (3–4 năm)" },
  { value: "SENIOR",    label: "Senior (5–7 năm)" },
  { value: "LEAD",      label: "Lead / Trưởng nhóm" },
  { value: "EXPERT",    label: "Expert (8+ năm)" },
  { value: "MANAGER",   label: "Manager" },
];
const DEGREE_OPTIONS = ["Trung cấp", "Cao đẳng", "Đại học", "Trên đại học"];
const PROGRAMMING_SKILLS = ["ReactJS", "NodeJS", "Java", "Python", "TypeScript", "React Native", "VueJS", "Angular", "Docker", "AWS"];

const EXPERIENCE_RANGES = [
  { value: "0", label: "Chưa có kinh nghiệm" },
  { value: "0-1", label: "Dưới 1 năm" },
  { value: "1-3", label: "1–3 năm" },
  { value: "3-5", label: "3–5 năm" },
  { value: "5-10", label: "5–10 năm" },
  { value: "10+", label: "Trên 10 năm" },
];

const SALARY_RANGES = [
  { value: "0-10", label: "Dưới 10 triệu" },
  { value: "10-20", label: "10–20 triệu" },
  { value: "20-30", label: "20–30 triệu" },
  { value: "30-50", label: "30–50 triệu" },
  { value: "50+", label: "Trên 50 triệu" },
];

const ITEMS_PER_PAGE = 6;

const FindCandidate = () => {
  const reqIdRef = useRef(0);
  const [keyword, setKeyword] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedWorkType, setSelectedWorkType] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedDegree, setSelectedDegree] = useState("all");
  const [selectedSalary, setSelectedSalary] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCandidate, setViewCandidate] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [employerLocation, setEmployerLocation] = useState("");
  const [industryContext, setIndustryContext] = useState("");

  // AI Match-by-job state
  const [myJobs, setMyJobs] = useState([]);
  const [matchDrawer, setMatchDrawer] = useState({ open: false, jobId: null, jobTitle: "" });

  // Affiliation gate state — HR phải APPROVED mới truy cập tìm ứng viên.
  // Backend cũng guard endpoint (AuthorizationService.requireApprovedCompanyOf)
  // nhưng UI gate trước cho UX rõ ràng + tránh fail-with-403 toast khó hiểu.
  // null = chưa fetch xong → render loading; object có status field sau khi fetch.
  const [affiliation, setAffiliation] = useState(null);
  const [affiliationChecked, setAffiliationChecked] = useState(false);
  // Tier-gated: backend trả 402 khi tier < PRO. UI riêng (CTA nâng cấp gói)
  // tách biệt với affiliation gate (CTA xác thực doanh nghiệp).
  const [tierGated, setTierGated] = useState(false);
  const [tierGateMessage, setTierGateMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    affiliationService.getMe()
      .then((data) => { if (!cancelled) setAffiliation(data || { status: 'NONE' }); })
      .catch(() => { if (!cancelled) setAffiliation({ status: 'NONE' }); })
      .finally(() => { if (!cancelled) setAffiliationChecked(true); });
    return () => { cancelled = true; };
  }, []);
  const isApproved = affiliation?.status === 'APPROVED';

  // Fetch employer's company profile on mount:
  //  - employerLocation → used for location proximity scoring in KG
  //  - industryContext  → used as a silent keyword when no explicit search is typed,
  //                       so the system suggests candidates relevant to the employer's domain
  useEffect(() => {
    companyService.getMyCompany()
      .then(res => {
        // Location
        const addr = res?.address || res?.location || "";
        setEmployerLocation(addr);

        // Build an industry context string from industries + techStack
        const industryLabels = (res?.industries || []).map(ind =>
          ind.replace(/_/g, " ").toLowerCase()
        );
        const techStack = res?.techStack || [];
        const contextParts = [...industryLabels, ...techStack].filter(Boolean);
        setIndustryContext(contextParts.join(" "));
      })
      .catch(() => {
        // Non-critical: smart recommendation will degrade gracefully
      });

    // Load my jobs cho dropdown "Match theo job"
    companyService.getMyJobs(0, 100)
      .then(res => {
        const items = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
        setMyJobs(items.filter(j => j?.status === 'ACTIVE' || !j?.status));
      })
      .catch(() => setMyJobs([]));
  }, []);

  const resetFilters = () => {
    setKeyword("");
    setSelectedPosition("all");
    setSelectedLevel("all");
    setSelectedLocation("all");
    setSelectedWorkType("all");
    setSelectedExperience("all");
    setSelectedDegree("all");
    setSelectedSalary("all");
    setSelectedSkills([]);
    setOnlyAvailable(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    const reqId = ++reqIdRef.current;
    const hasKeyword = keyword.trim().length > 0;
    const debounceMs = hasKeyword ? 400 : 0;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await employerCandidateService.search({
          keyword,
          position: selectedPosition,
          level: selectedLevel,
          location: selectedLocation,
          workType: selectedWorkType,
          experience: selectedExperience,
          degree: selectedDegree,
          salary: selectedSalary,
          skills: selectedSkills,
          onlyAvailable,
          employerLocation,
          industryContext,
          page: currentPage - 1,
          size: ITEMS_PER_PAGE,
        });

        if (reqId !== reqIdRef.current) return;
        setCandidates(res?.content || []);
        setTotalElements(res?.totalElements ?? 0);
        setTotalPages(res?.totalPages ?? 1);
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        setCandidates([]);
        setTotalElements(0);
        setTotalPages(1);
        // 402 → tier gate (interceptor đã toast). Hiện gate UI thay vì empty list.
        if (err?.httpStatus === 402 || err?.status === 402) {
          setTierGated(true);
          setTierGateMessage(err?.message || "");
        } else {
          setTierGated(false);
          toast.error(err?.message || "Không thể tải danh sách ứng viên");
        }
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    keyword,
    selectedPosition,
    selectedLevel,
    selectedLocation,
    selectedWorkType,
    selectedExperience,
    selectedDegree,
    selectedSalary,
    selectedSkills,
    onlyAvailable,
    currentPage,
    industryContext,
  ]);

  const activeFilterCount = [
    selectedPosition !== "all",
    selectedLevel !== "all",
    selectedLocation !== "all",
    selectedWorkType !== "all",
    selectedExperience !== "all",
    selectedDegree !== "all",
    selectedSalary !== "all",
    selectedSkills.length > 0,
    onlyAvailable,
  ].filter(Boolean).length;

  const filteredSkillOptions = PROGRAMMING_SKILLS.filter(
    (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)
  ).slice(0, 12);

  // ─── Gate: chưa fetch xong affiliation → loading skeleton ───
  if (!affiliationChecked) {
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <Breadcrumb rootLabel="Tổng quan" rootLink="/employer/dashboard" items={[{ label: 'Tìm kiếm ứng viên' }]} />
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center">
          <div className="text-center text-gray-500 text-sm">
            <div className="inline-block w-8 h-8 border-2 border-[#3AB4E6] border-t-transparent rounded-full animate-spin mb-3" />
            <div>Đang kiểm tra trạng thái xác thực...</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Gate: chưa APPROVED → block UI + CTA xác thực ───
  if (!isApproved) {
    const submissionStatus = affiliation?.submissionStatus; // DRAFT/PENDING_REVIEW/APPROVED/REJECTED
    const status = affiliation?.status || 'NONE'; // INCOMPLETE/PENDING/APPROVED/REJECTED/REVOKED/NONE
    let icon = <FaShieldAlt className="text-[#3AB4E6]" />;
    let title = "Cần xác thực doanh nghiệp";
    let desc = "Tài khoản nhà tuyển dụng cần được xác thực trước khi tìm kiếm ứng viên. Vui lòng hoàn tất hồ sơ doanh nghiệp.";
    let cta = "Bắt đầu xác thực";
    let badge = { text: "Chưa xác thực", color: "bg-amber-50 text-amber-700 border-amber-200" };

    if (status === 'PENDING' || submissionStatus === 'PENDING_REVIEW') {
      icon = <FaClock className="text-blue-500 animate-pulse" />;
      title = "Hồ sơ đang chờ admin duyệt";
      desc = "Bạn đã gửi hồ sơ doanh nghiệp. Admin sẽ duyệt trong vòng 1-3 ngày làm việc. Sau khi được duyệt, bạn có thể tìm kiếm và liên hệ ứng viên.";
      cta = "Xem trạng thái hồ sơ";
      badge = { text: "Chờ duyệt", color: "bg-blue-50 text-blue-700 border-blue-200" };
    } else if (status === 'REJECTED' || submissionStatus === 'REJECTED') {
      icon = <FaExclamationTriangle className="text-red-500" />;
      title = "Hồ sơ bị từ chối";
      desc = "Admin yêu cầu chỉnh sửa hồ sơ. Vui lòng kiểm tra ghi chú từ admin và cập nhật lại thông tin doanh nghiệp.";
      cta = "Cập nhật hồ sơ";
      badge = { text: "Bị từ chối", color: "bg-red-50 text-red-700 border-red-200" };
    } else if (status === 'INCOMPLETE' || submissionStatus === 'DRAFT') {
      icon = <FaBuilding className="text-amber-500" />;
      title = "Hồ sơ doanh nghiệp chưa đầy đủ";
      desc = "Vui lòng cập nhật đầy đủ thông tin doanh nghiệp (mã số thuế, logo, giấy phép, v.v.) và gửi cho admin duyệt.";
      cta = "Hoàn thiện hồ sơ";
      badge = { text: "Chưa hoàn thiện", color: "bg-amber-50 text-amber-700 border-amber-200" };
    }

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <Breadcrumb rootLabel="Tổng quan" rootLink="/employer/dashboard" items={[{ label: 'Tìm kiếm ứng viên' }]} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-4xl mb-5 shadow-inner">
              {icon}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.color} mb-3`}>
              {badge.text}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-600 text-sm max-w-lg leading-relaxed mb-8">{desc}</p>

            <Link
              to="/employer/verification"
              className="inline-flex items-center gap-2 bg-[#3AB4E6] hover:bg-[#2fa0cf] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#3AB4E6]/30 transition-all"
            >
              {cta} <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
              <p className="text-xs text-gray-500 mb-3">Vì sao cần xác thực?</p>
              <ul className="text-xs text-gray-600 space-y-2 max-w-md mx-auto text-left">
                <li className="flex items-start gap-2"><FaCheckCircle className="text-green-500 mt-0.5 shrink-0" /> Bảo vệ ứng viên khỏi spam và lừa đảo</li>
                <li className="flex items-start gap-2"><FaCheckCircle className="text-green-500 mt-0.5 shrink-0" /> Tăng độ tin cậy cho tin tuyển dụng của bạn</li>
                <li className="flex items-start gap-2"><FaCheckCircle className="text-green-500 mt-0.5 shrink-0" /> Tuân thủ chính sách bảo mật thông tin cá nhân</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tierGated) {
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <Breadcrumb rootLabel="Tổng quan" rootLink="/employer/dashboard" items={[{ label: 'Tìm kiếm ứng viên' }]} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-4xl mb-5 shadow-inner">
              <Zap className="text-amber-500" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200 mb-3">
              Cần nâng cấp gói
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tính năng Talent Pool — chỉ gói PRO trở lên</h2>
            <p className="text-gray-600 text-sm max-w-lg leading-relaxed mb-8">
              {tierGateMessage || "Tìm kiếm ứng viên trực tiếp trong kho hồ sơ là tính năng cao cấp. Nâng cấp gói PRO hoặc ENTERPRISE để mở khóa."}
            </p>
            <Link
              to="/employer/subscriptions"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all"
            >
              Nâng cấp gói ngay <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
              <p className="text-xs text-gray-500 mb-3">Lợi ích khi nâng cấp PRO:</p>
              <ul className="text-xs text-gray-600 space-y-2 max-w-md mx-auto text-left">
                <li className="flex items-start gap-2"><FaCheckCircle className="text-green-500 mt-0.5 shrink-0" /> Search trực tiếp hồ sơ ứng viên openToWork</li>
                <li className="flex items-start gap-2"><FaCheckCircle className="text-green-500 mt-0.5 shrink-0" /> 50 job posting + 20 lượt boost / 30 ngày</li>
                <li className="flex items-start gap-2"><FaCheckCircle className="text-green-500 mt-0.5 shrink-0" /> AI match-by-job (5 credits/lần)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <Breadcrumb
        rootLabel="Tổng quan"
        rootLink="/employer/dashboard"
        items={[{ label: 'Tìm kiếm ứng viên' }]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm ứng viên</h1>
          <p className="text-gray-500 text-sm mt-1">Khám phá và kết nối với những tài năng hàng đầu</p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={resetFilters} className="text-gray-500 h-9 px-3 text-xs">
            <X className="w-3.5 h-3.5 mr-1" /> Xóa bộ lọc ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* AI Match-by-job dropdown */}
        {myJobs.length > 0 && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 shrink-0">
              <FaMagic /> Match AI theo job đã đăng
            </div>
            <select
              defaultValue=""
              onChange={(e) => {
                const jobId = Number(e.target.value);
                if (!jobId) return;
                const j = myJobs.find(x => x.id === jobId);
                setMatchDrawer({ open: true, jobId, jobTitle: j?.title || "" });
                e.target.value = ""; // reset để lần sau chọn lại trigger
              }}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#3AB4E6] outline-none"
            >
              <option value="">— Chọn job để tìm ứng viên (5 credits/lần) —</option>
              {myJobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title || `Job #${j.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Tìm theo tên, vị trí, kỹ năng..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/10 outline-none transition-all text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0 h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Bộ lọc nâng cao
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Basic select filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Position Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedPosition} 
             onChange={(e) => { setSelectedPosition(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả vị trí</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
           </select>

           {/* Level Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedLevel} 
             onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả cấp bậc</option>
              {LEVEL_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
           </select>

           {/* Location Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedLocation} 
             onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả địa điểm</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
           </select>

           {/* WorkType Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedWorkType} 
             onChange={(e) => { setSelectedWorkType(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả hình thức</option>
              {WORK_TYPES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
           </select>
        </div>

        {/* Advanced Filters Area */}
        {showAdvanced && (
          <div className="pt-6 border-t border-gray-50 space-y-6 animate-scale-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm outline-none cursor-pointer"
                value={selectedExperience} 
                onChange={(e) => { setSelectedExperience(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả kinh nghiệm</option>
                {EXPERIENCE_RANGES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>

              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm outline-none cursor-pointer"
                value={selectedDegree} 
                onChange={(e) => { setSelectedDegree(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả bằng cấp</option>
                {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm outline-none cursor-pointer"
                value={selectedSalary} 
                onChange={(e) => { setSelectedSalary(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả mức lương</option>
                {SALARY_RANGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Skills selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Kỹ năng</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map(s => (
                  <Badge key={s} variant="info" className="gap-1.5 py-1.5 bg-blue-50 text-blue-700 font-bold">
                    {s} <X className="w-3 h-3 cursor-pointer" onClick={() => { setSelectedSkills(p => p.filter(x => x !== s)); setCurrentPage(1); }} />
                  </Badge>
                ))}
              </div>
              
              <div className="max-w-md">
                <input
                  placeholder="Tìm kỹ năng..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#3AB4E6] outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filteredSkillOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSkills(p => [...p, s]); setSkillSearch(""); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-500 hover:border-[#3AB4E6] hover:text-[#3AB4E6] transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="available"
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => { setOnlyAvailable(e.target.checked); setCurrentPage(1); }}
                className="w-5 h-5 rounded border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6] cursor-pointer"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-600 cursor-pointer">
                Chỉ hiện ứng viên đang tìm việc
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="flex justify-between items-center py-2">
        <p className="text-sm text-gray-500">
          {loading ? (
            <span>Đang tải...</span>
          ) : (
            <>
              Tìm thấy <span className="font-bold text-gray-900">{totalElements}</span> ứng viên
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => setViewCandidate(candidate)}
          >
            {/* Status Badge */}
            <div className="absolute top-0 right-0 p-4">
               {candidate.isAvailable ? (
                 <span className="text-[10px] uppercase tracking-tighter bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold border border-green-100">Đang tìm việc</span>
               ) : (
                 <span className="text-[10px] uppercase tracking-tighter bg-gray-50 text-gray-400 px-2.5 py-1 rounded-full font-bold">Không sẵn sàng</span>
               )}
            </div>

            <div className="flex flex-col h-full">
               <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                 <User className="w-8 h-8 text-[#3AB4E6]" />
               </div>

               <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1967D2] transition-colors">{candidate.name}</h3>
               <p className="text-sm font-bold text-[#3AB4E6] mb-4">{candidate.title} · {candidate.level}</p>

               <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {candidate.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {candidate.experience} năm kinh nghiệm
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> {candidate.degree} - {candidate.education}
                  </div>
               </div>

               <div className="flex flex-wrap gap-1.5 mt-auto">
                 {candidate.skills.slice(0, 3).map(s => (
                   <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">{s}</span>
                 ))}
                 {candidate.skills.length > 3 && (
                   <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-1 rounded">+{candidate.skills.length - 3}</span>
                 )}
               </div>

               {/* Phase 5: Explainability — KG Match Reasons */}
               {candidate.matchReasons && candidate.matchReasons.length > 0 && (
                 <div className="mt-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                   <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">🧠 Lý do phù hợp</p>
                   {candidate.matchReasons.slice(0, 3).map((reason, idx) => (
                     <p key={idx} className="text-[11px] text-emerald-600 leading-relaxed">{reason}</p>
                   ))}
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && candidates.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-bold text-gray-800">Không tìm thấy ứng viên phù hợp</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.</p>
            <Button variant="outline" className="mt-6 rounded-xl" onClick={resetFilters}>Xóa tất cả bộ lọc</Button>
          </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="w-10 h-10 p-0 rounded-full"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                currentPage === p ? "bg-[#1967D2] text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-10 h-10 p-0 rounded-full"
          >
             <ChevronDown className="w-4 h-4 -rotate-90" />
          </Button>
        </div>
      )}

      {/* ════════════ CANDIDATE PROFILE MODAL ════════════ */}
      <ReviewCandidateModal
        candidate={viewCandidate}
        onClose={() => setViewCandidate(null)}
      />

      {/* ════════════ AI MATCH-BY-JOB DRAWER ════════════ */}
      <MatchCandidatesDrawer
        isOpen={matchDrawer.open}
        jobId={matchDrawer.jobId}
        jobTitle={matchDrawer.jobTitle}
        onClose={() => setMatchDrawer({ open: false, jobId: null, jobTitle: "" })}
      />
    </div>
  );
};

export default FindCandidate;
